# 乾乾 (QianQian) - 技术架构文档 v2.0

> **版本**: v2.0.0  
> **状态**: 架构设计阶段（已整合 DeepResearch 分析）  
> **最后更新**: 2026-02-26  
> **参考项目**: oh-my-opencode, everything-claude-code  
> **DeepResearch**: 已整合平台规范深度分析

---

## 一、架构总览

### 1.1 系统架构图（更新版）

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              用户交互层 (User Layer)                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │   CLI 终端        │  │  IDE 插件        │  │   AI Chat 界面           │   │
│  │   (Node.js/Bun)   │  │  (VS Code/       │  │   (Web/TUI)              │   │
│  │                   │  │   Cursor)        │  │                          │   │
│  └────────┬─────────┘  └────────┬─────────┘  └────────────┬─────────────┘   │
└───────────┼─────────────────────┼─────────────────────────┼─────────────────┘
            │                     │                         │
            └─────────────────────┼─────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI 管理层 (AI Management Layer)                      │
│  ┌──────────────────────────┐  ┌─────────────────────────────────────────┐  │
│  │   Market Connector       │  │   Auto-Doc/Config Engine               │  │
│  │   - 外部市场抓取          │  │   - 反向总结                            │  │
│  │   - 格式转换             │  │   - 自动 Commit                         │  │
│  │   - 安全性审计           │  │   - 智能打标                            │  │
│  └──────────────────────────┘  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────┬───────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      调度中心层 (Orchestration Layer)                        │
│                                                                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│   │  Sync       │  │  Adaptor    │  │  Conflict   │  │  Compatibility  │   │
│   │  Engine     │  │  Registry   │  │  Resolver   │  │  Guard          │   │
│   │             │  │             │  │             │  │                 │   │
│   │ • 增量同步  │  │ • Cursor    │  │ • 3级策略   │  │ • 矩阵检查      │   │
│   │ • 依赖管理  │  │ • Open Code │  │ • 语义合并  │  │ • 降级提示      │   │
│   │ • 状态追踪  │  │ • Claude    │  │ • 本地覆写  │  │ • 环境检测      │   │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘   │
│          │                │                │                  │            │
│          └────────────────┴────────────────┴──────────────────┘            │
│                                     │                                       │
│                              Git Bridge                                     │
│                         (isomorphic-git) ⭐ 更新                           │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│   Cursor        │        │   Open Code     │        │   Claude Code   │
│   .cursor/rules/│        │   .opencode/    │        │   .claude/      │
│   Team Rules ⭐ │        │   7层配置 ⭐    │        │   5层作用域 ⭐  │
└─────────────────┘        └─────────────────┘        └─────────────────┘
          │                           │                           │
          └───────────────────────────┼───────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        资产存储层 (Storage Layer)                            │
│                         GitHub Private Repo                                  │
│                                                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│   │  Skills  │  │ Prompts  │  │  Agents  │  │  Flows   │  │   MCPs   │    │
│   │  /skills │  │ /prompts │  │ /agents  │  │ /flows   │  │/mcp-conf │    │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                                             │
│   ┌────────────────────────────────────────────────────────────────────┐   │
│   │  Plugins (Post-MVP)                                               │   │
│   │  /plugins/{name}/                                                 │   │
│   │    ├── package.json       # 包定义                                │   │
│   │    ├── compatibility.yaml # 兼容性矩阵                            │   │
│   │    └── manifests/         # 平台差异化配置                         │   │
│   └────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                     安全执行层 (Sandbox Layer) ⭐ 新增                      │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    SandboxManager                                   │  │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │  │
│   │  │  Isolates   │  │    Deno     │  │ Firecracker │                 │  │
│   │  │   (v8)      │  │  Sandbox    │  │   (预留)    │                 │  │
│   │  │  <10ms     │  │   <50ms     │  │   ~150ms    │                 │  │
│   │  └─────────────┘  └─────────────┘  └─────────────┘                 │  │
│   │                                                                     │  │
│   │  隔离级别自动选择:                                                   │  │
│   │  • Prompt 类型: 无隔离                                              │  │
│   │  • JS Skill (纯计算): Isolates                                      │  │
│   │  • JS Skill (文件/网络): Deno                                       │  │
│   │  • Python/复杂: Firecracker (预留)                                  │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈选型（更新版）

