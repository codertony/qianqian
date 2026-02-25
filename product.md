# 乾乾 (QianQian) - 产品需求文档

> **版本**: v1.0.0  
> **状态**: 需求澄清阶段  
> **最后更新**: 2026-02-26

---

## 一、产品概述

### 1.1 产品名称与寓意

**产品名称**: 乾乾 (QianQian)

**命名出处**:
> 《周易·乾卦》"天行健，君子以自强不息；九三，君子终日乾乾，夕惕若厉，无咎"

回答：参考项目均已克隆到 ReferenceRepo 中：
包含：
everything-claude-code
oh-my-opencode

**核心理念映射**:

| 原文意象 | 产品映射 |
|---------|---------|
| **终日乾乾** - 持续精进 | 个人AI能力的持续沉淀与迭代，将零散能力固化为可版本管理的数字资产 |
| **夕惕若厉** - 谨惕稳慎 | 跨平台同步的冲突处理、本地覆写保护、安全可控的分发机制 |
| **刚健自主** - 自强不息 | 用户完全掌控资产主权，数据存储于私有GitHub仓库，不绑定第三方平台 |

### 1.2 产品定位

**一句话定义**: 基于 GitHub 存储、通过 CLI 调度、由 AI 辅助维护的**跨平台 AI 资产管理中枢**。

**核心理念**: 将 AI 能力（Prompt/Skill/Agent/Flow）视为**可版本管理的个人代码资产**。

### 1.3 解决的核心痛点

1. **平台孤岛问题**: Cursor、Claude Code、Open Code 等 AI IDE 配置互不兼容，能力无法跨平台复用
2. **能力流失问题**: 与 AI 对话中产生的优质 Prompt 和 Skill 随对话结束而流失，无法持久化积累
3. **多端同步繁琐**: 手动复制粘贴配置到多个设备和环境，效率低下且易出错
4. **版本管理缺失**: 个人 Skill 缺乏版本控制，无法追踪迭代历史和回滚

---

## 二、核心诉求与产品原则

### 2.1 四大核心诉求

| 诉求 | 说明 |
|------|------|
| **平台无关性** | 资产独立于特定 IDE 存在，一次开发，多端可用 |
| **资产化迭代** | 支持个人 Skill 的持续打磨、版本控制与优胜劣汰 |
| **AI 驱动维护** | 通过自然语言指令，由 AI 完成复杂的配置文件生成与入库 |
| **主动分发机制** | 通过 CLI 主动向各平台注入配置，而非被动等待平台调用 |

### 2.2 产品设计原则

1. **协议先行**: 所有资产采用自描述的存储规范，确保跨平台可解析
2. **用户主权**: 资产完全属于用户，存储于用户私有仓库
3. **安全可控**: 冲突分级处理、本地覆写保护、敏感信息隔离
4. **渐进增强**: 支持从简单 Prompt 到复杂 Plugin 的能力演进

---

## 三、需求澄清与待决策事项

### 3.1 资产类型规范（待明确）

#### ❓ 需求澄清 Q1: Skill 执行逻辑的权限边界

**当前描述**: Skills 包含 `logic.py/js` 执行逻辑

**待明确问题**:
- Skill 执行是否仅限于本地环境，还是支持远程执行？
- 是否需要沙箱机制隔离 Skill 执行环境？
- Skill 的权限模型如何设计（文件系统访问、网络访问、系统调用等）？

回答：Skill的设计参考Cloud Code的设计标准。

**建议方案**:
```yaml
# skill-manifest.json 权限声明示例
{
  "permissions": {
    "filesystem": ["read", "write"],
    "network": false,
    "shell": false,
    "mcp": ["github", "slack"]
  }
}
```

#### ❓ 需求澄清 Q2: Flow 的执行引擎

**当前描述**: Flows 描述多 Agent 协作逻辑，基于状态机或 DAG

**待明确问题**:
- Flow 是否需要内置执行引擎，还是仅作为描述性配置？
- Flow 支持的条件判断和循环逻辑复杂到什么程度？
- Flow 执行时的状态持久化需求？

回答：Flow 设计参考 oh My Open Code，和 Everything Claude Code.

**建议方案**:
- **MVP 阶段**: Flow 仅作为描述性配置，由目标平台（如 Open Code）执行
- **进阶阶段**: 提供轻量级 Flow 执行引擎，支持基础的条件分支和并行执行

#### ❓ 需求澄清 Q3: Prompt 的分层粒度

**当前描述**: Prompts 分为 System Prompts 和 Task Prompts

**待明确问题**:
- 是否支持 Prompt 的继承和组合机制？
- Prompt 变量插值的语法规范？
- 是否支持动态 Prompt（根据上下文生成）？ 支持

**建议方案**:
```yaml
# prompt 元数据示例
---
name: "frontend-expert"
type: "system"  # system | task | composite
version: "1.2.0"
variables:
  - name: "framework"
    type: "enum"
    options: ["react", "vue", "angular"]
    default: "react"
inherits:
  - "base-coding-guidelines"
---
```

### 3.2 CLI 命令设计（待明确）

回答：CLI命令方式参考：Oh My Open Code，主要生成AI阅读理解的初始化流程，可通过AI的skill执行操作指令，尽量减少初始化交互以启动AI操作。

#### ❓ 需求澄清 Q4: 核心命令集定义

**当前描述**: `acl save`, `acl sync`, `acl install-deps`

**待明确问题**:

