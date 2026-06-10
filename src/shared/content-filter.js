import { GlobalObserver } from './global-observer.js';
import { UrlChangeManager } from './url-change.js';

/**
 * 创建内容过滤器 — 统一处理 初始扫描 + URL变化重扫 + MutationObserver 监听新节点
 *
 * @param {Object} opts
 * @param {string} opts.selector    - 目标元素 CSS 选择器 (querySelectorAll 用)
 * @param {string} opts.className   - MutationObserver 中匹配新增节点的 className (精确匹配)
 * @param {Function} opts.processItem - (element) => void，对每个匹配元素执行的处理函数
 * @param {Function} [opts.initialScan] - 可选：自定义初始扫描逻辑，替代默认的 querySelectorAll
 */
export function createContentFilter({ selector, className, processItem, initialScan }) {
  // 初始扫描
  function scanNow() {
    if (initialScan) {
      initialScan();
    } else {
      document.querySelectorAll(selector).forEach(processItem);
    }
  }

  scanNow();

  // URL 变化后重新扫描
  UrlChangeManager.add(function () {
    setTimeout(scanNow, 1000);
  });

  // 监听动态插入的新节点
  GlobalObserver.add(function (mutationsList) {
    for (const mutation of mutationsList) {
      for (const target of mutation.addedNodes) {
        if (target.nodeType != 1) continue;
        if (target.className === className) {
          processItem(target);
        }
      }
    }
  });
}
