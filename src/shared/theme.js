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