| 命令 | 功能 | 待明确点 |
|------|------|---------|
| `acl init` | 初始化配置 | 交互式配置向导的必要性？ |
| `acl save` | 保存当前能力 | 如何自动识别当前 IDE 和上下文？ |
| `acl sync` | 同步资产 | 默认行为是全量同步还是选择性同步？ |
| `acl pull` | 拉取更新 | 是否支持预览变更（dry-run）？ |
| `acl status` | 查看状态 | 需要展示哪些状态信息？ |
| `acl diff` | 对比差异 | 是否支持跨平台的语义差异对比？ |

**建议核心命令集**:

```bash
# 初始化与配置
acl init [--repo <github-url>]    # 初始化本地配置，绑定 GitHub 仓库
acl config set <key> <value>      # 设置配置项
acl config get <key>              # 查看配置项

# 资产捕获
acl capture [--name <name>]       # 捕获当前 IDE 的能力（自动识别上下文）
                                  # 别名: acl save
acl capture prompt [--scope <scope>]  # 专门捕获 Prompt
acl capture agent <name>          # 专门捕获 Agent

# 资产查询
acl list [--type <type>] [--tag <tag>]  # 列出资产
acl show <asset-name>             # 查看资产详情
acl search <keyword>              # 搜索资产

# 同步与分发
acl sync [--target <platform>] [--dry-run]  # 同步资产到本地平台
acl pull [--force]                # 从云端拉取更新
acl push                          # 推送本地变更到云端
acl diff [local|remote|platform]  # 查看差异
acl status                        # 查看同步状态

# 依赖管理
acl deps install                  # 安装 Skill 依赖
acl deps check                    # 检查依赖完整性

# 平台适配
acl adapt <asset> --to <platform> # 预览适配到目标平台的配置
```

#### ❓ 需求澄清 Q5: 配置存储位置

**待明确问题**:
- 全局配置文件位置: `~/.acl/config.yaml` ?
- 项目级配置位置: `.acl/config.yaml` ?
- 本地覆写目录: `.acl/overrides/` ?
- 忽略规则文件: `.aclignore` ?

**建议目录结构**:
```
~/.acl/                          # 用户级配置
├── config.yaml                  # 全局配置
├── credentials.yaml             # 加密存储的凭证
└── cache/                       # 本地缓存

./.acl/                          # 项目级配置（工作目录）
├── config.yaml                  # 项目配置
├── overrides/                   # 本地覆写
│   ├── frontend-expert.md
│   └── arch-reviewer.md
└── local-only/                  # 仅本地存在的资产

./.aclignore                     # 同步忽略规则（类似 .gitignore）
```

### 3.3 平台适配技术方案（待明确）

#### ❓ 需求澄清 Q6: 目标平台适配策略

**当前描述**: 支持 Cursor、Open Code、Cloud Code、OpenClaw

**待明确问题**:

| 平台 | 适配目标 | 待明确点 |
|------|---------|---------|
| **Cursor** | `.cursor/rules/*.mdc` | `.mdc` 文件格式的完整规范？是否支持多文件规则？ |
| **Open Code** | YAML 配置文件 | 配置文件的命名和位置约定？ |
| **Cloud Code** | 插件配置 | 与 Open Code 的差异点？ |
| **Claude Code** | 指令集 | 是否有特定的配置文件格式？ |
| **OpenClaw** | `~/.claw/skills/` | 目录结构和文件命名规范？ |

回答：平台适配的逻辑与规范需进一步调研,请AI进行自动调研和分析。如果比较复杂，可以先暂时放一放，拭目以待。

**建议适配器设计**:

```typescript
// 适配器接口定义
interface PlatformAdapter {
  name: string;
  version: string;
  
  // 检测当前环境是否支持该平台
  detect(): Promise<boolean>;
  
  // 将 ACL 资产转换为目标平台格式
  adapt(asset: ACLAsset): Promise<PlatformConfig[]>;
  
  // 将目标平台配置反向转换为 ACL 资产
  reverseAdapt(configPath: string): Promise<ACLAsset>;
  
  // 应用配置到目标平台
  apply(configs: PlatformConfig[]): Promise<void>;
  
  // 检查兼容性
  checkCompatibility(asset: ACLAsset): CompatibilityReport;
}
```

#### ❓ 需求澄清 Q7: 兼容性矩阵设计

**待明确问题**:
- 兼容性检查粒度：Plugin 级、Agent 级、Skill 级还是功能级？取决于原模型使用的是私有库中的 plugin、agent 还是 skill。
- 兼容性等级定义：完全兼容、部分兼容、不兼容的标准？完全兼容与不兼容仅判断两种情况，部分兼容暂不判断，因无法区分解决方案。不兼容时可提示用户自行对比解决。
- 如何处理部分兼容的情况（跳过、警告、降级）？没有部分兼容。

**建议兼容性矩阵**:

```yaml
# compatibility.yaml 示例
plugin: "acl-full-stack"
version: "2.1.0"

compatibility:
  cursor:
    status: "full"           # full | partial | none
    version: ">=0.45"
    notes: "完全支持"
    
  opencode:
    status: "partial"
    version: ">=1.0"
    missing_features:
      - "运维 Agent（需要本地 Docker）"
    notes: "前端、后端 Agent 可用，运维 Agent 需本地环境"
    
  cloudcode:
    status: "partial"
    version: ">=1.2"
    missing_features:
      - "运维 Agent"
      - "本地文件系统操作"
    notes: "仅前端、后端 Agent 可用"
    
  openclaw:
    status: "none"
    version: "<2.0"
    notes: "OpenClaw 当前版本不支持 Plugin 格式，需等待 v2.0"

# 细粒度的 Agent 级别兼容性
agents:
  frontend-agent:
    cursor: { status: "full" }
    opencode: { status: "full" }
    cloudcode: { status: "full" }
    
  backend-agent:
    cursor: { status: "full" }
    opencode: { status: "full" }
    cloudcode: { status: "full" }
    
  devops-agent:
    cursor: { status: "full" }
    opencode: { status: "partial", reason: "需要本地 Docker" }
    cloudcode: { status: "none", reason: "云端环境不支持宿主机操作" }
```

