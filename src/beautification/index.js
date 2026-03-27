import { initMenuValues, menu_value, menu_setting } from '../shared/menu-framework.js';
import { getTheme, setTheme } from '../shared/theme.js';
import { getWidescreenCSS } from './widescreen.js';

// CSS imports (inlined as strings by rollup)
import css_base from './styles/base.css';
import css_index from './styles/index.css';
import css_hideArticleImage from './styles/hide-article-image.css';
import css_picHeight from './styles/pic-height.css';
import css_darkMode1 from './styles/darkMode-1.css';
import css_darkMode1x from './styles/darkMode-1-x.css';
import css_darkMode2 from './styles/darkMode-2.css';
import css_darkMode2Firefox from './styles/darkMode-2-firefox.css';
import css_darkMode3 from './styles/darkMode-3.css';
import css_darkMode3Firefox from './styles/darkMode-3-firefox.css';
import css_darkMode4 from './styles/darkMode-4.css';
import css_darkMode4Firefox from './styles/darkMode-4-firefox.css';

(function () {
  "use strict";
  var menu_ALL = [
      {
        key: "menu_widescreenDisplay", label: "宽屏显示",
        tips: "勾选 = 该页面开启宽屏显示（刷新后查看效果）",
        type: "group",
        children: [
          { key: "menu_widescreenDisplayIndex", label: "首页", default: true },
          { key: "menu_widescreenDisplayQuestion", label: "问题页", default: true },
          { key: "menu_widescreenDisplaySearch", label: "搜索页、话题页、圈子", default: true },
          { key: "menu_widescreenDisplayCollection", label: "收藏页", default: true },
          { key: "menu_widescreenDisplayPost", label: "文章页", default: false },
          { key: "menu_widescreenDisplayPeople", label: "用户主页", default: false },
          { key: "menu_widescreenDisplayWidth", label: "宽屏宽度", tips: "宽屏宽度 (默认 1000)", default: "1000", inputType: "text" },
        ],
      },
      { key: "menu_darkMode", label: "暗黑模式", tips: "暗黑模式", default: true, type: "toggle" },
      { key: "menu_darkModeType", label: "暗黑模式切换（1~4）", tips: "暗黑模式切换", default: 1, type: "cycle", max: 4 },
      { key: "menu_darkModeAuto", label: "暗黑模式跟随浏览器", tips: "暗黑模式跟随浏览器", default: false, type: "toggle" },
      { key: "menu_picHeight", label: "调整图片最大高度", tips: "调整图片最大高度", default: true, type: "toggle" },
      { key: "menu_postimg", label: "隐藏文章开头大图", tips: "隐藏文章开头大图", default: true, type: "toggle" },
      { key: "menu_hideTitle", label: "向下翻时自动隐藏顶栏", tips: "向下翻时自动隐藏顶栏", default: true, type: "toggle" },
    ],
    menu_ID = [];
  initMenuValues(menu_ALL);
  registerMenuCommand();
  addStyle();
  // 向下翻时自动隐藏顶栏
  if (menu_value("menu_hideTitle")) setTimeout(hideTitle, 2000);

  // 注册脚本菜单
  function registerMenuCommand() {
    for (let i = 0; i < menu_ID.length; i++) {
      GM_unregisterMenuCommand(menu_ID[i]);
    }
    menu_ID = [];

    for (const item of menu_ALL) {
      if (item.type === "group") {
        menu_ID.push(GM_registerMenuCommand(`#️⃣ ${item.label}`, function () {
          menu_setting(item.label, item.tips, item.children);
        }));
      } else if (item.type === "cycle") {
        let val = GM_getValue(item.key);
        if (val > item.max) { val = 1; GM_setValue(item.key, val); }
        menu_ID.push(GM_registerMenuCommand(
          `${menu_num(val)} ${item.label}`,
          function () { menu_toggle(GM_getValue(item.key), item.key); },
        ));
      } else if (item.type === "toggle") {
        let val = GM_getValue(item.key);
        menu_ID.push(GM_registerMenuCommand(
          `${val ? "✅" : "❌"} ${item.label}`,
          function () { menu_switch(`${GM_getValue(item.key)}`, item.key, item.tips); },
        ));
      }
    }

    menu_ID.push(GM_registerMenuCommand("💬 反馈 & 建议", function () {
      window.GM_openInTab("https://github.com/XIU2/UserScript#xiu2userscript", { active: true, insert: true, setParent: true });
      window.GM_openInTab("https://greasyfork.org/zh-CN/scripts/412212/feedback", { active: true, insert: true, setParent: true });
    }));
  }

  // 切换暗黑模式
  function menu_toggle(menu_status, Name) {
    menu_status = parseInt(menu_status);
    if (menu_status >= 4) {
      menu_status = 1;
    } else {
      menu_status += 1;
    }
    GM_setValue(`${Name}`, menu_status);
    if (menu_status === 1) {
      // 设置 Cookie
      if (getTheme() === "light") { setTheme("dark"); location.reload(); }
    } else {
      if (getTheme() === "dark") {
        setTheme("light"); location.reload();
      } else {
        if (menu_value("menu_darkMode")) {
          location.reload();
        } else {
          registerMenuCommand();
        }
      }
    }
  }

  // 菜单数字图标
  function menu_num(num) {
    return ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"][
      num
    ];
  }

  // 菜单开关
  function menu_switch(menu_status, Name, Tips) {
    if (menu_status == "true") {
      GM_setValue(`${Name}`, false);

      if (Name === "menu_darkMode") {
        // 暗黑模式
        if (getTheme() === "dark") {
          setTheme("light"); location.reload();
        } else {
          location.reload();
        }
      } else {
        GM_notification({
          text: `已关闭 [${Tips}] 功能\n（点击刷新网页后生效）`,
          timeout: 3500,
          onclick: function () {
            location.reload();
          },
        });
      }
    } else {
      GM_setValue(`${Name}`, true);

      if (Name === "menu_darkMode") {
        if (menu_value("menu_darkModeType") === 1) {
          if (getTheme() === "light") { setTheme("dark"); location.reload(); }
        } else {
          if (getTheme() === "dark") {
            setTheme("light"); location.reload();
          } else {
            location.reload();
          }
        }
      } else {
        GM_notification({
          text: `已开启 [${Tips}] 功能\n（点击刷新网页后生效）`,
          timeout: 3500,
          onclick: function () {
            location.reload();
          },
        });
      }
    }
    registerMenuCommand(); // 重新注册脚本菜单
  }

  // 添加样式
  function addStyle() {
    let style = css_base,
      style_index = css_index;

    // 宽屏 CSS（动态宽度）
    const ws = getWidescreenCSS(GM_getValue('menu_widescreenDisplayWidth'));
    let style_widescreenDisplayIndex = ws.index,
      style_widescreenDisplayQuestion = ws.question,
      style_widescreenDisplaySearch = ws.search,
      style_widescreenDisplayCollection = ws.collection,
      style_widescreenDisplayPost = ws.post,
      style_widescreenDisplayPeople = ws.people;

    // 暗黑模式 CSS
    let style_darkMode_1 = css_darkMode1,
      style_darkMode_1_x = css_darkMode1x,
      style_darkMode_2 = css_darkMode2,
      style_darkMode_3 = css_darkMode3,
      style_darkMode_4 = css_darkMode4;

    // 其他功能 CSS
    let style_2 = css_hideArticleImage,
      style_4 = css_picHeight;

    // Firefox 兼容
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
    if (isFirefox) {
      style_darkMode_2 = css_darkMode2Firefox;
      style_darkMode_3 = css_darkMode3Firefox;
      style_darkMode_4 = css_darkMode4Firefox;
    }

    let style_Add = document.createElement("style");

    // 如果开启了 [暗黑模式]
    if (menu_value("menu_darkMode")) {
      // 如果开启了 [暗黑模式跟随浏览器] 且 当前浏览器是暗黑模式
      if (
        menu_value("menu_darkModeAuto") &&
        !window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        // 如果是暗黑模式，则需要改为白天模式
        if (getTheme() === "dark") {
          setTheme("light"); location.reload();
        }
      } else {
        // 如果暗黑模式为 1
        if (menu_value("menu_darkModeType") === 1) {
          // 如果当前知乎主题为白天模式，那就是改为暗黑模式
          if (getTheme() === "light") {
            setTheme("dark"); location.reload();
          }
          // 如果是问题日志页，则改为暗黑模式
          if (location.pathname.includes("/log")) {
            document.documentElement.setAttribute("data-theme", "dark");
            style_darkMode_1 += style_darkMode_1_x;
          }
        } else {
          // 如果是其他暗黑模式，则需要确保为白天模式
          if (getTheme() === "dark") {
            setTheme("light"); location.reload();
          }
        }
        switch (menu_value("menu_darkModeType")) {
          case 1:
            if (
              !(
                location.hostname.includes("zhuanlan") &&
                (location.pathname.includes("/edit") ||
                  location.pathname.includes("/write"))
              )
            )
              style += style_darkMode_1;
            break;
          case 2:
            style += style_darkMode_2;
            break;
          case 3:
            style += style_darkMode_3;
            break;
          case 4:
            style += style_darkMode_4;
            break;
        }
      }
    } else {
      if (getTheme() === "dark") {
        setTheme("light"); location.reload();
      }
    }

    if (
      location.pathname === "/" ||
      location.pathname === "/hot" ||
      location.pathname === "/follow"
    )
      style += style_index;
    if (
      menu_value("menu_darkMode") &&
      menu_value("menu_darkModeType") === 1 &&
      (location.pathname.includes("/special/") ||
        location.pathname.includes("/pub/"))
    )
      style += style_darkMode_2 + "video {filter: invert(1) !important;}";

    // 宽屏显示
    if (menu_value("menu_widescreenDisplayIndex"))
      style += style_widescreenDisplayIndex;
    if (
      menu_value("menu_widescreenDisplayQuestion") &&
      location.pathname.includes("/question/")
    )
      style += style_widescreenDisplayQuestion;
    if (
      menu_value("menu_widescreenDisplaySearch") &&
      (location.pathname === "/search" ||
        location.pathname.includes("/club/") ||
        location.pathname.includes("/topic/"))
    )
      style += style_widescreenDisplaySearch;
    if (
      menu_value("menu_widescreenDisplayCollection") &&
      location.pathname.includes("/collection/")
    )
      style += style_widescreenDisplayCollection;
    if (
      menu_value("menu_widescreenDisplayPost") &&
      location.hostname.includes("zhuanlan") &&
      location.pathname.includes("/edit") === false &&
      location.pathname.includes("/write") === false
    )
      style += style_widescreenDisplayPost;
    if (
      menu_value("menu_widescreenDisplayPeople") &&
      location.pathname.includes("/people/")
    )
      style += style_widescreenDisplayPeople;

    // 调整图片最大高度
    if (menu_value("menu_picHeight")) style += style_4;
    // 隐藏文章开头大图
    if (menu_value("menu_postimg")) style += style_2;

    if (document.lastChild) {
      document.lastChild.appendChild(style_Add).textContent = style;
    } else {
      // 避免网站加载速度太慢的备用措施
      let timer1 = setInterval(function () {
        // 每 50 毫秒检查一下 html 是否已存在
        if (document.lastChild) {
          clearInterval(timer1); // 取消定时器
          document.lastChild.appendChild(style_Add).textContent = style;
        }
      }, 50);
    }
  }

  function hideTitle() {
    // 获取需要控制的元素
    const floatingElement = document.getElementsByTagName("header")[0];
    if (!floatingElement) return;
    let beforeScrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;

    let _scrollTicking = false;
    window.addEventListener(
      "scroll",
      function (e) {
        if (_scrollTicking) return;
        _scrollTicking = true;
        requestAnimationFrame(function () {
          var afterScrollTop =
              document.documentElement.scrollTop || document.body.scrollTop,
            delta = afterScrollTop - beforeScrollTop;
          if (delta !== 0) {
            floatingElement.hidden = delta > 0;
            beforeScrollTop = afterScrollTop;
          }
          _scrollTicking = false;
        });
      },
      false,
    );
  }

})();
