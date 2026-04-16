// URL 变化事件管理器（避免重复注册 urlchange 监听器）
// 支持 scoped handlers 和 onBeforeNavigate 回调（用于清理 GlobalObserver scoped handlers）
export const UrlChangeManager = (function () {
  const handlers = new Set();
  const scopedHandlers = new Set();
  let initialized = false;
  let beforeNavigateCallback = null;

  function init() {
    if (initialized) return;
    initialized = true;
    window.addEventListener("urlchange", () => {
      // 先执行清理回调（清理 GlobalObserver scoped handlers）
      if (beforeNavigateCallback) {
        try { beforeNavigateCallback(); } catch (e) { console.warn("UrlChange beforeNavigate error:", e); }
      }
      // 清理 scoped URL handlers
      scopedHandlers.clear();
      // 执行永久 handlers
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
    addScoped(handler) {
      if (!initialized) init();
      scopedHandlers.add(handler);
      return handler;
    },
    remove(handler) {
      handlers.delete(handler);
      scopedHandlers.delete(handler);
    },
    // 注册 URL 变化前的清理回调（用于 GlobalObserver.clearScoped）
    onBeforeNavigate(callback) {
      beforeNavigateCallback = callback;
    },
  };
})();

// 自定义 urlchange 事件（用来监听 URL 变化）
export function addUrlChangeEvent() {
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
