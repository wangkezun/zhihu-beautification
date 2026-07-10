// ==UserScript==
// @name         知乎美化 Remake
// @version      4.0.0
// @author       wangkezun
// @description  宽屏显示、暗黑模式（4种）、暗黑模式跟随浏览器、屏蔽首页活动广告、隐藏文章开头大图、调整图片最大高度、向下翻时自动隐藏顶栏
// @match        https://www.zhihu.com/*
// @match        https://zhuanlan.zhihu.com/*
// @exclude      https://www.zhihu.com/signin*
// @icon         data:image/png;base64,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
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_openInTab
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @sandbox      JavaScript
// @license      GPL-3.0 License
// @run-at       document-start
// @namespace    https://github.com/wangkezun/zhihu-beautification
// @supportURL   https://github.com/wangkezun/zhihu-beautification
// @homepageURL  https://greasyfork.org/zh-CN/scripts/586219-%E7%9F%A5%E4%B9%8E%E7%BE%8E%E5%8C%96-remake
// @updateURL    https://greasyfork.org/zh-CN/scripts/586219-%E7%9F%A5%E4%B9%8E%E7%BE%8E%E5%8C%96-remake.update.js
// @downloadURL  https://github.com/wangkezun/zhihu-beautification/releases/latest/download/Zhihu-Beautification.user.js
// ==/UserScript==

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 初始化菜单默认值到 GM 存储
// 支持新的对象格式: { key, default, children?: [...] }
function initMenuValues(menu_ALL) {
  for (const item of menu_ALL) {
    if (GM_getValue(item.key) == null) {
      GM_setValue(item.key, item.default);
    }
    if (item.children) {
      for (const child of item.children) {
        if (GM_getValue(child.key) == null) {
          GM_setValue(child.key, child.default);
        }
      }
    }
  }
}

// 返回菜单值（直接读取 GM 存储）
function menu_value(key) {
  return GM_getValue(key);
}

