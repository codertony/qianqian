# 乾乾 (QianQian) 统一清单体系

> **版本**: v1.0.0  
> **状态**: 执行跟踪中  
> **最后更新**: 2026-02-26  
> **更新周期**: 每周五  
> **维护者**: Sisyphus

---

## 📋 清单体系说明

本文档是乾乾项目的**单一事实来源（Single Source of Truth）**，整合了：
- **功能清单（Feature List）**: 按产品模块分类的功能需求
- **任务清单（Task List）**: 具体的开发任务，含优先级、状态、估时
- **问题清单（Issue List）**: 待解决的技术问题和待决策事项

**使用规范**:
- 每项必须有唯一 ID（格式: `{阶段}-{模块}-{序号}`）
- 状态必须及时更新: `待开始` → `进行中` → `待审核` → `已完成`
- 每周五回顾并更新进度

---

## 一、功能清单（Feature List）

### 1.1 核心基础设施（Core Infrastructure）

| ID | 功能模块 | 功能描述 | 优先级 | 状态 | 所属阶段 |
|----|---------|---------|--------|------|---------|
| F-CORE-001 | CLI 框架 | 基于 Commander.js 的 CLI 框架，支持命令注册、参数解析、帮助文档 | P0 | ✅ 已完成 | Phase 1 |
| F-CORE-002 | 配置系统 | 多层配置加载与合并（Defaults → User → Project → Env → CLI），Zod 校验 | P0 | ✅ 已完成 | Phase 1 |
| F-CORE-003 | 日志系统 | 结构化日志（pino），支持级别控制和文件输出 | P0 | ✅ 已完成 | Phase 1 |
| F-CORE-004 | 错误处理 | 统一错误体系，含错误码、用户友好消息、堆栈追踪 | P0 | ✅ 已完成 | Phase 1 |
| F-CORE-005 | Git 存储引擎 | isomorphic-git 集成，支持浅克隆（--depth 1）、认证、分支管理 | P0 | 🔄 进行中 | Phase 1 |
| F-CORE-006 | 凭证加密存储 | AES-256-GCM 加密，~/.acl/credentials.yaml 安全存储 | P1 | ⏳ 待开始 | Phase 1 |
| F-CORE-007 | 文件系统工具 | 跨平台路径处理、目录操作、文件监听 | P0 | ✅ 已完成 | Phase 1 |

### 1.2 CLI 命令（CLI Commands）

| ID | 命令 | 功能描述 | 优先级 | 状态 | 所属阶段 |
|----|-----|---------|--------|------|---------|
| F-CLI-001 | `acl init` | 交互式初始化，创建配置文件和仓库连接 | P0 | ✅ 已完成 | Phase 1 |
| F-CLI-002 | `acl sync` | 核心同步命令，支持全量/增量同步、平台选择 | P0 | ⏳ 待开始 | Phase 1 |
| F-CLI-003 | `acl pull` | 从远程仓库拉取更新 | P0 | ⏳ 待开始 | Phase 1 |
| F-CLI-004 | `acl push` | 推送本地变更到远程仓库 | P0 | ⏳ 待开始 | Phase 1 |
| F-CLI-005 | `acl status` | 显示同步状态、变更统计 | P0 | ⏳ 待开始 | Phase 1 |
| F-CLI-006 | `acl list` | 列出所有资产（Prompts/Skills/Agents） | P1 | ⏳ 待开始 | Phase 1 |
| F-CLI-007 | `acl show` | 查看单个资产详情 | P1 | ⏳ 待开始 | Phase 1 |
| F-CLI-008 | `acl diff` | 比较本地与远程差异 | P1 | ⏳ 待开始 | Phase 1 |
| F-CLI-009 | `acl capture` | 捕获 IDE 配置并转换为资产 | P0 | ⏳ 待开始 | Phase 1 |
| F-CLI-010 | `acl capture --ai` | AI 辅助捕获，从对话提取 Skill | P0 | ⏳ 待开始 | Phase 2 |
| F-CLI-011 | `acl config` | 配置管理命令组（get/set/list） | P1 | ⚠️ 部分完成 | Phase 1 |
| F-CLI-012 | `acl deps install` | 安装 Skill 依赖（npm/pip） | P0 | ⏳ 待开始 | Phase 2 |
| F-CLI-013 | `acl deps check` | 检查依赖完整性 | P1 | ⏳ 待开始 | Phase 2 |
| F-CLI-014 | `acl plugin install` | 安装 Plugin | P0 | ⏳ 待开始 | Phase 3 |
| F-CLI-015 | `acl plugin uninstall` | 卸载 Plugin | P1 | ⏳ 待开始 | Phase 3 |
| F-CLI-016 | `acl plugin list` | 列出已安装 Plugins | P1 | ⏳ 待开始 | Phase 3 |
| F-CLI-017 | `acl fetch` | 从外部市场抓取资产 | P0 | ⏳ 待开始 | Phase 3 |
| F-CLI-018 | `acl validate` | 验证资产格式正确性 | P1 | ⏳ 待开始 | Phase 2 |

