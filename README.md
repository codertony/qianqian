# 乾乾 (QianQian) - AI 能力资产管理中枢

> 天行健，君子以自强不息。  
> 一次沉淀，多端可用，用户主权。

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/codertony/qianqian)  
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## ✨ 什么是乾乾？

**乾乾**是一个**跨平台 AI 资产管理中枢**，帮助你把在 Cursor、Claude Code、Open Code 等 AI IDE 中积累的 Prompt、Skill、Agent 等能力，转化为**可版本管理的个人数字资产**。

### 核心痛点

- 🚫 **平台孤岛**：不同 AI IDE 的配置无法互通
- 😔 **能力流失**：与 AI 对话中产生的优质 Prompt 随对话结束而消失
- 🔄 **多端同步**：手动复制粘贴配置到多个设备效率低下
- 📊 **版本缺失**：个人 Skill 缺乏版本控制，无法追踪迭代

### 乾乾如何解决

```
┌─────────────────────────────────────────────────────────┐
│                     乾乾 (QianQian)                      │
│                   你的 AI 能力中枢                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Cursor ─────────┐                                      │
│                  │                                      │
│  Open Code ──────┼────▶  GitHub 私有仓库 ◀────  捕获    │
│                  │        (版本管理)            同步    │
│  Claude Code ────┤                                      │
│                  │                                      │
│  Cloud Code ─────┘                                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 核心特性

### 1. 跨平台能力同步
一次配置，处处可用。在 Cursor 中优化的 Prompt，一键同步到 Open Code、Claude Code 等平台。

```bash
# 在公司电脑保存能力
$ acl capture --name arch-reviewer --tag java
✓ Captured from Cursor
✓ Pushed to GitHub

# 回家同步到个人电脑
$ acl sync --target opencode
✓ Applied 3 assets to Open Code
```

### 2. AI 辅助能力沉淀
与 AI 对话中碰撞出的灵感，通过自然语言指令自动提取、结构化、入库。

```bash
$ acl capture --ai "总结刚才的性能优化讨论"
✓ Extracted 3 key capabilities
✓ Generated skill: frontend-performance-expert
✓ Created README + examples
? Commit to repository? [Y/n]
```

### 3. 版本管理与迭代
所有资产存储在你的私有 GitHub 仓库，享受 Git 的版本管理、分支、回滚能力。

```bash
$ acl pull
✓ Fetched 5 updates from GitHub
  - feat(prompt): update frontend-expert (v1.2.0)
  - fix(skill): correct python analyzer

$ acl diff
Changed:
  ~ prompts/frontend-expert.md
  ~ skills/code-analyzer/
```

### 4. 智能冲突解决
支持三种同步策略，确保本地配置不被意外覆盖：

- `@sync:full` - 完全由云端接管
- `@sync:merge` - AI 辅助语义合并
- `@sync:local` - 本地专属，不参与同步

```bash
$ acl sync
⚠  Detected 2 conflicts
? Resolution strategy: AI Merge
✓ Merged with AI assistance
✓ Local overrides preserved
```

### 5. 兼容性检查
自动检测资产与目标平台的兼容性，提前预警不支持的特性。

```bash
$ acl sync --plugin full-stack
Compatibility Report:
  ✓ Frontend Agent (all platforms)
  ✓ Backend Agent (cursor, opencode)
  ⚠ DevOps Agent (local only)

[!] DevOps Agent skipped (incompatible with Cloud Code)
Applied: 3/4 assets
```

---

## 🚀 快速开始

### 安装

```bash
# 使用 npm
npm install -g qianqian

# 或使用 Homebrew (macOS/Linux)
brew install qianqian

# 或直接下载二进制
# https://github.com/codertony/qianqian/releases
```

### 初始化配置

```bash
# 初始化项目
$ acl init
? Enter your GitHub repository URL: https://github.com/yourname/acl-assets
? Select default sync policy: merge
? Automatically push changes? Yes
✓ Configuration created at ./.acl/config.jsonc
```

### 捕获你的第一个能力

```bash
# 从当前 IDE 捕获 Prompt
$ acl capture --name my-first-prompt
✓ Detected Cursor environment
✓ Extracted prompt from .cursor/rules/
✓ Converted to ACL format
? Save and commit? [Y/n] y
✓ Committed: feat(prompt): add my-first-prompt
```

### 同步到另一台设备

```bash
# 在新设备上拉取
$ acl pull
✓ Fetched 1 asset from GitHub

