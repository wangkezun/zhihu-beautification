# 问题页回答主栏宽度修复设计

## 背景

问题页开启“宽屏显示”后，设置宽度为 `1000px`，但实际回答主栏只有
`694px`，回答内容只有 `654px`，右侧留下明显空白。

实际页面检查确认：

- 知乎当前 DOM 已不存在 `.Question-main`，因此现有
  `.Question-main { width: ... !important; }` 没有命中元素。
- `.Question-mainColumn { width: inherit !important; }` 在当前 flex 布局中
  仍计算为 `694px`。
- 临时将 `.Question-mainColumn` 明确设为 `1000px !important` 后，
  `.ListShortcut` 变为 `1000px`，回答内容变为 `960px`。

## 目标

- 桌面问题页的回答主栏严格使用“宽屏显示”设置中的宽度。
- 保持顶部问题信息区域现状。
- 保持现有隐藏右侧栏行为。
- 保持窄屏响应式行为，不引入横向滚动。
- 兼容仍使用 `.Question-main` 的旧版页面结构。

## 方案

采用稳定语义类的纯 CSS 修复，不依赖知乎动态生成的 `css-*` 类，也不增加
DOM 监听或行内样式。

在问题页宽屏 CSS 中：

1. 从使用 `width: inherit` 的选择器组中移除 `.Question-mainColumn`。
2. 让 `.Question-main` 和 `.Question-mainColumn` 都明确使用设置宽度，并带
   `!important`。
3. 两个现有媒体查询同时覆盖 `.Question-main` 和
   `.Question-mainColumn`：较窄视口使用 `auto`，更窄视口使用 `98.5%`。
4. `.ListShortcut` 继续使用 `width: inherit !important`，并随已明确扩宽的
   主栏包含块铺满可用宽度。
5. 侧栏隐藏和作者信息宽度规则保持不变。

概念规则如下：

```css
.Question-main,
.Question-mainColumn {
  width: ${w}px !important;
}
```

## 测试

更新 `test/widescreen.test.js`，验证 `getWidescreenCSS('1200')` 生成的规则：

- 桌面规则同时为 `.Question-main` 和 `.Question-mainColumn` 设置
  `1200px !important`。
- `.Question-mainColumn` 不再出现在 `width: inherit` 选择器组中。
- 两个响应式规则同时覆盖这两个选择器，并分别生成 `auto !important` 和
  `98.5% !important`。
- 现有全量测试继续通过。

实际页面验收以 computed styles 为准：设置宽度为 `1000px` 时，
`.Question-mainColumn` 和 `.ListShortcut` 都应为 `1000px`；回答卡片扣除现有
左右内边距后应为 `960px`。

## 非目标

- 不调整顶部问题信息区域。
- 不改变首页、搜索页、收藏页、文章页或用户页宽屏规则。
- 不引用当前页面中的 Emotion 动态类名。
- 不增加 JavaScript DOM 观察器。