### 1.3 资产类型管理（Asset Management）

| ID | 资产类型 | 功能描述 | 优先级 | 状态 | 所属阶段 |
|----|---------|---------|--------|------|---------|
| F-ASSET-001 | Prompt 资产 | Markdown + YAML Frontmatter 格式，支持变量、继承 | P0 | ✅ 类型定义完成 | Phase 1 |
| F-ASSET-002 | Skill 资产 | 多文件目录结构，含 SKILL.md、示例、脚本 | P0 | ✅ 类型定义完成 | Phase 1 |
| F-ASSET-003 | Skill 执行 | 无执行（MVP）→ Isolates → Deno → Firecracker | P1 | ⏳ 待开始 | Phase 2-3 |
| F-ASSET-004 | Agent 资产 | 单文件 Markdown，定义 purpose、capabilities、tools | P0 | ✅ 类型定义完成 | Phase 1 |
| F-ASSET-005 | Flow 资产 | DAG 描述性配置（节点、边、变量） | P1 | ⏳ 待开始 | Phase 3 |
| F-ASSET-006 | MCP Config | MCP 服务器配置，支持敏感信息隔离 | P1 | ⏳ 待开始 | Phase 3 |
| F-ASSET-007 | Plugin 资产 | 复合包，含 manifest、兼容性矩阵、多平台配置 | P2 | ⏳ 待开始 | Phase 3 |
| F-ASSET-008 | 资产验证 | Zod Schema 验证，格式检查和引用完整性 | P1 | ⏳ 待开始 | Phase 2 |

### 1.4 平台适配器（Platform Adapters）

| ID | 平台 | 功能描述 | 优先级 | 状态 | 所属阶段 |
|----|-----|---------|--------|------|---------|
| F-ADPT-001 | Cursor 基础适配 | Prompt/Agent 转换，.cursor/rules/ 支持 | P0 | ⚠️ 部分完成 | Phase 1 |
| F-ADPT-002 | Cursor Team Rules | 支持企业级 Team Rules 优先级 | P1 | ⏳ 待开始 | Phase 1 |
| F-ADPT-003 | Open Code 基础适配 | Prompt/Skill/Agent 转换，YAML 格式 | P0 | ⚠️ 部分完成 | Phase 1 |
| F-ADPT-004 | Open Code 7层配置 | 完整配置层级支持（Remote → Global → Project → Local → Env → Inline） | P1 | ⏳ 待开始 | Phase 2 |
| F-ADPT-005 | Claude Code 适配 | 5层作用域支持（Managed → Project → Local → User → Command Line） | P1 | ⏳ 待开始 | Phase 2 |
| F-ADPT-006 | Cloud Code 适配 | Google Cloud Code 平台支持 | P2 | ⏳ 待开始 | Phase 3 |
| F-ADPT-007 | 适配器工厂 | 动态适配器实例化（硬编码 Map） | P0 | ⏳ 待开始 | Phase 1 |
| F-ADPT-008 | 平台检测 | 自动检测当前 IDE 环境 | P1 | ✅ 已完成 | Phase 1 |
| F-ADPT-009 | 反向适配 | 从平台配置反向转换为 ACL 资产 | P1 | ⚠️ 部分完成 | Phase 2 |

### 1.5 同步与冲突解决（Sync & Conflict Resolution）