### 3.4 AI 管理入口（待明确）

#### ❓ 需求澄清 Q8: AI 集成方式

**当前描述**: 通过自然语言指令，由 AI 完成配置文件生成与入库


**待明确问题**:
- AI 集成方式：本地 LLM、云端 API、还是 IDE 内置 AI？ AI是基于当前使用工具环境的AI。
- AI 的触发机制：CLI 内嵌、IDE 插件、还是独立 Chat 界面？考虑基于 skill 进行操作。
- AI 的权限边界：能否直接执行 Git 操作、文件写入？可以直接操作远程的AI仓库提交merge request。，最佳方式仍需一次授权与确认

**建议方案**:

**方案 A: CLI 内嵌 AI（推荐 MVP）**
```bash
acl ai "总结刚才的对话，创建一个前端性能优化 Skill"
# 或
acl capture --ai "从当前 .cursor/rules 提取最佳实践"
```
- 优点：简单直接，无需额外组件
- 缺点：交互体验受限

**方案 B: IDE 插件 + AI（长期）**
- 在 VS Code/Cursor 中提供 ACL 侧边栏
- 选中代码/Prompt → 右键"Save to ACL"
- AI 自动分析上下文，生成元数据

**方案 C: 独立 Chat 界面（可选）**
- Web 界面或 TUI（Terminal UI）
- 更丰富的交互体验

#### ❓ 需求澄清 Q9: AI 自动化级别

**待明确问题**:

| 自动化级别 | 描述 | 确认机制 |
|-----------|------|---------|
| **全自动** | AI 直接执行所有操作 | 无确认，适合完全信任的场景 |
| **半自动** | AI 生成方案，用户确认后执行 | 显示计划，Y/N 确认 |
| **建议模式** | AI 生成建议，用户手动执行 | 输出 Git 命令，用户自行执行 |

**建议默认采用"半自动"模式**，允许用户配置偏好。
回答：都是以提交 merge request 的方式，基于远程二次确认，远程 Git 上的二次确认。

### 3.5 冲突处理机制（待明确）

#### ❓ 需求澄清 Q10: 冲突解决策略

**当前描述**: 支持 @sync:full、@sync:merge、@sync:local 打标

**待明确问题**:
- 合并冲突时，AI 介入的程度？ AI自动梳理冲突，给出合并方案。
- 是否支持三路合并（base + local + remote）？ 这里主要是 user 基础全局层面的 merge 这个呃这些 agents，因为它是面向个人用户的模型，呃这些方法 skills。
- 冲突回滚机制？ 冲突给出建议后，若未被采纳，需支持回滚。

**建议冲突处理流程**:

```
用户执行 acl sync
    ↓
检测云端 vs 本地变更
    ↓
无冲突 ──────────────→ 直接同步
    ↓
有冲突
    ↓
读取 @sync 标记
    ↓
@sync:full ──────────→ 本地变更被覆盖（警告提示）
    ↓
@sync:local ─────────→ 跳过该文件（仅提示）
    ↓
@sync:merge ─────────→ 调用 AI 进行语义合并
    ↓
AI 合并方案展示给用户 ────→ 用户确认 ────→ 应用合并
    ↓
用户拒绝
    ↓
提供手动编辑界面或跳过
```

### 3.6 安全性设计（待明确）

#### ❓ 需求澄清 Q11: 敏感信息处理

**待明确问题**:
- 哪些信息属于敏感信息（API Key、数据库密码、内部 URL）？
- 敏感信息的存储加密方式？
- 如何防止敏感信息被意外提交到 GitHub？

需要有一个个人配置文件，不上传至 Git。该文件可用于配置各类 access key、API 等信息，可参考 oh My Open Code 的配置逻辑。

**建议安全方案**:

1. **敏感信息隔离**:
```
assets/
├── mcp-configs/
│   ├── github.yaml              # 公开配置
│   ├── github.env.template      # 模板（含占位符）
│   └── github.env.local         # 本地私有（.gitignore 保护）
```

1. **自动敏感信息检测**:
```bash
acl scan --secrets              # 扫描潜在敏感信息
acl check --pre-push            # 提交前检查
```

1. **加密存储**:
```yaml
# ~/.acl/credentials.yaml (AES 加密)
secrets:
  openai_api_key:
    encrypted: "U2FsdGVkX1..."
    created_at: "2026-02-26"
```

#### ❓ 需求澄清 Q12: 权限与审计

**待明确问题**:
- 是否需要细粒度的权限控制（只读/读写/管理） 读写和读写管理都有
- 操作日志审计需求？ 可以结构化后放入该代码仓库，用于生成提交日志和展示页面。

**建议方案**:
- MVP 阶段：简单的本地权限（默认用户完全控制）
- 进阶阶段：操作日志（`~/.acl/audit.log`）

### 3.7 MVP 边界（待明确）

#### ❓ 需求澄清 Q13: MVP 功能范围

