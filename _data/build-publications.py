# Fetches the lab's publication list from OpenAlex and writes _data/publications.yml.
#
# Why OpenAlex instead of Google Scholar:
#   - Google Scholar has no public API and actively blocks automated access
#     (CAPTCHAs on datacenter IPs), so it cannot be refreshed reliably from CI.
#   - OpenAlex is a free, open, official API that returns clean metadata (venue,
#     year, type, DOI, open-access PDF) and imposes no key requirement.
#
# Note on completeness: OpenAlex sometimes splits one person across several
# "author" records when a given paper does not carry their ORCID. Rob Patro
# currently has one canonical record (with ORCID) plus a few smaller phantom
# records. We union a curated allowlist of his verified author ids below so no
# papers are dropped. If OpenAlex mints a new phantom record, this script logs a
# warning naming it so it can be vetted and added to AUTHOR_IDS.
#
# The output file is read by _includes/publication-list.html. Do not edit the
# output by hand; edit this script or the parameters below and re-run.

import json
import os
import sys
import time
import urllib.parse
import urllib.request

import yaml

# --- Parameters ---------------------------------------------------------------

# Verified OpenAlex author ids for the lab PI (Rob Patro). The first is the
# canonical record (has ORCID); the rest are phantom duplicates OpenAlex created
# for papers missing his ORCID, each confirmed by hand to be his work.
# To find/verify ids: https://api.openalex.org/authors?filter=display_name.search:rob%20patro
AUTHOR_IDS = os.environ.get(
    "OPENALEX_AUTHOR_IDS",
    "A5014584023,A5121843332,A5134680717,A5110572855",
).split(",")

# Names OpenAlex may file the PI under; used only to flag new, unrecognized
# author records so they can be reviewed and added to AUTHOR_IDS above.
DISCOVERY_NAMES = ["rob patro", "robert patro"]

# A polite contact for the OpenAlex "polite pool" (faster, more reliable).
MAILTO = os.environ.get("OPENALEX_MAILTO", "rob@cs.umd.edu")

# Only these OpenAlex work types are treated as publications. This drops
# software releases, datasets, dissertations, supplements, errata, etc.
INCLUDE_TYPES = {"article", "review", "preprint", "book-chapter", "book"}

API_ROOT = "https://api.openalex.org/works"
AUTHORS_ROOT = "https://api.openalex.org/authors"
PER_PAGE = 200

current_dir = os.path.dirname(os.path.realpath(__file__))
output_file = os.path.join(current_dir, "publications.yml")


def api_get(url):
    req = urllib.request.Request(url, headers={"User-Agent": f"combine-lab.github.io ({MAILTO})"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp)


def fetch_works_for(author_id):
    """Page through every work for one author id using cursor pagination."""
    works = []
    cursor = "*"
    while cursor:
        params = {
            "filter": f"author.id:{author_id}",
            "sort": "publication_date:desc",
            "per-page": str(PER_PAGE),
            "cursor": cursor,
            "mailto": MAILTO,
        }
        payload = api_get(f"{API_ROOT}?{urllib.parse.urlencode(params)}")
        works.extend(payload["results"])
        cursor = payload["meta"].get("next_cursor")
        if not payload["results"]:
            break
        time.sleep(0.2)  # be gentle
    return works


def warn_about_new_records():
    """Log any Rob/Robert Patro author record not already in AUTHOR_IDS."""
    known = set(AUTHOR_IDS)
    for name in DISCOVERY_NAMES:
        params = {"filter": f"display_name.search:{name}", "per-page": "50", "mailto": MAILTO}
        try:
            payload = api_get(f"{AUTHORS_ROOT}?{urllib.parse.urlencode(params)}")
        except Exception as error:  # discovery is best-effort; never fail the build on it
            print(f"  (discovery check skipped for {name!r}: {error})")
            continue
        for author in payload.get("results", []):
            if author["display_name"].strip().lower() not in DISCOVERY_NAMES:
                continue
            aid = short_id(author["id"])
            if aid not in known and author.get("works_count", 0) > 0:
                print(
                    f"  NOTE: unrecognized author record {aid} "
                    f"({author['display_name']!r}, {author['works_count']} works, "
                    f"orcid={author.get('orcid')}). If this is Rob, add it to AUTHOR_IDS."
                )


def short_id(openalex_url):
    return (openalex_url or "").rsplit("/", 1)[-1]


def venue_of(work):
    loc = work.get("primary_location") or {}
    source = loc.get("source") or {}
    return source.get("display_name")


def simplify(work):
    authorships = work.get("authorships") or []
    authors = [a["author"]["display_name"] for a in authorships if a.get("author")]
    doi = work.get("doi")
    oa = work.get("open_access") or {}
    return {
        "id": short_id(work.get("id")),
        "title": (work.get("title") or "").strip(),
        "authors": authors,
        "num_authors": len(authors),
        "venue": venue_of(work),
        "year": work.get("publication_year"),
        "date": work.get("publication_date"),
        "type": work.get("type"),
        "is_preprint": work.get("type") == "preprint",
        "doi": doi,
        "link": doi or work.get("id"),
        "is_oa": oa.get("is_oa", False),
        "oa_url": oa.get("oa_url"),
    }


def main():
    print(f"Fetching works for {len(AUTHOR_IDS)} author record(s): {', '.join(AUTHOR_IDS)}")
    raw = []
    for author_id in AUTHOR_IDS:
        author_id = author_id.strip()
        if not author_id:
            continue
        works = fetch_works_for(author_id)
        print(f"  {author_id}: {len(works)} raw works")
        raw.extend(works)

    warn_about_new_records()

    pubs = []
    seen = set()
    for work in raw:
        if (work.get("type") or "") not in INCLUDE_TYPES:
            continue
        if not (work.get("title") or "").strip():
            continue
        wid = short_id(work.get("id"))
        if wid in seen:  # same work can only belong to one author record, but be safe
            continue
        seen.add(wid)
        pubs.append(simplify(work))

    # newest first
    pubs.sort(key=lambda p: (p.get("date") or ""), reverse=True)

    header = (
        "# Generated by _data/build-publications.py from OpenAlex. Do not edit by hand.\n"
        f"# Source: OpenAlex authors {', '.join(a.strip() for a in AUTHOR_IDS)}\n\n"
    )
    with open(output_file, "w", encoding="utf8") as file:
        file.write(header)
        yaml.dump(pubs, file, default_flow_style=False, sort_keys=False, allow_unicode=True)

    print(f"Wrote {len(pubs)} publications to {output_file}")
    if not pubs:
        sys.exit("No publications fetched; refusing to leave an empty list.")


if __name__ == "__main__":
    main()
