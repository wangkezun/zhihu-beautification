// 宽屏显示 CSS - 使用动态宽度值（从原始 Zhihu-Beautification.user.js 还原）
export function getWidescreenCSS(width) {
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
.Question-main {width: ${w}px !important;}
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
