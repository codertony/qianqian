# 乾乾 (QianQian) 技术路线图 v1.0

> **版本**: v1.0.0  
> **状态**: 执行中  
> **最后更新**: 2026-02-26  
> **当前阶段**: Phase 1 - MVP Core (40% 完成)

---

## 路线图概览

```
2026 Q1                    Q2                       Q3
───────────────────────────────────────────────────────────────
Week  1  2  3  4  5  6 | 7  8  9  10 | 11 12 13 14 15 16 17 18 19 20
      [====Phase 1====]   [==Phase 2==]   [========Phase 3========]
      MVP Core (6w)       MVP+ (4w)       Full Version (10w)

关键里程碑:
├── W2:  CLI 基础命令可用
├── W4:  配置系统完成
├── W6:  首次跨平台同步演示 ⭐ MVP
├── W8:  AI 提取功能上线
├── W10: 智能冲突解决 ⭐ MVP+
└── W20: v1.0.0 正式发布 ⭐ GA
```

---

## Phase 1: MVP Core (Week 1-6)

### 目标
实现可运行的基础同步能力，支持 Prompt 资产在 Cursor 和 OpenCode 之间同步。

### 当前进度
```
Phase 1 完成度: ████████░░░░░░░░░░░░ 40%

已完成:
✅ 项目结构和 TypeScript 配置
✅ CLI 框架 (Commander.js)
✅ 配置系统 (Zod + JSONC)
✅ AI Provider 框架 (Anthropic/OpenAI)
✅ Cursor/OpenCode 适配器类型定义
✅ Git 同步引擎 (simple-git)

进行中:
⚠️ CLI 命令实现 (10% - 仅 init 完成)
⚠️ 适配器工厂 (0% - 返回 null)
⚠️ 凭证加密存储 (0%)

待开始:
❌ 8 个核心 CLI 命令
❌ 适配器完整实现
```

### Week 1-2: 工程搭建与基础设施

#### Week 1: 项目初始化
**目标**: 可构建、可测试的项目骨架

| 任务 ID | 任务名称 | 优先级 | 估时 | 状态 |
|---------|---------|--------|------|------|
| P1-W1-T1 | 创建项目目录结构 | P0 | 2h | ✅ 已完成 |
| P1-W1-T2 | 初始化 Bun/Node 项目 | P0 | 2h | ✅ 已完成 |
| P1-W1-T3 | 配置 TypeScript | P0 | 2h | ✅ 已完成 |
| P1-W1-T4 | 安装核心依赖 | P0 | 2h | ✅ 已完成 |
| P1-W1-T5 | 配置 ESLint + Prettier | P1 | 2h | ⚠️ 待确认 |
| P1-W1-T6 | 配置 Git 工作流 | P1 | 2h | ⚠️ 待确认 |
| P1-W1-T7 | 创建目录结构 (src/, tests/) | P0 | 2h | ✅ 已完成 |
| P1-W1-T8 | 编写 README | P1 | 4h | ✅ 已完成 |

**Week 1 里程碑**:
```bash
✓ 项目可构建
✓ 测试框架就绪
⚠️ 代码规范配置（可选）
```

#### Week 2: 基础工具与错误处理
**目标**: 稳定的基础工具库

| 任务 ID | 任务名称 | 优先级 | 估时 | 状态 |
|---------|---------|--------|------|------|
| P1-W2-T1 | 实现错误处理体系 | P0 | 4h | ✅ 已完成 |
| P1-W2-T2 | 实现日志系统 | P0 | 4h | ✅ 已完成 |
| P1-W2-T3 | 实现文件系统工具 | P0 | 4h | ✅ 已完成 |
| P1-W2-T4 | 实现路径工具 | P1 | 2h | ✅ 已完成 |
| P1-W2-T5 | 实现哈希计算工具 | P1 | 2h | ✅ 已完成 |
| P1-W2-T6 | 编写基础工具测试 | P1 | 4h | ⚠️ 待开始 |
| P1-W2-T7 | 配置 CI (GitHub Actions) | P1 | 4h | ⚠️ 待确认 |
| P1-W2-T8 | 实现 CLI 框架骨架 | P0 | 6h | ✅ 已完成 |