| 层级 | 组件 | 技术选型 | 选型理由 | 更新说明 |
|------|------|---------|---------|---------|
| **CLI 运行时** | 执行引擎 | **Bun** (首选) / Node.js 20+ | 快速启动、原生 TypeScript 支持、内置测试、打包能力 | - |
| **CLI 框架** | 命令解析 | **Commander.js** | 生态成熟、类型支持好、中间件友好 | - |
| **配置解析** | 配置管理 | **Zod v4** + **JSONC** | 运行时校验、类型推导、支持注释 | - |
| **Git 操作** | 版本控制 | **isomorphic-git** ⭐ | 纯 JavaScript、无系统依赖、浅克隆支持 | 由 simple-git 升级 |
| **沙箱执行** | 隔离环境 | **isolated-vm** / **Deno** | 分级隔离、安全可控 | ⭐ 新增 |
| **文件处理** | 模板引擎 | **Handlebars** / EJS | 灵活的文件生成、条件渲染 | - |
| **加密存储** | 凭证管理 | **AES-256-GCM** (crypto-js) | 行业标准、安全可控 | - |
| **AI 集成** | LLM 调用 | **OpenAI SDK** + **Anthropic SDK** | 主流模型支持、统一的 Function Calling | - |
| **网络请求** | HTTP 客户端 | **undici** / **fetch** (native) | 现代 API、性能优异 | - |
| **测试框架** | 单元测试 | **Bun Test** | 内置、快速、Jest 兼容 | - |
| **打包分发** | 二进制分发 | **Bun 编译** / **pkg** | 单文件可执行、跨平台 | - |
| **日志系统** | 日志记录 | **pino** | 高性能、结构化、类型安全 | - |

---

## 二、核心模块详细设计

### 2.1 Git 存储引擎（更新）

#### 2.1.1 isomorphic-git 优势

根据 DeepResearch 分析，isomorphic-git 相比 simple-git/Nodegit 的优势：

| 维度 | isomorphic-git | simple-git | Nodegit |
|------|----------------|-----------|---------|
| 环境依赖 | ✅ 零原生依赖，纯 JS | ⚠️ 依赖 git 二进制 | ❌ 依赖编译环境 |
| 功能完整性 | ✅ Clone, Push, Pull, 浅克隆 | ✅ 功能全 | ✅ 功能全 |
| 稳定性 | ✅ 无崩溃风险 | ⚠️ 依赖外部进程 | ❌ 易产生段错误 |
| 资源消耗 | ✅ 支持 `--depth 1` 浅克隆 | ❌ 完整克隆 | ❌ 完整克隆 |
| 浏览器兼容 | ✅ 支持 | ❌ 不支持 | ❌ 不支持 |

#### 2.1.2 浅克隆策略

```typescript
// 首次同步使用浅克隆，节省流量
await git.clone({
  fs,
  http,
  dir: localPath,
  url: repoUrl,
  depth: 1,                    // 仅拉取最新提交
  singleBranch: true,          // 仅拉取默认分支
  defaultBranch: 'main',
});

// 后续同步使用增量 fetch
await git.fetch({
  fs,
  http,
  dir: localPath,
  depth: 1,
  singleBranch: true,
});
```

#### 2.1.3 认证方案

```typescript
// Token 认证（GitHub PAT）
await git.push({
  fs,
  http,
  dir: localPath,
  remote: 'origin',
  ref: 'main',
  onAuth: () => ({
    username: 'x-access-token',
    password: await credentials.get('github_token'),
  }),
});
```

### 2.2 沙箱执行层（新增）

#### 2.2.1 三层隔离架构

根据 DeepResearch 安全分析，设计分级隔离方案：

