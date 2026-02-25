# 乾乾 (QianQian) 项目架构文档

> **版本**: v1.0.0  
> **参考项目**: [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)  
> **最后更新**: 2026-02-26

---

## 目录

- [架构概述](#架构概述)
- [目录结构](#目录结构)
- [核心模块说明](#核心模块说明)
- [设计原则](#设计原则)
- [依赖关系](#依赖关系)

---

## 架构概述

乾乾 (QianQian) 采用**模块化分层架构**，参考 oh-my-opencode 的设计哲学，将功能拆分为独立的模块，通过清晰的接口进行协作。

### 架构特点

| 特性 | 说明 |
|------|------|
| **模块化** | 功能按领域划分，高内聚低耦合 |
| **可扩展** | 支持新平台适配器、新资产类型的插件化扩展 |
| **可测试** | 单元测试与集成测试分离，支持 mock |
| **类型安全** | TypeScript 全栈，Zod 运行时校验 |

---

## 目录结构

```
qianqian/
├── 📁 src/                          # 源代码主目录
│   ├── 📁 core/                     # 核心领域模型
│   │   ├── asset/                   # 资产领域（Prompt/Skill/Agent/Flow）
│   │   ├── platform/                # 平台领域（Cursor/OpenCode/ClaudeCode）
│   │   └── sync/                    # 同步领域（Pull/Push/Diff）
│   │
│   ├── 📁 agents/                   # AI Agent 定义（参考 oh-my-opencode）
│   │   ├── capturer/                # 能力捕获 Agent
│   │   ├── syncer/                  # 同步协调 Agent
│   │   ├── analyzer/                # 资产分析 Agent
│   │   └── converter/               # 格式转换 Agent
│   │
│   ├── 📁 cli/                      # 命令行接口（参考 oh-my-opencode/cli）
│   │   ├── commands/                # 命令实现（init, capture, sync, etc.）
│   │   ├── config-manager/          # 配置管理 CLI
│   │   └── doctor/                  # 诊断工具（健康检查）
│   │
│   ├── 📁 config/                   # 配置系统（参考 oh-my-opencode/config）
│   │   ├── schema/                  # Zod Schema 定义
│   │   └── adapters/                # 配置适配器（YAML/JSON/JSONC）
│   │
│   ├── 📁 features/                 # 功能模块（参考 oh-my-opencode/features）
│   │   ├── asset-manager/           # 资产管理核心
│   │   ├── github-sync/             # GitHub 同步引擎
│   │   ├── platform-adapters/       # 平台适配器（Cursor/OpenCode/ClaudeCode）
│   │   ├── conflict-resolver/       # 冲突解决引擎
│   │   ├── version-control/         # 版本控制集成
│   │   └── ai-extractor/            # AI 辅助能力提取
│   │
│   ├── 📁 hooks/                    # 生命周期钩子（参考 oh-my-opencode/hooks）
│   │   ├── pre-sync/                # 同步前钩子
│   │   ├── post-sync/               # 同步后钩子
│   │   └── validation/              # 校验钩子
│   │
│   ├── 📁 tools/                    # 工具实现（参考 oh-my-opencode/tools）
│   │   ├── git/                     # Git 操作封装
│   │   ├── github/                  # GitHub API 封装
│   │   ├── ide-detect/              # IDE 环境检测
│   │   ├── file-ops/                # 文件操作工具
│   │   └── template-engine/         # 模板引擎
│   │
│   ├── 📁 shared/                   # 共享工具（参考 oh-my-opencode/shared）
│   │   ├── utils/                   # 通用工具函数
│   │   ├── types/                   # 全局类型定义
│   │   └── constants/               # 常量定义
│   │
│   └── 📄 index.ts                  # 入口文件
│
├── 📁 docs/                         # 文档目录
│   ├── 📁 architecture/             # 架构文档
│   │   ├── diagrams/                # 架构图
│   │   └── decisions/               # 架构决策记录（ADR）
│   ├── 📁 guide/                    # 用户指南
│   │   ├── quickstart/              # 快速开始
│   │   └── advanced/                # 高级用法
│   ├── 📁 reference/                # 参考文档
│   │   ├── commands/                # 命令参考
│   │   ├── api/                     # API 文档
│   │   └── config/                  # 配置参考
│   └── 📁 api/                      # 程序化 API 文档
│
├── 📁 script/                       # 构建脚本
│
├── 📁 packages/                     # 多平台发布包
│   ├── darwin-arm64/                # macOS Apple Silicon
│   ├── darwin-x64/                  # macOS Intel
│   ├── linux-arm64/                 # Linux ARM64
│   ├── linux-x64/                   # Linux x64
│   └── windows-x64/                 # Windows x64
│
├── 📁 assets/                       # 静态资源
│
├── 📁 bin/                          # 可执行文件入口
│
├── 📁 test/                         # 测试目录
│   ├── unit/                        # 单元测试
│   ├── integration/                 # 集成测试
│   ├── e2e/                         # 端到端测试
│   └── fixtures/                    # 测试夹具
│
├── 📁 examples/                     # 示例资产
│   ├── prompts/                     # Prompt 示例
│   ├── skills/                      # Skill 示例
│   ├── agents/                      # Agent 示例
│   └── flows/                       # Flow 示例
│
├── 📄 README.md                     # 项目说明
├── 📄 package.json                  # npm 配置
├── 📄 tsconfig.json                 # TypeScript 配置
└── 📄 LICENSE                       # 许可证
```

---

## 核心模块说明

### 1. Core 层（领域模型）

参考 oh-my-opencode 的 clean architecture 设计，定义核心业务领域：

| 模块 | 职责 | 类比（oh-my-opencode）|
|------|------|----------------------|
| `core/asset/` | 定义资产实体（Prompt/Skill/Agent/Flow） | `config/schema/` |
| `core/platform/` | 定义平台实体和接口 | `agents/` 中的平台抽象 |
| `core/sync/` | 定义同步操作和状态 | `features/` 中的同步逻辑 |

### 2. Agents 层（AI Agent）

参考 oh-my-opencode 的 Agent 系统设计，定义领域特定的 AI Agent：

| Agent | 职责 | 模型 | 触发方式 |
|-------|------|------|----------|
| `capturer` | 从 IDE 捕获能力 | GPT-4/Kimi | `acl capture` 命令 |
| `syncer` | 协调同步流程 | GPT-4/Kimi | `acl sync` 命令 |
| `analyzer` | 分析资产质量 | Claude-3.5 | 后台分析 |
| `converter` | 格式转换 | GPT-4 | 同步时自动 |

### 3. CLI 层（命令行接口）

参考 oh-my-opencode 的 CLI 设计，使用 Commander.js：

```
cli/
├── commands/           # 命令实现
│   ├── init.ts         # acl init
│   ├── capture.ts      # acl capture
│   ├── sync.ts         # acl sync
│   ├── pull.ts         # acl pull
│   ├── push.ts         # acl push
│   └── ...
├── config-manager/     # 配置管理
└── doctor/             # 诊断工具
    └── checks/         # 健康检查项
```

### 4. Features 层（功能模块）

参考 oh-my-opencode 的 feature 模块化设计，每个 feature 独立：

| Feature | 说明 | 类比（oh-my-opencode）|
|---------|------|----------------------|
| `asset-manager` | 资产的 CRUD 操作 | `features/skill-loader` |
| `github-sync` | GitHub 仓库同步 | 类似 `features/background-agent` |
| `platform-adapters` | 多平台适配 | `features/claude-code-*-loader` |
| `conflict-resolver` | 冲突解决引擎 | 自定义功能 |
| `ai-extractor` | AI 辅助提取 | `hooks/` 中的 AI 相关钩子 |

### 5. Tools 层（工具封装）

参考 oh-my-opencode 的 tools 设计，封装外部操作：

| Tool | 说明 | 类比（oh-my-opencode）|
|------|------|----------------------|
| `git` | Git 操作封装 | `tools/git` |
| `github` | GitHub API 封装 | 类似内置 MCP |
| `ide-detect` | IDE 环境自动检测 | 自定义工具 |
| `template-engine` | 模板渲染 | 类似 `tools/skill` |

### 6. Hooks 层（生命周期）

参考 oh-my-opencode 的 hooks 系统：

```
hooks/
├── pre-sync/           # 同步前执行
│   ├── validation.ts   # 校验资产
│   ├── backup.ts       # 备份本地配置
│   └── compatibility.ts # 兼容性检查
├── post-sync/          # 同步后执行
│   ├── notification.ts # 发送通知
│   └── cleanup.ts      # 清理临时文件
└── validation/         # 通用校验
    └── schema.ts       # Schema 校验
```

### 7. Shared 层（共享工具）

参考 oh-my-opencode 的 shared 设计：

```
shared/
├── utils/              # 通用工具函数
│   ├── logger.ts       # 日志工具
│   ├── path.ts         # 路径处理
│   └── crypto.ts       # 加密工具
├── types/              # 全局类型
│   ├── asset.ts        # 资产类型
│   ├── platform.ts     # 平台类型
│   └── config.ts       # 配置类型
└── constants/          # 常量
    ├── platforms.ts    # 支持的平台列表
    └── asset-types.ts  # 资产类型枚举
```

---

## 设计原则

### 1. 参考 oh-my-opencode 的最佳实践

| 原则 | 说明 |
|------|------|
| **工厂模式** | 使用 `createXXX()` 函数创建实例 |
| **Hook 分层** | Pre/Post/Validation 三层钩子系统 |
| **配置合并** | 用户配置 → 项目配置 → 默认配置 |
| **工具注册** | 工具通过注册表模式统一管理 |

### 2. 乾乾特有原则

| 原则 | 说明 |
|------|------|
| **资产优先** | 一切设计围绕"资产"概念展开 |
| **平台无关** | 核心业务逻辑不依赖特定 IDE |
| **渐进增强** | 支持从简单 Prompt 到复杂 Flow 的演进 |
| **用户主权** | 用户完全掌控数据和配置 |

### 3. 代码规范

```typescript
// 1. 文件命名：kebab-case
//    ✅ asset-manager.ts
//    ❌ assetManager.ts, AssetManager.ts

// 2. 模块导出：barrel export
//    src/features/asset-manager/index.ts
export { createAssetManager } from './asset-manager';
export type { AssetManager, AssetOptions } from './asset-manager';

// 3. 类型安全：Zod 运行时校验
const AssetSchema = z.object({
  name: z.string(),
  type: z.enum(['prompt', 'skill', 'agent', 'flow']),
  version: z.string(),
});

// 4. 错误处理：自定义错误类
class AssetError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AssetError';
  }
}

// 5. 禁止的写法
// ❌ 不使用 as any
// ❌ 不使用 @ts-ignore
// ❌ 不创建 utils.ts, helpers.ts 等 catch-all 文件
// ❌ 不使用空的 catch 块
```

---

## 依赖关系

### 模块依赖图

```
┌─────────────────────────────────────────────────────────────┐
│                         CLI 层                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  init   │ │ capture │ │  sync   │ │  pull   │ ...       │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
└───────┼───────────┼───────────┼───────────┼─────────────────┘
        │           │           │           │
        ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Features 层                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │asset-manager│ │ github-sync │ │ platform-adapters   │   │
│  └──────┬──────┘ └──────┬──────┘ └──────────┬──────────┘   │
└─────────┼───────────────┼───────────────────┼───────────────┘
          │               │                   │
          ▼               ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                       Core 层                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │  asset   │ │ platform │ │   sync   │                     │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘                     │
└───────┼────────────┼────────────┼─────────────────────────────┘
        │            │            │
        ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Shared 层                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │  utils   │ │  types   │ │ constants│                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

### 依赖规则

1. **单向依赖**: Core → Features → CLI，不可反向依赖
2. **Shared 共享**: 所有层都可以依赖 Shared
3. **Tools 独立**: Tools 可以被任何层使用，但 Tool 之间不相互依赖
4. **Agents 松散**: Agents 通过接口与 Features 交互，不直接依赖

---

## 参考链接

- [oh-my-opencode AGENTS.md](./ReferenceRepo/oh-my-opencode/AGENTS.md)
- [oh-my-opencode 目录结构](https://github.com/code-yeongyu/oh-my-opencode/tree/dev/src)
- [产品需求文档](../product.md)
