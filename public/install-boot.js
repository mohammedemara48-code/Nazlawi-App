(function () {
  if (!("serviceWorker" in navigator)) return;
  window.__nazlawiInstall = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    window.__nazlawiInstall = e;
    window.dispatchEvent(new Event("nazlawi-can-install"));
  });
  window.addEventListener("appinstalled", function () {
    window.__nazlawiInstall = null;
    window.dispatchEvent(new Event("nazlawi-installed"));
  });
  navigator.serviceWorker.register("/nazlawi-sw.js", { scope: "/" }).catch(function () {});
})();