// 脚本设置弹窗
// children: [{ key, label, tips?, inputType?: 'text' }]
function menu_setting(title, tips, children) {
  // 防止重复打开叠加多个弹窗/遮罩
  document
    .querySelectorAll(".zhihuE_SettingBackdrop_1, .zhihuE_SettingStyle")
    .forEach(function (el) {
      el.remove();
    });
  let _html = `<style class="zhihuE_SettingStyle">.zhihuE_SettingRoot {position: absolute;top: 50%;left: 50%;-webkit-transform: translate(-50%, -50%);-moz-transform: translate(-50%, -50%);-ms-transform: translate(-50%, -50%);-o-transform: translate(-50%, -50%);transform: translate(-50%, -50%);width: auto;min-width: 400px;max-width: 600px;height: auto;min-height: 150px;max-height: 400px;color: #535353;background-color: #fff;border-radius: 3px;}
.zhihuE_SettingBackdrop_1 {position: fixed;top: 0;right: 0;bottom: 0;left: 0;z-index: 203;display: -webkit-box;display: -ms-flexbox;display: flex;-webkit-box-orient: vertical;-webkit-box-direction: normal;-ms-flex-direction: column;flex-direction: column;-webkit-box-pack: center;-ms-flex-pack: center;justify-content: center;overflow-x: hidden;overflow-y: auto;-webkit-transition: opacity .3s ease-out;transition: opacity .3s ease-out;}
.zhihuE_SettingBackdrop_2 {position: absolute;top: 0;right: 0;bottom: 0;left: 0;z-index: 0;background-color: rgba(18,18,18,.65);-webkit-transition: background-color .3s ease-out;transition: background-color .3s ease-out;}
.zhihuE_SettingRoot .zhihuE_SettingHeader {padding: 10px 20px;color: #fff;font-weight: bold;background-color: #3994ff;border-radius: 3px 3px 0 0;}
.zhihuE_SettingRoot .zhihuE_SettingMain {padding: 10px 20px;border-radius: 0 0 3px 3px;}
.zhihuE_SettingHeader span {float: right;cursor: pointer;}
.zhihuE_SettingMain input {margin: 10px 6px 10px 0;vertical-align:middle;}
.zhihuE_SettingMain input[type=text] {margin: 5px 6px 5px 0;padding-block: 0;}
.zhihuE_SettingMain input[name=zhihuE_Setting_Checkbox] {cursor: pointer;}
.zhihuE_SettingMain label {margin-right: 20px;user-select: none;cursor: pointer;vertical-align:middle;}
.zhihuE_SettingMain hr {border: 0.5px solid #f4f4f4;}
.zhihuE_SettingMain p {white-space: pre-line;}
[data-theme="dark"] .zhihuE_SettingRoot {color: #adbac7;background-color: #343A44;}
[data-theme="dark"] .zhihuE_SettingHeader {color: #d0d0d0;background-color: #2D333B;}
[data-theme="dark"] .zhihuE_SettingMain hr {border: 0.5px solid #2d333b;}</style>
        <div class="zhihuE_SettingBackdrop_1"><div class="zhihuE_SettingBackdrop_2"></div><div class="zhihuE_SettingRoot">
            <div class="zhihuE_SettingHeader">${escapeHtml(title)}<span class="zhihuE_SettingClose" title="点击关闭"><svg class="Zi Zi--Close Modal-closeIcon" fill="currentColor" viewBox="0 0 24 24" width="24" height="24"><path d="M13.486 12l5.208-5.207a1.048 1.048 0 0 0-.006-1.483 1.046 1.046 0 0 0-1.482-.005L12 10.514 6.793 5.305a1.048 1.048 0 0 0-1.483.005 1.046 1.046 0 0 0-.005 1.483L10.514 12l-5.208 5.207a1.048 1.048 0 0 0 .006 1.483 1.046 1.046 0 0 0 1.482.005L12 13.486l5.207 5.208a1.048 1.048 0 0 0 1.483-.006 1.046 1.046 0 0 0 .005-1.482L13.486 12z" fill-rule="evenodd"></path></svg></span></div>
            <div class="zhihuE_SettingMain"><p>${escapeHtml(tips)}</p><hr>`;
  for (const child of children) {
    if (child.inputType === "text") {
      _html += `<label>${child.tips || child.label}：<input name="${child.key}" type="text" oninput="value=value.replace(/[^\\d]/g,'')" value="${escapeHtml(GM_getValue(child.key))}" style="width: 50px;"></label><br>`;
    } else if (GM_getValue(child.key)) {
      _html += `<label><input name="zhihuE_Setting_Checkbox" type="checkbox" value="${child.key}" checked="checked">${child.label}</label><br>`;
    } else {
      _html += `<label><input name="zhihuE_Setting_Checkbox" type="checkbox" value="${child.key}">${child.label}</label><br>`;
    }
  }
  _html += `</div></div></div>`;
  document.body.insertAdjacentHTML("beforeend", _html);
  // insertAdjacentHTML 是同步的，插入后立即绑定事件
  const doc = document.querySelector(".zhihuE_SettingBackdrop_1");
  doc.querySelector(".zhihuE_SettingClose").onclick = function () {
    this.parentElement.parentElement.parentElement.remove();
    document.querySelector(".zhihuE_SettingStyle").remove();
  };
  doc.querySelector(".zhihuE_SettingBackdrop_2").onclick = function (event) {
    if (event.target == this) {
      document.querySelector(".zhihuE_SettingClose").click();
    }
  };
  doc
    .querySelectorAll("input[name=zhihuE_Setting_Checkbox]")
    .forEach(function (checkBox) {
      checkBox.addEventListener("click", function () {
        GM_setValue(this.value, this.checked);
      });
    });
  doc.querySelectorAll("input[type=text]").forEach(function (textInput) {
    textInput.onchange = function () {
      GM_setValue(this.name, this.value);
    };
  });
}

// 获取知乎 Cookie 中的主题类型
function getTheme() {
  let name = "theme=",
    ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return "light";
}