**当前描述**: 基础同步、Metadata 标记、核心协议适配、一键入库

**待明确问题**:

| 功能模块 | 包含在 MVP？ | 优先级 |
|---------|------------|-------|
| CLI 基础命令（init, sync, status） | ✅ | P0 |
| GitHub 存储集成 | ✅ | P0 |
| Cursor 适配器 | ✅ | P0 |
| Open Code 适配器 | ✅ | P0 |
| Prompt 资产类型 | ✅ | P0 |
| Skill 资产类型 | ✅ | P0 |
| 基础冲突处理（@sync:full/local） | ✅ | P0 |
| Agent 资产类型 | ⚠️ | P1 |
| Flow 资产类型 | ⚠️ | P1 |
| MCP Config 资产类型 | ⚠️ | P1 |
| AI 辅助入库 | ⚠️ | P1 |
| Plugin 封装包 | ❌ | P2 |
| 语义合并（@sync:merge） | ❌ | P2 |
| 多平台兼容性检查 | ❌ | P2 |
| 外部市场抓取 | ❌ | P2 |

**建议 MVP 范围**:

**Phase 1 (MVP Core)**:
- CLI 基础命令: init, sync, pull, status
- 资产类型: Prompts、Skills
- 适配器: Cursor、Open Code
- 基础同步与冲突处理

**Phase 2 (MVP+)**:
- 资产类型: Agents
- AI 辅助入库
- 语义合并

**Phase 3 (Post-MVP)**:
- Flows、MCP Configs、Plugins
- 外部市场抓取
- 高级兼容性检查

---

## 四、系统功能架构

### 4.1 架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户层 (User Layer)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   CLI 终端    │  │  IDE 插件    │  │   AI Chat 界面       │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
└─────────┼─────────────────┼─────────────────────┼───────────────┘
          │                 │                     │
          └─────────────────┼─────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI 管理入口 (AI-Agentic Manager)              │
│  ┌──────────────────┐  ┌──────────────────┐                      │
│  │ Market Connector │  │ Auto-Doc/Config  │                      │
│  │ - 外部市场抓取    │  │ - 反向总结        │                      │
│  │ - 格式转换       │  │ - 自动 Commit     │                      │
│  └──────────────────┘  └──────────────────┘                      │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   调度中心层 (Orchestration Layer)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Pull/Sync│  │ Adaptor  │  │    Conflict  │  │ Compatibility│ │
│  │  智能拉取 │  │ 协议转换 │  │   Resolver   │  │    Guard     │ │
│  └──────────┘  └──────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cursor        │    │   Open Code     │    │   OpenClaw      │
│   .cursor/rules/│    │   .opencode/    │    │   ~/.claw/      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    资产存储层 (Storage Layer)                     │
│                        GitHub Private Repo                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Skills  │  │ Prompts  │  │  Agents  │  │  Flows   │        │
│  │  /skills │  │ /prompts │  │ /agents  │  │ /flows   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 资产存储层 (Storage Layer)

#### 4.2.1 存储设计原则

1. **协议先行**: 所有资产具备自描述能力
2. **语义化目录**: 按资产类型分层存储
3. **版本控制**: 天然继承 Git 的版本管理能力
4. **元数据驱动**: 每个资产包含完整的 manifest 描述

#### 4.2.2 仓库目录结构

```
acl-assets/                          # GitHub 私有仓库
├── README.md                        # 仓库说明
├── .acl/                            # ACL 系统配置
│   └── repo-config.yaml
│
├── skills/                          # 原子技能
│   ├── skill-name/
│   │   ├── manifest.json            # 技能元数据
│   │   ├── logic.py / logic.js      # 执行逻辑
│   │   ├── schema.json              # 输入输出 schema
│   │   ├── requirements.txt         # Python 依赖
│   │   ├── package.json             # Node 依赖
│   │   └── README.md                # 使用说明
│   └── ...
│
├── prompts/                         # 指令集
│   ├── system/                      # 系统级 Prompts
│   │   └── frontend-expert.md
│   ├── tasks/                       # 任务级 Prompts
│   │   └── code-review.md
│   └── README.md
│
├── agents/                          # AI 角色定义
│   ├── agent-name/
│   │   ├── agent.yaml               # OASF 规范定义
│   │   ├── purpose.md               # 核心使命
│   │   ├── knowledge/               # 知识库
│   │   └── README.md
│   └── ...
│
├── flows/                           # 多 Agent 协作
│   └── flow-name.json               # DAG 定义
│
├── mcp-configs/                     # MCP 服务配置
│   ├── service-name.yaml            # 公开配置
│   └── service-name.env.template    # 敏感信息模板
│
└── plugins/                         # 复合能力包（Post-MVP）
    └── plugin-name/
        ├── package.json
        ├── compatibility.yaml
        └── manifests/
```

#### 4.2.3 资产规范定义

**Skill Manifest 规范**:

```json
{
  "$schema": "https://acl.dev/schemas/skill-v1.json",
  "name": "rust-analyzer-helper",
  "version": "1.2.3",
  "description": "Rust 代码分析与优化助手",
  "type": "skill",
  "author": "user@example.com",
  "tags": ["rust", "analysis", "optimization"],
  "entry": "logic.py",
  "language": "python",
  "permissions": {
    "filesystem": ["read"],
    "network": false,
    "shell": false
  },
  "input": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
      "code": { "type": "string" },
      "focus": { 
        "type": "string", 
        "enum": ["performance", "safety", "style"]
      }
    },
    "required": ["code"]
  },
  "output": {
    "type": "object",
    "properties": {
      "suggestions": { "type": "array" },
      "score": { "type": "number" }
    }
  },
  "dependencies": {
    "python": ["rust-analyzer>=0.15"],
    "system": ["rustc"]
  },
  "compatibility": {
    "cursor": ">=0.40",
    "opencode": ">=1.0"
  }
}
```

