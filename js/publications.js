// Client-side search / filter / sort for the publications page.
// Operates entirely on the DOM rendered by _includes/publication-list.html;
// no network calls, so it works on GitHub Pages with no build step.

(function () {
  const list = document.querySelector(".pub_list");
  if (!list) return;

  const searchInput = document.querySelector(".pub_search_input");
  const sortSelect = document.querySelector(".pub_sort");
  const countNum = document.querySelector(".pub_count_num");
  const emptyMsg = document.querySelector(".pub_empty");
  const items = Array.from(list.querySelectorAll(".pub_item"));

  const str = (el, attr) => el.getAttribute(attr) || "";

  function apply() {
    const query = (searchInput.value || "").trim().toLowerCase();
    const sort = sortSelect.value;

    // filter
    let visible = 0;
    for (const item of items) {
      const show = !query || str(item, "data-search").indexOf(query) !== -1;
      item.hidden = !show;
      if (show) visible++;
    }

    // sort (only the visible ones need ordering, but sorting all is cheap)
    const sorted = items.slice().sort((a, b) => {
      const da = str(a, "data-date");
      const db = str(b, "data-date");
      if (sort === "oldest") return da < db ? -1 : da > db ? 1 : 0;
      return da > db ? -1 : da < db ? 1 : 0; // newest
    });
    for (const item of sorted) list.appendChild(item);

    countNum.textContent = visible;
    if (emptyMsg) emptyMsg.hidden = visible !== 0;
  }

  searchInput.addEventListener("input", apply);
  sortSelect.addEventListener("change", apply);

  // support ?search= deep links (matches the resources page convention)
  const params = new URLSearchParams(window.location.search);
  const preset = params.get("search");
  if (preset) searchInput.value = preset;

  apply();
})();
