// Light/dark theme toggle. The initial theme is applied in <head> (see
// head.html) to avoid a flash; this script wires up the header toggle button
// and keeps the icon/label in sync.

(function () {
  var KEY = "combine-theme";
  var root = document.documentElement;

  function prefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  // The effective theme: an explicit choice on <html>, else the OS preference.
  function effective() {
    var attr = root.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
    return prefersDark() ? "dark" : "light";
  }

  function syncButton() {
    var btn = document.querySelector(".theme_toggle");
    if (!btn) return;
    var isDark = effective() === "dark";
    btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    var label = isDark ? "Switch to light theme" : "Switch to dark theme";
    btn.setAttribute("aria-label", label);
    btn.setAttribute("data-tooltip", label);
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch (e) {}
    syncButton();
    syncGiscus();
  }

  // Keep the giscus comments iframe (if present on the page) in sync with the
  // site theme. No-op on pages without comments.
  function syncGiscus() {
    var frame = document.querySelector("iframe.giscus-frame");
    if (!frame || !frame.contentWindow) return;
    frame.contentWindow.postMessage(
      { giscus: { setConfig: { theme: effective() } } },
      "https://giscus.app"
    );
  }

  // giscus posts a message once its iframe is ready; sync our theme to it then.
  window.addEventListener("message", function (e) {
    if (e.origin !== "https://giscus.app") return;
    if (e.data && e.data.giscus) syncGiscus();
  });

  // Toggle on click (event delegation so it works no matter when this runs).
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".theme_toggle") : null;
    if (!btn) return;
    apply(effective() === "dark" ? "light" : "dark");
  });

  // If the user has not made an explicit choice, follow OS changes live.
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function () {
      if (!root.getAttribute("data-theme")) syncButton();
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncButton);
  } else {
    syncButton();
  }
})();