# 同步到目标平台
$ acl sync --target opencode
✓ Applied my-first-prompt to .opencode/prompts/
```

---

## 📦 支持的资产类型

| 资产类型 | 说明 | 状态 |
|---------|------|------|
| **Prompts** | AI 指令集，支持 System/Task 分层 | ✅ MVP |
| **Skills** | 原子级可复用能力 | ✅ MVP |
| **Agents** | AI 角色定义（Purpose + Knowledge） | ✅ MVP+ |
| **Flows** | 多 Agent 协作流程 | 🚧 Phase 3 |
| **MCP Configs** | 远程服务配置 | 🚧 Phase 3 |
| **Plugins** | 复合型能力包 | 🚧 Phase 3 |

---

## 🛠️ 核心命令

```bash
# 初始化与配置
acl init                    # 初始化项目配置
acl config set <key> <value>  # 设置配置项

# 能力捕获
acl capture [name]          # 捕获当前 IDE 的能力
acl capture --ai            # 使用 AI 提取能力
acl save [name]             # capture 的别名

# 资产管理
acl list                    # 列出所有资产
acl show <name>             # 查看资产详情
acl search <keyword>        # 搜索资产

# 同步与分发
acl sync                    # 同步资产到本地平台
acl pull                    # 从云端拉取更新
acl push                    # 推送本地变更
acl diff                    # 查看差异
acl status                  # 查看同步状态

# 依赖管理
acl deps install            # 安装 Skill 依赖
acl deps check              # 检查依赖完整性

# 插件管理 (Phase 3)
acl plugin list             # 列出已安装插件
acl plugin install <name>   # 安装插件
acl plugin uninstall <name> # 卸载插件
```

---

## 💡 使用场景

### 场景一：跨平台能力迁移

**背景**：你在公司 Cursor 中打磨了一套精准的 Java 架构评审 Agent。

```bash
# 在公司电脑
$ acl capture --name java-arch-reviewer
✓ Extracted from .cursor/rules/
✓ Pushed to GitHub

# 回家后在个人电脑
$ acl sync --target opencode
✓ Converted to Open Code format
✓ Applied to .opencode/agents/
```

### 场景二：AI 对话转资产

**背景**：与 AI 讨论前端性能优化时产生了优质思路。

```bash
# 对话结束后
$ acl capture --ai "总结刚才的性能优化讨论"
✓ Extracted key insights:
  - Web Vitals monitoring
  - Code splitting strategies
  - Caching mechanisms
✓ Generated skill: frontend-performance-expert
✓ Auto-generated examples
```

### 场景三：团队协作标准化

**背景**：团队需要统一的代码审查标准。

```bash
# 创建团队共享仓库
$ acl init --repo https://github.com/team/acl-assets

# 捕获并分享
$ acl capture --name team-code-reviewer
$ acl push

# 团队成员使用
$ acl pull
$ acl sync
```

---

## 🏗️ 项目结构

### 用户资产仓库结构

```
acl-assets/                    # 你的 GitHub 私有仓库
├── prompts/                   # Prompt 资产
│   ├── system/
│   └── tasks/
├── skills/                    # Skill 资产
│   └── skill-name/
│       ├── manifest.json
│       └── logic.py
├── agents/                    # Agent 资产
│   └── agent-name/
│       ├── agent.yaml
│       └── purpose.md
└── .acl/                      # ACL 配置
    └── config.jsonc