**Prompt 规范**:

```markdown
---
name: "frontend-performance-expert"
type: "system"  # system | task
version: "2.1.0"
author: "user@example.com"
tags: ["frontend", "performance", "optimization"]
scope: "global"  # global | project
sync_policy: "merge"  # full | merge | local
variables:
  - name: "framework"
    type: "enum"
    options: ["react", "vue", "angular"]
    default: "react"
  - name: "target_metrics"
    type: "array"
    default: ["LCP", "FID", "CLS"]
---

# Frontend Performance Expert

You are a frontend performance optimization expert...

## Core Principles

1. Always measure before optimizing
2. Focus on Core Web Vitals
...
```

**Agent 规范（OASF 兼容）**:

```yaml
# agent.yaml
$schema: "https://oasf.dev/schemas/agent-v1.json"

name: "architecture-reviewer"
version: "1.0.0"
description: "Java 企业级架构评审专家"

type: "agent"
purpose: |
  审查 Java 企业级项目的架构设计，
  确保符合最佳实践和公司规范。

knowledge_base:
  - ref: "prompts://system/architecture-principles"
  - ref: "docs://company/java-guidelines"
  - file: "./knowledge/patterns/"

assigned_skills:
  - ref: "skills://dependency-analyzer"
  - ref: "skills://performance-bottleneck-detector"

memory:
  type: "session"  # session | persistent | none
  
llm_config:
  model: "claude-sonnet-4-20250514"
  temperature: 0.3
  max_tokens: 8000
```

### 4.3 调度中心层 (Orchestration Layer)

#### 4.3.1 Pull/Sync 模块

**增量同步机制**:

```typescript
interface SyncEngine {
  // 计算本地与远程的差异
  diff(localAssets: Asset[], remoteAssets: Asset[]): DiffResult;
  
  // 基于文件 hash 的变更检测
  computeHash(filePath: string): string;
  
  // 智能合并策略
  merge(local: Asset, remote: Asset, strategy: MergeStrategy): MergedAsset;
}

interface DiffResult {
  added: Asset[];      // 远程新增
  modified: Asset[];   // 双方都有变更
  deleted: Asset[];    // 远程删除
  conflict: Asset[];   // 冲突需处理
  unchanged: Asset[];  // 无变更
}
```

**依赖管理**:

```bash
# 同步后自动检查依赖
$ acl sync
✓ 同步完成：新增 2 个 Skills，更新 1 个 Prompt
⚠ 检测到依赖缺失：
  - rust-analyzer-helper 需要 Python 包：rust-analyzer>=0.15
  - node-analyzer 需要 Node 包：@typescript/parser

运行 acl deps install 安装依赖？[Y/n]
```

#### 4.3.2 Adaptor 模块

**平台适配器实现**:

```typescript
// Cursor 适配器
class CursorAdapter implements PlatformAdapter {
  name = "cursor";
  
  async adapt(asset: ACLAsset): Promise<PlatformConfig[]> {
    switch (asset.type) {
      case "prompt":
        return [{
          path: `.cursor/rules/${asset.name}.mdc`,
          content: this.convertPromptToMDC(asset)
        }];
      
      case "agent":
        // Cursor 通过 .cursorrules 文件支持 Agent 定义
        return [{
          path: `.cursorrules`,
          content: this.convertAgentToRules(asset)
        }];
        
      default:
        throw new UnsupportedAssetError(asset.type);
    }
  }
  
  private convertPromptToMDC(prompt: PromptAsset): string {
    return `---
description: ${prompt.description}
globs: ${prompt.globs?.join(",") || "*"}
alwaysApply: ${prompt.alwaysApply || false}
---

${prompt.content}`;
  }
}

// Open Code 适配器
class OpenCodeAdapter implements PlatformAdapter {
  name = "opencode";
  
  async adapt(asset: ACLAsset): Promise<PlatformConfig[]> {
    switch (asset.type) {
      case "agent":
        return [{
          path: `.opencode/agents/${asset.name}.yaml`,
          content: yaml.stringify({
            name: asset.name,
            instructions: asset.content,
            tools: asset.assignedSkills
          })
        }];
        
      case "flow":
        return [{
          path: `.opencode/flows/${asset.name}.json`,
          content: JSON.stringify(this.convertFlow(asset), null, 2)
        }];
        
      default:
        throw new UnsupportedAssetError(asset.type);
    }
  }
}
```

#### 4.3.3 Conflict Resolver 模块

**冲突处理策略**:

```typescript
interface ConflictResolver {
  // 根据 sync_policy 决定处理方式
  resolve(
    local: Asset,
    remote: Asset,
    policy: SyncPolicy
  ): Promise<Resolution>;
}

type SyncPolicy = "full" | "merge" | "local";

interface Resolution {
  action: "overwrite" | "merge" | "skip" | "manual";
  result?: Asset;
  diff?: string;
}
```

**本地覆写机制**:

```
同步流程：
1. 从云端拉取 global-frontend-expert.md
2. 检测本地存在 .acl/overrides/frontend-expert.md
3. 读取 sync_policy（默认为 merge）
4. 若 policy=merge：
   - 将云端内容作为基础
   - 将本地覆写内容叠加
   - 生成项目特定的临时配置
5. 分发到目标平台
```

