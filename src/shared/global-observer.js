// 全局统一 MutationObserver 管理器（合并所有 document 级 childList+subtree 观察器）
export const GlobalObserver = (function () {
  const handlers = new Set();
  let observer = null;

  function init() {
    if (observer) return;
    observer = new MutationObserver((mutations) => {
      for (const handler of handlers) {
        try {
          handler(mutations);
        } catch (e) {
          console.warn("GlobalObserver error:", e);
        }
      }
    });
    observer.observe(document, { childList: true, subtree: true });
  }

  return {
    add(handler) {
      handlers.add(handler);
      if (!observer) init();
      return handler;
    },
    remove(handler) {
      handlers.delete(handler);
    },
  };
})();
