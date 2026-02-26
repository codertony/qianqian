# 乾乾 (QianQian) 技术路线图 v1.1

> **版本**: v1.1.0  
> **状态**: 执行中（已整合 DeepResearch）  
> **最后更新**: 2026-02-26  
> **当前阶段**: Phase 1 - MVP Core (40% 完成)  
> **变更说明**: 已整合 DeepResearch 分析，更新 Git 选型、沙箱层设计、平台适配细化

---

## 路线图概览（更新）

```
2026 Q1                    Q2                       Q3
───────────────────────────────────────────────────────────────
Week  1  2  3  4  5  6 | 7  8  9  10 | 11 12 13 14 15 16 17 18 19 20
      [====Phase 1====]   [==Phase 2==]   [========Phase 3========]
      MVP Core (6w)       MVP+ (4w)       Full Version (10w)
      
      ⭐ 更新: isomorphic-git    ⭐ 更新: capture --ai      ⭐ 新增: Deno Sandbox
      ⭐ 新增: SandboxManager    ⭐ 更新: 语义合并          ⭐ 新增: A2A 协议
      ⭐ 更新: Team Rules 支持   ⭐ 新增: 敏感信息扫描      ⭐ 预留: Firecracker

关键里程碑:
├── W2:  CLI 基础命令可用
├── W4:  配置系统完成
├── W6:  首次跨平台同步演示 ⭐ MVP
│        (isomorphic-git + 浅克隆)
├── W8:  AI 提取功能上线 ⭐ 
│        (完整对话解析器)
├── W10: 智能冲突解决 + Isolates 沙箱 ⭐ MVP+
└── W20: v1.0.0 正式发布 ⭐ GA
```

---

## 变更摘要（基于 DeepResearch）

### 主要更新

| 类别 | 原规划 | 更新后 | 影响 |
|------|--------|--------|------|
| **Git 存储** | simple-git | **isomorphic-git** | 零依赖、浅克隆支持 |
| **沙箱层** | 未规划 | **SandboxManager + 三层隔离** | 安全执行 Skill |
| **Cursor 适配** | 基础实现 | **支持 Team Rules 优先级** | 企业级场景 |
| **Open Code** | 基础适配 | **完整 7 层配置支持** | 企业级配置 |
| **Claude Code** | 未规划 | **5 层作用域设计** | Phase 2 实现 |
| **语义合并** | 简单实现 | **保持语法完整性** | Markdown/YAML AST |
| **安全扫描** | 未规划 | **敏感信息自动检测** | 防止密钥泄露 |
| **Flow 引擎** | 轻量级执行 | **描述性配置** | 由目标平台执行 |

### Phase 1 新增任务（+9h）

```diff
+ P1-W5-T9:  迁移到 isomorphic-git (4h)
+ P1-W6-T9:  Cursor Team Rules 支持 (2h)
+ P1-W6-T10: SandboxManager 接口设计 (3h)

Phase 1 总工作量: 55h → 64h (+16%)
```

### Phase 2 新增任务（+24h）

```diff
+ P2-W8-T8:  对话特征提取器 (6h)
+ P2-W9-T9:  语法感知合并 (4h)
+ P2-W10-T9: 敏感信息扫描 (6h)
+ P2-W10-T10: Isolates 沙箱实现 (8h)

Phase 2 总工作量: 40h → 64h (+60%)
```

### Phase 3 调整

```diff
- Flow 执行引擎实现
+ Flow 描述性格式（由目标平台执行）
+ Deno Sandbox 实现
+ Firecracker 预留接口
+ A2A 协议集成调研
```

---

## Phase 1: MVP Core（Week 1-6）详细规划（更新）

### 目标
实现可运行的基础同步能力，支持 Prompt 资产在 Cursor 和 OpenCode 之间同步。

**更新重点**:
1. 迁移到 isomorphic-git（零依赖、浅克隆）
2. 设计 SandboxManager 接口（为 Phase 2 沙箱做准备）
3. 完善 Cursor Team Rules 支持

### Week 1-2: 工程搭建与基础设施

**无变更** - 与 v1.0 保持一致

### Week 3-4: 核心 CLI 与配置系统

**无变更** - 与 v1.0 保持一致

### Week 5: Git 集成（更新）

**目标**: Git 操作稳定可靠，**迁移到 isomorphic-git**

