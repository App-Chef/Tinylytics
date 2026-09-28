/*!
 * Tinylytics tracker (MIT). https://github.com/App-Chef/Tinylytics
 * No cookies, no local storage, no fingerprinting.
 */
(function () {
  "use strict";

  try {
    var w = window;
    var d = document;
    var loc = w.location;

    // Never run twice on the same page (e.g. the snippet was pasted twice).
    if (w.__tinylytics) return;
    w.__tinylytics = true;

    var script = d.currentScript || d.querySelector("script[data-site]");
    if (!script) return;

    var siteId = script.getAttribute("data-site");
    if (!siteId) return;

    var endpoint = script.getAttribute("data-api") || new URL(script.src, loc.href).origin + "/api/collect";
    var hashMode = script.getAttribute("data-hash") === "true";
    var allowLocal = script.getAttribute("data-allow-localhost") === "true";
    var respectDnt = script.getAttribute("data-respect-dnt") === "true";

    var lastPage = null;

    var ignored = function () {
      // Local development, automated browsers and opted-out browsers are not counted.
      if (!allowLocal && (/^(localhost|127\.|\[::1\]|0\.0\.0\.0)/.test(loc.hostname) || loc.protocol === "file:")) {
        return true;
      }
      if (w.navigator.webdriver) return true;
      if (respectDnt && (w.navigator.doNotTrack === "1" || w.navigator.globalPrivacyControl)) return true;
      try {
        // Set this in your own browser to exclude yourself: localStorage.tinylytics_ignore = "true"
        if (w.localStorage.getItem("tinylytics_ignore") === "true") return true;
      } catch (e) {
        // Storage can be blocked; that is fine.
      }
      return false;
    };

    var externalReferrer = function () {
      var ref = d.referrer;
      if (!ref) return "";
      try {
        var url = new URL(ref);
        if (url.hostname === loc.hostname) return "";
        // Only the origin and path. Query strings often contain search terms or tokens.
        return url.origin + url.pathname;
      } catch (e) {
        return "";
      }
    };

    var campaignSource = function () {
      try {
        var params = new URLSearchParams(loc.search);
        return params.get("utm_source") || params.get("ref") || "";
      } catch (e) {
        return "";
      }
    };

    var send = function (body) {
      var data = JSON.stringify(body);
      try {
        if (w.navigator.sendBeacon && w.navigator.sendBeacon(endpoint, new Blob([data], { type: "text/plain" }))) {
          return;
        }
      } catch (e) {
        // Fall through to fetch.
      }
      try {
        w.fetch(endpoint, {
          method: "POST",
          body: data,
          headers: { "Content-Type": "text/plain" },
          keepalive: true,
          credentials: "omit",
        }).catch(function () {});
      } catch (e) {
        // Tinylytics must never break the host page.
      }
    };

    var pageview = function () {
      try {
        var page = loc.pathname + (hashMode ? loc.hash : "");
        // Client-side routers often push or replace the same URL; count it once.
        if (page === lastPage) return;
        var first = lastPage === null;
        lastPage = page;
        if (ignored()) return;
        send({
          site_id: siteId,
          event: "page_view",
          page: page,
          // The document referrer only describes how the visitor arrived.
          referrer: first ? externalReferrer() : "",
          source: first ? campaignSource() : "",
        });
      } catch (e) {
        // Ignore.
      }
    };

    // Single page applications: track URL changes made through the History API.
    var wrap = function (name) {
      var original = w.history[name];
      if (typeof original !== "function") return;
      w.history[name] = function () {
        var result = original.apply(this, arguments);
        pageview();
        return result;
      };
    };
    wrap("pushState");
    wrap("replaceState");
    w.addEventListener("popstate", pageview);
    if (hashMode) w.addEventListener("hashchange", pageview);

    // Pages restored from the back/forward cache are new views.
    w.addEventListener("pageshow", function (e) {
      if (e.persisted) {
        lastPage = null;
        pageview();
      }
    });

    // Prerendered pages are only counted once the visitor actually sees them.
    if (d.visibilityState === "prerender") {
      d.addEventListener("visibilitychange", function onVisible() {
        if (d.visibilityState === "visible") {
          d.removeEventListener("visibilitychange", onVisible);
          pageview();
        }
      });
    } else {
      pageview();
    }
  } catch (e) {
    // Never throw into the host application.
  }
})();
