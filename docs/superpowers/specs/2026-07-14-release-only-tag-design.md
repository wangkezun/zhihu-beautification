# 发布专用 Tag 与 Greasy Fork Webhook 兼容设计

**日期：** 2026-07-14  
**状态：** 已确认，待实施计划

## 背景

当前发布流程在 tag 工作流中构建 `dist/Zhihu-Beautification.user.js`，将其作为固定名称的 GitHub Release Asset 上传。`main` 使用 `0.0.0` 开发占位版本并且不跟踪 `dist`，发布 tag 不移动，工作流也不写回 Git refs。

GitHub Release 与 Latest Asset URL 均正常，但 Greasy Fork 在处理 `release: published` webhook 时不会下载 Release Asset。它会从同步 URL 推导出文件路径，再从发布 tag 的 Git 文件树读取该路径。对于当前同步 URL：

```text
https://github.com/wangkezun/zhihu-beautification/releases/latest/download/Zhihu-Beautification.user.js
```

Greasy Fork 推导出的 tag 内路径是：

```text
Zhihu-Beautification.user.js
```

由于当前 tag 指向 `main`，而 `main` 不包含该根目录文件，自动同步失败。Greasy Fork 的相关行为见其官方 [`lib/github.rb`](https://github.com/greasyfork-org/greasyfork/blob/main/lib/github.rb) 和 [`webhooks.rb`](https://github.com/greasyfork-org/greasyfork/blob/main/app/controllers/concerns/webhooks.rb)。

## 目标

- 保持 `main` 只存源码、测试和工作流，不跟踪构建产物。
- 保持 `src/meta.txt` 在 `main` 上使用 `0.0.0`。
- 保持发布 tag 使用 `vX.Y.Z`，创建后不删除、不移动、不强制更新。
- 保持固定的 Latest Release Asset URL。
- 让 Greasy Fork 的 `release: published` webhook 能从 tag 文件树读取 userscript。
- 用一个本地命令完成安全、可验证的发布入口：

  ```bash
  npm run release -- v4.0.5
  ```

- 发布命令只推送新 tag，不推送或修改 `main`，也不创建长期发布分支。

## 非目标

- 不修改现有 `v4.0.3` 或 `v4.0.4` tag。
- 不为失败的旧 webhook 投递补写或移动 tag。
- 不让 GitHub Actions 创建、移动或强制更新 tag。
- 不在 `main` 或长期分支上保存已发布版本号。
- 不在本次工作中改变脚本功能或 UI。

## 方案比较

### 方案 A：发布专用提交，由本地命令创建（采用）

本地命令从干净的 `main` 构建 userscript，创建一个不属于 `main` 的发布专用提交。该提交的文件树等于 `main`，但额外包含根目录 `Zhihu-Beautification.user.js`。新 tag 指向这个提交，并且只推送 tag。

优点：保持 `main` 干净；不需要长期分支；工作流不写 refs；tag 内含 Greasy Fork 所需文件。缺点：本地发布命令需要 Git、Node.js、npm 和可推送 tag 的凭据。

### 方案 B：GitHub `workflow_dispatch` 创建发布提交和 tag

由手动工作流完成相同操作。优点是发布入口集中在 GitHub；缺点是工作流必须拥有并使用写 refs 权限，扩大了自动化权限面，也违反原先“工作流不写 Git refs”的边界。

### 方案 C：长期 `release` 分支跟踪构建产物

在专用分支保存 userscript 并从该分支打 tag。优点是 Git 历史直观；缺点是增加长期分支、合并和产物维护成本，容易重新引入构建产物漂移。

## 架构

### `main`

`main` 继续保存：

- `src/` 源码与 `src/meta.txt` 的 `0.0.0` 占位版本；
- 测试、Rollup 配置和 GitHub Actions 工作流；
- 发布版本注入器和新的本地发布命令；
- 不跟踪 `dist/` 或根目录 userscript。

### 本地发布命令

在 `package.json` 中提供：

```json
{
  "scripts": {
    "release": "node scripts/create-release.js"
  }
}
```

接口为：

```bash
npm run release -- vX.Y.Z
```

命令负责前置验证、隔离构建、构造发布提交、创建 annotated tag，并只推送该 tag。

### 发布专用提交

发布提交的第一父提交是执行发布时的 `main` HEAD。它的文件树相对该父提交只新增：

```text
/Zhihu-Beautification.user.js
```

该文件包含 tag 对应的真实 `@version`。

从第二个发布专用 tag 开始，如果上一发布 tag 不是当前 `main` 的祖先，则把上一发布 tag 的提交作为第二父提交。这样相邻发布 tag 保持祖先关系，同时第一父提交仍明确记录本次发布对应的 `main`。

发布提交不挂在本地或远端分支上。推送 tag 时，Git 会自动上传 tag 引用的提交和对象。

### GitHub Release 工作流

现有 tag push 工作流继续：

1. checkout 新 tag；
2. 从 tag 名向临时工作区的 `src/meta.txt` 注入版本；
3. 运行测试和 Rollup 构建；
4. 校验构建产物的 `@version`；
5. 比较新构建的 `dist/Zhihu-Beautification.user.js` 与 tag 根目录的 `Zhihu-Beautification.user.js`，要求内容完全一致；
6. 确认同名 Release 不存在；
7. 创建 Release 并上传固定名称的 Asset。

工作流不执行 `git commit`、`git push`、`git tag` 或强制操作。

### Greasy Fork

Greasy Fork 同步 URL 保持：

```text
https://github.com/wangkezun/zhihu-beautification/releases/latest/download/Zhihu-Beautification.user.js
```

GitHub 仓库 webhook 保持 Active，并且只订阅 Release 事件。Greasy Fork 收到 `release: published` 后，从 tag 根目录读取 `Zhihu-Beautification.user.js` 并更新脚本。

## 发布数据流

```text
main HEAD（源码，@version 0.0.0，无构建产物）
  → npm run release -- vX.Y.Z
  → 隔离环境注入版本、测试、构建
  → 构造发布专用提交（新增 /Zhihu-Beautification.user.js）
  → 创建并推送不可变 annotated tag
  → GitHub Actions 重新测试和构建
  → 校验 tag 文件与 CI 构建内容一致
  → 创建 GitHub Release 与固定名称 Asset
  → GitHub 发送 release: published webhook
  → Greasy Fork 从 tag 文件树读取根目录脚本
  → Greasy Fork 保存新版本
```

## 发布命令详细行为

### 前置验证

命令在产生 Git 对象或 tag 前必须验证：

- 参数严格匹配 `vX.Y.Z`；
- 当前分支为 `main`；
- 工作区与索引干净；
- 本地 `HEAD` 与 `origin/main` 一致；
- 本地和远端均不存在目标 tag；
- 目标版本高于已有最高语义版本 tag；
- Node.js 依赖可用。

### 隔离构建

命令在临时 detached worktree 中从当前 `main` 构建，避免修改调用者工作区：

1. 安装锁定依赖；
2. 向临时 `src/meta.txt` 注入 tag 版本；
3. 运行全部测试；
4. 运行构建；
5. 校验产物版本；
6. 保存构建产物供发布树使用。

### 构造提交与 tag

命令使用独立临时 Git index 或等效 Git plumbing，从 `main` HEAD 的树开始，仅加入根目录 userscript。它不得把临时修改后的 `src/meta.txt` 放入发布树，因此发布提交内的源码 metadata 仍为 `0.0.0`，只有构建后的根目录 userscript 使用发布版本。

发布提交信息使用：

```text
release: vX.Y.Z
```

annotated tag 名称和消息均使用 `vX.Y.Z`。

### 推送前验证

创建 tag 后、推送前必须验证：

- tag 解引用到刚创建的发布提交；
- 第一父提交等于发布开始时的 `main` HEAD；
- 相对第一父提交只新增根目录 userscript；
- `git show vX.Y.Z:Zhihu-Beautification.user.js` 成功；
- tag 内 userscript 的 `@version` 等于 `X.Y.Z`；
- tag 内 userscript 内容等于隔离构建产物。

全部通过后执行且仅执行：

```bash
git push origin refs/tags/vX.Y.Z
```

## 错误处理与不可变性

- 任一前置验证、测试、构建或内容校验失败：不创建 tag，不推送任何引用。
- 目标 tag 已存在：立即失败，绝不覆盖或移动。
- tag 已在本地创建但网络推送失败：保留本地 tag，输出明确的重试命令，不自动删除或重建。
- tag 推送成功但 CI 失败：保留 tag；修复问题后使用新的补丁版本发布，不移动失败 tag。
- Release 已存在：工作流失败且不覆盖已有资产。
- GitHub webhook 返回 HTTP 200 但 `updated_failed` 非空：视为 Greasy Fork 同步失败，不能只根据 HTTP 状态判定成功。
- 临时 worktree 无论成功或失败都应清理；清理失败只报告路径，不影响已创建 tag 的不可变性。

## 测试设计

### 单元测试

- tag 格式与版本递增校验；
- 选择提交父节点的规则；
- Git 命令参数构造；
- 从 userscript 读取和校验 `@version`；
- 前置条件失败时不进入创建 tag 或 push 阶段。

### 集成测试

在临时 Git 仓库中验证：

- 发布提交相对 `main` 只新增根目录 userscript；
- `main`、工作区和索引保持不变；
- tag 是 annotated tag，且指向发布专用提交；
- 第二次发布时上一发布 tag 成为祖先；
- 无任何分支指向发布专用提交；
- 已存在 tag、脏工作区、版本倒退和构建失败均不会 push。

### 工作流约束测试

- 工作流仍不包含 Git refs 写操作；
- 工作流校验 tag 根目录文件与 CI 构建产物完全一致；
- Release Asset 文件名保持 `Zhihu-Beautification.user.js`。

### 端到端验收

用下一个新版本执行一次真实发布，并验证：

- GitHub Actions 成功；
- Release 与 Asset 存在；
- Latest Asset URL 返回新版本；
- webhook 的 `published` 投递响应中 `updated_scripts` 包含目标 Greasy Fork 脚本；
- `updated_failed` 为空；
- Greasy Fork 对外脚本版本等于新 tag 版本；
- `main` SHA 和内容未被发布操作改变。

## 迁移

- 保留 `v4.0.3`、`v4.0.4` 及其 Release，不删除、不移动。
- 新发布结构从下一补丁版本开始使用。
- Greasy Fork 与 GitHub webhook 配置保持现状。
- 首次成功发布后，以 webhook 响应正文而不是 HTTP 200 作为自动同步成功证据。