```typescript
// src/features/sandbox/types.ts

export enum IsolationLevel {
  NONE = 'none',           // 无隔离（Prompt 类型）
  ISOLATES = 'isolates',   // V8 Isolates（纯 JS 计算）
  DENO = 'deno',           // Deno 沙箱（文件/网络访问）
  FIRECRACKER = 'firecracker', // 微虚拟机（预留）
}

export interface SandboxConfig {
  level: IsolationLevel;
  permissions: {
    filesystem?: ('read' | 'write')[];
    network?: boolean | string[];      // 支持域名白名单 *.web.dev
    shell?: boolean;
    env?: string[];
  };
  resources?: {
    memory?: number;      // MB
    timeout?: number;     // ms
  };
}
```

#### 2.2.2 隔离级别自动选择

```typescript
// src/features/sandbox/manager.ts

export class SandboxManager {
  selectIsolationLevel(skill: SkillAsset): IsolationLevel {
    // 1. 无执行逻辑 -> 无隔离
    if (!skill.logic) {
      return IsolationLevel.NONE;
    }
    
    // 2. 纯 JS 计算（无文件/网络）-> Isolates
    if (skill.logic.language === 'javascript' &&
        !skill.manifest.permissions?.filesystem &&
        !skill.manifest.permissions?.network) {
      return IsolationLevel.ISOLATES;
    }
    
    // 3. 需要文件/网络访问 -> Deno
    if (skill.manifest.permissions?.filesystem ||
        skill.manifest.permissions?.network) {
      return IsolationLevel.DENO;
    }
    
    // 4. Python 或复杂需求 -> Firecracker（预留）
    if (skill.logic.language === 'python') {
      return IsolationLevel.FIRECRACKER;
    }
    
    return IsolationLevel.DENO; // 默认
  }
}
```

#### 2.2.3 启动性能对比

| 隔离级别 | 启动时间 | 适用场景 | 实现优先级 |
|---------|---------|---------|-----------|
| **NONE** | 即时 | Prompt 类型 | Phase 1 |
| **ISOLATES** | < 10ms | 纯 JS 计算 | Phase 2 |
| **DENO** | < 50ms | 文件/网络访问 | Phase 2 |
| **FIRECRACKER** | ~150ms | 重度隔离 | Phase 3 |

### 2.3 平台适配器深化设计

#### 2.3.1 Cursor 适配器（细化）

DeepResearch 揭示的 Cursor 三层优先级：

```typescript
// src/adapters/cursor.ts

export class CursorAdapter {
  // Cursor Rules 优先级（高 → 低）
  private readonly PRIORITY_ORDER = [
    'team',      // .cursor/team/*.mdc（企业级强制）
    'project',   // .cursor/rules/*.mdc（项目级）
    'user',      // ~/.cursor/*.mdc（用户级）
  ];

  async adapt(asset: Asset): Promise<PlatformConfig[]> {
    if (asset.type === 'prompt') {
      return this.adaptPrompt(asset as PromptAsset);
    }
    
    if (asset.type === 'agent') {
      return this.adaptAgent(asset as AgentAsset);
    }
    
    throw new UnsupportedAssetError(asset.type, 'cursor');
  }

  private adaptPrompt(prompt: PromptAsset): PlatformConfig[] {
    const mdcContent = this.toMDCFormat(prompt);
    
    // 根据 scope 决定存储位置
    const targetDir = prompt.scope === 'global' 
      ? '.cursor/user'           // 用户级
      : '.cursor/rules';         // 项目级
    
    return [{
      path: `${targetDir}/${prompt.name}.mdc`,
      content: mdcContent,
      priority: prompt.scope === 'global' ? 'user' : 'project',
    }];
  }

  private toMDCFormat(prompt: PromptAsset): string {
    const frontmatter = {
      description: prompt.description,
      globs: prompt.globs?.join(',') || '*',
      alwaysApply: prompt.scope === 'global',
    };
    
    return `---
${yaml.stringify(frontmatter)}---

${prompt.content}`;
  }
}
```

#### 2.3.2 Open Code 适配器（7层配置）

