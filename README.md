# zhihu-js

基于 [XIU2/UserScript](https://github.com/XIU2/UserScript) 改造。

### 与本体的差异

- 源码用 Rollup 分模块构建，本体是单文件
- 性能优化：MutationObserver 全量扫描改为增量处理，减少页面卡顿
- 修复 closure 泄漏

## 脚本

| 脚本 | 说明 | 安装 |
|------|------|------|
| 知乎增强 | 移除登录弹窗、屏蔽指定类别、屏蔽低赞回答、屏蔽用户/关键词、默认收起回答、高清原图、站外直链等 | [dist/Zhihu-Enhanced.user.js](./dist/Zhihu-Enhanced.user.js) |
| 知乎美化 | 宽屏显示、暗黑模式（4种）、屏蔽首页活动广告、隐藏文章大图、自动隐藏顶栏等 | [dist/Zhihu-Beautification.user.js](./dist/Zhihu-Beautification.user.js) |

## 开发

```bash
npm install
npm run build    # 构建到 dist/
npm run dev      # watch 模式
```

源码在 `src/enhanced/` 和 `src/beautification/`，使用 Rollup 构建，meta 信息在 `meta.txt`。

## License

GPL-3.0
