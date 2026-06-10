// URL 变化事件管理器（避免重复注册 urlchange 监听器）
export const UrlChangeManager = (function () {
  const handlers = new Set();
  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;
    window.addEventListener("urlchange", () => {
      for (const handler of handlers) {
        try {
          handler();
        } catch (e) {
          console.warn("UrlChange error:", e);
        }
      }
    });
  }

  return {
    add(handler) {
      if (!initialized) init();
      handlers.add(handler);
      return handler;
    },
    remove(handler) {
      handlers.delete(handler);
    },
  };
})();

// 自定义 urlchange 事件（用来监听 URL 变化）
let urlChangeEventPatched = false;
export function addUrlChangeEvent() {
  if (urlChangeEventPatched) return;
  urlChangeEventPatched = true;

  history.pushState = ((f) =>
    function pushState() {
      var ret = f.apply(this, arguments);
      window.dispatchEvent(new Event("pushstate"));
      window.dispatchEvent(new Event("urlchange"));
      return ret;
    })(history.pushState);

  history.replaceState = ((f) =>
    function replaceState() {
      var ret = f.apply(this, arguments);
      window.dispatchEvent(new Event("replacestate"));
      window.dispatchEvent(new Event("urlchange"));
      return ret;
    })(history.replaceState);

  window.addEventListener("popstate", () => {
    window.dispatchEvent(new Event("urlchange"));
  });
}