**Week 2 里程碑**:
```bash
✓ acl --version 可用
✓ acl --help 可用
⚠️ 测试 CI（可选）
✓ 日志系统工作正常
```

### Week 3-4: 核心 CLI 与配置系统

#### Week 3: 配置管理系统
**目标**: 多层级配置工作正常

| 任务 ID | 任务名称 | 优先级 | 估时 | 状态 | 备注 |
|---------|---------|--------|------|------|------|
| P1-W3-T1 | 设计配置 Schema (Zod) | P0 | 4h | ✅ 已完成 | - |
| P1-W3-T2 | 实现配置加载器 | P0 | 6h | ✅ 已完成 | 多层合并 |
| P1-W3-T3 | 实现配置合并逻辑 | P0 | 4h | ✅ 已完成 | 3层覆盖 |
| P1-W3-T4 | 实现配置验证 | P1 | 4h | ✅ 已完成 | Zod校验 |
| P1-W3-T5 | 实现环境变量解析 | P1 | 3h | ⚠️ 部分完成 | ACL_* |
| P1-W3-T6 | 编写配置系统测试 | P1 | 4h | ❌ 待开始 | - |
| P1-W3-T7 | 创建默认配置模板 | P1 | 2h | ✅ 已完成 | - |

**技术决策点**:
- 配置层级: Defaults → User (~/.acl/) → Project (./.acl/) → Env → CLI
- 格式: JSONC (支持注释)
- 验证: Zod Schema

**Week 3 里程碑**:
```bash
✓ 配置可加载和验证
✓ 多层级覆盖逻辑正确
⚠️ 配置系统测试（待补充）
```

#### Week 4: CLI 命令实现 (Part 1)
**目标**: 核心命令可用

| 任务 ID | 任务名称 | 优先级 | 估时 | 状态 | 依赖 |
|---------|---------|--------|------|------|------|
| P1-W4-T1 | 实现 `acl init` 命令 | P0 | 8h | ✅ 已完成 | P1-W3-T2 |
| P1-W4-T2 | 实现交互式提示工具 | P0 | 4h | ✅ 已完成 | - |
| P1-W4-T3 | 实现 `acl config` 命令组 | P1 | 4h | ⚠️ 部分完成 | P1-W3-T2 |
| P1-W4-T4 | 实现 `acl status` 命令 | P0 | 6h | ❌ 未实现 | - |
| P1-W4-T5 | 实现命令中间件 | P0 | 6h | ⚠️ 部分完成 | T1 |
| P1-W4-T6 | 编写 CLI 测试 | P1 | 4h | ❌ 待开始 | T1 |
| P1-W4-T7 | 实现进度指示器 | P1 | 2h | ✅ 已完成 | - |

**Week 4 里程碑**:
```bash
$ acl init
? Enter your GitHub repository URL: https://github.com/user/acl-assets
? Select default sync policy: merge
✓ Configuration created at ./.acl/config.jsonc

$ acl status
❌ 未实现
```

### Week 5-6: 基础同步与适配器

#### Week 5: Git 集成完善
**目标**: Git 操作稳定可靠

| 任务 ID | 任务名称 | 优先级 | 估时 | 状态 | 备注 |
|---------|---------|--------|------|------|------|
| P1-W5-T1 | 集成 isomorphic-git | P0 | 4h | ⚠️ 决策中 | 当前用 simple-git |
| P1-W5-T2 | 实现 Git 认证 (Token/PAT) | P0 | 4h | ✅ 基础实现 | - |
| P1-W5-T3 | 实现仓库克隆 | P0 | 4h | ✅ 已完成 | - |
| P1-W5-T4 | 实现 Pull 操作 | P0 | 4h | ✅ 已完成 | - |
| P1-W5-T5 | 实现 Push 操作 | P0 | 4h | ✅ 已完成 | - |
| P1-W5-T6 | 实现 Commit 操作 | P0 | 3h | ✅ 已完成 | - |
| P1-W5-T7 | 实现凭证加密存储 | P1 | 6h | ❌ 未实现 | AES-256-GCM |
| P1-W5-T8 | 编写 Git 操作测试 | P1 | 4h | ❌ 待开始 | - |

**技术决策点**:
- Git 库选择: simple-git (当前) → isomorphic-git (建议迁移)
- 凭证存储: 加密文件 ~/.acl/credentials.enc

