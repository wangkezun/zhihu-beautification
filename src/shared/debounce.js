// 防抖
export function debounce(fn, delay) {
  let timer;
  function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  }
  debounced.cancel = function () {
    clearTimeout(timer);
  };
  return debounced;
}