// 修改知乎 Cookie 中的主题类型（纯数据操作，不触发 reload）
function setTheme(theme) {
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

// 宽屏显示 CSS - 使用动态宽度值（从原始 Zhihu-Beautification.user.js 还原）
function getWidescreenCSS(width) {
  const w = width || "1000";
  const w50 = Number(w) + 50;
  const w100 = Number(w) - 100;
  return {
    index: `/* 宽屏显示 - 首页 */
.Topstory-mainColumn, .QuestionWaiting-mainColumn {width: inherit !important;}
.Topstory-mainColumn~div,[data-za-detail-view-path-module="RightSideBar"] {display: none !important;}
.Topstory-container {width: ${w}px;}
@media only screen and (max-width: ${w50}px) {.Topstory-container {width: 97% !important;}}
`,

    question: `/* 宽屏显示 - 问题页 */
.Question-mainColumn, .ListShortcut, .QuestionWaiting-mainColumn {width: inherit !important;}
.Question-mainColumn+div,[data-za-detail-view-path-module="RightSideBar"], .Question-sideColumn, .GlobalSideBar {display: none !important;}
.QuestionWaiting-mainColumn {margin-right: 0 !important;}
.Question-main {width: ${w}px;}
@media only screen and (max-width: ${w50}px) {.Question-main {width: auto !important;}}
@media only screen and (max-width: ${w100}px) {.Question-main {width: 98.5% !important;}}
.AuthorInfo {max-width: 100% !important;}
`,

    search: `/* 宽屏显示 - 搜索页 */
.SearchMain, .ContentLayout-mainColumn, .Club-mainColumn, .Post-mainColumn, [data-za-detail-view-path-module=TopicItem]>div:first-child {width: inherit !important;}
.SearchMain+div, .ContentLayout-sideColumn, .Card.QuestionHeaderTopicMeta, .ClubSideBar, [data-za-detail-view-path-module=TopicItem]>div:not(:first-child) {display: none !important;}
.Search-container, .ContentLayout, .Club-container, .Post-container, [data-za-detail-view-path-module=TopicItem] {width: ${w}px;}
@media only screen and (max-width: ${w50}px) {.Search-container, .ContentLayout, .Club-container, .Post-container, [data-za-detail-view-path-module=TopicItem] {width: 97.5% !important;}}
`,

    collection: `/* 宽屏显示 - 收藏页 */
.CollectionsDetailPage-mainColumn {width: inherit !important;}
.CollectionsDetailPage-mainColumn+div {display: none !important;}
.CollectionsDetailPage {width: ${w}px;}
@media only screen and (max-width: ${w50}px) {.CollectionsDetailPage {width: 98.5% !important;}}
`,

    post: `/* 宽屏显示 - 文章页 */
.Post-content {min-width: auto !important;}
.Post-SideActions {left: calc(10vw) !important;}
.Post-Row-Content-right {display: none !important;}
.Post-Row-Content, .Post-Row-Content-left, .RichContent-actions {width: ${w}px !important;}
@media only screen and (max-width: ${w50}px) {.Post-Row-Content, .Post-Row-Content-left, .RichContent-actions {width: auto !important;}}
@media only screen and (max-width: ${w100}px) {.Post-Row-Content, .Post-Row-Content-left, .RichContent-actions {width: 98% !important;}}
`,

    people: `/* 宽屏显示 - 用户主页 */
.Profile-mainColumn {width: inherit !important;}
.Profile-mainColumn+div,[data-za-module="RightSideBar"],.Profile-sideColumn {display: none !important;}
.Profile-main, #ProfileHeader {width: ${w}px !important;}
@media only screen and (max-width: ${w50}px) {.Profile-main, #ProfileHeader {width: auto !important;}}
@media only screen and (max-width: ${w100}px) {.Profile-main, #ProfileHeader {width: 98.5% !important;}}
`,
  };
}

var css_base = "/* 屏蔽登录提示（问题页中间的元素） */\n.Question-mainColumnLogin {display: none !important;}\n/* 屏蔽回答页/首页广告 */\n.Pc-card.Card, .Pc-Business-Card-PcTopFeedBanner {display: none !important;}\n/* 屏蔽文章页推荐文章 */\n.Recommendations-Main {display: none !important;}\n/* 解除盐选内容选中复制限制 */\ndiv[class*=\"ManuscriptIntro-root-\"] {user-select: auto !important;}\n";

var css_index = "/* 屏蔽首页广告 */\n.TopstoryItem--advertCard {display: none !important;}\n/* 屏蔽首页活动广告 */\nmain.App-main > .Topstory > div:not(.Topstory-container) {display: none !important;}\nhtml[data-theme=\"light\"] header.AppHeader {background-color: #ffffff !important; -webkit-box-shadow: 0 1px 3px rgba(18,18,18,.1) !important; box-shadow: 0 1px 3px rgba(18,18,18,.1) !important;}\nhtml[data-theme=\"light\"] header.AppHeader a[aria-label=\"知乎\"] svg {filter: invert(57%) sepia(71%) saturate(949%) hue-rotate(190deg) brightness(86%) contrast(188%) !important;}\nhtml[data-theme=\"light\"] .AppHeader-TabsLink {color: #8590a6 !important; font-weight: normal !important;}\nhtml[data-theme=\"light\"] .AppHeader-userInfo Button svg, .SearchBar-searchButton svg {color: inherit !important;}\nhtml[data-theme=\"light\"] .AppHeader-userInfo button>div {color: #8590a6 !important;}\nhtml[data-theme=\"light\"] .Input-wrapper.Input-wrapper--grey {background: #f6f6f6 !important;}\nhtml[data-theme=\"light\"] .SearchBar input {color: #121212 !important;}\nhtml[data-theme=\"light\"] .SearchBar input::placeholder, html[data-theme=\"light\"] .SearchBar input::-webkit-input-placeholder, html[data-theme=\"light\"] {color: #919baf !important;}\nhtml[data-theme=\"light\"] .Button--primary.Button--blue {color: #fff !important;background-color: #06f !important;}\n/* 右上角 通知/私信 红点颜色 */\nhtml[data-theme=light] .AppHeader-notifications:not([aria-label=通知])>div:first-of-type, html[data-theme=light] .AppHeader-messages:not([aria-label=私信])>div:first-of-type {color: #ffffff !important;border: 2px solid #ffffff !important;}\n";

var css_hideArticleImage = "/* 隐藏在各列表中查看文章时开头显示的大图，不影响文章、专栏页面 */\n.RichContent img.ArticleItem-image {display: none !important;}\n";

var css_picHeight = "/* 调整图片最大高度 */\n.ztext .content_image, .ztext .origin_image, .GifPlayer img {max-height: 500px !important;width: auto !important;}\n";

var css_darkMode1 = "/* 暗黑模式（方案 1）— Catppuccin Mocha */\n/* 右上角 通知/私信 红点颜色 */\nhtml[data-theme=dark] .AppHeader-notifications:not([aria-label=通知])>div:first-of-type, html[data-theme=dark] .AppHeader-messages:not([aria-label=私信])>div:first-of-type {color: #cdd6f4 !important;border: 2px solid #1e1e2e !important;}\n/* 文字颜色 */\nhtml[data-theme=dark] body, html[data-theme=dark] .ContentItem-title, html[data-theme=dark] .QuestionHeader-title, html[data-theme=dark] .Tabs-link, html[data-theme=dark] .CreatorEntrance-title, html[data-theme=dark] .Search-container, html[data-theme=dark] .HotItem-excerpt, html[data-theme=dark] .PushNotifications-item, html[data-theme=dark] .Notifications-Main>header h1, html[data-theme=dark] .Notifications-Section-header h2, html[data-theme=dark] .NotificationList-Item-content, html[data-theme=dark] .Reward, html[data-theme=dark] .ChatSideBar-Search-Input input, html[data-theme=dark] input.Input, html[data-theme=dark] .LinkCard-title, html[data-theme=dark] .MCNLinkCard-title, html[data-theme=dark] .ZVideoLinkCard-title, html[data-theme=dark] .TipjarDialog-customButton, html[data-theme=dark] .Question-mainColumn .Card:not(.AnswersNavWrapper) a[data-za-detail-view-id] > div:last-child, html[data-theme=dark] .TextArea {color: #cdd6f4 !important;}\nhtml[data-theme=dark] .LinkCard-meta, html[data-theme=dark] .MCNLinkCard-source {color: #6c7086 !important;}\n/* 热榜标题 */\nhtml[data-theme=dark] .HotItem-title {color: #bac2de !important;}\n/* 首页信息流标题 */\nhtml[data-theme=dark] .ContentItem-title a:hover, html[data-theme=dark] .RichContent.is-collapsed .RichContent-inner:hover, html[data-theme=dark] .ContentItem-more:hover, html[data-theme=dark] .QuestionRichText--expandable.QuestionRichText--collapsed:hover {color: #bac2de !important;}\n/* 搜索高亮红字 */\nhtml[data-theme=dark] .Highlight em {color: #f38ba8 !important;}\n\n/* 背景颜色 - 网页 */\nhtml[data-theme=dark] body, html[data-theme=dark] .Select-option:focus {background: #181825 !important;}\n/* 背景颜色 - 问题 */\nhtml[data-theme=dark] .AppHeader, html[data-theme=dark] .QuestionHeader, html[data-theme=dark] .QuestionHeader-footer, html[data-theme=dark] .EmoticonsFooter-item--selected, html[data-theme=dark] .Card, html[data-theme=dark] .Question-mainColumn .Card .Sticky.is-bottom, html[data-theme=dark] .ContentItem-actions, html[data-theme=dark] .MoreAnswers .List-headerText, html[data-theme=dark] .CommentsV2-withPagination, html[data-theme=dark] .Topbar, html[data-theme=dark] .CommentsV2-footer, html[data-theme=dark] .CommentEditorV2-inputWrap--active, html[data-theme=dark] .InputLike, html[data-theme=dark] .InputLike + div div, html[data-theme=dark] .Popover-content, html[data-theme=dark] .Notifications-footer, html[data-theme=dark] .Messages-footer, html[data-theme=dark] .Modal-inner, html[data-theme=dark] .Emoticons, html[data-theme=dark] .EmoticonsFooter, html[data-theme=dark] .SearchTabs, html[data-theme=dark] .Popover-arrow:after, html[data-theme=dark] .CommentEditorV2-inputWrap, html[data-theme=dark] .ProfileHeader-wrapper, html[data-theme=dark] .UserCover, html[data-theme=dark] .AnswerForm-footer, html[data-theme=dark] .Editable-toolbar, html[data-theme=dark] .AnswerForm-fullscreenContent .Editable-toolbar, html[data-theme=dark] .KfeCollection-PcCollegeCard-wrapper, html[data-theme=dark] .KfeCollection-PcCollegeCard-root, html[data-theme=dark] .HotItem, html[data-theme=dark] .HotList, html[data-theme=dark] .HotListNavEditPad, html[data-theme=dark] .QuestionWaiting-typesTopper, html[data-theme=dark] .QuestionWaiting-types, html[data-theme=dark] .PostItem, html[data-theme=dark] .ClubSideBar section, html[data-theme=dark] .SearchSubTabs, html[data-theme=dark] .Club-SearchPosts-Content, html[data-theme=dark] .Club-content, html[data-theme=dark] .ClubJoinOrCheckinButton, html[data-theme=dark] .ClubEdit, html[data-theme=dark] .CornerButton, html[data-theme=dark] .Notifications-Section-header, html[data-theme=dark] .NotificationList, .NotificationList-Item.NotificationList-Item:after, .NotificationList-DateSplit.NotificationList-DateSplit:after, html[data-theme=dark] .Chat, .ChatUserListItem:after, .ChatListGroup-SectionTitle--bottomBorder:after, html[data-theme=dark] .ActionMenu, .ChatSideBar-Search--active, html[data-theme=dark] .ChatSideBar-Search-ResultListWrap, html[data-theme=dark] .QuestionMainDivider-inner, html[data-theme=dark] .Topic-bar, html[data-theme=dark] .AnnotationTag, html[data-theme=dark] .HoverCard, html[data-theme=dark] .HoverCard-loading, html[data-theme=dark] .ExploreSpecialCard, html[data-theme=dark] .ExploreHomePage-ContentSection-moreButton a, html[data-theme=dark] .ExploreRoundtableCard, html[data-theme=dark] .ExploreCollectionCard, html[data-theme=dark] .ExploreColumnCard, html[data-theme=dark] .RichText .lazy[data-lazy-status], html[data-theme=dark] #TopstoryContent > div:first-child, html[data-theme=dark] .Topstory-newUserFollowCountPanel, html[data-theme=dark] .AnswerForm-fullscreenContent .RichText, html[data-theme=dark] .Club-Search-Content, html[data-theme=dark] .WriteIndexLayout .Sticky {background: #1e1e2e !important;}\nhtml[data-theme=dark] .CommentListV2-header-divider, html[data-theme=dark] .CommentsV2-openComment-divider, html[data-theme=dark] .AnswerForm-fullscreenScroller, html[data-theme=dark] .HotListNav-item, html[data-theme=dark] .AutoInviteItem-wrapper--desktop, html[data-theme=dark] .ExploreSpecialCard-contentTag, html[data-theme=dark] .ExploreCollectionCard-contentTypeTag, html[data-theme=dark] .Reward-TipjarDialog-tagLine, html[data-theme=dark] .AnswerForm-footer.useNewEditorSetting > div, html[data-theme=dark] .AnswerForm-fullscreenContent > div:first-child, html[data-theme=dark] .Editable-toolbar button:hover, html[data-theme=dark] .AuthorInfo.AnswerAdd-info + div {background-color: #11111b !important;}\nhtml[data-theme=dark] .CornerButton:hover {background: #45475a !important;} /* 右下角按钮 */\n\n/* 背景颜色 - 引用 */\nhtml[data-theme=dark] .ztext blockquote {color: #7f849c !important;border-left: 3px solid #45475a !important;}\n\n/* 背景颜色 - 卡片 */\nhtml[data-theme=dark] .MCNLinkCard, html[data-theme=dark] .LinkCard-content, html[data-theme=dark] .ZVideoLinkCard-info {background-color: #181825 !important;}\nhtml[data-theme=dark] .Post-content .MCNLinkCard, html[data-theme=dark] .Post-content .LinkCard-content, html[data-theme=dark] .Post-content .ZVideoLinkCard-info {background-color: #1e1e2e !important;}\nhtml[data-theme=dark] .LinkCard-backdrop {background-image: url() !important;}\n\n/* 背景颜色 - 头像 */\nhtml[data-theme=dark] .Avatar, html[data-theme=dark] .UserAvatar {background-color: #1e1e2e !important;}\nhtml[data-theme=dark] .UserAvatar {border: 4px solid #1e1e2e !important;}\n\n/* 划词提示文字和背景颜色 */\nhtml[data-theme=dark] .css-fg13ww {color: #cdd6f4 !important; background-color: #313244 !important; border-radius: 10px !important;}\n\n/* 通知信息中点评论链接时，在弹出的评论框中 \"高亮\" 目标评论 */\nhtml[data-theme=dark] .CommentItemV2[tabindex='-1'] {background-color: #313244 !important;}\n\n/* 搜索框 */\nhtml[data-theme=dark] .Input-wrapper.Input-wrapper--grey, html[data-theme=dark] .ChatSideBar-Search-Input input {background: #313244 !important;}\n\n/* 加载动画 */\nhtml[data-theme=dark] .PlaceHolder-bg {background: -webkit-gradient(linear,left top,right top,from(#181825),color-stop(20%,#1e1e2e),color-stop(40%,#181825),to(#181825)) !important;background: linear-gradient(90deg,#181825 0,#1e1e2e 20%,#181825 40%,#181825) !important;}\nhtml[data-theme=dark] .PlaceHolder-inner {background: #181825 !important;color: #1e1e2e !important;}\n\n/* 私信 */\nhtml[data-theme=dark] .Input-wrapper {background-color: #313244 !important;}\nhtml[data-theme=dark] .TextMessage-sender, html[data-theme=\"dark\"] .TextMessage-sender::after {background-color: #585b70 !important;}\nhtml[data-theme=dark] .TextMessage-receiver, html[data-theme=\"dark\"] .TextMessage-receiver::after {background-color: #89b4fa !important;}\n\nhtml[data-theme=dark] .TextMessage-sender, html[data-theme=dark] .TextMessage-receiver {color: #cdd6f4 !important;}\nhtml[data-theme=dark] .ToolBar, html[data-theme=dark] .Input-wrapper, html[data-theme=dark] .ClubTopPosts, html[data-theme=dark] .ChatSideBar-Search-Input input {border: none !important;}\n\nhtml[data-theme=dark] .ChatBoxModal-closeIcon {fill: #9399b2 !important;}\n\n/* 私信网页 */\nhtml[data-theme=dark] .ChatUserListItem .Chat-ActionMenuPopover-Button {background: -webkit-gradient(linear,left top,right top,from(rgba(24,24,37,0)),color-stop(20%,#181825)) !important;background: linear-gradient(90deg,rgba(24,24,37,0),#181825 20%) !important;}\nhtml[data-theme=dark] .css-1j6tmrz {border: 2px solid #1e1e2e !important;}\n\n/* 选项鼠标指向时背景颜色 */\nhtml[data-theme=dark] .Messages-item:hover, html[data-theme=dark] .GlobalSideBar-navLink:hover, html[data-theme=dark] .Menu-item.is-active, html[data-theme=dark] .ActionMenu-item:hover, html[data-theme=dark] .ChatUserListItem--active, html[data-theme=dark] .Messages-newItem {background-color: #313244 !important;}\n/* 通知 */\nhtml[data-theme=dark] .PushNotifications-item a {color: #89b4fa !important;}\n\n/* 封面大图/文章头部大图 */\nhtml[data-theme=dark] img.UserCover-image, html[data-theme=dark] img.TitleImage {opacity: 0.7 !important;}\n/* 其他图片 */\nhtml[data-theme=dark] img {opacity: 0.85 !important;}\n/* GIF 动图、放大图除外 */\nhtml[data-theme=dark] .GifPlayer img, html[data-theme=dark] .ImageView-img, html[data-theme=dark]>body>img {opacity: 1 !important;}\n\n/* 边框 */\nhtml[data-theme=dark] .Topbar, html[data-theme=dark] .CommentsV2-footer, html[data-theme=dark] .Topstory-mainColumnCard .Card:not(.Topstory-tabCard), html[data-theme=dark] .NestComment:not(:last-child):after, html[data-theme=dark] .NestComment--rootComment:after, html[data-theme=dark] .NestComment .NestComment--child:after, html[data-theme=dark] .NestComment .NestComment--child:after, html[data-theme=dark] .CommentsV2-replyNum, html[data-theme=dark] .CommentItemV2:not(:first-child):after, html[data-theme=dark] .Tabs, html[data-theme=dark] .Popover-arrow:after, html[data-theme=dark] .SelfCollectionItem-innerContainer, html[data-theme=dark] .CollectionDetailPageItem-innerContainer {border-bottom: 1px solid #313244 !important;}\nhtml[data-theme=dark] .CommentEditorV2-inputWrap--active, html[data-theme=dark] .CommentEditorV2-inputWrap, html[data-theme=dark] .PostItem, html[data-theme=dark] .AnswerForm .Editable-toolbar, html[data-theme=dark] .Editable-toolbar span {border: none !important;}\nhtml[data-theme=dark] .InputLike {border: 1px solid #45475a !important;}\nhtml[data-theme=dark] .Popover .InputLike {border: 1px solid #1e1e2e !important;}\nhtml[data-theme=dark] .HotLanding-contentItem:not(:last-child) {border-bottom: 1px solid #45475a !important;}\nhtml[data-theme=dark] .HotLanding-content {border-left: 2px solid #45475a !important;}\n\nhtml[data-theme=dark] .Popover-content, html[data-theme=dark] .Popover-arrow:after {border: 1px solid #181825 !important;}\n\n/* 滚动条 */\nhtml[data-theme=dark] body::-webkit-scrollbar, html[data-theme=\"dark\"] .MessagesBox::-webkit-scrollbar, html[data-theme=\"dark\"] .Messages-list::-webkit-scrollbar, html[data-theme=dark] .PushNotifications-list::-webkit-scrollbar, html[data-theme=dark] .CommentListV2::-webkit-scrollbar, .ChatListGroup-SectionContent::-webkit-scrollbar, html[data-theme=dark] .ChatSideBar-Search-ResultListWrap::-webkit-scrollbar, html[data-theme=dark] .ChatBox textarea.Input::-webkit-scrollbar {width: 6px !important;height: 1px !important;}\nhtml[data-theme=dark] body::-webkit-scrollbar-thumb, html[data-theme=\"dark\"] .MessagesBox::-webkit-scrollbar-thumb, html[data-theme=\"dark\"] .Messages-list::-webkit-scrollbar-thumb, html[data-theme=dark] .PushNotifications-list::-webkit-scrollbar-thumb, html[data-theme=dark] .CommentListV2::-webkit-scrollbar-thumb, .ChatListGroup-SectionContent::-webkit-scrollbar-thumb, html[data-theme=dark] .ChatSideBar-Search-ResultListWrap::-webkit-scrollbar-thumb, html[data-theme=dark] .ChatBox textarea.Input::-webkit-scrollbar-thumb {background: #45475a !important;}\nhtml[data-theme=dark] body::-webkit-scrollbar-track {background: #181825 !important;}\nhtml[data-theme=dark] .MessagesBox::-webkit-scrollbar-track, html[data-theme=\"dark\"] .Messages-list::-webkit-scrollbar-track, html[data-theme=dark] .PushNotifications-list::-webkit-scrollbar-track, html[data-theme=dark] .CommentListV2::-webkit-scrollbar-track, .ChatListGroup-SectionContent::-webkit-scrollbar-track, html[data-theme=dark] .ChatSideBar-Search-ResultListWrap::-webkit-scrollbar-track, html[data-theme=dark] .ChatBox textarea.Input::-webkit-scrollbar-track {background: #1e1e2e !important;}\n\n/* 滚动条 - 回答目录 */\nhtml[data-theme=dark] .AnswerItem .RichContent-hasCatalog .RichContent-inner .Catalog.isCatalogV2::-webkit-scrollbar {width: 0 !important;}\nhtml[data-theme=dark] .AnswerItem .RichContent-hasCatalog .RichContent-inner .Catalog.isCatalogV2 > :first-child {background: #1e1e2e !important;}\n\nhtml {scrollbar-width: thin; scrollbar-color: #45475a #181825;}\n.MessagesBox, .Messages-list, .PushNotifications-list, .CommentListV2, .ChatListGroup-SectionContent, .ChatSideBar-Search-ResultListWrap {scrollbar-width: thin; scrollbar-color: #45475a #1e1e2e;}\n\n/* 背景颜色 - 专栏/文章 */\nhtml[data-theme=dark] .WhiteBg-body, html[data-theme=dark] .Post-content, html[data-theme=dark] .Post-Row-Content .Post-Row-Content-left {background: #181825 !important;}\nhtml[data-theme=dark] .ColumnPageHeader, html[data-theme=dark] .BottomInfo {background: #11111b !important;}\n\n/* 按钮颜色 */\n.TopstoryTabs-link.is-active, html[data-theme=dark] .TopstoryTabs-link.is-active, html[data-theme=dark] .VoteButton, .Tag, html[data-theme=dark] .Tag, html[data-theme=dark] .HotListNav-item.is-active, html[data-theme=dark] .RichText a.UserLink-link {color: #89b4fa !important;}\nhtml[data-theme=dark] .Reward-rewardBtn, html[data-theme=dark] .SearchBar-searchIcon.hasValue, html[data-theme=dark] .Chat-UnreadCount, html[data-theme=dark] .Payment-CheckedButton {color: #cdd6f4 !important;}\n\n/* 关闭查看回复时的高闪 */\nhtml[data-theme=dark] .CommentItemV2--highlighted {-webkit-animation: nano !important;animation: nano !important;}\n\n/* 赞赏 */\nhtml[data-theme=dark] .Reward-TipjarDialog-amountList .Button--red, html[data-theme=dark] .Reward-TipjarDialog-amountList .Button--red, html[data-theme=dark] .Reward-TipjarDialog-amountInput .SimpleInput {color: #bac2de !important; background-color: #313244 !important; border: none !important;}\n\n/* 赞同 */\nhtml[data-theme=dark] .VoteButton.is-active {color: #b4befe !important;}\n\n/* 创作中心 - 分析图表 */\nhtml[data-theme=dark] .CreatorSection-body .AnalyticsChart text {fill: #cdd6f4 !important;}\n";

var css_darkMode1x = "/* 问题日志页 — Catppuccin Mocha */\nhtml[data-theme=dark] .zu-top {background: #1e1e2e !important;border: none !important;}\nhtml[data-theme=dark] .zm-tag-editor-labels.zg-clear a {background: rgba(137,180,250,.1) !important;}\nhtml[data-theme=dark] .zu-main {background: #1e1e2e !important;padding-left: 20px;padding-right: 20px;}\nhtml[data-theme=dark] .zm-item+.zm-item {border-top: 1px solid #45475a;}\nhtml[data-theme=dark] a {color: #89b4fa !important;}\nhtml[data-theme=dark] ins, html[data-theme=dark] ins a {color: #a6e3a1 !important;}\nhtml[data-theme=dark] del a {color: #f38ba8 !important;}\nhtml[data-theme=dark] div#zh-hovercard a {color: #585b70 !important;}\n";

var css_darkMode2 = "/* 暗黑模式（方案 2） */\nhtml {filter: invert(90%) !important; text-shadow: 0 0 0 !important;}\nhtml[data-theme=light] body.ZVideo-body {background-color: #fff;}\nimg, .ZVideoItem-video, .ZVideo-video, .VideoAnswerPlayer-video {filter: invert(1) !important;}\n.css-5ym188, body>div>div>span+div>div[style='opacity: 1;'] {background-color: rgba(255, 255, 255, 0.65) !important;}\n.GifPlayer img, .GifPlayer.isPlaying video {filter: invert(1) !important;}\n.GifPlayer.isPlaying img.ztext-gif.GifPlayer-gif2mp4Image, img[alt=\"[公式]\"] {filter: none !important;}\n";

var css_darkMode2Firefox = "/* 暗黑模式（方案 2） */\nhtml {filter: invert(90%) !important; background-image: url(); text-shadow: 0 0 0 !important;}\nhtml[data-theme=light] body.ZVideo-body {background-color: #fff;}\nimg, .ZVideoItem-video, .ZVideo-video, .VideoAnswerPlayer-video {filter: invert(1) !important;}\n.GifPlayer img, .GifPlayer.isPlaying video {filter: invert(1) !important;}\n.GifPlayer.isPlaying img.ztext-gif.GifPlayer-gif2mp4Image {filter: none !important;}\n";

var css_darkMode3 = "/* 暗黑模式（方案 3） */\nhtml {filter: brightness(70%) !important;}\n";

var css_darkMode3Firefox = "/* 暗黑模式（方案 3） */\nhtml {filter: brightness(70%) !important; background-image: url();}\n";

var css_darkMode4 = "/* 暗黑模式（方案 4） */\nhtml {filter: brightness(65%) sepia(30%) !important;}\n";

var css_darkMode4Firefox = "/* 暗黑模式（方案 4） */\nhtml {filter: brightness(65%) sepia(30%) !important; background-image: url();}\n";

(function () {
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

    // document-start 时 head 可能尚不存在，挂到 <html> 下同样生效且零延迟
    // （注入晚了暗黑模式会先白屏闪烁一下）
    (document.head || document.documentElement).appendChild(
      style_Add,
    ).textContent = style;
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