| ID | 功能 | 功能描述 | 优先级 | 状态 | 所属阶段 |
|----|-----|---------|--------|------|---------|
| F-SYNC-001 | 全量同步 | 完整仓库同步，覆盖所有资产 | P0 | ⏳ 待开始 | Phase 1 |
| F-SYNC-002 | 增量同步 | 基于哈希的增量检测，仅同步变更 | P1 | ⏳ 待开始 | Phase 1 |
| F-SYNC-003 | 同步策略 | @sync:full / @sync:merge / @sync:local 标记支持 | P0 | ⏳ 待开始 | Phase 1 |
| F-SYNC-004 | 三路合并 | 基础文本合并算法 | P1 | ⏳ 待开始 | Phase 2 |
| F-SYNC-005 | 语义合并 | AI 辅助合并，保持 Markdown/YAML 语法完整性 | P1 | ⏳ 待开始 | Phase 2 |
| F-SYNC-006 | 冲突预览 | dry-run 模式，预览冲突而不应用 | P1 | ⏳ 待开始 | Phase 2 |
| F-SYNC-007 | 本地覆写保护 | 防止意外覆盖本地自定义配置 | P1 | ⏳ 待开始 | Phase 2 |
| F-SYNC-008 | 版本锁定 | versions.lock 文件，锁定资产版本 | P2 | ⏳ 待开始 | Phase 3 |

### 1.6 安全与沙箱（Security & Sandbox）

| ID | 功能 | 功能描述 | 优先级 | 状态 | 所属阶段 |
|----|-----|---------|--------|------|---------|
| F-SEC-001 | 敏感信息扫描 | 自动检测 API Key、Token、密码等 | P0 | ⏳ 待开始 | Phase 2 |
| F-SEC-002 | 自动 .gitignore | 检测敏感文件并建议加入 .gitignore | P1 | ⏳ 待开始 | Phase 2 |
| F-SEC-003 | 提交前检查 | pre-push 钩子，阻止含密钥的提交 | P1 | ⏳ 待开始 | Phase 3 |
| F-SEC-004 | SandboxManager 接口 | 沙箱管理器接口设计（预留扩展点） | P1 | ⏳ 待开始 | Phase 1 |
| F-SEC-005 | Isolates 沙箱 | V8 Isolates 隔离（纯 JS 计算） | P1 | ⏳ 待开始 | Phase 2 |
| F-SEC-006 | Deno Sandbox | Deno 权限模型沙箱（文件/网络访问） | P2 | ⏳ 待开始 | Phase 3 |
| F-SEC-007 | Firecracker 预留 | 微虚拟机隔离接口预留 | P3 | ⏳ 待开始 | Phase 3 |
| F-SEC-008 | 依赖安全检查 | 扫描 Skill 依赖的安全漏洞 | P2 | ⏳ 待开始 | Phase 3 |

### 1.7 AI 集成（AI Integration）

| ID | 功能 | 功能描述 | 优先级 | 状态 | 所属阶段 |
|----|-----|---------|--------|------|---------|
| F-AI-001 | AI Provider 框架 | Anthropic + OpenAI 双支持，统一接口 | P0 | ✅ 已完成 | Phase 1 |
| F-AI-002 | Token 预算管理 | 每日/每次调用 Token 限制 | P2 | ⏳ 待开始 | Phase 2 |
| F-AI-003 | 限流控制 | 每分钟请求数限制、并发控制 | P1 | ⏳ 待开始 | Phase 2 |
| F-AI-004 | Skill 提取 | 从对话历史提取可复用 Skill | P0 | ⏳ 待开始 | Phase 2 |
| F-AI-005 | 对话特征提取 | 识别有效 Prompt 模式，过滤闲聊 | P0 | ⏳ 待开始 | Phase 2 |
| F-AI-006 | Commit Message 生成 | 基于变更自动生成 Conventional Commit | P1 | ⏳ 待开始 | Phase 2 |
| F-AI-007 | 智能命名建议 | 为 Skill/Agent 生成语义化名称 | P2 | ⏳ 待开始 | Phase 2 |
| F-AI-008 | 自动文档生成 | 从代码/配置生成资产文档 | P2 | ⏳ 待开始 | Phase 2 |
| F-AI-009 | 语义合并 | AI 辅助解决复杂冲突 | P1 | ⏳ 待开始 | Phase 2 |
| F-AI-010 | 兼容性自动打标 | AI 分析资产并标记平台兼容性 | P2 | ⏳ 待开始 | Phase 3 |

### 1.8 兼容性系统（Compatibility System）

