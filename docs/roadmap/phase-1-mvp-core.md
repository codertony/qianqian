# Phase 1: MVP Core - 详细研发计划

> **阶段**: Phase 1 - MVP Core  
> **周期**: Week 1-6 (6 周)  
> **目标**: 可运行的基础同步能力  
> **负责人**: 待定

---

## 一、交付物清单

### Week 1-2: 工程搭建与基础设施

#### Week 1: 项目初始化
**目标**: 可构建、可测试的项目骨架

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P1-W1-T1 | 创建项目目录结构 | P0 | 2h | - | - |
| P1-W1-T2 | 初始化 Bun/Node 项目 | P0 | 2h | - | T1 |
| P1-W1-T3 | 配置 TypeScript | P0 | 2h | - | T2 |
| P1-W1-T4 | 安装核心依赖 (Commander, Zod, js-yaml) | P0 | 2h | - | T2 |
| P1-W1-T5 | 配置 ESLint + Prettier | P1 | 2h | - | T2 |
| P1-W1-T6 | 配置 Git 工作流 | P1 | 2h | - | - |
| P1-W1-T7 | 创建目录结构 (src/, tests/, docs/) | P0 | 2h | - | T1 |
| P1-W1-T8 | 编写 README 和 CONTRIBUTING | P1 | 4h | - | - |

**Week 1 里程碑**:
```bash
✓ 项目可构建
✓ 测试框架就绪
✓ 代码规范配置完成
```

#### Week 2: 基础工具与错误处理
**目标**: 稳定的基础工具库

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P1-W2-T1 | 实现错误处理体系 | P0 | 4h | - | - |
| P1-W2-T2 | 实现日志系统 | P0 | 4h | - | T1 |
| P1-W2-T3 | 实现文件系统工具 | P0 | 4h | - | - |
| P1-W2-T4 | 实现路径工具 (home 目录展开等) | P1 | 2h | - | T3 |
| P1-W2-T5 | 实现哈希计算工具 | P1 | 2h | - | - |
| P1-W2-T6 | 编写基础工具测试 | P1 | 4h | - | T1-5 |
| P1-W2-T7 | 配置 CI (GitHub Actions) | P1 | 4h | - | - |
| P1-W2-T8 | 实现 CLI 框架骨架 | P0 | 6h | - | T1-2 |

**Week 2 里程碑**:
```bash
✓ acl --version 可用
✓ acl --help 可用
✓ 测试 CI 通过
✓ 日志系统工作正常
```

---

### Week 3-4: 核心 CLI 与配置系统

#### Week 3: 配置管理系统
**目标**: 多层级配置工作正常

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P1-W3-T1 | 设计配置 Schema (Zod) | P0 | 4h | - | - |
| P1-W3-T2 | 实现配置加载器 | P0 | 6h | - | T1 |
| P1-W3-T3 | 实现配置合并逻辑 | P0 | 4h | - | T2 |
| P1-W3-T4 | 实现配置验证 | P1 | 4h | - | T1 |
| P1-W3-T5 | 实现环境变量解析 | P1 | 3h | - | T2 |
| P1-W3-T6 | 编写配置系统测试 | P1 | 4h | - | T2-5 |
| P1-W3-T7 | 创建默认配置模板 | P1 | 2h | - | T1 |

**Week 3 里程碑**:
```bash
✓ 配置可加载和验证
✓ 多层级覆盖逻辑正确
✓ 配置系统测试通过
```

#### Week 4: CLI 命令实现 (Part 1)
**目标**: 核心命令可用

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P1-W4-T1 | 实现 `acl init` 命令 | P0 | 8h | - | P1-W3-T2 |
| P1-W4-T2 | 实现交互式提示工具 | P0 | 4h | - | - |
| P1-W4-T3 | 实现 `acl config` 命令组 | P1 | 4h | - | P1-W3-T2 |
| P1-W4-T4 | 实现 `acl status` 命令 | P0 | 6h | - | - |
| P1-W4-T5 | 实现命令中间件 (auth check, config load) | P0 | 6h | - | T1 |
| P1-W4-T6 | 编写 CLI 测试 | P1 | 4h | - | T1,3,4 |
| P1-W4-T7 | 实现进度指示器 (Spinner) | P1 | 2h | - | - |

**Week 4 里程碑**:
```bash
$ acl init
? Enter your GitHub repository URL: https://github.com/user/acl-assets
? Select default sync policy: merge
✓ Configuration created at ./.acl/config.jsonc

$ acl status
Repository: https://github.com/user/acl-assets
Branch: main
Local assets: 0
Remote assets: 0
Sync status: ✓ In sync
```

---

### Week 5-6: 基础同步与适配器