```

### 源码项目结构

```
qianqian/                          # 项目根目录
├── 📁 src/                        # 源代码主目录
│   ├── 📁 core/                   # 核心领域模型（参考 oh-my-opencode）
│   │   ├── asset/                 # 资产领域：Prompt/Skill/Agent/Flow 定义
│   │   ├── platform/              # 平台领域：Cursor/OpenCode/ClaudeCode 抽象
│   │   └── sync/                  # 同步领域：Pull/Push/Diff 操作
│   │
│   ├── 📁 cli/                    # 命令行接口
│   │   ├── commands/              # 命令实现（init, capture, sync, pull, push...）
│   │   ├── config-manager/        # 配置管理
│   │   └── doctor/                # 诊断工具
│   │
│   ├── 📁 config/                 # 配置系统
│   │   ├── schema/                # Zod Schema 定义（运行时校验）
│   │   └── adapters/              # 配置适配器（YAML/JSON/JSONC）
│   │
│   ├── 📁 features/               # 功能模块（参考 oh-my-opencode features）
│   │   ├── asset-manager/         # 资产管理核心
│   │   ├── github-sync/           # GitHub 同步引擎
│   │   ├── platform-adapters/     # 平台适配器
│   │   ├── conflict-resolver/     # 冲突解决引擎
│   │   ├── version-control/       # 版本控制集成
│   │   └── ai-extractor/          # AI 辅助能力提取
│   │
│   ├── 📁 hooks/                  # 生命周期钩子
│   │   ├── pre-sync/              # 同步前钩子
│   │   ├── post-sync/             # 同步后钩子
│   │   └── validation/            # 校验钩子
│   │
│   ├── 📁 tools/                  # 工具封装
│   │   ├── git/                   # Git 操作封装
│   │   ├── github/                # GitHub API 封装
│   │   ├── ide-detect/            # IDE 环境检测
│   │   ├── file-ops/              # 文件操作工具
│   │   └── template-engine/       # 模板引擎
│   │
│   ├── 📁 shared/                 # 共享工具
│   │   ├── utils/                 # 通用工具函数
│   │   ├── types/                 # 全局类型定义
│   │   └── constants/             # 常量定义
│   │
│   └── 📄 index.ts                # 入口文件
│
├── 📁 docs/                       # 文档目录
│   ├── 📁 architecture/           # 架构文档
│   │   ├── diagrams/              # 架构图
│   │   ├── decisions/             # 架构决策记录（ADR）
│   │   └── project-structure.md   # 项目结构详细说明
│   ├── 📁 guide/                  # 用户指南
│   │   ├── quickstart/            # 快速开始
│   │   └── advanced/              # 高级用法
│   ├── 📁 reference/              # 参考文档
│   │   ├── commands/              # 命令参考
│   │   ├── api/                   # API 文档
│   │   └── config/                # 配置参考
│   └── 📁 api/                    # 程序化 API 文档
│
├── 📁 examples/                   # 示例资产
│   ├── prompts/                   # Prompt 示例
│   ├── skills/                    # Skill 示例
│   ├── agents/                    # Agent 示例
│   └── flows/                     # Flow 示例
│
├── 📁 test/                       # 测试目录
│   ├── unit/                      # 单元测试
│   ├── integration/               # 集成测试
│   ├── e2e/                       # 端到端测试
│   └── fixtures/                  # 测试夹具
│
├── 📁 bin/                        # 可执行文件
├── 📁 script/                     # 构建脚本
├── 📁 packages/                   # 多平台发布包
├── 📁 assets/                     # 静态资源
├── 📄 README.md                   # 项目说明
├── 📄 package.json                # npm 配置
├── 📄 tsconfig.json               # TypeScript 配置
└── 📄 LICENSE                     # 许可证
```

### 架构参考

本项目架构参考 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) 的设计哲学：

- **模块化分层**: Core → Features → CLI 单向依赖
- **Hook 系统**: Pre/Post/Validation 三层生命周期钩子
- **Agent 设计**: 领域特定的 AI Agent（Capturer, Syncer, Analyzer）
- **配置合并**: 用户配置 → 项目配置 → 默认配置
- **工具注册**: 通过注册表模式统一管理工具

详细架构文档：[docs/architecture/project-structure.md](./docs/architecture/project-structure.md)

---

## 🔒 安全与隐私

- **用户主权**：所有资产存储在你的私有 GitHub 仓库
- **敏感隔离**：API Key 等敏感信息使用 `.env.template` 机制隔离
- **本地优先**：本地覆写配置不会被云端更新抹除
- **加密存储**：凭证使用 AES-256-GCM 加密存储在本地

---

## 🗺️ 路线图

### Phase 1: MVP Core (当前)
- ✅ CLI 基础命令
- ✅ GitHub 集成
- ✅ Cursor / Open Code 适配器
- ✅ Prompt / Skill 资产管理

### Phase 2: MVP+ (进行中)
- 🚧 AI Provider 集成
- 🚧 自动 Commit Message
- 🚧 语义合并
- 🚧 Agent 资产管理

### Phase 3: Full Version (计划中)
- 📋 Plugin 系统
- 📋 Flow 支持
- 📋 兼容性矩阵
- 📋 外部市场抓取

---

## 🤝 贡献

欢迎贡献！请参考 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何参与。

### 开发环境

```bash
# 克隆仓库
git clone https://github.com/codertony/qianqian.git
cd qianqian

# 安装依赖
bun install

# 运行测试
bun test

# 本地开发
bun run dev
```

---

## 📄 许可证

[MIT](./LICENSE)

---

## 🙏 致谢

- 参考项目：[oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) by code-yeongyu
- 参考项目：[everything-claude-code](https://github.com/affaan-m/everything-claude-code) by affaan-m
- 命名灵感：《周易·乾卦》

---

> **乾乾** - 让你的 AI 能力，日日精进。

[GitHub](https://github.com/codertony/qianqian) • [文档](https://qianqian.dev) • [Discord](https://discord.gg/qianqian)