#### 4.3.4 Compatibility Guard 模块

**兼容性检查**:

```typescript
interface CompatibilityGuard {
  // 检查资产与目标平台的兼容性
  check(
    asset: Asset,
    targetPlatform: string
  ): CompatibilityReport;
  
  // 检查 Plugin 在目标环境的兼容性
  checkPlugin(
    plugin: Plugin,
    environment: Environment
  ): PluginCompatibilityReport;
}

interface CompatibilityReport {
  compatible: boolean;
  level: "full" | "partial" | "none";
  missingFeatures?: string[];
  warnings?: string[];
  suggestedActions?: string[];
}
```

**运行时兼容性反馈**:

```bash
$ acl sync --target cloudcode
检测环境：Cloud Code v2.1.0

[✓] 已同步：前端专家 Agent
[✓] 已同步：后端架构师 Agent
[!] 警告：运维 Agent 被跳过
   原因：当前环境不支持本地 Docker 操作
   建议：如需完整功能，请切换到 Open Code 或本地环境

同步完成：2/3 项资产已应用
```

### 4.4 AI 管理入口 (AI-Agentic Manager)

#### 4.4.1 Market Connector

**外部市场抓取流程**:

```
用户输入："ClawHub 这个 Skill 很棒，帮我收录"
    ↓
AI 解析链接，访问目标页面
    ↓
提取 README / SKILL.md 内容
    ↓
解析工具定义与逻辑说明
    ↓
安全性审计（检查可疑代码）
    ↓
转换为 ACL 标准格式
    ↓
生成 manifest.json
    ↓
标记 @source:clawhub
    ↓
生成 Git commit 信息
    ↓
推送到用户 GitHub 仓库
```

**Smart Ingester（Plugin 智能吸纳）**:

```typescript
interface SmartIngester {
  // 分析 Plugin 源码，生成兼容性报告
  analyze(pluginPath: string): Promise<PluginAnalysis>;
  
  // 自动检测平台依赖
  detectPlatformDependencies(code: string): PlatformDependency[];
  
  // 自动打标兼容性等级
  autoTagCompatibility(analysis: PluginAnalysis): CompatibilityTags;
}

interface PluginAnalysis {
  agents: AgentAnalysis[];
  skills: SkillAnalysis[];
  platformCalls: PlatformCall[];  // 检测到的平台特定调用
  osCalls: string[];              // 系统调用检测
  riskLevel: "low" | "medium" | "high";
}
```

#### 4.4.2 Auto-Doc/Config

**反向总结流程**:

```
用户在 Cursor 中完成一段高效对话
    ↓
输入：acl capture --name "performance-optimization"
    ↓
AI 分析对话历史
    ↓
提取核心 Prompt 逻辑
    ↓
生成标准化资产：
  - prompts/system/performance-expert.md
  - 包含说明、核心指令、示例
    ↓
自动编写 commit message
    ↓
推送到 GitHub
```

**AI 生成 Commit Message**:

```bash
$ acl capture --name "frontend-performance-expert"
AI 分析完成，生成以下变更：

新增文件：
  prompts/system/frontend-performance-expert.md
  prompts/system/frontend-performance-expert.examples.md

生成的 Commit Message：
  feat(prompt): add frontend-performance-expert via Cursor discussion
  
  - Extract performance optimization insights from session #1024
  - Include Web Vitals monitoring guidelines
  - Add code splitting and caching strategies
  
提交到 GitHub？[Y/n/edit] 
```

---

## 五、用户场景与用例

### 5.1 场景一：跨平台能力同步

**场景名称**: The "Hot-Swap" of Intelligence（智能热切换）

**背景**: 用户在公司 Cursor 环境中迭代出一套精准的"Java 架构评审 Agent"。

**用户旅程**:

```
[公司 - Cursor 环境]
用户: acl capture --name arch-reviewer --tag java-enterprise
     ↓
系统: ✓ 检测到 Cursor 环境
     ✓ 抓取 .cursor/rules/arch-review.mdc
     ✓ 提取 agent 定义
     ✓ 转换为 ACL 标准格式
     ✓ 生成 manifest
     ↓
     推送到 GitHub (acl-assets 私有仓库)

[回家路上]
用户: 打开个人笔记本

[家 - Open Code 环境]
用户: acl sync --target opencode
     ↓
系统: ✓ 从云端拉取 arch-reviewer
     ✓ 检测到目标平台：Open Code
     ✓ Adaptor 转换为 YAML 格式
     ✓ 写入 .opencode/agents/arch-reviewer.yaml
     ↓
用户: 可以在 Open Code 中使用相同的架构评审能力
```

**价值主张**: 两台设备、两个平台之间的"大脑"实现瞬时对齐，无需手动复制粘贴。

### 5.2 场景二：外部市场资产捕获

**场景名称**: Market-to-Private Capture（市场到私有）

**背景**: 用户在 ClawHub 发现优秀的 "Deep Refactor" Skill。

**用户旅程**:

```
用户: "ClawHub 这个 Skill 很棒，帮我收录并适配到 Cloud Code"
     附链接: https://clawhub.dev/skills/deep-refactor
     ↓
AI:  ✓ 访问链接，解析 README
     ✓ 提取 SKILL.md 内容
     ✓ 安全性审计通过
     ✓ 转换为 ACL 格式
     ✓ 标记 @source:clawhub
     ↓
用户: acl adapt deep-refactor --to cloudcode
     ↓
系统: ✓ 生成 Cloud Code 适配配置
     ⚠ 警告：部分功能在当前环境不可用
     ↓
用户: Skill 正式成为个人资产库一部分
```