#### Week 5: Git 集成
**目标**: Git 操作稳定可靠

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P1-W5-T1 | 集成 isomorphic-git | P0 | 4h | - | - |
| P1-W5-T2 | 实现 Git 认证 (Token/PAT) | P0 | 4h | - | T1 |
| P1-W5-T3 | 实现仓库克隆 | P0 | 4h | - | T1-2 |
| P1-W5-T4 | 实现 Pull 操作 | P0 | 4h | - | T1 |
| P1-W5-T5 | 实现 Push 操作 | P0 | 4h | - | T1 |
| P1-W5-T6 | 实现 Commit 操作 | P0 | 3h | - | T1 |
| P1-W5-T7 | 实现凭证加密存储 | P1 | 6h | - | T2 |
| P1-W5-T8 | 编写 Git 操作测试 | P1 | 4h | - | T1-6 |

**Week 5 里程碑**:
```bash
✓ Git 认证工作正常
✓ Pull/Push/Commit 可用
✓ 凭证安全存储
```

#### Week 6: 适配器实现
**目标**: Cursor 和 Open Code 适配器可用

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P1-W6-T1 | 设计适配器接口 | P0 | 3h | - | - |
| P1-W6-T2 | 实现 Cursor 适配器 (Prompt) | P0 | 8h | - | T1 |
| P1-W6-T3 | 实现 Open Code 适配器 (Prompt) | P0 | 6h | - | T1 |
| P1-W6-T4 | 实现适配器注册表 | P1 | 3h | - | T1 |
| P1-W6-T5 | 实现平台检测 | P1 | 3h | - | - |
| P1-W6-T6 | 实现 `acl sync` 命令 | P0 | 8h | - | T2-3, P1-W5 |
| P1-W6-T7 | 实现 `acl pull` 命令 | P0 | 4h | - | P1-W5 |
| P1-W6-T8 | 编写适配器测试 | P1 | 4h | - | T2-3 |

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

---

## 二、技术决策点

### Week 1
- **决策 1**: Bun vs Node.js
  - 建议: Bun (构建和运行更快)
  - 截止时间: Week 1 Day 1
  
- **决策 2**: 配置文件格式
  - 选项: YAML vs JSONC
  - 建议: JSONC (支持注释 + 易解析)
  - 截止时间: Week 1 Day 2

### Week 3
- **决策 3**: Git 库选择
  - 选项: isomorphic-git vs simple-git
  - 建议: isomorphic-git (纯 JS，无原生依赖)
  - 截止时间: Week 3 Day 1

- **决策 4**: 配置加载策略
  - 确定层级优先级
  - 截止时间: Week 3 Day 3

### Week 6
- **决策 5**: 适配器接口冻结
  - 审核适配器设计
  - 确保可扩展性
  - 截止时间: Week 6 Day 3

---

## 三、风险缓解

### 技术风险

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|---------|
| isomorphic-git 功能限制 | 中 | 高 | 预留 1 天调研，必要时切 simple-git |
| TypeScript 类型复杂性 | 中 | 中 | 早期定义核心类型，使用 Zod 推导 |
| 跨平台路径问题 | 中 | 中 | 使用 path 模块，Windows CI 测试 |

### 进度风险

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|---------|
| Week 4 命令复杂度超预期 | 中 | 中 | 可先实现基础版，交互优化延后 |
| Week 6 适配器工作量大 | 中 | 高 | 先实现 Prompt 适配，Skill 延后 |

---

## 四、交付标准

### 功能验收

- [ ] `acl init` 可创建完整配置
- [ ] `acl status` 显示正确状态
- [ ] `acl pull` 可从 GitHub 拉取
- [ ] `acl sync --target cursor` 成功同步
- [ ] `acl sync --target opencode` 成功同步
- [ ] 配置多层级覆盖正确
- [ ] 凭证加密存储

### 代码质量

- [ ] 测试覆盖率 > 60%
- [ ] 无 ESLint 错误
- [ ] 核心模块有 JSDoc
- [ ] CI 100% 通过

### 文档

- [ ] README 包含安装说明
- [ ] CLI 命令有 --help
- [ ] 配置选项文档化

---

## 五、依赖项

### 内部依赖
- 无 (Phase 1 为基础)

### 外部依赖
| 依赖 | 版本 | 用途 |
|------|------|------|
| commander | ^12.0.0 | CLI 框架 |
| zod | ^3.22.0 | Schema 校验 |
| js-yaml | ^4.1.0 | YAML 解析 |
| isomorphic-git | ^1.25.0 | Git 操作 |
| @clack/prompts | ^0.7.0 | 交互提示 |
| picocolors | ^1.0.0 | 终端颜色 |

---

## 六、任务看板模板

### To Do
- [ ] P1-W1-T1: 创建项目目录结构
- [ ] P1-W1-T2: 初始化 Bun/Node 项目
...

### In Progress
- [ ] 负责人 @xxx: 任务名称

### Review
- [ ] 等待 Review: 任务名称

### Done
- [x] 已完成: 任务名称

---

**阶段负责人**: 待定  
**开始日期**: 待定  
**结束日期**: 待定  
**状态**: 规划中