| ID | 功能 | 功能描述 | 优先级 | 状态 | 所属阶段 |
|----|-----|---------|--------|------|---------|
| F-COMP-001 | 兼容性矩阵 | Full/Partial/None 三级兼容性定义 | P1 | ✅ 类型定义完成 | Phase 3 |
| F-COMP-002 | 平台能力检测 | 自动检测目标平台支持的功能 | P1 | ⏳ 待开始 | Phase 3 |
| F-COMP-003 | 降级建议 | 当资产不兼容时提供降级方案 | P1 | ⏳ 待开始 | Phase 3 |
| F-COMP-004 | 运行时报告 | 同步时生成兼容性报告 | P2 | ⏳ 待开始 | Phase 3 |
| F-COMP-005 | 版本检测 | 检测平台版本，建议降级或升级 | P2 | ⏳ 待开始 | Phase 3 |

### 1.9 生态集成（Ecosystem Integration）

| ID | 功能 | 功能描述 | 优先级 | 状态 | 所属阶段 |
|----|-----|---------|--------|------|---------|
| F-ECO-001 | GitHub 市场抓取 | 从 GitHub 仓库抓取资产 | P0 | ⏳ 待开始 | Phase 3 |
| F-ECO-002 | ClawHub 市场 | 自有市场平台集成 | P2 | ⏳ 待开始 | Phase 3 |
| F-ECO-003 | Plugin 依赖解析 | npm/yarn 式依赖解析算法 | P1 | ⏳ 待开始 | Phase 3 |
| F-ECO-004 | Plugin 版本锁定 | package-lock 式版本锁定 | P2 | ⏳ 待开始 | Phase 3 |
| F-ECO-005 | A2A 协议支持 | Agent2Agent 协议集成 | P3 | ⏳ 待开始 | Phase 3 |

---

## 二、任务清单（Task List）

### 2.1 Phase 1: MVP Core（Week 1-6）

#### Week 5 - Git 集成（更新）

| 任务 ID | 任务名称 | 优先级 | 估时 | 状态 | 负责人 | 备注 |
|---------|---------|--------|------|------|--------|------|
| T-P1-W5-01 | ~~集成 simple-git~~ | ~~P0~~ | ~~4h~~ | ~~已取消~~ | - | 改用 isomorphic-git |
| **T-P1-W5-01** | **集成 isomorphic-git** | **P0** | **4h** | **⏳ 待开始** | - | ⭐ 更新 |
| T-P1-W5-02 | 实现 Git 认证 (Token/PAT) | P0 | 4h | ✅ 已完成 | - | - |
| T-P1-W5-03 | 实现仓库克隆（浅克隆） | P0 | 4h | ⚠️ 需更新 | - | 使用 --depth 1 |
| T-P1-W5-04 | 实现 Pull 操作 | P0 | 4h | ✅ 已完成 | - | - |
| T-P1-W5-05 | 实现 Push 操作 | P0 | 4h | ✅ 已完成 | - | - |
| T-P1-W5-06 | 实现 Commit 操作 | P0 | 3h | ✅ 已完成 | - | - |
| T-P1-W5-07 | 实现凭证加密存储 | P1 | 6h | ⏳ 待开始 | - | AES-256-GCM |
| T-P1-W5-08 | 编写 Git 操作测试 | P1 | 4h | ⏳ 待开始 | - | - |
| **T-P1-W5-09** | **isomorphic-git 迁移** | **P0** | **4h** | **⏳ 新增** | - | ⭐ DeepResearch |

#### Week 6 - 适配器与同步命令

| 任务 ID | 任务名称 | 优先级 | 估时 | 状态 | 负责人 | 依赖 |
|---------|---------|--------|------|------|--------|------|
| T-P1-W6-01 | 设计适配器接口 | P0 | 3h | ✅ 已完成 | - | - |
| T-P1-W6-02 | 实现 Cursor 适配器 (Prompt) | P0 | 8h | ⚠️ 进行中 | - | T-01 |
| T-P1-W6-03 | 实现 OpenCode 适配器 (Prompt) | P0 | 6h | ⚠️ 进行中 | - | T-01 |
| T-P1-W6-04 | 实现适配器注册表 | P1 | 3h | ⏳ 待开始 | - | T-01 |
| T-P1-W6-05 | 实现平台检测 | P1 | 3h | ✅ 已完成 | - | - |
| T-P1-W6-06 | 实现 `acl sync` 命令 | P0 | 8h | ⏳ 待开始 | - | T-02,03 |
| T-P1-W6-07 | 实现 `acl pull` 命令 | P0 | 4h | ⏳ 待开始 | - | T-P1-W5 |
| T-P1-W6-08 | 编写适配器测试 | P1 | 4h | ⏳ 待开始 | - | T-02,03 |
| **T-P1-W6-09** | **Cursor Team Rules 支持** | **P1** | **2h** | **⏳ 新增** | - | ⭐ DeepResearch |
| **T-P1-W6-10** | **SandboxManager 接口设计** | **P1** | **3h** | **⏳ 新增** | - | ⭐ DeepResearch |