**价值主张**: 一键将外部优质能力转化为个人可迭代、可管理的私有资产。

### 5.3 场景三：AI 驱动的技能迭代

**场景名称**: Conversation-to-Asset Pipeline（对话到资产）

**背景**: 用户与 AI 进行"前端性能优化"长对话，碰撞出优质 Prompt 逻辑。

**用户旅程**:

```
[长对话过程]
用户与 AI 讨论 Web Vitals、代码拆分、缓存机制...
     ↓
[对话结束]
用户: "总结刚才关于性能优化的洞察，沉淀为 Skill"
     ↓
AI:  ✓ 过滤对话中的废话
     ✓ 提取核心逻辑：
         - 测量优先原则
         - Core Web Vitals 优化策略
         - 代码拆分最佳实践
         - 缓存机制设计
     ✓ 生成标准化文档：
         README.md (说明)
         instruction.md (核心指令)
         examples.md (示例)
     ↓
系统: ✓ 写入 skills/frontend-performance-expert/
     ✓ 生成 Commit: "feat(skill): add frontend-performance-expert"
     ✓ 推送到 GitHub
     ↓
结果: 对话中的闪光点被固化为可调用的插件资产
```

**价值主张**: 将随对话流逝的灵感转化为持久化的个人数字资产。

### 5.4 场景四：本地覆写与精细化调优

**场景名称**: Local Overriding（本地覆写）

**背景**: 全局"前端专家" Skill 需要针对 Tailwind CSS 项目做特殊调整。

**用户旅程**:

```
[全局配置 - GitHub]
assets/prompts/system/frontend-expert.md
     ↓
[项目 A - Tailwind 项目]
用户: 创建 .acl/overrides/frontend-expert.md
     内容：添加 Tailwind CSS 特定规范
     ↓
用户: acl sync
     ↓
系统: ✓ 从云端拉取全局 frontend-expert
     ✓ 检测到本地覆写文件
     ✓ 应用 sync_policy: merge
     ✓ 语义叠加全局逻辑 + 本地覆写
     ✓ 生成项目特定的临时配置
     ↓
结果: 全局能力保持一致性，同时适配项目差异化需求
```

**价值主张**: 既保持全局资产一致性，又尊重本地环境的差异性，本地配置不会被云端更新抹除。

### 5.5 场景五：Plugin 跨平台分发

**场景名称**: Plugin Distribution with Compatibility Feedback（兼容性感知分发）

**背景**: 用户维护的 ACL-Full-Stack-Plugin 包含前端、后端、运维三个 Agent。

**用户旅程**:

```
[环境：Cloud Code - 纯 Web 开发项目]
用户: acl sync --plugin acl-full-stack
     ↓
系统: 检测环境：Cloud Code v2.1.0
     开始兼容性检查...
     ↓
系统: [✓] 前端 Agent  - 完全兼容
     [✓] 后端 Agent  - 完全兼容  
     [!] 运维 Agent  - 不兼容，已跳过
         原因：依赖本地 Docker，Cloud Code 无法提供
     ↓
系统: 同步完成 (2/3)
      
      提示：如需完整功能，请在 Open Code 
            或具备本地权限的环境下运行。
```

**价值主张**: 智能识别环境能力边界，提供清晰的兼容性反馈，避免配置错误。

---

## 六、技术实现路线

### 6.1 技术栈选择

| 组件 | 技术选型 | 理由 |
|------|---------|------|
| CLI 框架 | Node.js + Commander.js / Go | 跨平台、生态成熟、易于分发 |
| 配置文件解析 | YAML + JSON Schema | 人类可读、可校验 |
| Git 操作 | isomorphic-git / go-git | 纯实现，无需依赖系统 Git |
| AI 集成 | OpenAI API / Claude API | 主流大模型，支持 Function Calling |
| 加密存储 | AES-256-GCM | 行业标准，安全可控 |

### 6.2 开发阶段规划

#### Phase 1: MVP Core（2-3 个月）

**目标**: 实现基础同步能力

**功能清单**:
- [ ] CLI 基础命令: init, sync, pull, status, list
- [ ] GitHub 集成: 仓库创建、认证、推拉
- [ ] 资产类型: Prompts、Skills
- [ ] 平台适配器: Cursor、Open Code
- [ ] 基础冲突处理: @sync:full、@sync:local
- [ ] 文档与示例

**成功标准**:
- 用户可以在 Cursor 和 Open Code 之间同步 Prompts
- 基础 CLI 体验流畅

#### Phase 2: MVP+（1-2 个月）

**目标**: 增强 AI 能力与资产管理

**功能清单**:
- [ ] AI 辅助入库: capture --ai
- [ ] 资产类型: Agents
- [ ] 语义合并: @sync:merge
- [ ] 依赖管理: deps install
- [ ] 外部市场抓取基础版

**成功标准**:
- 用户可以通过自然语言指令保存 Skill
- 冲突处理更智能

#### Phase 3: 完整版（2-3 个月）

**目标**: 完整 Plugin 生态与高级功能

**功能清单**:
- [ ] 资产类型: Flows、MCP Configs、Plugins
- [ ] 兼容性检查器: compatibility guard
- [ ] 平台适配器: Cloud Code、OpenClaw、Claude Code
- [ ] 高级 AI 功能: Smart Ingester、自动兼容性报告
- [ ] GUI/TUI 界面（可选）

