# GitHub Release Asset 与 Greasy Fork 同步设计

## 目标

让 `main` 只保存可开发、可测试的源码，不再由发布工作流提交构建产物、重写主干或强制移动标签。发布版本号与最终 userscript 由 tag 驱动，在 GitHub Release 中生成，并通过稳定的 Latest Release Asset URL 提供给 Greasy Fork。

## 发布产物与同步地址

GitHub Release 上传固定名称的资产：

```text
Zhihu-Beautification.user.js
```

Greasy Fork 使用以下同步地址：

```text
https://github.com/wangkezun/zhihu-beautification/releases/latest/download/Zhihu-Beautification.user.js
```

GitHub 仓库 Webhook 只订阅 Release 事件。Greasy Fork 在 Release 发布后从上述稳定地址重新拉取脚本。

## 分支与版本模型

- `main` 保存源码、测试、构建配置和发布工作流。
- `dist/Zhihu-Beautification.user.js` 不再由 Git 跟踪。
- `src/meta.txt` 在 `main` 中使用开发占位版本 `0.0.0`，不代表已发布版本。
- 发布 tag 使用 `vX.Y.Z` 格式，并指向已验证的 `main` 提交。
- Release 工作流从 tag 名提取 `X.Y.Z`，仅在 CI 工作区内替换 `src/meta.txt` 的占位版本。
- tag 创建后不再移动或强制更新。

## GitHub Actions 流程

工作流由 `v*` tag push 触发，顺序如下：

1. 检出触发工作流的 tag 提交，不额外切换到 `main`。
2. 安装依赖。
3. 校验 tag 必须符合 `vX.Y.Z`，提取发布版本 `X.Y.Z`。
4. 将 CI 工作区内 `src/meta.txt` 的 `@version` 替换为发布版本。
5. 运行 `npm test`。
6. 运行 `npm run build`。
7. 校验构建产物中的 `@version` 与 tag 一致。
8. 创建 GitHub Release，并上传 `dist/Zhihu-Beautification.user.js`。

工作流不执行 `git commit`、`git push main`、`git tag -f` 或强制推送。

## 当前 v4.0.3 的迁移

`v4.0.3` 已存在并指向正确的修复提交，但旧工作流因为构建产物没有差异而在空提交处失败，GitHub Release 尚未创建。

迁移步骤：

1. 在 `main` 提交新的发布工作流、开发占位版本和停止跟踪的 `dist`。
2. 保留现有 `v4.0.3` tag，不删除、不移动。
3. 从现有 `v4.0.3` tag 对应源码构建版本为 `4.0.3` 的 userscript。
4. 手动为现有 tag 创建一次 GitHub Release 并上传资产。
5. 从下一个版本开始完全使用新工作流自动发布。

## 失败处理

- tag 格式非法：在构建前失败，不创建 Release。
- 测试或构建失败：保留 tag，但不创建 Release；修复代码后发布新的补丁版本，不移动旧 tag。
- Release 资产版本与 tag 不一致：校验失败，不上传资产。
- 同名 Release 已存在：工作流显式失败，避免静默覆盖已发布内容。

## 验证

- 单元测试覆盖问题页宽度规则。
- 增加发布脚本或工作流级检查，验证 tag 到 `@version` 的转换。
- 本地执行 `npm test` 与 `npm run build`。
- 检查 `dist` 已从 Git 索引移除且仍被 `.gitignore` 忽略。
- 对 `v4.0.3` 补建 Release 后，确认 Latest Release Asset URL 返回 `@version 4.0.3`。
- 在 Greasy Fork 中手动同步一次，再验证 Release webhook 后续能够自动更新。