| 任务 ID | 任务名称 | 优先级 | 估时 | 状态 | 备注 |
|---------|---------|--------|------|------|------|
| ~~P1-W5-T1~~ | ~~集成 simple-git~~ | ~~P0~~ | ~~4h~~ | ~~已取消~~ | ~~改用 isomorphic-git~~ |
| **P1-W5-T1** | **集成 isomorphic-git** | **P0** | **4h** | **待开始** | ⭐ 更新 |
| P1-W5-T2 | 实现 Git 认证 (Token/PAT) | P0 | 4h | ✅ 基础实现 | - |
| P1-W5-T3 | 实现仓库克隆（浅克隆） | P0 | 4h | ⚠️ 需更新 | ⭐ 使用 --depth 1 |
| P1-W5-T4 | 实现 Pull 操作 | P0 | 4h | ✅ 已完成 | - |
| P1-W5-T5 | 实现 Push 操作 | P0 | 4h | ✅ 已完成 | - |
| P1-W5-T6 | 实现 Commit 操作 | P0 | 3h | ✅ 已完成 | - |
| P1-W5-T7 | 实现凭证加密存储 | P1 | 6h | ❌ 未实现 | AES-256-GCM |
| P1-W5-T8 | 编写 Git 操作测试 | P1 | 4h | ❌ 待开始 | - |
| **P1-W5-T9** | **isomorphic-git 迁移** | **P0** | **4h** | **❌ 新增** | ⭐ 替换 simple-git |

**技术决策 - isomorphic-git 迁移**:

```typescript
// 迁移要点
// 1. 替换所有 simple-git 调用
// 2. 使用浅克隆优化首次同步
// 3. 验证认证流程兼容性

// 浅克隆示例
import * as git from 'isomorphic-git';
import * as fs from 'fs';
import http from 'isomorphic-git/http/node';

await git.clone({
  fs,
  http,
  dir: localPath,
  url: repoUrl,
  depth: 1,              // 仅拉取最新提交
  singleBranch: true,    // 仅默认分支
  defaultBranch: 'main',
});
```

**Week 5 里程碑**（更新）:
```bash
✓ Git 认证工作正常（isomorphic-git）
✓ Pull/Push/Commit 可用
✓ 浅克隆支持 (--depth 1)
⚠️ 凭证安全存储（待实现）
```

### Week 6: 适配器实现与同步命令（更新）

**目标**: Cursor 和 OpenCode 适配器可用，**支持 Team Rules**

| 任务 ID | 任务名称 | 优先级 | 估时 | 状态 | 依赖 |
|---------|---------|--------|------|------|------|
| P1-W6-T1 | 设计适配器接口 | P0 | 3h | ✅ 已完成 | - |
| P1-W6-T2 | 实现 Cursor 适配器 (Prompt) | P0 | 8h | ⚠️ 需更新 | ⭐ 支持 Team Rules |
| P1-W6-T3 | 实现 OpenCode 适配器 (Prompt) | P0 | 6h | ⚠️ 部分完成 | ⭐ 7层配置 |
| P1-W6-T4 | 实现适配器注册表 | P1 | 3h | ❌ 返回 null | - |
| P1-W6-T5 | 实现平台检测 | P1 | 3h | ✅ 已完成 | - |
| P1-W6-T6 | 实现 `acl sync` 命令 | P0 | 8h | ❌ TODO | T2-3, P1-W5 |
| P1-W6-T7 | 实现 `acl pull` 命令 | P0 | 4h | ❌ TODO | P1-W5 |
| P1-W6-T8 | 编写适配器测试 | P1 | 4h | ❌ 待开始 | T2-3 |
| **P1-W6-T9** | **Cursor Team Rules 支持** | **P1** | **2h** | **❌ 新增** | ⭐ DeepResearch |
| **P1-W6-T10** | **SandboxManager 接口设计** | **P1** | **3h** | **❌ 新增** | ⭐ DeepResearch |

**新增：Team Rules 支持**:

```typescript
// Cursor 三层优先级实现
export class CursorAdapter {
  private readonly PRIORITY_ORDER = [
    'team',      // .cursor/team/*.mdc（企业级强制）
    'project',   // .cursor/rules/*.mdc（项目级）
    'user',      // ~/.cursor/*.mdc（用户级）
  ];

  async adapt(asset: PromptAsset): Promise<PlatformConfig[]> {
    // 根据 scope 映射到不同优先级
    const targetDir = asset.scope === 'global' 
      ? '.cursor/user'           // 用户级
      : '.cursor/rules';         // 项目级
    
    // Team Rules 通过企业配置指定路径
    if (asset.metadata?.teamRule) {
      targetDir = '.cursor/team';
    }
    
    return [{ path: `${targetDir}/${asset.name}.mdc`, content }];
  }
}
```