**Week 5 里程碑**:
```bash
✓ Git 认证工作正常
✓ Pull/Push/Commit 可用
❌ 凭证安全存储（待实现）
```

#### Week 6: 适配器实现与同步命令
**目标**: Cursor 和 OpenCode 适配器可用

| 任务 ID | 任务名称 | 优先级 | 估时 | 状态 | 依赖 |
|---------|---------|--------|------|------|------|
| P1-W6-T1 | 设计适配器接口 | P0 | 3h | ✅ 已完成 | - |
| P1-W6-T2 | 实现 Cursor 适配器 (Prompt) | P0 | 8h | ⚠️ 部分完成 | T1 |
| P1-W6-T3 | 实现 OpenCode 适配器 (Prompt) | P0 | 6h | ⚠️ 部分完成 | T1 |
| P1-W6-T4 | 实现适配器注册表 | P1 | 3h | ❌ 返回 null | T1 |
| P1-W6-T5 | 实现平台检测 | P1 | 3h | ✅ 已完成 | - |
| P1-W6-T6 | 实现 `acl sync` 命令 | P0 | 8h | ❌ TODO | T2-3, P1-W5 |
| P1-W6-T7 | 实现 `acl pull` 命令 | P0 | 4h | ❌ TODO | P1-W5 |
| P1-W6-T8 | 编写适配器测试 | P1 | 4h | ❌ 待开始 | T2-3 |

**关键技术问题**:
1. 适配器工厂 `createAdapter()` 返回 null，需要实现
2. `acl sync` 命令仅有 TODO 注释，需要完整实现

**Phase 1 最终里程碑**:
```bash
$ acl sync --target cursor
✓ Detected Cursor environment
✓ Connected to GitHub
✓ Fetched 3 prompts from remote
✓ Applied to .cursor/rules/
  + frontend-expert.mdc
  + backend-architect.mdc
  + code-reviewer.mdc
Sync complete: 3/3 assets applied
```

### Phase 1 风险与缓解

| 风险 | 可能性 | 影响 | 缓解措施 | 状态 |
|------|--------|------|---------|------|
| CLI 命令未实现 | 高 | 高 | 立即优先实现 sync/pull/push/status | 🔴 需关注 |
| 适配器工厂缺失 | 高 | 高 | 硬编码实现 createAdapter() | 🔴 需关注 |
| 凭证加密未实现 | 中 | 高 | 使用 crypto-js AES-256-GCM | 🟡 计划中 |
| isomorphic-git 迁移 | 中 | 中 | 可延后，simple-git 可用 | 🟢 可接受 |

### Phase 1 交付标准

**功能验收**:
- [ ] `acl init` 可创建完整配置 ✅
- [ ] `acl status` 显示正确状态 ❌
- [ ] `acl pull` 可从 GitHub 拉取 ❌
- [ ] `acl sync --target cursor` 成功同步 ❌
- [ ] `acl sync --target opencode` 成功同步 ❌
- [ ] 配置多层级覆盖正确 ✅
- [ ] 凭证加密存储 ❌

**代码质量**:
- [ ] 测试覆盖率 > 60% ❌
- [ ] 无 ESLint 错误 ⚠️
- [ ] 核心模块有 JSDoc ✅
- [ ] CI 100% 通过 ⚠️

---

## Phase 2: MVP+ (Week 7-10)

### 目标
增强 AI 能力与资产管理，实现智能冲突解决和 Agent 支持。

### Week 7-8: AI 集成与自动化

#### Week 7: AI Provider 框架完善
**目标**: AI 功能基础设施就绪

| 任务 ID | 任务名称 | 优先级 | 估时 | 依赖 |
|---------|---------|--------|------|------|
| P2-W7-T1 | 设计 AI Provider 接口 | P0 | 4h | - |
| P2-W7-T2 | 实现 Anthropic Provider | P0 | 6h | T1 |
| P2-W7-T3 | 实现 OpenAI Provider | P1 | 4h | T1 |
| P2-W7-T4 | 实现 Provider 工厂 | P1 | 2h | T2-3 |
| P2-W7-T5 | 实现 AI 配置管理 | P1 | 3h | - |
| P2-W7-T6 | 实现 AI 调用限流 | P1 | 3h | T2 |
| P2-W7-T7 | 实现 Token 预算管理 | P2 | 4h | T2 |
| P2-W7-T8 | 编写 AI Provider 测试 | P1 | 4h | T2-4 |

