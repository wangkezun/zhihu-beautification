// 全局统一 MutationObserver 管理器（合并所有 document 级 childList+subtree 观察器）
// 支持 scoped handlers：SPA 页面切换时自动清理，避免 handler 累积
export const GlobalObserver = (function () {
  const handlers = new Set();
  const scopedHandlers = new Set();
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
      for (const handler of scopedHandlers) {
        try {
          handler(mutations);
        } catch (e) {
          console.warn("GlobalObserver scoped error:", e);
        }
      }
    });
    observer.observe(document, { childList: true, subtree: true });
  }

  return {
    // 永久 handler，不会被 clearScoped 清理
    add(handler) {
      handlers.add(handler);
      if (!observer) init();
      return handler;
    },
    // 页面级 handler，URL 变化时通过 clearScoped() 清理
    addScoped(handler) {
      scopedHandlers.add(handler);
      if (!observer) init();
      return handler;
    },
    remove(handler) {
      handlers.delete(handler);
      scopedHandlers.delete(handler);
    },
    // 清理所有 scoped handlers（SPA 页面切换时调用）
    clearScoped() {
      scopedHandlers.clear();
    },
  };
})();
