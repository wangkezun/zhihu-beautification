import { initMenuValues, menu_value, menu_setting } from './shared/menu-framework.js';
import { getTheme, setTheme } from './shared/theme.js';
import { getWidescreenCSS } from './widescreen.js';

// CSS imports (inlined as strings by rollup)
import css_base from './styles/base.css';
import css_index from './styles/index.css';
import css_hideArticleImage from './styles/hide-article-image.css';
import css_picHeight from './styles/pic-height.css';
import css_darkMode1 from './styles/darkMode-1.css';
import css_darkMode1x from './styles/darkMode-1-x.css';

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
      { key: "menu_darkMode", label: "Catppuccin 配色", tips: "Catppuccin 配色", default: true, type: "toggle" },
      { key: "menu_darkModeType", label: "Catppuccin 风格切换", tips: "切换 Mocha、Macchiato、Frappé、Latte", default: 1, type: "cycle", max: 4 },
      { key: "menu_darkModeAuto", label: "深色风格跟随浏览器", tips: "深色风格跟随浏览器", default: false, type: "toggle" },
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
          `${menu_num(val)} ${catppuccinFlavourName(val)} ${item.label}`,
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

  // 切换 Catppuccin 风格
  function menu_toggle(menu_status, Name) {
    menu_status = parseInt(menu_status);
    if (menu_status >= 4) {
      menu_status = 1;
    } else {
      menu_status += 1;
    }
    GM_setValue(`${Name}`, menu_status);
    if (menu_value("menu_darkMode")) {
      const theme = isLightFlavour(menu_status) ? "light" : "dark";
      if (getTheme() !== theme) {
        setTheme(theme); location.reload();
      } else {
        location.reload();
      }
    } else {
      registerMenuCommand();
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
        const theme = isLightFlavour(menu_value("menu_darkModeType")) ? "light" : "dark";
        if (getTheme() !== theme) setTheme(theme);
        location.reload();
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

    // Catppuccin CSS：以 Mocha 样式为基础，按 flavour 替换色板。
    let style_darkMode_1 = css_darkMode1,
      style_darkMode_1_x = css_darkMode1x;

    // 其他功能 CSS
    let style_2 = css_hideArticleImage,
      style_4 = css_picHeight;

    let style_Add = document.createElement("style");

    const selectedFlavour = menu_value("menu_darkModeType");
    const flavour = menu_value("menu_darkModeAuto") &&
      !window.matchMedia("(prefers-color-scheme: dark)").matches ? 4 : selectedFlavour;

    // 如果开启了 Catppuccin 配色
    if (menu_value("menu_darkMode")) {
      const theme = isLightFlavour(flavour) ? "light" : "dark";
      if (getTheme() !== theme) {
        setTheme(theme); location.reload();
      }
      if (location.pathname.includes("/log") && !isLightFlavour(flavour)) {
        document.documentElement.setAttribute("data-theme", "dark");
        style_darkMode_1 += style_darkMode_1_x;
      }
      if (!(location.hostname.includes("zhuanlan") &&
        (location.pathname.includes("/edit") || location.pathname.includes("/write")))) {
        style += getCatppuccinCSS(flavour, style_darkMode_1);
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
      (location.pathname.includes("/special/") ||
        location.pathname.includes("/pub/"))
    )
      style += getCatppuccinCSS(flavour, style_darkMode_1);

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

    // document-start 时 head 可能尚不存在，挂到 <html> 下同样生效且零延迟
    // （注入晚了暗黑模式会先白屏闪烁一下）
    (document.head || document.documentElement).appendChild(
      style_Add,
    ).textContent = style;
  }

  function getCatppuccinCSS(flavour, css) {
    const palettes = {
      4: { // Latte
        "#1e1e2e": "#eff1f5", "#181825": "#e6e9ef", "#11111b": "#dce0e8",
        "#313244": "#ccd0da", "#45475a": "#bcc0cc", "#585b70": "#acb0be",
        "#6c7086": "#9ca0b0", "#7f849c": "#8c8fa1", "#9399b2": "#7c7f93",
        "#bac2de": "#5c5f77", "#cdd6f4": "#4c4f69", "#89b4fa": "#1e66f5",
        "#b4befe": "#7287fd", "#f38ba8": "#d20f39", "#a6e3a1": "#40a02b",
      },
      3: { // Frappé
        "#1e1e2e": "#303446", "#181825": "#292c3c", "#11111b": "#232634",
        "#313244": "#414559", "#45475a": "#51576d", "#585b70": "#626880",
        "#6c7086": "#737994", "#7f849c": "#838ba7", "#9399b2": "#949cbb",
        "#bac2de": "#b5bfe2", "#cdd6f4": "#c6d0f5", "#89b4fa": "#8caaee",
        "#b4befe": "#babbf1", "#f38ba8": "#e78284", "#a6e3a1": "#a6d189",
      },
      2: { // Macchiato
        "#1e1e2e": "#24273a", "#181825": "#1e2030", "#11111b": "#181926",
        "#313244": "#363a4f", "#45475a": "#494d64", "#585b70": "#5b6078",
        "#6c7086": "#6e738d", "#7f849c": "#8087a2", "#9399b2": "#939ab7",
        "#bac2de": "#b8c0e0", "#cdd6f4": "#cad3f5", "#89b4fa": "#8aadf4",
        "#b4befe": "#b7bdf8", "#f38ba8": "#ed8796", "#a6e3a1": "#a6da95",
      },
      1: {}, // Mocha（原始 CSS）
    };
    const palette = palettes[flavour] || palettes[1];
    const rgba = {
      1: ["24,24,37", "137,180,250"],
      2: ["36,39,58", "138,173,244"],
      3: ["48,52,70", "140,170,238"],
      4: ["239,241,245", "30,102,245"],
    }[Number(flavour)] || ["24,24,37", "137,180,250"];
    let themed = css
      .replace(/#[0-9a-fA-F]{6}/g, (color) => palette[color.toLowerCase()] || color)
      .replaceAll("rgba(24,24,37", `rgba(${rgba[0]}`)
      .replaceAll("rgba(137,180,250", `rgba(${rgba[1]}`);
    if (isLightFlavour(flavour)) {
      themed = themed
        .replaceAll("data-theme=dark", "data-theme=light")
        .replaceAll('data-theme="dark"', 'data-theme="light"');
    }
    return themed;
  }

  function isLightFlavour(flavour) {
    return Number(flavour) === 4;
  }

  function catppuccinFlavourName(flavour) {
    return ["", "Mocha", "Macchiato", "Frappé", "Latte"][Number(flavour)] || "Mocha";
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