### 2.2 Phase 2: MVP+（Week 7-10）

#### Week 8 - AI 自动化（更新）

| 任务 ID | 任务名称 | 优先级 | 估时 | 状态 | 负责人 | 依赖 |
|---------|---------|--------|------|------|--------|------|
| T-P2-W8-01 | 实现 Commit Message 生成 | P0 | 6h | ⏳ 待开始 | - | P2-W7 |
| T-P2-W8-02 | 实现 Skill 提取功能 | P0 | 10h | ⏳ 待开始 | - | P2-W7 |
| T-P2-W8-03 | 实现对话解析器 | P0 | 6h | ⏳ 待开始 | - | T-02 |
| T-P2-W8-04 | 实现 `acl capture --ai` | P0 | 6h | ⏳ 待开始 | - | T-02,03 |
| T-P2-W8-05 | 实现智能命名建议 | P1 | 4h | ⏳ 待开始 | - | P2-W7 |
| T-P2-W8-06 | 实现自动生成 README | P1 | 4h | ⏳ 待开始 | - | P2-W7 |
| T-P2-W8-07 | 编写自动化功能测试 | P1 | 4h | ⏳ 待开始 | - | T-01-04 |
| **T-P2-W8-08** | **对话特征提取器** | **P0** | **6h** | **⏳ 新增** | - | ⭐ DeepResearch |

#### Week 9-10 - 冲突解决与沙箱（更新）

| 任务 ID | 任务名称 | 优先级 | 估时 | 状态 | 负责人 | 依赖 |
|---------|---------|--------|------|------|--------|------|
| T-P2-W9-01 | 设计冲突解决策略 | P0 | 4h | ⏳ 待开始 | - | - |
| T-P2-W9-02 | 实现三路合并算法 | P0 | 8h | ⏳ 待开始 | - | T-01 |
| T-P2-W9-03 | 实现语义合并 (AI) | P0 | 8h | ⏳ 待开始 | - | P2-W7, T-02 |
| T-P2-W9-04 | 实现 @sync 标记处理 | P0 | 6h | ⏳ 待开始 | - | T-01 |
| T-P2-W9-05 | 实现冲突预览 (dry-run) | P1 | 4h | ⏳ 待开始 | - | T-02-03 |
| T-P2-W9-06 | 实现本地覆写保护 | P1 | 4h | ⏳ 待开始 | - | T-04 |
| T-P2-W9-07 | 编写冲突解决测试 | P1 | 4h | ⏳ 待开始 | - | T-02-04 |
| T-P2-W9-08 | 更新 sync 命令支持策略 | P0 | 4h | ⏳ 待开始 | - | T-04 |
| **T-P2-W9-09** | **语法感知合并** | **P1** | **4h** | **⏳ 新增** | - | ⭐ DeepResearch |
| T-P2-W10-01 | 实现 Agent Schema | P0 | 4h | ⏳ 待开始 | - | - |
| T-P2-W10-02 | 更新适配器支持 Agent | P0 | 6h | ⏳ 待开始 | - | T-01, P1-W6 |
| T-P2-W10-03 | 实现 Agent 反向适配 | P1 | 6h | ⏳ 待开始 | - | T-02 |
| T-P2-W10-04 | 实现依赖检测 | P0 | 6h | ⏳ 待开始 | - | - |
| T-P2-W10-05 | 实现 `acl deps install` | P0 | 6h | ⏳ 待开始 | - | T-04 |
| T-P2-W10-06 | 实现 `acl deps check` | P1 | 3h | ⏳ 待开始 | - | T-04 |
| T-P2-W10-07 | 编写 Agent 和依赖测试 | P1 | 4h | ⏳ 待开始 | - | T-01-06 |
| T-P2-W10-08 | 性能优化 (大仓库) | P1 | 4h | ⏳ 待开始 | - | - |
| **T-P2-W10-09** | **敏感信息扫描** | **P0** | **6h** | **⏳ 新增** | - | ⭐ DeepResearch |
| **T-P2-W10-10** | **Isolates 沙箱实现** | **P1** | **8h** | **⏳ 新增** | - | ⭐ DeepResearch |