**新增：SandboxManager 接口设计**:

```typescript
// 为 Phase 2 沙箱做准备
export interface SandboxManager {
  // 根据 Skill 自动选择隔离级别
  selectIsolationLevel(skill: SkillAsset): IsolationLevel;
  
  // 启动沙箱（预留接口）
  createSandbox(config: SandboxConfig): Promise<Sandbox>;
  
  // 执行代码（预留接口）
  execute(sandbox: Sandbox, code: string): Promise<ExecutionResult>;
}

export enum IsolationLevel {
  NONE = 'none',           // Prompt 类型
  ISOLATES = 'isolates',   // 纯 JS 计算（Phase 2）
  DENO = 'deno',           // 文件/网络访问（Phase 2）
  FIRECRACKER = 'firecracker', // 微虚拟机（Phase 3）
}
```

---

## Phase 2: MVP+（Week 7-10）详细规划（更新）

### 目标
增强 AI 能力与资产管理，实现智能冲突解决和 **Isolates 沙箱**。

### Week 7-8: AI 集成与自动化（更新）

**目标**: AI 功能基础设施就绪，**完整对话解析器**

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
| **P2-W8-T8** | **对话特征提取器** | **P0** | **6h** | **P2-W7** | ⭐ 新增 |

**新增：对话特征提取器**:

```typescript
// 根据 DeepResearch 的 Auto-Doc 设计
export class ConversationAnalyzer {
  async extractFeatures(conversation: string): Promise<Feature[]> {
    // 1. 识别有效 Prompt 模式
    // 2. 过滤闲聊内容
    // 3. 提取可复用指令
    // 4. 生成元数据
  }
}

// capture --ai 完整流程
$ acl capture --ai
✓ Analyzing conversation...
✓ Extracted features:
  - 3 effective prompt patterns
  - 2 common workflows
  - 1 error resolution strategy
✓ Generated skill: code-optimizer
? Save as skill? [Y/n] y
? Update existing skill (code-optimizer v1.0)? [Y/n] n
✓ Created skills/code-optimizer/v2.0.0/
✓ Generated commit: feat(skill): add code-optimizer v2 via AI extraction
```

### Week 9-10: 高级同步与冲突处理（更新）

**目标**: 智能冲突处理可用，**Isolates 沙箱**，**敏感信息扫描**

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
| **P2-W9-T9** | **语法感知合并** | **P1** | **4h** | **T3** | ⭐ 新增 |
| P2-W10-T1 | 实现 Agent Schema | P0 | 4h | - |
| P2-W10-T2 | 更新适配器支持 Agent | P0 | 6h | T1, P1-W6 |
| P2-W10-T3 | 实现 Agent 反向适配 | P1 | 6h | T2 |
| P2-W10-T4 | 实现依赖检测 | P0 | 6h | - |
| P2-W10-T5 | 实现 `acl deps install` | P0 | 6h | T4 |
| P2-W10-T6 | 实现 `acl deps check` | P1 | 3h | T4 |
| P2-W10-T7 | 编写 Agent 和依赖测试 | P1 | 4h | T1-6 |
| P2-W10-T8 | 性能优化 (大仓库) | P1 | 4h | - |
| **P2-W10-T9** | **敏感信息扫描** | **P0** | **6h** | **-** | ⭐ 新增 |
| **P2-W10-T10** | **Isolates 沙箱实现** | **P1** | **8h** | **-** | ⭐ 新增 |

**新增：语法感知合并**:

```typescript
// 保持 Markdown/YAML 语法完整性
export class SyntaxAwareMerge {
  async merge(local: string, remote: string): Promise<string> {
    // 1. 解析为 AST
    const localAST = parseMarkdown(local);
    const remoteAST = parseMarkdown(remote);
    
    // 2. 合并（保持结构）
    const merged = mergeAST(localAST, remoteAST);
    
    // 3. 序列化（不破坏格式）
    return serializeMarkdown(merged);
  }
}
```

**新增：敏感信息扫描**:

```typescript
// 防止密钥泄露
export class SecretScanner {
  async scan(content: string): Promise<ScanResult> {
    const patterns = [
      { name: 'OpenAI API Key', pattern: /sk-[a-zA-Z0-9]{48}/ },
      { name: 'GitHub Token', pattern: /gh[pousr]_[A-Za-z0-9_]{36}/ },
      { name: 'AWS Key', pattern: /AKIA[0-9A-Z]{16}/ },
    ];
    
    // 扫描并报告
  }
}

// 使用
$ acl push
⚠️  Detected potential secrets:
    - OpenAI API Key in mcp-configs/openai.yaml
    ✓ Auto-added to .gitignore
    ? Proceed? [Y/n]
```

**新增：Isolates 沙箱**:

```typescript
// V8 Isolates 实现
import { Isolate } from 'isolated-vm';

export class IsolatesSandbox {
  async execute(code: string, context: Context): Promise<Result> {
    const isolate = new Isolate({ memoryLimit: 128 });
    const script = await isolate.compileScript(code);
    
    // 在隔离环境中执行
    return script.run(context);
  }
}
```

---

## Phase 3: Full Version（Week 11-20）调整

### Phase 3a: Plugin 与 Flow（Week 11-13）调整

**调整**: Flow 为描述性配置（非执行引擎）

```diff
- P3-W12-T2: 实现 Flow 引擎 (基础) (10h)
+ P3-W12-T2: 实现 Flow 描述性格式 (6h)
+ P3-W12-T3: 更新适配器支持 Flow (8h)
- P3-W12-T3: 更新适配器支持 Flow (8h)
```

**理由**: DeepResearch 建议 Flow 作为描述性 DAG，由目标平台执行引擎解析。

### Phase 3b: 多平台与生态（Week 14-16）调整

**新增**: Deno Sandbox

```diff
+ P3-W14-T8: 实现 Deno Sandbox (10h)
```

### Phase 3c: 发布准备（Week 17-20）

**新增**: A2A 协议调研

```diff
+ P3-W20-T9: A2A (Agent2Agent) 协议调研 (8h)
```

---

## 关键决策更新（基于 DeepResearch）

### 决策 A: Git 库选择（更新原决策 7）

| 选项 | 状态 | 理由 |
|------|------|------|
| A. 保持 simple-git | ❌ 已弃用 | 有原生依赖，不支持浅克隆 |
| **B. 迁移 isomorphic-git** | ✅ **确认** | DeepResearch 强烈推荐，零依赖、浅克隆 |

**实施时间**: Phase 1, Week 5

### 决策 B: 沙箱实现范围（新增）

| 选项 | 内容 | 建议 |
|------|------|------|
| **A. Phase 1 设计接口** | 预留 SandboxManager | ✅ **确认** |
| B. Phase 2 实现 Isolates | 基础隔离 | ✅ 确认 |
| C. Phase 3 完整三层 | + Deno + Firecracker | ✅ 确认 |

### 决策 C: Flow 引擎（更新原决策 8）

| 选项 | 内容 | 状态 |
|------|------|------|
| **A. 描述性配置** | Flow 作为 DAG 定义 | ✅ **确认** |
| B. 轻量级执行引擎 | 基础节点调度 | ❌ 弃用 |
| C. 完整执行引擎 | 并行执行、状态持久化 | ❌ 弃用 |

**理由**: 由目标平台执行更有优势，避免重复造轮子。

---

## 风险更新

### 新增风险

| 风险 | Phase | 可能性 | 影响 | 缓解措施 |
|------|-------|--------|------|---------|
| isomorphic-git API 差异 | 1 | 中 | 中 | 预留 4h 迁移时间 |
| Isolates 性能调优 | 2 | 中 | 中 | 渐进优化 |
| 语法感知合并复杂度 | 2 | 中 | 高 | 先支持 Markdown/YAML |

### 已缓解风险

| 风险 | 缓解措施 | 状态 |
|------|---------|------|
| Git 跨平台兼容性 | 采用 isomorphic-git | ✅ 已解决 |
| Skill 执行安全 | 引入三层隔离架构 | ✅ 已规划 |
| 敏感信息泄露 | 自动扫描 + 分层存储 | ✅ 已规划 |

---

## 文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| 技术架构 v2.0 | `docs/technical/architecture-v2.md` | 已整合 DeepResearch |
| 资产存储规范 | `docs/specs/asset-storage-spec-v1.md` | 不变 |
| DeepResearch 补充 | `docs/analysis/deepresearch-supplement.md` | 详细分析 |
| 本路线图 | `docs/roadmap/technical-roadmap-v1.1.md` | 当前文档 |

---

**文档维护者**: Sisyphus  
**状态**: 已整合 DeepResearch  
**版本**: v1.1.0  
**下次评审**: 2026-03-05