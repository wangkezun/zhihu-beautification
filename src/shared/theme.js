// 获取知乎 Cookie 中的主题类型
export function getTheme() {
  let name = "theme=",
    ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return "light";
}

// 修改知乎 Cookie 中的主题类型（纯数据操作，不触发 reload）
export function setTheme(theme) {
  switch (theme) {
    case "light":
      document.cookie =
        "theme=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
      document.documentElement.setAttribute("data-theme", "light");
      break;
    case "dark":
      document.cookie =
        "theme=dark; expires=Thu, 18 Dec 2031 12:00:00 GMT; path=/; SameSite=Lax";
      document.documentElement.setAttribute("data-theme", "dark");
      break;
  }
}

// 知乎会在 React 初始化时重新写入 data-theme，因此不能只依赖 Cookie。
// 持续把页面主题属性同步为脚本当前选择的主题，确保配色选择器始终生效。
export function keepTheme(theme, root = document.documentElement, Observer = MutationObserver) {
  const sync = () => {
    if (root.getAttribute("data-theme") !== theme) {
      root.setAttribute("data-theme", theme);
    }
  };

  sync();

  const observer = new Observer(sync);
  observer.observe(root, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return observer;
}