```typescript
// src/adapters/opencode.ts

export class OpenCodeAdapter {
  // Open Code 7层配置优先级
  private readonly CONFIG_LAYERS = [
    { name: 'inline', source: 'env:OPENCODE_CONFIG_CONTENT', priority: 7 },
    { name: 'opencode-dir', path: '.opencode/opencode.json', priority: 6 },
    { name: 'project', path: 'opencode.json', priority: 5 },
    { name: 'custom', source: 'env:OPENCODE_CONFIG', priority: 4 },
    { name: 'global', path: '~/.config/opencode/opencode.json', priority: 3 },
    { name: 'remote', source: '.well-known/opencode', priority: 2 },
    { name: 'default', source: 'built-in', priority: 1 },
  ];

  async adapt(asset: Asset): Promise<PlatformConfig[]> {
    // 转换资产为 Open Code 格式
    // 写入 .opencode/ 目录（第 6 层）
  }
}
```

#### 2.3.3 Claude Code 适配器（5层作用域）

```typescript
// src/adapters/claude.ts

export class ClaudeCodeAdapter {
  // Claude Code 5层作用域
  private readonly SCOPES = [
    { name: 'command-line', priority: 'temporary' },  // CLI 标志
    { name: 'local', path: '.claude/settings.local.json', priority: 'high' },
    { name: 'project', path: '.claude/settings.json', priority: 'medium' },
    { name: 'user', path: '~/.claude/settings.json', priority: 'low' },
    { name: 'managed', path: '/etc/claude-code/', priority: 'highest' },
  ];

  async adapt(asset: Asset): Promise<PlatformConfig[]> {
    // 根据 sync_policy 选择作用域
    // @sync:full → project scope（可提交 Git）
    // @sync:local → local scope（.gitignore）
  }
}
```

### 2.4 兼容性矩阵（细化）

根据 DeepResearch 的分级标准：

```typescript
// src/features/compatibility/types.ts

export enum CompatibilityLevel {
  FULL = 'full',       // 100% 功能可用
  PARTIAL = 'partial', // 核心可用，部分降级
  NONE = 'none',       // 完全不兼容
}

export interface CompatibilityReport {
  asset: string;
  platform: string;
  level: CompatibilityLevel;
  
  // Full: 无需额外信息
  // Partial: 说明缺失功能和降级建议
  missingFeatures?: string[];
  workarounds?: string[];
  
  // None: 说明原因
  reason?: string;
}

// 示例报告
const exampleReport: CompatibilityReport = {
  asset: 'devops-agent',
  platform: 'cloud-code',
  level: CompatibilityLevel.PARTIAL,
  missingFeatures: [
    '本地 Docker 操作（云端环境不支持）',
    'Shell 脚本执行（受限）'
  ],
  workarounds: [
    '使用 Cloud Build 替代本地 Docker',
    '使用内置的 Cloud Shell 工具'
  ],
};
```

---

## 三、安全设计深化

### 3.1 敏感信息分层管理

```
存储分层:
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: 全局敏感配置（本地加密）                            │
│ ~/.acl/credentials.yaml (AES-256-GCM)                       │
│   - API Keys                                                │
│   - GitHub Tokens                                           │
│   - MCP Server 凭证                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ 部署时注入
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: 资产仓库（公开）                                    │
│ assets/mcp-configs/github.yaml                              │
│   - 公开配置（endpoint, timeout）                           │
│   - 占位符 ${GITHUB_TOKEN}                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ 模板转换
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: 目标平台配置                                        │
│ .opencode/mcp.json                                          │
│   - 注入后的实际配置                                        │
│   - 本地 .gitignore 保护                                    │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 自动敏感信息扫描

```typescript
// src/security/scanner.ts

export class SecretScanner {
  private patterns: SecretPattern[] = [
    { name: 'OpenAI API Key', pattern: /sk-[a-zA-Z0-9]{48}/, severity: 'high' },
    { name: 'Anthropic API Key', pattern: /sk-ant-[a-zA-Z0-9]{32,}/, severity: 'high' },
    { name: 'GitHub Token', pattern: /gh[pousr]_[A-Za-z0-9_]{36}/, severity: 'high' },
    { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/, severity: 'high' },
    { name: 'Private Key', pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/, severity: 'critical' },
    { name: 'Env Variable', pattern: /\b(API_KEY|SECRET|TOKEN|PASSWORD)\s*=\s*['"][^'"]+['"]/, severity: 'medium' },
  ];