**Week 7 里程碑**:
```bash
✓ AI Provider 可切换
✓ Token 预算可配置
✓ 限流保护生效
```

#### Week 8: 自动化功能
**目标**: AI 辅助能力上线

| 任务 ID | 任务名称 | 优先级 | 估时 | 依赖 |
|---------|---------|--------|------|------|
| P2-W8-T1 | 实现 Commit Message 生成 | P0 | 6h | P2-W7 |
| P2-W8-T2 | 实现 Skill 提取功能 | P0 | 10h | P2-W7 |
| P2-W8-T3 | 实现对话解析器 | P0 | 6h | T2 |
| P2-W8-T4 | 实现 `acl capture --ai` | P0 | 6h | T2-3 |
| P2-W8-T5 | 实现智能命名建议 | P1 | 4h | P2-W7 |
| P2-W8-T6 | 实现自动生成 README | P1 | 4h | P2-W7 |
| P2-W8-T7 | 编写自动化功能测试 | P1 | 4h | T1-4 |

**Week 8 里程碑**:
```bash
$ acl capture --ai
✓ Analyzing conversation...
✓ Extracted skill: code-optimizer
  - 3 capabilities identified
  - Input schema generated
  - Examples extracted
? Save as skill? [Y/n]

$ git log -1
feat(skill): add code-optimizer via AI extraction

- Extracted from conversation #42
- Includes performance, readability, and security optimization
```

### Week 9-10: 高级同步与冲突处理

#### Week 9: 冲突解决
**目标**: 智能冲突处理可用

| 任务 ID | 任务名称 | 优先级 | 估时 | 依赖 |
|---------|---------|--------|------|------|
| P2-W9-T1 | 设计冲突解决策略 | P0 | 4h | - |
| P2-W9-T2 | 实现三路合并算法 | P0 | 8h | T1 |
| P2-W9-T3 | 实现语义合并 (AI) | P0 | 8h | P2-W7, T2 |
| P2-W9-T4 | 实现 @sync 标记处理 | P0 | 6h | T1 |
| P2-W9-T5 | 实现冲突预览 (dry-run) | P1 | 4h | T2-3 |
| P2-W9-T6 | 实现本地覆写保护 | P1 | 4h | T4 |
| P2-W9-T7 | 编写冲突解决测试 | P1 | 4h | T2-4 |
| P2-W9-T8 | 更新 sync 命令支持策略 | P0 | 4h | T4 |

**Week 9 里程碑**:
```bash
✓ 三路合并工作正常
✓ 语义合并可用
✓ @sync:merge 标记生效
```

#### Week 10: Agent 支持 + 依赖管理
**目标**: 支持 Agent 资产管理

| 任务 ID | 任务名称 | 优先级 | 估时 | 依赖 |
|---------|---------|--------|------|------|
| P2-W10-T1 | 实现 Agent Schema | P0 | 4h | - |
| P2-W10-T2 | 更新适配器支持 Agent | P0 | 6h | T1, P1-W6 |
| P2-W10-T3 | 实现 Agent 反向适配 | P1 | 6h | T2 |
| P2-W10-T4 | 实现依赖检测 | P0 | 6h | - |
| P2-W10-T5 | 实现 `acl deps install` | P0 | 6h | T4 |
| P2-W10-T6 | 实现 `acl deps check` | P1 | 3h | T4 |
| P2-W10-T7 | 编写 Agent 和依赖测试 | P1 | 4h | T1-6 |
| P2-W10-T8 | 性能优化 (大仓库) | P1 | 4h | - |

**Phase 2 最终里程碑**:
```bash
$ acl sync --target cursor
✓ Detected 3 conflicts
? Conflict resolution strategy: [AI Merge]
✓ Merged with AI assistance
✓ Applied 5 assets, 3 merged
[!] 1 local override preserved

$ acl deps check
✓ All dependencies satisfied
  - npm packages: 3 installed
  - pip packages: 2 installed
```

### Phase 2 技术决策点