### 2.3 Phase 3: Full Version（Week 11-20）

| 任务 ID | 任务名称 | 优先级 | 估时 | 状态 | 负责人 | 所属阶段 |
|---------|---------|--------|------|------|--------|---------|
| T-P3-W11-01 | 设计 Plugin 架构 | P0 | 8h | ⏳ 待开始 | - | 3a |
| T-P3-W11-02 | 定义 Plugin Manifest Schema | P0 | 4h | ⏳ 待开始 | - | 3a |
| T-P3-W11-03 | 实现 Plugin 加载器 | P0 | 8h | ⏳ 待开始 | - | 3a |
| T-P3-W12-01 | 设计 Flow Schema | P0 | 6h | ⏳ 待开始 | - | 3a |
| T-P3-W12-02 | 实现 Flow 描述性格式 | P0 | 6h | ⏳ 待开始 | - | 3a |
| T-P3-W12-03 | 更新适配器支持 Flow | P0 | 8h | ⏳ 待开始 | - | 3a |
| T-P3-W13-01 | 设计 MCP Config Schema | P0 | 4h | ⏳ 待开始 | - | 3a |
| T-P3-W13-02 | 实现 MCP Config 管理 | P0 | 6h | ⏳ 待开始 | - | 3a |
| T-P3-W14-01 | 调研 Claude Code 格式 | P0 | 4h | ⏳ 待开始 | - | 3b |
| T-P3-W14-02 | 实现 Claude Code 适配器 | P0 | 10h | ⏳ 待开始 | - | 3b |
| T-P3-W14-03 | 实现 Deno Sandbox | P0 | 10h | ⏳ 待开始 | - | 3b |
| T-P3-W17-01 | 编写缺失单元测试 | P0 | 12h | ⏳ 待开始 | - | 3c |
| T-P3-W17-02 | 编写 E2E 测试 | P0 | 12h | ⏳ 待开始 | - | 3c |
| T-P3-W20-01 | A2A 协议调研 | P3 | 8h | ⏳ 待开始 | - | 3c |

---

## 三、问题/决策清单（Issue & Decision List）

### 3.1 待决策问题（Blocking Decisions）

| ID | 问题 | 选项 | 建议 | 紧急度 | 状态 | 截止时间 |
|----|-----|------|------|--------|------|---------|
| D-001 | MVP Skill 执行范围 | A. 仅 Prompt 集合<br>B. 基础 Node.js 执行<br>C. 完整沙箱 | **A** | 🔴 P0 | ⏳ 待确认 | Phase 1 启动 |
| D-002 | CLI 命令优先级 | 推荐: sync>pull>status>capture | - | 🔴 P0 | ⏳ 待确认 | Phase 1 启动 |
| D-003 | Phase 1 平台支持 | A. Cursor+OpenCode<br>B. +Claude Code<br>C. +Cloud Code | **A** | 🔴 P0 | ⏳ 待确认 | Phase 1 启动 |
| D-004 | 适配器工厂实现 | A. 硬编码 Map<br>B. 动态导入<br>C. 配置驱动 | **A** | 🔴 P0 | ⏳ 待确认 | Phase 1 启动 |
| D-005 | Git 库选择 | A. 保持 simple-git<br>B. 迁移 isomorphic-git | **B** | 🟡 P1 | ⏳ 待确认 | Phase 1 W5 |
| D-006 | 配置层级设计 | A. 乾乾 5 层<br>B. 融合 7 层 | **A** | 🟡 P1 | ⏳ 待确认 | Phase 1 内 |
| D-007 | capture --ai 范围 | A. Phase 2<br>B. Phase 1 | **A** | 🟡 P1 | ⏳ 待确认 | Phase 1 内 |
| D-008 | Flow 引擎范围 | A. 描述性配置<br>B. 轻量执行<br>C. 完整引擎 | **A** | 🟢 P2 | ⏳ 待确认 | Phase 3 |

### 3.2 技术风险追踪

