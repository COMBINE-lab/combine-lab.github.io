// Interactive ecosystem map.
//
// Markup and data are emitted by _includes/ecosystem-map.html; styles are in
// css/ecosystem.scss. Requires d3 v7 (loaded by the include).
//
// Each repository is a bubble: size = stars, opacity = how recently it was
// pushed, colour = theme. The views only change where the bubbles sit.

(function () {
  "use strict";

  var root = document.getElementById("eco");
  if (!root || typeof d3 === "undefined") return;

  // ---- tunables -----------------------------------------------------------
  var LABELLED = 18; // bubbles with a permanent label (site-featured first, then by score)
  var SIZE_EXPONENT = 0.33; // radius ~ stars^exponent; 0.5 = area-proportional, lower = flatter
  var VIEWS = ["ocean", "themes", "connections", "languages", "timeline", "list"];
  // -------------------------------------------------------------------------

  var $ = function (id) {
    return document.getElementById(id);
  };
  var read = function (id) {
    try {
      return JSON.parse($(id).textContent) || null;
    } catch (e) {
      return null;
    }
  };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };

  var github = read("eco-data-github") || [];
  var curated = read("eco-data-curated") || [];
  var eco = read("eco-data-ecosystem") || {};
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var THEMES = (eco.themes || []).map(function (t, i) {
    return { id: t.id, name: t.name, i: i, color: "var(--eco-c-" + t.id + ")" };
  });
  var themeById = {};
  THEMES.forEach(function (t) {
    themeById[t.id] = t;
  });
  var fallbackTheme = themeById.lib || THEMES[0];

  var state = { view: "ocean", q: "", theme: null, task: null, pinned: null, hover: null, sort: "score", dir: -1 };
  var repos = [],
    links = [],
    byName = {},
    sim = null,
    W = 0,
    H = 0,
    now = Date.now();

  // ---- data ---------------------------------------------------------------
  function guessTheme(r) {
    var s = (r.name + " " + (r.description || "") + " " + (r.topics || []).join(" ")).toLowerCase();
    var id = /paper|experiment|scripts|benchmark|analysis|simulation/.test(s)
      ? "papers"
      : /single[- ]?cell|alevin|simpleaf|scrna/.test(s)
      ? "sc"
      : /bruijn|unitig/.test(s)
      ? "dbg"
      : /index|hash/.test(s)
      ? "index"
      : /mapping|mapper|align/.test(s)
      ? "map"
      : /quant|salmon|abundance|transcript/.test(s)
      ? "tx"
      : /tutorial|website|template|docs/.test(s)
      ? "lab"
      : "lib";
    return themeById[id];
  }

  function prepare() {
    var cur = {};
    curated.forEach(function (c) {
      var k = String(c.repo || "").toLowerCase();
      if (k && c.ready !== false && !cur[k]) cur[k] = c;
    });
    var catThemes = eco.category_themes || {};
    var meta = eco.repos || {};
    var list = github.filter(function (g) {
      return g && g.name && !g.fork;
    });
    var maxS = Math.max.apply(
      null,
      list
        .map(function (g) {
          return g.stargazers_count || 0;
        })
        .concat([1])
    );

    repos = list.map(function (g) {
      var c = cur[String(g.full_name || g.repo || "").toLowerCase()] || {};
      var m = meta[g.name] || {};
      var r = {
        n: g.name,
        s: g.stargazers_count || 0,
        f: g.forks_count || 0,
        l: g.language || "",
        t: g.topics || [],
        a: !!g.archived,
        h: g.homepage || "",
        url: g.html_url,
        release: g.latest_release || "",
        status: c.status || "",
        sitefeat: !!c.featured,
        out: [],
        inn: [],
      };
      r.theme = themeById[catThemes[c.category]] || themeById[m.theme] || guessTheme(g) || fallbackTheme;
      r.sum =
        c.description ||
        String(g.description || "")
          .replace(/:[a-z0-9_+-]+:/g, "")
          .replace(/\s+/g, " ")
          .trim() ||
        m.summary ||
        "";
      r.days = Math.max(0, (now - Date.parse(g.pushed_at)) / 864e5) || 0;
      r.created = Date.parse(g.created_at) || Date.parse(g.pushed_at) || now;
      r.score = (Math.log1p(r.s) / Math.log1p(maxS)) * (0.35 + 0.65 * Math.exp(-r.days / 365));
      r.hay = (r.n + " " + r.sum + " " + r.t.join(" ") + " " + r.l + " " + r.theme.name + " " + r.status).toLowerCase();
      return r;
    });

    byName = {};
    repos.forEach(function (r) {
      byName[r.n] = r;
    });

    // connections
    var seen = {};
    links = [];
    (eco.links || []).forEach(function (l) {
      var a = byName[l.from],
        b = byName[l.to],
        key = l.from + ">" + l.to;
      if (!a || !b || a === b || seen[key]) return;
      seen[key] = 1;
      var link = { source: a, target: b, kind: l.kind === "feeds" ? "feeds" : "uses" };
      links.push(link);
      a.out.push(link);
      b.inn.push(link);
    });
    repos.forEach(function (r) {
      r.deg = r.out.length + r.inn.length;
    });

    // what gets a permanent label, and the ranked side list
    var ranked = repos
      .filter(function (r) {
        return r.theme.id !== "papers" && r.theme.id !== "lab";
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });
    var nf = 0;
    ranked.forEach(function (r) {
      if (r.sitefeat) {
        r.feat = true;
        nf++;
      }
    });
    ranked.forEach(function (r) {
      if (!r.feat && nf < LABELLED) {
        r.feat = true;
        nf++;
      }
    });
    ranked.slice(0, 10).forEach(function (r, i) {
      r.top = i + 1;
    });

    (eco.tasks || []).forEach(function (t) {
      t.set = {};
      (t.repos || []).forEach(function (n) {
        t.set[n] = 1;
      });
    });
  }

  function ago(d) {
    if (d < 1) return "today";
    if (d < 2) return "yesterday";
    if (d < 45) return Math.round(d) + " days ago";
    if (d < 700) return Math.round(d / 30.4) + " months ago";
    return (d / 365).toFixed(d < 3650 ? 1 : 0).replace(/\.0$/, "") + " years ago";
  }

  function matches(r) {
    if (state.task && !state.task.set[r.n]) return false;
    if (state.theme && r.theme.id !== state.theme) return false;
    if (!state.q) return true;
    return state.q.split(/\s+/).every(function (w) {
      return r.hay.indexOf(w) >= 0;
    });
  }

  function focus() {
    return state.hover || state.pinned;
  }

  function neighbour(r, f) {
    return (
      f &&
      (r.out.some(function (l) {
        return l.target === f;
      }) ||
        r.inn.some(function (l) {
          return l.source === f;
        }))
    );
  }

  // ---- controls -----------------------------------------------------------
  function buildChips() {
    var box = $("eco-chips");
    box.textContent = "";
    THEMES.forEach(function (t) {
      var n = repos.filter(function (r) {
        return r.theme === t;
      }).length;
      if (!n) return;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "eco_chip";
      b.style.setProperty("--c", t.color);
      b.setAttribute("aria-pressed", state.theme === t.id);
      b.innerHTML = "<i></i>" + esc(t.name) + " <b>" + n + "</b>";
      b.onclick = function () {
        state.theme = state.theme === t.id ? null : t.id;
        buildChips();
        refresh();
      };
      box.appendChild(b);
    });
  }

  function buildTasks() {
    var box = $("eco-tasks");
    box.textContent = "";
    (eco.tasks || []).forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "eco_task";
      b.textContent = t.label;
      b.setAttribute("aria-pressed", state.task === t);
      b.onclick = function () {
        state.task = state.task === t ? null : t;
        unpin();
        buildTasks();
        refresh();
      };
      box.appendChild(b);
    });
    if (!(eco.tasks || []).length) box.parentNode.hidden = true;
    var blurb = $("eco-task-blurb");
    blurb.hidden = !state.task;
    blurb.textContent = state.task ? state.task.blurb || "" : "";
  }

  function buildTop() {
    var ol = $("eco-top");
    ol.textContent = "";
    repos
      .filter(function (r) {
        return r.top;
      })
      .sort(function (a, b) {
        return a.top - b.top;
      })
      .forEach(function (r) {
        var li = document.createElement("li"),
          b = document.createElement("button");
        b.type = "button";
        b.style.setProperty("--c", r.theme.color);
        b.innerHTML = "<i></i><span>" + esc(r.n) + "</span><b>★ " + r.s + "</b>";
        b.onmouseenter = function () {
          hot(r, true);
        };
        b.onmouseleave = function () {
          hot(r, false);
        };
        b.onclick = function (e) {
          e.stopPropagation();
          pin(r);
        };
        li.appendChild(b);
        ol.appendChild(li);
      });
  }

  function hot(r, on) {
    d3.selectAll(".eco_node")
      .filter(function (d) {
        return d === r;
      })
      .classed("eco_hot", on)
      .raise();
  }

  function setFoot() {
    var stamp = github.reduce(function (m, g) {
      return g.generated_at && g.generated_at > m ? g.generated_at : m;
    }, "");
    $("eco-foot").textContent =
      repos.length + " public repositories, " + links.length + " connections." + (stamp ? " GitHub data refreshed " + stamp.slice(0, 10) + "." : "");
  }

  // ---- bubbles ------------------------------------------------------------
  function radius(r) {
    var k = Math.max(0.62, Math.min(1, W / 1000));
    return (4 + 4.2 * Math.pow(r.s, SIZE_EXPONENT)) * k;
  }

  function draw() {
    var ln = d3
      .select("#eco-links")
      .selectAll("line")
      .data(links);
    ln.enter()
      .append("line")
      .attr("class", function (l) {
        return "eco_link eco_" + l.kind;
      })
      .attr("marker-end", "url(#eco-arrow)");

    var g = d3
      .select("#eco-nodes")
      .selectAll("g.eco_node")
      .data(repos, function (d) {
        return d.n;
      });
    var e = g.enter().append("g").attr("class", "eco_node");
    e.append("circle").attr("class", "eco_halo");
    e.append("circle").attr("class", "eco_b");
    e.append("text");
    e.on("mouseenter", function (ev, d) {
      // Do not re-order the node here: moving it in the DOM while the pointer
      // is arriving swallows a click that starts in the same gesture (a tap,
      // or a click with no hover pause).
      state.hover = d;
      if (state.pinned !== d) showTip(d);
      refresh(true);
    })
      .on("mousemove", function (ev) {
        moveTip(ev);
      })
      .on("mouseleave", function () {
        state.hover = null;
        hideTip();
        refresh(true);
      })
      .on("click", function (ev, d) {
        ev.stopPropagation();
        pin(d);
      })
      .on("contextmenu", function (ev, d) {
        ev.preventDefault();
        ev.stopPropagation();
        pin(d);
      })
      .on("keydown", function (ev, d) {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          pin(d);
        }
      });
    g = e.merge(g);
    g.each(function (d) {
      d.r = radius(d);
    })
      .attr("tabindex", function (d) {
        return d.feat ? 0 : null;
      })
      .attr("role", "button")
      .attr("aria-label", function (d) {
        return d.n + ", " + d.s + " stars, updated " + ago(d.days);
      });
    g.select("circle.eco_b")
      .attr("r", function (d) {
        return d.r;
      })
      .style("fill", function (d) {
        return d.theme.color;
      })
      .style("fill-opacity", function (d) {
        return 0.32 + 0.63 * Math.exp(-d.days / 900);
      });
    g.select("circle.eco_halo")
      .attr("r", function (d) {
        return d.r + 3.5;
      })
      .style("display", function (d) {
        return d.days <= 90 ? null : "none";
      });
  }

  function label() {
    var hits = repos.filter(matches);
    var showAll = (state.q || state.theme || state.task) && hits.length <= 28;
    var f = focus();
    d3.selectAll(".eco_node")
      .select("text")
      .each(function (d) {
        var t = d3.select(this);
        var on =
          d.feat ||
          (showAll && matches(d)) ||
          (state.view === "connections" && d.deg > 0) ||
          d === f ||
          neighbour(d, f);
        if (!on) {
          t.text("");
          d.lab = false;
          return;
        }
        var fs = Math.max(10, Math.min(15, d.r * 0.34)),
          inside = d.n.length * fs * 0.62 < d.r * 1.8;
        t.text(d.n)
          .attr("class", inside ? "eco_in" : "eco_out")
          .style("font-size", (inside ? fs : 11) + "px")
          .attr("dy", inside ? "0.34em" : null)
          .attr("y", inside ? 0 : d.r + 14);
        d.lab = !inside;
      });
  }

  function linkOn(l) {
    var f = focus();
    if (state.view === "list") return false;
    if (f) return l.source === f || l.target === f;
    if (!matches(l.source) || !matches(l.target)) return false;
    return state.view === "connections" || !!state.task;
  }

  // light = only hover changed: skip the table and count
  function refresh(light) {
    var f = focus();
    var spotlight = f && f.deg > 0 && state.view !== "connections";
    d3.selectAll(".eco_node")
      .classed("eco_dim", function (d) {
        return !matches(d);
      })
      .classed("eco_soft", function (d) {
        if (!matches(d)) return false;
        if (spotlight) return d !== f && !neighbour(d, f);
        return state.view === "connections" && d.deg === 0;
      });
    d3.selectAll(".eco_link").style("display", function (l) {
      return linkOn(l) ? null : "none";
    });
    label();
    placeLinks();
    if (light) return;
    var hits = repos.filter(matches);
    $("eco-count").textContent =
      state.q || state.theme || state.task ? hits.length + " of " + repos.length + " match" : repos.length + " repositories";
    if (state.view === "list") table();
    if (state.pinned && !matches(state.pinned)) unpin();
  }

  // ---- views --------------------------------------------------------------
  function depthY(days) {
    var maxD = Math.max(
      3650,
      d3.max(repos, function (r) {
        return r.days;
      })
    );
    var top = 64,
      bot = H - 34;
    return top + ((bot - top) * Math.log(1 + days / 30)) / Math.log(1 + maxD / 30);
  }

  function grid(groups) {
    var cols = W >= 900 ? 4 : W >= 560 ? 3 : 2,
      rows = Math.ceil(groups.length / cols),
      cw = W / cols,
      ch = H / rows,
      out = {};
    groups.forEach(function (k, i) {
      var c = i % cols,
        r = Math.floor(i / cols);
      out[k] = { x: cw * (c + 0.5), y: ch * r + ch * 0.58, lx: cw * c + 14, ly: ch * r + 24 };
    });
    return out;
  }

  function langGroups() {
    var cnt = {};
    repos.forEach(function (r) {
      var l = r.l || "Other";
      cnt[l] = (cnt[l] || 0) + 1;
    });
    var top = Object.keys(cnt)
      .filter(function (l) {
        return l !== "Other";
      })
      .sort(function (a, b) {
        return cnt[b] - cnt[a];
      })
      .slice(0, 7);
    return {
      top: top,
      key: function (r) {
        return top.indexOf(r.l) >= 0 ? r.l : "Other";
      },
    };
  }

  function layout() {
    var G = d3.select("#eco-guide");
    G.selectAll("*").remove();
    var v = state.view,
      fx,
      fy,
      sx = 0.12,
      sy = 0.12;
    if (sim) sim.stop();
    if (v === "list") {
      table();
      return;
    }

    if (v === "ocean") {
      fx = function (d) {
        return W * (0.1 + (0.8 * (d.theme.i + 0.5)) / THEMES.length);
      };
      sx = 0.035;
      fy = function (d) {
        return depthY(d.days);
      };
      sy = 0.5;
      [
        [0, "updated this month"],
        [182, "6 months ago"],
        [365, "1 year"],
        [730, "2 years"],
        [1825, "5 years"],
        [3650, "10 years"],
      ].forEach(function (t) {
        var y = depthY(t[0]);
        if (t[0] === 0) y -= 44;
        else G.append("line").attr("x1", 0).attr("x2", W).attr("y1", y).attr("y2", y);
        G.append("text")
          .attr("x", 12)
          .attr("y", y - 5)
          .text(t[1]);
      });
    } else if (v === "themes" || v === "languages") {
      var keyf, names, cells, lg;
      if (v === "themes") {
        names = THEMES.map(function (t) {
          return t.id;
        });
        keyf = function (d) {
          return d.theme.id;
        };
      } else {
        lg = langGroups();
        names = lg.top.concat(["Other"]);
        keyf = lg.key;
      }
      cells = grid(names);
      fx = function (d) {
        return cells[keyf(d)].x;
      };
      fy = function (d) {
        return cells[keyf(d)].y;
      };
      names.forEach(function (k) {
        var n = repos.filter(function (r) {
            return keyf(r) === k;
          }).length,
          c = cells[k];
        G.append("text")
          .attr("class", "eco_h")
          .attr("x", c.lx)
          .attr("y", c.ly)
          .text(v === "themes" ? themeById[k].name : k);
        G.append("text")
          .attr("class", "eco_n")
          .attr("x", c.lx)
          .attr("y", c.ly + 16)
          .text(n + (n === 1 ? " repo" : " repos"));
      });
    } else if (v === "timeline") {
      var x = d3
        .scaleTime()
        .domain([
          d3.min(repos, function (r) {
            return r.created;
          }),
          now,
        ])
        .range([W < 600 ? 24 : 40, W - 60]);
      var lane = (H - 60) / THEMES.length;
      fx = function (d) {
        return x(d.created);
      };
      sx = 0.6;
      fy = function (d) {
        return 26 + lane * (d.theme.i + 0.6);
      };
      sy = 0.25;
      THEMES.forEach(function (t) {
        var y = 26 + lane * t.i;
        G.append("line").attr("x1", 0).attr("x2", W).attr("y1", y).attr("y2", y);
        G.append("text")
          .attr("class", "eco_h")
          .attr("x", 12)
          .attr("y", y + 16)
          .text(t.name);
      });
      x.ticks(d3.timeYear.every(W < 600 ? 2 : 1)).forEach(function (t) {
        G.append("text").attr("x", x(t)).attr("y", H - 10).attr("text-anchor", "middle").text(t.getFullYear());
      });
    } else if (v === "connections") {
      // connected tools form the graph; the rest wait in a strip along the bottom
      var parked = repos
        .filter(function (r) {
          return r.deg === 0;
        })
        .sort(function (a, b) {
          return a.theme.i - b.theme.i || b.s - a.s;
        });
      var rowsN = W < 700 ? 3 : 2,
        per = Math.ceil(parked.length / rowsN),
        stripTop = H - 30 - rowsN * 34;
      parked.forEach(function (r, i) {
        r.px = 24 + ((W - 48) * ((i % per) + 0.5)) / per;
        r.py = stripTop + 28 + Math.floor(i / per) * 34;
      });
      fx = function (d) {
        return d.deg ? W / 2 : d.px;
      };
      fy = function (d) {
        return d.deg ? (stripTop - 10) / 2 + 6 : d.py;
      };
      G.append("line").attr("x1", 0).attr("x2", W).attr("y1", stripTop).attr("y2", stripTop);
      G.append("text")
        .attr("x", 12)
        .attr("y", stripTop + 13)
        .text("no connections recorded yet");
      G.append("text").attr("class", "eco_n").attr("x", 12).attr("y", 20).text("solid: output feeds the next tool \u00b7 dashed: built on, or runs, the other");
    }

    repos.forEach(function (d) {
      if (d.x == null) {
        d.x = fx(d) + (Math.random() - 0.5) * 40;
        d.y = fy(d) + (Math.random() - 0.5) * 40;
      }
    });

    sim = d3.forceSimulation(repos).alphaDecay(0.035).velocityDecay(0.38).on("tick", tick);
    if (v === "connections") {
      sim
        .force(
          "x",
          d3.forceX(fx).strength(function (d) {
            return d.deg ? 0.05 : 0.9;
          })
        )
        .force(
          "y",
          d3.forceY(fy).strength(function (d) {
            return d.deg ? 0.09 : 0.9;
          })
        )
        .force(
          "charge",
          d3.forceManyBody().strength(function (d) {
            return d.deg ? -260 : 0;
          })
        )
        .force(
          "link",
          d3
            .forceLink(
              links.map(function (l) {
                return { source: l.source, target: l.target };
              })
            )
            .distance(function (l) {
              return l.source.r + l.target.r + 46;
            })
            .strength(0.45)
        )
        .force(
          "c",
          d3
            .forceCollide(function (d) {
              return d.deg ? Math.max(d.r + 14, d.n.length * 3.2) : Math.min(d.r, 15) + 1;
            })
            .iterations(3)
        );
    } else {
      sim
        .force("x", d3.forceX(fx).strength(sx))
        .force("y", d3.forceY(fy).strength(sy))
        .force(
          "c",
          d3
            .forceCollide(function (d) {
              return d.lab ? Math.max(d.r + 13, d.n.length * 3.2) : d.r + 2;
            })
            .iterations(3)
        );
    }
    if (reduced) {
      sim.stop();
      for (var i = 0; i < 320; i++) sim.tick();
      tick();
    }
  }

  function tick() {
    d3.selectAll(".eco_node").attr("transform", function (d) {
      d.x = Math.max(d.r + 3, Math.min(W - d.r - 3, d.x));
      d.y = Math.max(d.r + 3, Math.min(H - d.r - (d.lab ? 18 : 3), d.y));
      return "translate(" + d.x.toFixed(1) + "," + d.y.toFixed(1) + ")";
    });
    placeLinks();
    if (state.pinned) placeCard();
  }

  // draw each visible link from rim to rim so the arrowhead is not hidden
  function placeLinks() {
    d3.selectAll(".eco_link").each(function (l) {
      if (this.style.display === "none") return;
      var a = l.source,
        b = l.target;
      if (a.x == null || b.x == null) return;
      var dx = b.x - a.x,
        dy = b.y - a.y,
        d = Math.sqrt(dx * dx + dy * dy) || 1,
        ux = dx / d,
        uy = dy / d;
      this.setAttribute("x1", a.x + ux * (a.r + 1));
      this.setAttribute("y1", a.y + uy * (a.r + 1));
      this.setAttribute("x2", b.x - ux * (b.r + 3));
      this.setAttribute("y2", b.y - uy * (b.r + 3));
    });
  }

  function measure() {
    var s = $("eco-stage");
    W = s.clientWidth;
    H = state.view === "list" ? 700 : s.clientHeight;
    d3.select("#eco-svg").attr("viewBox", "0 0 " + W + " " + H);
  }

  function setHash(h) {
    try {
      history.replaceState(null, "", "#" + h);
    } catch (e) {}
  }

  function setView(v, quiet) {
    if (VIEWS.indexOf(v) < 0) v = "ocean";
    state.view = v;
    unpin(true);
    hideTip();
    root.querySelectorAll("#eco-views button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.v === v);
    });
    $("eco-stage").classList.toggle("eco_list", v === "list");
    if (!quiet) setHash(v);
    measure();
    draw();
    label();
    layout();
    refresh();
  }

  // ---- hover summary and pinned card -------------------------------------
  function showTip(d) {
    var t = $("eco-tip");
    t.innerHTML =
      "<strong>" +
      esc(d.n) +
      "</strong><p>" +
      esc(d.sum || "No description yet.") +
      "</p><small>★ " +
      d.s +
      (d.l ? " · " + esc(d.l) : "") +
      " · updated " +
      ago(d.days) +
      "</small>";
    t.hidden = false;
  }

  function moveTip(ev) {
    var t = $("eco-tip");
    if (t.hidden) return;
    var b = $("eco-stage").getBoundingClientRect(),
      x = ev.clientX - b.left + 14,
      y = ev.clientY - b.top + 14;
    if (x + t.offsetWidth > b.width - 6) x = ev.clientX - b.left - t.offsetWidth - 12;
    if (y + t.offsetHeight > b.height - 6) y = ev.clientY - b.top - t.offsetHeight - 12;
    t.style.left = Math.max(6, x) + "px";
    t.style.top = Math.max(6, y) + "px";
  }

  function hideTip() {
    $("eco-tip").hidden = true;
  }

  function relRow(title, list) {
    if (!list.length) return "";
    return (
      '<div class="eco_rel"><span>' +
      title +
      "</span>" +
      list
        .map(function (r) {
          return '<button type="button" data-repo="' + esc(r.n) + '">' + esc(r.n) + "</button>";
        })
        .join("") +
      "</div>"
    );
  }

  function pin(d) {
    if (state.view === "list") setView("ocean");
    if (!matches(d)) {
      // reached from a deep link or a connection chip: clear whatever hides it
      state.task = null;
      state.theme = null;
      state.q = "";
      $("eco-q").value = "";
      buildChips();
      buildTasks();
    }
    hideTip();
    if (state.pinned) hot(state.pinned, false);
    state.pinned = d;
    hot(d, true);
    var pick = function (arr, side, kind) {
      return arr
        .filter(function (l) {
          return l.kind === kind;
        })
        .map(function (l) {
          return l[side];
        });
    };
    var c = $("eco-card");
    c.style.setProperty("--c", d.theme.color);
    c.innerHTML =
      '<button type="button" class="eco_x" aria-label="Close">×</button>' +
      '<div class="eco_card_title">' +
      esc(d.n) +
      "</div>" +
      '<span class="eco_cat"><i></i>' +
      esc(d.theme.name) +
      (d.a ? " · archived" : "") +
      "</span>" +
      (d.status ? '<span class="eco_status">' + esc(d.status) + "</span>" : "") +
      (d.sum ? "<p>" + esc(d.sum) + "</p>" : '<p class="eco_none">No description yet.</p>') +
      "<dl><dt>Stars</dt><dd>" +
      d.s +
      "</dd><dt>Forks</dt><dd>" +
      d.f +
      "</dd><dt>Language</dt><dd>" +
      esc(d.l || "n/a") +
      "</dd><dt>" +
      (d.release ? "Release" : "Since") +
      "</dt><dd>" +
      esc(d.release || new Date(d.created).getFullYear()) +
      "</dd></dl>" +
      '<span class="eco_cat">Last updated ' +
      ago(d.days) +
      "</span>" +
      relRow("Feeds into", pick(d.out, "target", "feeds")) +
      relRow("Takes input from", pick(d.inn, "source", "feeds")) +
      relRow("Built on / runs", pick(d.out, "target", "uses")) +
      relRow("Used by", pick(d.inn, "source", "uses")) +
      (d.t.length
        ? '<div class="eco_topics">' +
          d.t
            .slice(0, 8)
            .map(function (t) {
              return "<span>" + esc(t) + "</span>";
            })
            .join("") +
          "</div>"
        : "") +
      '<div class="eco_go"><a class="eco_gh" href="' +
      esc(d.url) +
      '" target="_blank" rel="noopener">Open on GitHub →</a>' +
      (d.h && /^https?:\/\//.test(d.h) ? '<a class="eco_hp" href="' + esc(d.h) + '" target="_blank" rel="noopener">Docs / homepage</a>' : "") +
      "</div>";
    c.hidden = false;
    c.querySelector(".eco_x").onclick = function () {
      unpin();
    };
    c.querySelectorAll(".eco_rel button").forEach(function (b) {
      b.onclick = function () {
        var r = byName[b.dataset.repo];
        if (r) pin(r);
      };
    });
    setHash(d.n);
    refresh();
    placeCard();
    c.querySelector("a.eco_gh").focus({ preventScroll: true });
  }

  function placeCard() {
    var d = state.pinned,
      c = $("eco-card");
    if (!d || c.hidden || d.x == null) return;
    var cw = c.offsetWidth,
      ch = c.offsetHeight,
      x = d.x + d.r + 12,
      y = d.y - ch / 2;
    if (x + cw > W - 8) x = d.x - d.r - 12 - cw;
    if (x < 8) {
      x = Math.max(8, Math.min(W - cw - 8, d.x - cw / 2));
      y = d.y + d.r + 12;
    }
    y = Math.max(8, Math.min(H - ch - 8, y));
    c.style.left = x + "px";
    c.style.top = y + "px";
  }

  function unpin(keepHash) {
    if (!state.pinned) return;
    hot(state.pinned, false);
    state.pinned = null;
    $("eco-card").hidden = true;
    if (!keepHash) {
      setHash(state.view);
      refresh();
    }
  }

  // ---- list view ----------------------------------------------------------
  function table() {
    var cols = [
      ["n", "Repository"],
      ["sum", "Summary"],
      ["theme", "Theme"],
      ["l", "Language"],
      ["s", "Stars"],
      ["days", "Updated"],
    ];
    var rows = repos.filter(matches),
      k = state.sort,
      dir = state.dir;
    var val = function (r) {
      return k === "theme" ? r.theme.i : k === "score" ? r.score : r[k];
    };
    rows.sort(function (a, b) {
      var x = val(a),
        y = val(b);
      if (typeof x === "string") {
        x = x.toLowerCase();
        y = String(y).toLowerCase();
      }
      return (x < y ? -1 : x > y ? 1 : 0) * dir || b.score - a.score;
    });
    var h =
      "<table><thead><tr>" +
      cols
        .map(function (c) {
          var num = c[0] === "s" || c[0] === "days";
          return (
            "<th" +
            (num ? ' class="eco_num"' : "") +
            (c[0] === k ? ' aria-sort="' + (dir > 0 ? "ascending" : "descending") + '"' : "") +
            '><button type="button" data-k="' +
            c[0] +
            '">' +
            c[1] +
            (c[0] === k ? (dir > 0 ? " ↑" : " ↓") : "") +
            "</button></th>"
          );
        })
        .join("") +
      "</tr></thead><tbody>";
    h += rows
      .map(function (r) {
        return (
          '<tr><td class="eco_name"><a href="' +
          esc(r.url) +
          '" target="_blank" rel="noopener">' +
          esc(r.n) +
          '</a></td><td class="eco_d">' +
          esc(r.sum || "") +
          '</td><td><span class="eco_cat" style="--c:' +
          r.theme.color +
          '"><i></i>' +
          esc(r.theme.name) +
          "</span></td><td>" +
          esc(r.l || "") +
          '</td><td class="eco_num">' +
          r.s +
          '</td><td class="eco_num">' +
          ago(r.days) +
          "</td></tr>"
        );
      })
      .join("");
    h += "</tbody></table>" + (rows.length ? "" : '<div class="eco_empty">Nothing matches. Try a shorter search or clear the filters.</div>');
    var w = $("eco-table");
    w.innerHTML = h;
    w.querySelectorAll("th button").forEach(function (b) {
      b.onclick = function () {
        var nk = b.dataset.k;
        if (state.sort === nk) state.dir = -state.dir;
        else {
          state.sort = nk;
          state.dir = nk === "s" ? -1 : 1;
        }
        table();
      };
    });
  }

  // ---- wire up ------------------------------------------------------------
  prepare();
  if (!repos.length) {
    root.hidden = true;
    return;
  }
  buildChips();
  buildTasks();
  buildTop();
  setFoot();

  root.querySelectorAll("#eco-views button").forEach(function (b) {
    b.onclick = function () {
      setView(b.dataset.v);
    };
  });

  var qt;
  $("eco-q").addEventListener("input", function () {
    clearTimeout(qt);
    var v = this.value;
    qt = setTimeout(function () {
      state.q = v.trim().toLowerCase();
      refresh();
    }, 90);
  });
  $("eco-q").addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var m = repos.filter(matches).sort(function (a, b) {
      return b.score - a.score;
    })[0];
    if (m && state.view !== "list") pin(m);
  });
  $("eco-stage").addEventListener("click", function (e) {
    if (!e.target.closest(".eco_card")) unpin();
  });
  $("eco-card").addEventListener("click", function (e) {
    e.stopPropagation();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") unpin();
  });

  // the hash names either a view (#themes) or a repository (#salmon)
  function fromHash() {
    var h = decodeURIComponent(location.hash.slice(1));
    if (!h) return;
    if (VIEWS.indexOf(h) >= 0) {
      if (h !== state.view) setView(h, true);
    } else if (byName[h] && state.pinned !== byName[h]) {
      setTimeout(function () {
        pin(byName[h]);
      }, reduced ? 0 : 900);
    }
  }
  window.addEventListener("hashchange", fromHash);

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if ($("eco-stage").clientWidth !== W) {
        measure();
        draw();
        layout();
        refresh();
      }
    }, 150);
  });

  var first = decodeURIComponent(location.hash.slice(1));
  setView(VIEWS.indexOf(first) >= 0 ? first : "ocean", true);
  fromHash();
})();