  async scan(content: string): Promise<ScanResult> {
    // 扫描内容中的敏感信息
  }
}
```

---

## 四、AI 集成深化

### 4.1 capture --ai 详细流程

根据 DeepResearch 的 Auto-Doc 设计：

```typescript
// src/features/ai/capture-service.ts

export class AICaptureService {
  async captureFromConversation(
    conversation: string,
    context: CaptureContext
  ): Promise<CaptureResult> {
    // 1. 特征提取
    const features = await this.extractFeatures(conversation);
    
    // 2. 元数据生成
    const metadata = await this.generateMetadata(features, context);
    
    // 3. 资产生成
    const asset = await this.generateAsset(metadata);
    
    // 4. 冲突检测
    const conflicts = await this.detectConflicts(asset);
    
    // 5. 返回建议
    return {
      asset,
      suggestedAction: conflicts.length > 0 ? 'update' : 'create',
      conflicts,
    };
  }

  private async extractFeatures(conversation: string): Promise<Feature[]> {
    // 识别对话中有效的 Prompt 模式
    // 过滤闲聊内容
    // 提取可复用指令
    const prompt = `
Analyze the following conversation and extract reusable AI capability patterns:

${conversation}

Identify:
1. Effective prompts that solved problems
2. Common patterns or workflows
3. Tool usage sequences
4. Error resolution strategies

Return as structured JSON with confidence scores.
`;

    return this.aiProvider.extract(prompt);
  }
}
```

### 4.2 语义合并算法

```typescript
// src/features/conflict/semantic-merge.ts

export class SemanticMergeService {
  async merge(
    local: string,
    remote: string,
    base?: string
  ): Promise<MergeResult> {
    // 1. 解析为 AST（保持结构）
    const localAST = this.parseToAST(local);
    const remoteAST = this.parseToAST(remote);
    
    // 2. 三向合并
    const merged = this.threeWayMerge(localAST, remoteAST, base);
    
    // 3. AI 优化（复杂冲突）
    if (merged.hasComplexConflicts) {
      return this.aiAssistedMerge(local, remote, merged);
    }
    
    // 4. 输出保持语法完整性
    return {
      content: this.serializeAST(merged),
      conflicts: merged.conflicts,
    };
  }

  private parseToAST(content: string): AST {
    // Markdown: 保持 frontmatter + 正文结构
    // YAML: 保持键值结构
    // 不破坏语法结构
  }
}
```

---

## 五、实施路线图（更新）

### Phase 1: MVP Core（Week 1-6）更新

```diff
+ 新增任务:
+ P1-W5-T9: 迁移到 isomorphic-git (4h)
+ P1-W6-T9: Cursor Team Rules 支持 (2h)
+ P1-W6-T10: SandboxManager 接口设计 (3h)

修改任务:
~ P1-W5-T1: 改为集成 isomorphic-git（原 simple-git）
```

### Phase 2: MVP+（Week 7-10）更新

```diff
+ 新增任务:
+ P2-W8-T8: 对话特征提取器 (6h)
+ P2-W9-T9: 语法感知合并 (4h)
+ P2-W10-T9: 敏感信息扫描 (6h)
+ P2-W10-T10: Isolates 沙箱实现 (8h)
```

### Phase 3: Full Version（Week 11-20）更新

```diff
+ 新增任务:
+ P3-W11: Deno Sandbox 实现
+ P3-W13: Firecracker 预留接口
+ P3-W16: A2A 协议集成调研
```

---

## 六、参考与致谢

- DeepResearch 报告: `deepresearch-乾乾 AI 资产管理需求澄清.md`
- 平台文档: Cursor Rules, Open Code Config, Claude Code Settings
- 协议标准: OASF, MCP 2.0, A2A (Agent2Agent)
- 安全参考: OpenClaw 案例研究, Firecracker MicroVM

---

**文档维护者**: Sisyphus  
**状态**: 已整合 DeepResearch 分析  
**下次评审**: 2026-03-05