| ID | 风险描述 | 可能性 | 影响 | 缓解措施 | 状态 | 负责人 |
|----|---------|--------|------|---------|------|--------|
| R-001 | isomorphic-git API 差异导致迁移困难 | 中 | 中 | 预留 4h 缓冲时间，准备回退方案 | ⏳ 监控 | - |
| R-002 | Isolates 性能不达标（>10ms 启动） | 中 | 中 | 渐进优化，备选 Deno | ⏳ 监控 | - |
| R-003 | AI 提取质量不稳定 | 高 | 高 | 提示词工程 + 人工确认流程 | ⏳ 监控 | - |
| R-004 | 语法感知合并复杂度过高 | 中 | 高 | 先支持 Markdown/YAML，逐步扩展 | ⏳ 监控 | - |
| R-005 | Cursor Team Rules 文档不足 | 中 | 低 | 基于现有 .mdc 规范推断 | ⏳ 监控 | - |
| R-006 | Claude Code 配置格式变化 | 中 | 中 | 关注官方文档更新 | ⏳ 监控 | - |

### 3.3 已知问题（Known Issues）

| ID | 问题描述 | 严重程度 | 临时解决方案 | 永久解决方案 | 状态 |
|----|---------|---------|-------------|-------------|------|
| I-001 | `createAdapter()` 返回 null | 🔴 阻塞 | 无 | 实现硬编码 Map | ⏳ 待修复 |
| I-002 | `acl sync` 仅有 TODO 注释 | 🔴 阻塞 | 无 | 实现完整同步逻辑 | ⏳ 待修复 |
| I-003 | 凭证未加密存储 | 🟡 高 | 手动管理 | AES-256-GCM 加密 | ⏳ 待修复 |
| I-004 | 8/10 CLI 命令未实现 | 🟡 高 | 无 | 按优先级实现 | ⏳ 待修复 |
| I-005 | 测试覆盖率 < 60% | 🟢 中 | 无 | 补充单元测试 | ⏳ 待修复 |

---

## 四、进度总览

### 4.1 总体进度

```
Phase 1 (MVP Core):        ████████░░░░░░░░░░░░  40%  (Week 6/6)
Phase 2 (MVP+):            ░░░░░░░░░░░░░░░░░░░░   0%  (未开始)
Phase 3 (Full Version):    ░░░░░░░░░░░░░░░░░░░░   0%  (未开始)
─────────────────────────────────────────────────────────
Overall:                   ███░░░░░░░░░░░░░░░░░  15%
```

### 4.2 本周关键任务（Week 6）

| 优先级 | 任务 | 状态 | 阻塞项 |
|--------|------|------|--------|
| 🔴 P0 | 实现 `acl sync` 命令 | ⏳ 待开始 | 适配器工厂 |
| 🔴 P0 | 修复 `createAdapter()` | ⏳ 待开始 | - |
| 🔴 P0 | 迁移 isomorphic-git | ⏳ 待开始 | - |
| 🟡 P1 | Cursor Team Rules 支持 | ⏳ 待开始 | - |
| 🟡 P1 | SandboxManager 接口设计 | ⏳ 待开始 | - |

### 4.3 里程碑检查

| 里程碑 | 计划日期 | 状态 | 风险 |
|--------|---------|------|------|
| MVP 演示（sync 工作） | Week 6 | 🟡 有风险 | 需完成 4 个 P0 任务 |
| AI 功能上线 | Week 8 | 🟢 正常 | - |
| MVP+ 发布 | Week 10 | 🟢 正常 | - |
| v1.0.0 GA | Week 20 | 🟢 正常 | - |

---

## 五、使用指南

### 5.1 更新清单

**每周五执行**:
1. 更新任务状态（⏳/🔄/✅）
2. 添加新发现的任务
3. 更新问题/风险状态
4. 调整优先级（如有必要）

### 5.2 添加新任务

```markdown
| T-{阶段}-W{周}-{序号} | {任务名} | {P0/P1/P2} | {估时} | ⏳ 待开始 | {负责人} | {依赖} |
```

### 5.3 任务状态流转

```
⏳ 待开始 → 🔄 进行中 → 🔍 待审核 → ✅ 已完成
   ↓           ↓           ↓
   └───────────┴───────────┘
              ↓
         ❌ 已取消（注明原因）
```

---

## 六、历史变更记录

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|---------|------|
| 2026-02-26 | v1.0.0 | 初始版本，整合功能清单、任务清单、问题清单 | Sisyphus |
| 2026-02-26 | v1.0.1 | 整合 DeepResearch 更新，添加 isomorphic-git 迁移、沙箱层设计等任务 | Sisyphus |

---

**文档维护者**: Sisyphus  
**更新频率**: 每周五  
**状态**: 活跃追踪中