| 决策 | 选项 | 建议 | 截止时间 |
|------|------|------|---------|
| AI Provider 默认 | Anthropic vs OpenAI | Anthropic (Claude 指令遵循强) | W7 Day 1 |
| Token 预算策略 | 限制/警告/超额处理 | 限制 + 警告 | W7 Day 3 |
| 冲突解决 UX | 自动/半自动/手动 | 半自动（默认） | W9 Day 2 |
| Agent 定义格式 | 自定义/OASF/混合 | 混合（OASF + 扩展） | W10 Day 2 |

### Phase 2 风险与缓解

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|---------|
| AI API 响应慢 | 高 | 中 | 添加超时、缓存、降级 |
| AI 提取质量不稳定 | 中 | 高 | 提示词优化、人工确认 |
| 合并算法复杂度 | 中 | 中 | 先用简单实现，逐步优化 |
| Agent 格式不统一 | 高 | 高 | 参考 everything-claude-code |

---

## Phase 3: Full Version (Week 11-20)

### 目标
完整 Plugin 生态与生产就绪，支持多平台和高级功能。

### Phase 3a: Plugin 与 Flow (Week 11-13)

#### Week 11: Plugin 系统设计
**目标**: Plugin 框架就绪

| 任务 ID | 任务名称 | 优先级 | 估时 |
|---------|---------|--------|------|
| P3-W11-T1 | 设计 Plugin 架构 | P0 | 8h |
| P3-W11-T2 | 定义 Plugin Manifest Schema | P0 | 4h |
| P3-W11-T3 | 实现 Plugin 加载器 | P0 | 8h |
| P3-W11-T4 | 实现 Plugin 依赖解析 | P1 | 6h |
| P3-W11-T5 | 实现 `acl plugin install` | P0 | 6h |
| P3-W11-T6 | 实现 `acl plugin uninstall` | P1 | 3h |
| P3-W11-T7 | 实现 `acl plugin list` | P1 | 3h |
| P3-W11-T8 | 编写 Plugin 测试 | P1 | 4h |

#### Week 12: Flow 支持 + Smart Ingester
**目标**: Flow 资产可用，外部市场抓取上线

| 任务 ID | 任务名称 | 优先级 | 估时 |
|---------|---------|--------|------|
| P3-W12-T1 | 设计 Flow Schema | P0 | 6h |
| P3-W12-T2 | 实现 Flow 引擎 (基础) | P0 | 10h |
| P3-W12-T3 | 更新适配器支持 Flow | P0 | 8h |
| P3-W12-T4 | 设计 Market Connector | P0 | 4h |
| P3-W12-T5 | 实现 GitHub 市场抓取 | P0 | 6h |
| P3-W12-T6 | 实现 ClawHub 市场抓取 | P1 | 8h |
| P3-W12-T7 | 实现 `acl fetch` | P0 | 6h |
| P3-W12-T8 | 编写 Flow 和 Market 测试 | P1 | 4h |

#### Week 13: MCP Config + 兼容性系统
**目标**: 完整 MCP 支持，兼容性检查器上线

| 任务 ID | 任务名称 | 优先级 | 估时 |
|---------|---------|--------|------|
| P3-W13-T1 | 设计 MCP Config Schema | P0 | 4h |
| P3-W13-T2 | 实现 MCP Config 管理 | P0 | 6h |
| P3-W13-T3 | 实现敏感信息隔离 | P0 | 6h |
| P3-W13-T4 | 设计兼容性矩阵 Schema | P0 | 4h |
| P3-W13-T5 | 实现兼容性检查器 | P0 | 10h |
| P3-W13-T6 | 实现运行时兼容性报告 | P1 | 6h |
| P3-W13-T7 | 实现自动兼容性打标 (AI) | P1 | 8h |
| P3-W13-T8 | 编写 MCP 和兼容性测试 | P1 | 4h |

**Phase 3a 里程碑**:
```bash
$ acl sync --plugin full-stack
Compatibility Report:
  ✓ Frontend Agent (all platforms)
  ✓ Backend Agent (cursor, opencode)
  ⚠ DevOps Agent (local only)
  ✓ Database Skill (all platforms)

[!] DevOps Agent skipped (incompatible with Cloud Code)
Applied: 3/4 assets
```