**成功标准**:
- 支持复杂 Plugin 的跨平台分发
- 完整的兼容性矩阵支持

### 6.3 关键技术决策

#### 决策 1: 协议标准选择

**选项**:
1. **完全自定义**: 完全自主设计 ACL 协议
2. **基于 OASF**: 在 Open Agentic Schema Framework 基础上扩展
3. **混合方案**: 核心协议自定义，与 OASF 保持兼容

**建议**: **选项 3 - 混合方案**
- Agent 定义采用 OASF 规范，确保生态兼容
- Skill、Prompt 等定义自定义，更贴合产品需求
- 提供 OASF 导出能力，确保资产可迁移

#### 决策 2: 平台适配策略

**选项**:
1. **适配器插件化**: 每个平台适配器独立开发和分发
2. **内置核心适配器**: 核心平台内置，其他通过插件扩展
3. **社区驱动**: 基础框架 + 社区贡献适配器

**建议**: **选项 2 - 内置核心适配器**
- MVP 阶段内置 Cursor、Open Code 适配器
- 定义清晰的 Adapter API，支持后续扩展
- 核心适配器由官方维护，确保质量

#### 决策 3: AI 集成深度

**选项**:
1. **仅生成**: AI 仅生成配置，用户手动应用
2. **半自动**: AI 生成并展示，用户确认后应用
3. **全自动**: AI 完全自主执行（需高信任）

**建议**: **选项 2 - 半自动（默认）**
- 默认需要用户确认关键操作
- 提供 `--auto` 标志供高级用户选择全自动
- 敏感操作（如 Git push）始终需要确认

---

## 七、待调研技术问题

### 7.1 协议标准类

| 问题 | 优先级 | 调研目标 |
|------|-------|---------|
| OASF 元数据兼容性 | P1 | 确定 Agent 定义的字段映射关系 |
| A2A 协议 Purpose 字段 | P2 | 了解 Agent 间通信的标准化方式 |
| MCP 2.0 规范 | P1 | 确定 MCP Config 的存储和引用方式 |
| OpenClaw Skill 规范 | P1 | 明确 Skill 目录结构和加载机制 |

### 7.2 平台适配类

| 问题 | 优先级 | 调研目标 |
|------|-------|---------|
| Cursor .mdc 文件规范 | P0 | 完整的语法和限制 |
| Open Code 插件热加载 | P1 | 同步后是否需要重启？动态加载机制？ |
| Cloud Code 差异点 | P1 | 与 Open Code 的配置差异 |
| Claude Code 配置方式 | P2 | 是否有配置文件？如何注入？ |

### 7.3 工程实现类

| 问题 | 优先级 | 调研目标 |
|------|-------|---------|
| Git 合并策略 | P1 | 基于 Git 钩子的自动合并实现 |
| 依赖自动检测 | P2 | 如何检测 Skill 的 Python/Node 依赖 |
| 语义合并算法 | P2 | AI 辅助的 Markdown/YAML 合并 |
| 加密存储方案 | P1 | 本地凭证的安全存储 |

---

## 八、附录

### 8.1 术语表

| 术语 | 定义 |
|------|------|
| **ACL** | AI Capability Library，AI 能力库，本产品核心概念 |
| **Skill** | 原子级能力单元，可执行特定任务的工具 |
| **Prompt** | 指令集，定义 AI 的行为和输出风格 |
| **Agent** | AI 角色定义，包含 Purpose、Knowledge、Skills |
| **Flow** | 多 Agent 协作流程，基于状态机或 DAG |
| **Plugin** | 复合型能力包，包含多个 Agents、Skills、Flows |
| **MCP** | Model Context Protocol，模型上下文协议 |
| **OASF** | Open Agentic Schema Framework，开放智能体模式框架 |
| **Adaptor** | 协议转换器，将 ACL 资产转换为目标平台格式 |
| **Sync Policy** | 同步策略：full/merge/local |

### 8.2 CLI 命令速查

```bash
# 初始化
acl init [--repo <url>] [--template <name>]

# 资产捕获
acl capture [--name <name>] [--type <type>] [--tag <tag>]
acl capture prompt [--scope <scope>]
acl capture agent <name>

# 资产查询
acl list [--type <type>] [--tag <tag>] [--format <format>]
acl show <asset-name>
acl search <keyword>

# 同步与分发
acl sync [--target <platform>] [--dry-run] [--force]
acl pull [--force]
acl push
acl diff [local|remote|platform]
acl status

# 依赖管理
acl deps install [--skill <name>]
acl deps check

# 平台适配
acl adapt <asset> --to <platform> [--preview]

# AI 辅助
acl ai <instruction>
acl capture --ai <description>

# 配置
acl config set <key> <value>
acl config get <key>
acl config list
```

### 8.3 目录结构速查

```
~/.acl/                          # 用户级配置
├── config.yaml
├── credentials.yaml
└── cache/

./.acl/                          # 项目级配置
├── config.yaml
├── overrides/
└── local-only/

./.aclignore                     # 忽略规则

.github-repo/acl-assets/         # GitHub 资产仓库
├── skills/
├── prompts/
├── agents/
├── flows/
├── mcp-configs/
└── plugins/
```

---

## 九、变更日志

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| v1.0.0 | 2026-02-26 | 初始版本，基于 README.md 梳理并澄清需求 |

---

**文档维护者**: Sisyphus  
**审核状态**: 待评审  
**下次评审日期**: 2026-03-05
