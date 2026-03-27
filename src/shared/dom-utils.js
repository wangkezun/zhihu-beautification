// 寻找父元素
export function findParentElement(item, className, type = false) {
  if (item.parentElement) {
    if (type) {
      // true = 完全一致，false = 包含即可
      if (
        item.parentElement.className &&
        item.parentElement.className === className
      ) {
        return item.parentElement;
      } else {
        let temp = findParentElement(item.parentElement, className, true);
        if (temp) return temp;
      }
    } else {
      if (
        item.parentElement.className &&
        item.parentElement.className.indexOf(className) > -1
      ) {
        return item.parentElement;
      } else {
        let temp = findParentElement(item.parentElement, className);
        if (temp) return temp;
      }
    }
  }
  return;
}

// 获取元素是否在可视区域（完全可见）
export function isElementInViewport(el) {
  let rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// 获取元素是否在可视区域（部分可见）
export function isElementInViewport_(el) {
  let rect = el.getBoundingClientRect();
  return (
    rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom > 0
  );
}

export function getXpath(xpath, contextNode, doc = document) {
  contextNode = contextNode || doc;
  try {
    const result = doc.evaluate(
      xpath,
      contextNode,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    );
    return (
      result.singleNodeValue &&
      result.singleNodeValue.nodeType === 1 &&
      result.singleNodeValue
    );
  } catch (err) {
    throw new Error(`无效 Xpath: ${xpath}`);
  }
}