### Phase 3b: 多平台与生态 (Week 14-16)

#### Week 14: 新平台适配器
**目标**: Claude Code + 更多平台支持

| 任务 ID | 任务名称 | 优先级 | 估时 |
|---------|---------|--------|------|
| P3-W14-T1 | 调研 Claude Code 格式 | P0 | 4h |
| P3-W14-T2 | 实现 Claude Code 适配器 | P0 | 10h |
| P3-W14-T3 | 调研 Cloud Code 格式 | P1 | 4h |
| P3-W14-T4 | 实现 Cloud Code 适配器 | P1 | 8h |
| P3-W14-T5 | 实现适配器版本管理 | P1 | 6h |
| P3-W14-T6 | 更新平台检测逻辑 | P1 | 4h |
| P3-W14-T7 | 编写新适配器测试 | P1 | 4h |

#### Week 15: 版本降级 + 状态同步
**目标**: 高级兼容性特性

| 任务 ID | 任务名称 | 优先级 | 估时 |
|---------|---------|--------|------|
| P3-W15-T1 | 实现版本检测 | P0 | 6h |
| P3-W15-T2 | 实现版本降级策略 | P1 | 8h |
| P3-W15-T3 | 设计 Session 状态同步 | P1 | 4h |
| P3-W15-T4 | 实现 MCP Session 共享 | P2 | 10h |
| P3-W15-T5 | 实现资产版本锁定 | P1 | 6h |
| P3-W15-T6 | 更新 sync 支持版本参数 | P1 | 4h |
| P3-W15-T7 | 编写版本管理测试 | P1 | 4h |

#### Week 16: 安全增强 + 性能优化
**目标**: 生产级安全和性能

| 任务 ID | 任务名称 | 优先级 | 估时 |
|---------|---------|--------|------|
| P3-W16-T1 | 实现敏感信息扫描 | P0 | 8h |
| P3-W16-T2 | 实现自动 .gitignore 更新 | P1 | 4h |
| P3-W16-T3 | 实现提交前检查 | P1 | 6h |
| P3-W16-T4 | 优化大仓库性能 | P0 | 10h |
| P3-W16-T5 | 实现增量同步缓存 | P0 | 8h |
| P3-W16-T6 | 实现并行下载 | P1 | 6h |
| P3-W16-T7 | 性能基准测试 | P1 | 4h |
| P3-W16-T8 | 编写安全和性能测试 | P1 | 4h |

**Phase 3b 里程碑**:
```bash
$ acl push
✓ Pre-push checks passed
✓ No secrets detected
✓ All tests passed
Pushed to origin/main

Performance Benchmark:
  Sync 100 assets: 2.3s (target: < 5s) ✓
  Memory usage: 45MB (target: < 100MB) ✓
```

### Phase 3c: 发布准备 (Week 17-20)

#### Week 17: 测试完善
**目标**: 测试覆盖率达 80%+

| 任务 ID | 任务名称 | 优先级 | 估时 |
|---------|---------|--------|------|
| P3-W17-T1 | 编写缺失单元测试 | P0 | 12h |
| P3-W17-T2 | 编写 E2E 测试 | P0 | 12h |
| P3-W17-T3 | 设置跨平台 CI | P0 | 8h |
| P3-W17-T4 | 性能压力测试 | P1 | 6h |
| P3-W17-T5 | Bug 修复 | P0 | 10h |
| P3-W17-T6 | 测试覆盖率报告 | P1 | 2h |

#### Week 18: 文档完善
**目标**: 完整文档体系

| 任务 ID | 任务名称 | 优先级 | 估时 |
|---------|---------|--------|------|
| P3-W18-T1 | 编写用户指南 | P0 | 12h |
| P3-W18-T2 | 编写 API 参考 | P0 | 10h |
| P3-W18-T3 | 编写配置参考 | P0 | 8h |
| P3-W18-T4 | 编写 Plugin 开发指南 | P1 | 10h |
| P3-W18-T5 | 编写适配器开发指南 | P1 | 6h |
| P3-W18-T6 | 制作示例和模板 | P1 | 6h |
| P3-W18-T7 | 编写 FAQ | P1 | 4h |
| P3-W18-T8 | 文档网站搭建 | P2 | 8h |

#### Week 19: 构建与分发
**目标**: 可分发版本

| 任务 ID | 任务名称 | 优先级 | 估时 |
|---------|---------|--------|------|
| P3-W19-T1 | 配置二进制构建 | P0 | 6h |
| P3-W19-T2 | 构建 macOS 二进制 | P0 | 4h |
| P3-W19-T3 | 构建 Linux 二进制 | P0 | 4h |
| P3-W19-T4 | 构建 Windows 二进制 | P0 | 4h |
| P3-W19-T5 | 签名配置 | P1 | 6h |
| P3-W19-T6 | 发布工作流 (GitHub Actions) | P0 | 8h |
| P3-W19-T7 | Homebrew 配方 | P1 | 4h |
| P3-W19-T8 | npm 发布配置 | P1 | 4h |

#### Week 20: 发布与社区
**目标**: 正式发布，社区启动

| 任务 ID | 任务名称 | 优先级 | 估时 |
|---------|---------|--------|------|
| P3-W20-T1 | 发布候选版本 (RC) | P0 | 2h |
| P3-W20-T2 | Beta 测试 | P0 | 12h |
| P3-W20-T3 | Bug 修复 (RC) | P0 | 8h |
| P3-W20-T4 | 正式发布 v1.0.0 | P0 | 2h |
| P3-W20-T5 | 发布公告和博客 | P0 | 6h |
| P3-W20-T6 | 社区 Discord 启动 | P1 | 2h |
| P3-W20-T7 | 示例仓库发布 | P1 | 4h |
| P3-W20-T8 | 项目复盘 | P1 | 2h |

**Phase 3c / 项目 最终里程碑**:
```bash
🎉 QianQian v1.0.0 Released!

Features:
  ✓ 5 资产类型 (Prompt, Skill, Agent, Flow, MCP)
  ✓ 4 平台适配 (Cursor, Open Code, Claude, Cloud Code)
  ✓ Plugin 系统
  ✓ AI 辅助提取
  ✓ 智能冲突解决
  ✓ 兼容性矩阵

Downloads:
  npm: npm install -g qianqian
  Binary: https://github.com/user/qianqian/releases

Community:
  Discord: https://discord.gg/qianqian
  Docs: https://qianqian.dev
```

### Phase 3 可延后功能

**可移到 v1.1**:
- [ ] Session 状态同步
- [ ] 自动兼容性打标 (AI)
- [ ] 文档网站
- [ ] Homebrew 配方
- [ ] Cloud Code 适配器

**可移到 v2.0**:
- [ ] Flow 执行引擎
- [ ] 图形化界面
- [ ] 市场托管服务
- [ ] 团队协作功能

---

## 四、关键路径与依赖关系

### 4.1 关键路径图

```
[Week 1-2] 工程搭建
     │
     ▼
[Week 3-4] 配置系统
     │
     ▼
[Week 5] Git 集成
     │
     ├──▶ [Week 6] 适配器 + sync 命令 ───────────────────────────────┐
     │                     │                                        │
     ▼                     ▼                                        ▼
[Week 7-8] AI Provider  [Week 9] 冲突解决  [Week 10] Agent + Deps  Phase 1 完成
     │                     │                     │
     ▼                     ▼                     ▼
[Week 11-13] Plugin + Flow + MCP (Phase 3a)
     │
     ▼
[Week 14-16] 多平台 + 安全 + 性能 (Phase 3b)
     │
     ▼
[Week 17-20] 测试 + 文档 + 发布 (Phase 3c)
     │
     ▼
  v1.0.0 GA
```

### 4.2 关键依赖矩阵

| 前置任务 | 后置任务 | 依赖类型 |
|---------|---------|---------|
| P1-W3 配置系统 | P1-W4 CLI 命令 | 强依赖 |
| P1-W5 Git 集成 | P1-W6 sync/pull/push | 强依赖 |
| P1-W6 适配器 | P2-W10 Agent 支持 | 强依赖 |
| P2-W7 AI Provider | P2-W8 capture --ai | 强依赖 |
| P2-W9 冲突解决 | P3-所有同步功能 | 强依赖 |
| P3-W11 Plugin | P3-W12 Flow | 弱依赖 |

---

## 五、资源需求估算

### 5.1 人力资源

| 阶段 | 周期 | 建议团队规模 | 角色分配 |
|------|------|-------------|---------|
| Phase 1 | 6 周 | 1-2 人 | 全栈工程师 |
| Phase 2 | 4 周 | 2 人 | 后端 + AI 工程师 |
| Phase 3 | 10 周 | 2-3 人 | 全栈 + 平台工程师 + 文档工程师 |

### 5.2 基础设施

| 资源 | 用途 | 成本估算 |
|------|------|---------|
| GitHub Actions | CI/CD | 免费额度内 |
| Anthropic API | AI 功能 | ~$50/月 (开发) |
| OpenAI API | AI 备用 | ~$20/月 (开发) |
| npm 发布 | 包分发 | 免费 |
| 二进制签名 | 安全 | ~$100-300/年 |

### 5.3 外部依赖

| 依赖 | Phase | 风险 |
|------|-------|------|
| isomorphic-git | 1 | 低 (功能完善) |
| Anthropic API | 2 | 中 (成本控制) |
| Cursor API | 3 | 中 (非官方) |
| Claude Code API | 3 | 高 (文档不足) |

---

## 六、成功指标

### 技术指标

| 指标 | Phase 1 | Phase 2 | Phase 3 (v1.0) |
|------|---------|---------|---------------|
| 测试覆盖率 | > 60% | > 70% | >= 80% |
| CLI 启动时间 | < 1s | < 500ms | < 500ms |
| 同步 100 assets | < 10s | < 5s | < 3s |
| 二进制大小 | - | - | < 50MB |

### 用户指标（发布后）

| 指标 | 1 个月 | 3 个月 | 6 个月 |
|------|--------|--------|--------|
| GitHub Stars | 100 | 500 | 1000 |
| npm 周下载 | 500 | 2000 | 5000 |
| 活跃 Issue | < 20 | < 30 | < 50 |
| 社区成员 | 50 | 200 | 500 |

---

## 七、风险总览

### 7.1 技术风险

| 风险 | Phase | 可能性 | 影响 | 缓解措施 |
|------|-------|--------|------|---------|
| isomorphic-git 功能限制 | 1 | 中 | 高 | 预留 simple-git 降级方案 |
| AI API 响应慢/失败 | 2 | 高 | 中 | 超时、缓存、降级 |
| 平台适配器维护 | 3 | 高 | 中 | 社区驱动，核心维护 2-3 个 |
| 合并算法复杂度 | 2 | 中 | 中 | 先用简单实现，逐步优化 |

### 7.2 进度风险

| 风险 | Phase | 可能性 | 影响 | 缓解措施 |
|------|-------|--------|------|---------|
| CLI 命令开发超预期 | 1 | 中 | 高 | 简化 MVP 范围 |
| AI 功能质量不稳定 | 2 | 中 | 高 | 提示词优化、人工确认 |
| Phase 3 功能过多 | 3 | 高 | 高 | MCP/Flow 可延后 |
| 文档工作量超预期 | 3 | 中 | 中 | Markdown 优先，网站延后 |

---

## 八、附录

### 8.1 术语表

| 术语 | 定义 |
|------|------|
| **GA** | General Availability，正式发布 |
| **MVP** | Minimum Viable Product，最小可行产品 |
| **P0/P1/P2** | 优先级：P0=必需，P1=重要，P2=可选 |
| **TODO** | 待实现 |
| **WIP** | Work In Progress，进行中 |

### 8.2 缩写对照

| 缩写 | 全称 |
|------|------|
| **ACL** | AI Capability Library |
| **MCP** | Model Context Protocol |
| **OASF** | Open Agentic Schema Framework |
| **CI/CD** | Continuous Integration/Deployment |
| **E2E** | End-to-End |

### 8.3 参考文档

1. [Phase 1 详细计划](./phase-1-mvp-core.md)
2. [Phase 2 详细计划](./phase-2-mvp-plus.md)
3. [Phase 3 详细计划](./phase-3-full.md)
4. [资产存储规范](../specs/asset-storage-spec-v1.md)
5. [技术架构文档](../technical/architecture.md)

---

**文档维护者**: Sisyphus  
**状态**: 执行中  
**下次评审**: 2026-03-05