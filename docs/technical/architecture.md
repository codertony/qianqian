# 乾乾 (QianQian) - 技术架构文档

> **版本**: v1.0.0  
> **状态**: 架构设计阶段  
> **最后更新**: 2026-02-26  
> **参考项目**: oh-my-opencode, everything-claude-code

---

## 一、架构总览

### 1.1 系统架构图

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
│   │ • 状态追踪  │  │ • CloudCode │  │ • 本地覆写  │  │ • 环境检测      │   │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘   │
│          │                │                │                  │            │
│          └────────────────┴────────────────┴──────────────────┘            │
│                                     │                                       │
│                              Git Bridge                                     │
│                         (isomorphic-git/go-git)                            │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│   Cursor        │        │   Open Code     │        │   Claude Code   │
│   .cursor/rules/│        │   .opencode/    │        │   .claude/      │
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
```

### 1.2 技术栈选型

| 层级 | 组件 | 技术选型 | 选型理由 |
|------|------|---------|---------|
| **CLI 运行时** | 执行引擎 | **Bun** (首选) / Node.js 20+ | 快速启动、原生 TypeScript 支持、内置测试、打包能力 |
| **CLI 框架** | 命令解析 | **Commander.js** | 生态成熟、类型支持好、中间件友好 |
| **配置解析** | 配置管理 | **Zod v4** + **JSONC** | 运行时校验、类型推导、支持注释 |
| **Git 操作** | 版本控制 | **isomorphic-git** | 纯 JavaScript 实现、无系统依赖、浏览器兼容 |
| **文件处理** | 模板引擎 | **Handlebars** / EJS | 灵活的文件生成、条件渲染 |
| **加密存储** | 凭证管理 | **AES-256-GCM** (crypto-js) | 行业标准、安全可控 |
| **AI 集成** | LLM 调用 | **OpenAI SDK** + **Anthropic SDK** | 主流模型支持、统一的 Function Calling |
| **网络请求** | HTTP 客户端 | **undici** / **fetch** (native) | 现代 API、性能优异 |
| **测试框架** | 单元测试 | **Bun Test** | 内置、快速、Jest 兼容 |
| **打包分发** | 二进制分发 | **Bun 编译** / **pkg** | 单文件可执行、跨平台 |
| **日志系统** | 日志记录 | **pino** | 高性能、结构化、类型安全 |

---

## 二、核心模块设计

### 2.1 CLI 模块架构

```
src/cli/
├── index.ts                    # CLI 入口
├── cli-program.ts              # Commander 程序定义
├── commands/                   # 命令实现
│   ├── init.ts                 # acl init
│   ├── capture.ts              # acl capture/save
│   ├── sync.ts                 # acl sync
│   ├── pull.ts                 # acl pull
│   ├── push.ts                 # acl push
│   ├── status.ts               # acl status
│   ├── diff.ts                 # acl diff
│   ├── list.ts                 # acl list
│   ├── show.ts                 # acl show
│   ├── adapt.ts                # acl adapt
│   ├── ai.ts                   # acl ai
│   └── deps.ts                 # acl deps install/check
├── middleware/                 # 命令中间件
│   ├── auth-check.ts           # 认证检查
│   ├── config-load.ts          # 配置加载
│   └── platform-detect.ts      # 平台检测
└── utils/                      # CLI 工具
    ├── spinner.ts              # 进度指示
    ├── formatter.ts            # 输出格式化
    └── prompt.ts               # 交互式提示
```

### 2.2 核心命令设计

#### 命令注册表

```typescript
// src/cli/commands/registry.ts

import { Command } from 'commander';

export interface CommandDefinition {
  name: string;
  description: string;
  arguments?: ArgumentDefinition[];
  options?: OptionDefinition[];
  subcommands?: CommandDefinition[];
  action: (args: any, options: any) => Promise<void>;
  middleware?: MiddlewareFunction[];
}

export const commandRegistry: CommandDefinition[] = [
  {
    name: 'init',
    description: 'Initialize ACL configuration and bind GitHub repository',
    options: [
      { flags: '--repo <url>', description: 'GitHub repository URL' },
      { flags: '--template <name>', description: 'Use initialization template' },
      { flags: '--force', description: 'Overwrite existing configuration' }
    ],
    action: initCommand,
    middleware: [checkGitInstallation]
  },
  {
    name: 'capture',
    description: 'Capture current IDE capabilities',
    aliases: ['save'],
    arguments: [
      { name: '[name]', description: 'Asset name' }
    ],
    options: [
      { flags: '--type <type>', description: 'Asset type (prompt|skill|agent)' },
      { flags: '--tag <tag>', description: 'Add tag to asset' },
      { flags: '--scope <scope>', description: 'Scope (global|project)', default: 'project' },
      { flags: '--ai', description: 'Use AI to extract and structure' }
    ],
    action: captureCommand,
    middleware: [loadConfig, detectPlatform]
  },
  {
    name: 'sync',
    description: 'Synchronize assets to local platform',
    options: [
      { flags: '--target <platform>', description: 'Target platform (cursor|opencode|claude)' },
      { flags: '--dry-run', description: 'Preview changes without applying' },
      { flags: '--force', description: 'Force sync, ignore conflicts' },
      { flags: '--asset <name>', description: 'Sync specific asset only' }
    ],
    action: syncCommand,
    middleware: [loadConfig, checkAuth]
  },
  // ... 更多命令
];
```

### 2.3 配置管理模块

#### 多层级配置架构

参考 oh-my-opencode 的配置设计，采用三级配置覆盖：

```
系统默认值 (Defaults)
    ↓ 覆盖
用户配置 (~/.acl/config.jsonc)
    ↓ 覆盖
项目配置 (./.acl/config.jsonc)
    ↓ 覆盖
环境变量 (ACL_*)
    ↓ 覆盖
命令行参数 (--*)
```

#### 配置 Schema 定义

```typescript
// src/config/schema.ts

import { z } from 'zod';

// 基础类型定义
const SyncPolicySchema = z.enum(['full', 'merge', 'local']);
const PlatformSchema = z.enum(['cursor', 'opencode', 'cloudcode', 'claude', 'openclaw', 'custom']);

// 用户配置 Schema
export const UserConfigSchema = z.object({
  version: z.string().default('1.0.0'),
  
  // GitHub 配置
  github: z.object({
    repo_url: z.string().url(),
    branch: z.string().default('main'),
    token: z.string().optional(), // 从 credentials 加载
    auto_push: z.boolean().default(true),
    commit_message_template: z.string().default('feat({type}): {description}')
  }),
  
  // 同步配置
  sync: z.object({
    default_policy: SyncPolicySchema.default('merge'),
    auto_install_deps: z.boolean().default(true),
    ignored_assets: z.array(z.string()).default([]),
    confirm_before_push: z.boolean().default(true)
  }),
  
  // 平台适配器配置
  platforms: z.record(PlatformSchema, z.object({
    enabled: z.boolean().default(true),
    config_path: z.string().optional(),
    auto_detect: z.boolean().default(true)
  })),
  
  // AI 配置
  ai: z.object({
    provider: z.enum(['openai', 'anthropic', 'gemini']).default('anthropic'),
    model: z.string().default('claude-sonnet-4-20250514'),
    api_key: z.string().optional(), // 从 credentials 加载
    temperature: z.number().min(0).max(2).default(0.3),
    auto_commit: z.boolean().default(false)
  }),
  
  // 日志配置
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    file: z.string().default('~/.acl/acl.log'),
    max_size: z.string().default('10MB')
  })
});

export type UserConfig = z.infer<typeof UserConfigSchema>;
```

#### 配置加载器

```typescript
// src/config/loader.ts

import { readFileSync } from 'fs';
import { parse as parseJSONC } from 'jsonc-parser';
import { UserConfigSchema, UserConfig } from './schema';

export class ConfigLoader {
  private static readonly USER_CONFIG_PATH = '~/.acl/config.jsonc';
  private static readonly PROJECT_CONFIG_PATH = './.acl/config.jsonc';
  
  async load(): Promise<UserConfig> {
    // 1. 加载系统默认值
    const defaults = this.getDefaults();
    
    // 2. 加载用户配置
    const userConfig = await this.loadConfigFile(ConfigLoader.USER_CONFIG_PATH);
    
    // 3. 加载项目配置
    const projectConfig = await this.loadConfigFile(ConfigLoader.PROJECT_CONFIG_PATH);
    
    // 4. 解析环境变量
    const envConfig = this.parseEnvVariables();
    
    // 5. 深度合并配置
    const merged = this.deepMerge(defaults, userConfig, projectConfig, envConfig);
    
    // 6. Zod 校验
    const result = UserConfigSchema.safeParse(merged);
    if (!result.success) {
      throw new ConfigValidationError(result.error);
    }
    
    return result.data;
  }
  
  private async loadConfigFile(path: string): Promise<Partial<UserConfig>> {
    try {
      const content = readFileSync(path, 'utf-8');
      const parsed = parseJSONC(content);
      return parsed || {};
    } catch {
      return {};
    }
  }
  
  private parseEnvVariables(): Partial<UserConfig> {
    // 解析 ACL_* 环境变量
    const config: any = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith('ACL_')) {
        this.setNestedValue(config, key.slice(4).toLowerCase(), value);
      }
    }
    return config;
  }
  
  private deepMerge(...objects: any[]): any {
    // 深度合并实现
    return objects.reduce((prev, obj) => {
      if (!obj) return prev;
      return this.mergeObjects(prev, obj);
    }, {});
  }
}
```

---

## 三、资产存储层设计

### 3.1 GitHub 仓库结构

```
acl-assets/                          # 用户私有仓库
├── .acl/                            # ACL 系统元数据
│   ├── repo-config.yaml             # 仓库级配置
│   └── versions.lock                # 版本锁定文件
│
├── skills/                            # 原子技能 (参考 everything-claude-code/skills/)
│   ├── rust-analyzer-helper/
│   │   ├── manifest.json            # 技能元数据 (参考 oh-my-opencode Skill schema)
│   │   ├── logic.py                 # 执行逻辑
│   │   ├── schema.json              # 输入输出 Schema
│   │   ├── requirements.txt         # Python 依赖
│   │   └── README.md                # 使用说明
│   └── ...
│
├── prompts/                           # 指令集
│   ├── system/                        # 系统级 Prompts
│   │   ├── frontend-expert.md       # Markdown + YAML frontmatter
│   │   └── backend-expert.md
│   ├── tasks/                         # 任务级 Prompts
│   │   └── code-review.md
│   └── README.md
│
├── agents/                            # AI 角色定义 (参考 everything-claude-code/agents/)
│   ├── architecture-reviewer/
│   │   ├── agent.yaml               # OASF 规范定义
│   │   ├── purpose.md               # 核心使命
│   │   ├── knowledge/               # 知识库索引
│   │   └── README.md
│   └── ...
│
├── flows/                             # 多 Agent 协作
│   └── ci-cd-automation.json        # DAG 定义
│
├── mcp-configs/                       # MCP 服务配置
│   ├── github.yaml                  # 公开配置
│   └── github.env.template          # 敏感信息模板
│
└── plugins/                           # 复合能力包 (Post-MVP)
    └── full-stack-dev/
        ├── package.json               # 包定义
        ├── compatibility.yaml         # 兼容性矩阵
        └── manifests/                 # 平台差异化配置
```

### 3.2 资产 Schema 定义

#### Skill Schema (参考 oh-my-opencode)

```typescript
// src/schemas/skill.ts

export const SkillManifestSchema = z.object({
  $schema: z.string().default('https://qianqian.dev/schemas/skill-v1.json'),
  name: z.string().regex(/^[a-z0-9-]+$/),
  version: z.string(),
  description: z.string(),
  type: z.literal('skill'),
  
  // 作者信息
  author: z.object({
    name: z.string(),
    email: z.string().email().optional(),
    url: z.string().url().optional()
  }),
  
  // 分类标签
  tags: z.array(z.string()).default([]),
  
  // 入口配置
  entry: z.string().default('index.js'),
  language: z.enum(['javascript', 'typescript', 'python', 'go', 'rust']),
  
  // 权限声明 (参考 Cloud Code 设计)
  permissions: z.object({
    filesystem: z.array(z.enum(['read', 'write', 'execute'])).default([]),
    network: z.boolean().default(false),
    shell: z.boolean().default(false),
    mcp: z.array(z.string()).default([]),
    env: z.array(z.string()).default([])
  }),
  
  // 输入输出 Schema
  input: z.object({
    $schema: z.string().optional(),
    type: z.literal('object'),
    properties: z.record(z.any()),
    required: z.array(z.string()).default([])
  }).optional(),
  
  output: z.object({
    type: z.literal('object'),
    properties: z.record(z.any())
  }).optional(),
  
  // 依赖管理
  dependencies: z.object({
    npm: z.array(z.string()).optional(),
    pip: z.array(z.string()).optional(),
    system: z.array(z.string()).optional()
  }).optional(),
  
  // 兼容性矩阵
  compatibility: z.record(z.string(), z.string()).default({})
});

export type SkillManifest = z.infer<typeof SkillManifestSchema>;
```

#### Prompt Schema (参考 everything-claude-code)

```typescript
// src/schemas/prompt.ts

export const PromptFrontmatterSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]+$/),
  type: z.enum(['system', 'task', 'composite']).default('task'),
  version: z.string().default('1.0.0'),
  author: z.string().optional(),
  tags: z.array(z.string()).default([]),
  scope: z.enum(['global', 'project']).default('project'),
  sync_policy: z.enum(['full', 'merge', 'local']).default('merge'),
  
  // 变量定义（支持动态 Prompt）
  variables: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'enum', 'array']),
    description: z.string().optional(),
    default: z.any().optional(),
    options: z.array(z.any()).optional() // 用于 enum 类型
  })).default([]),
  
  // 继承机制
  inherits: z.array(z.string()).default([]),
  
  // 适用平台
  platforms: z.array(z.string()).optional()
});

export type PromptFrontmatter = z.infer<typeof PromptFrontmatterSchema>;
```

#### Agent Schema (参考 OASF + everything-claude-code)

```typescript
// src/schemas/agent.ts

export const AgentManifestSchema = z.object({
  $schema: z.string().default('https://qianqian.dev/schemas/agent-v1.json'),
  name: z.string().regex(/^[a-z0-9-]+$/),
  version: z.string(),
  description: z.string(),
  type: z.literal('agent'),
  
  // 核心使命 (Purpose - 参考 A2A 协议)
  purpose: z.string(),
  
  // 知识库引用
  knowledge_base: z.array(z.object({
    type: z.enum(['prompt', 'doc', 'skill', 'url']),
    ref: z.string()
  })).default([]),
  
  // 关联技能
  assigned_skills: z.array(z.string()).default([]),
  
  // 记忆配置
  memory: z.object({
    type: z.enum(['session', 'persistent', 'none']).default('session'),
    storage: z.string().optional() // persistent 时的存储路径
  }),
  
  // LLM 配置
  llm_config: z.object({
    model: z.string(),
    temperature: z.number().min(0).max(2).default(0.3),
    max_tokens: z.number().optional(),
    top_p: z.number().optional(),
    system_prompt: z.string().optional()
  }),
  
  // 工具权限
  allowed_tools: z.array(z.string()).optional(),
  
  // 元数据
  metadata: z.record(z.any()).default({})
});

export type AgentManifest = z.infer<typeof AgentManifestSchema>;
```

---

## 四、调度中心层设计

### 4.1 同步引擎

```typescript
// src/sync/engine.ts

export interface SyncEngine {
  /**
   * 计算本地与远程的差异
   */
  diff(localAssets: Asset[], remoteAssets: Asset[]): Promise<DiffResult>;
  
  /**
   * 执行同步操作
   */
  sync(options: SyncOptions): Promise<SyncResult>;
  
  /**
   * 解决冲突
   */
  resolveConflict(local: Asset, remote: Asset, policy: SyncPolicy): Promise<Resolution>;
}

export class GitSyncEngine implements SyncEngine {
  constructor(
    private git: GitManager,
    private resolver: ConflictResolver,
    private logger: Logger
  ) {}
  
  async diff(localAssets: Asset[], remoteAssets: Asset[]): Promise<DiffResult> {
    const result: DiffResult = {
      added: [],
      modified: [],
      deleted: [],
      conflict: [],
      unchanged: []
    };
    
    const localMap = new Map(localAssets.map(a => [a.id, a]));
    const remoteMap = new Map(remoteAssets.map(a => [a.id, a]));
    
    // 检测新增和变更
    for (const remote of remoteAssets) {
      const local = localMap.get(remote.id);
      if (!local) {
        result.added.push(remote);
      } else if (this.hasChanged(local, remote)) {
        if (this.hasConflict(local, remote)) {
          result.conflict.push({ local, remote });
        } else {
          result.modified.push(remote);
        }
      } else {
        result.unchanged.push(remote);
      }
    }
    
    // 检测删除
    for (const local of localAssets) {
      if (!remoteMap.has(local.id)) {
        result.deleted.push(local);
      }
    }
    
    return result;
  }
  
  private hasChanged(local: Asset, remote: Asset): boolean {
    return local.hash !== remote.hash;
  }
  
  private hasConflict(local: Asset, remote: Asset): boolean {
    // 本地有修改且远程也有修改
    return local.modified && remote.modified;
  }
}
```

### 4.2 适配器架构

```typescript
// src/adapters/base.ts

export interface PlatformAdapter {
  readonly name: string;
  readonly version: string;
  readonly supportedAssets: AssetType[];
  
  /**
   * 检测当前环境是否支持该平台
   */
  detect(): Promise<boolean>;
  
  /**
   * 将 ACL 资产转换为目标平台格式
   */
  adapt(asset: Asset): Promise<PlatformConfig[]>;
  
  /**
   * 将目标平台配置反向转换为 ACL 资产
   */
  reverseAdapt(configPath: string): Promise<Asset>;
  
  /**
   * 应用配置到目标平台
   */
  apply(configs: PlatformConfig[]): Promise<void>;
  
  /**
   * 检查资产与平台的兼容性
   */
  checkCompatibility(asset: Asset): CompatibilityReport;
}

// Cursor 适配器实现
export class CursorAdapter implements PlatformAdapter {
  name = 'cursor';
  version = '0.45';
  supportedAssets = ['prompt', 'agent'];
  
  private readonly RULES_DIR = '.cursor/rules';
  private readonly CURSOR_RULES_FILE = '.cursorrules';
  
  async detect(): Promise<boolean> {
    return fs.exists('.cursor') || fs.exists('.cursorrules');
  }
  
  async adapt(asset: Asset): Promise<PlatformConfig[]> {
    switch (asset.type) {
      case 'prompt':
        return this.adaptPrompt(asset as PromptAsset);
      case 'agent':
        return this.adaptAgent(asset as AgentAsset);
      default:
        throw new UnsupportedAssetError(asset.type, this.name);
    }
  }
  
  private adaptPrompt(prompt: PromptAsset): PlatformConfig[] {
    // 转换为 .mdc 格式
    const mdcContent = this.toMDCFormat(prompt);
    return [{
      path: `${this.RULES_DIR}/${prompt.name}.mdc`,
      content: mdcContent,
      metadata: {
        globs: prompt.globs || ['*'],
        alwaysApply: prompt.scope === 'global'
      }
    }];
  }
  
  private toMDCFormat(prompt: PromptAsset): string {
    const frontmatter = {
      description: prompt.description,
      globs: prompt.globs?.join(',') || '*',
      alwaysApply: prompt.scope === 'global'
    };
    
    return `---
${yaml.stringify(frontmatter)}---

${prompt.content}`;
  }
}

// Open Code 适配器实现
export class OpenCodeAdapter implements PlatformAdapter {
  name = 'opencode';
  version = '1.0';
  supportedAssets = ['prompt', 'agent', 'flow'];
  
  private readonly OPENCODE_DIR = '.opencode';
  
  async adapt(asset: Asset): Promise<PlatformConfig[]> {
    switch (asset.type) {
      case 'agent':
        return this.adaptAgent(asset as AgentAsset);
      case 'flow':
        return this.adaptFlow(asset as FlowAsset);
      default:
        throw new UnsupportedAssetError(asset.type, this.name);
    }
  }
  
  private adaptAgent(agent: AgentAsset): PlatformConfig[] {
    const config = {
      name: agent.name,
      description: agent.description,
      instructions: agent.purpose,
      tools: agent.assigned_skills,
      model: agent.llm_config?.model
    };
    
    return [{
      path: `${this.OPENCODE_DIR}/agents/${agent.name}.yaml`,
      content: yaml.stringify(config)
    }];
  }
}
```

### 4.3 冲突解决器

```typescript
// src/sync/conflict-resolver.ts

export interface ConflictResolver {
  resolve(
    local: Asset,
    remote: Asset,
    policy: SyncPolicy,
    options?: ResolveOptions
  ): Promise<Resolution>;
}

export class SemanticConflictResolver implements ConflictResolver {
  constructor(
    private aiProvider: AIProvider,
    private logger: Logger
  ) {}
  
  async resolve(
    local: Asset,
    remote: Asset,
    policy: SyncPolicy,
    options?: ResolveOptions
  ): Promise<Resolution> {
    switch (policy) {
      case 'full':
        return { action: 'overwrite', result: remote };
        
      case 'local':
        return { action: 'skip', result: local };
        
      case 'merge':
        return this.semanticMerge(local, remote, options);
        
      default:
        throw new UnknownPolicyError(policy);
    }
  }
  
  private async semanticMerge(
    local: Asset,
    remote: Asset,
    options?: ResolveOptions
  ): Promise<Resolution> {
    // 如果是文本资产（Prompt），使用 AI 进行语义合并
    if (local.type === 'prompt' && options?.useAI) {
      const merged = await this.aiProvider.mergePrompts(
        local.content,
        remote.content,
        local.description
      );
      
      return {
        action: 'merge',
        result: {
          ...remote,
          content: merged.content,
          merged_sections: merged.sections
        },
        diff: merged.explanation
      };
    }
    
    // 其他类型资产，使用简单的三路合并
    return this.threeWayMerge(local, remote);
  }
  
  private async threeWayMerge(local: Asset, remote: Asset): Promise<Resolution> {
    // 基于 Git 的三路合并算法
    // ...
  }
}
```

---

## 五、AI 管理层设计

### 5.1 AI Provider 架构

```typescript
// src/ai/provider.ts

export interface AIProvider {
  readonly name: string;
  
  /**
   * 生成 Commit Message
   */
  generateCommitMessage(changes: Change[]): Promise<string>;
  
  /**
   * 从对话中提取 Skill
   */
  extractSkill(conversation: string, context: ExtractionContext): Promise<ExtractedSkill>;
  
  /**
   * 语义合并 Prompts
   */
  mergePrompts(local: string, remote: string, description: string): Promise<MergeResult>;
  
  /**
   * 分析兼容性
   */
  analyzeCompatibility(code: string): Promise<CompatibilityAnalysis>;
  
  /**
   * 自然语言转命令
   */
  nlToCommand(instruction: string, context: CommandContext): Promise<CommandIntent>;
}

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private client: Anthropic;
  
  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }
  
  async extractSkill(conversation: string, context: ExtractionContext): Promise<ExtractedSkill> {
    const prompt = `
你是一位专业的 AI 能力提取专家。请从以下对话中提取核心能力，并转换为结构化的 Skill。

对话内容：
${conversation}

上下文信息：
- 项目名称: ${context.projectName}
- 技术栈: ${context.techStack.join(', ')}

请提取以下内容：
1. Skill 名称（简短、清晰）
2. Skill 描述
3. 适用场景
4. 核心指令（转化为可复用的 Prompt）
5. 输入参数定义
6. 输出格式定义
7. 示例对话

以 JSON 格式返回，符合以下 Schema：
${SKILL_EXTRACTION_SCHEMA}
`;

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.3,
      system: 'You are an expert AI capability extraction specialist.',
      messages: [{ role: 'user', content: prompt }]
    });
    
    return JSON.parse(response.content[0].text);
  }
  
  async generateCommitMessage(changes: Change[]): Promise<string> {
    const prompt = `
根据以下变更生成符合 Conventional Commits 规范的提交信息：

变更列表：
${changes.map(c => `- ${c.type}: ${c.path}`).join('\n')}

要求：
1. 使用 feat/fix/docs/style/refactor/test/chore 类型
2. 简洁明了，不超过 72 个字符
3. 如果是多个相关变更，使用 scope

直接返回提交信息文本，不要包含任何解释。
`;

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }]
    });
    
    return response.content[0].text.trim();
  }
}
```

### 5.2 Market Connector

```typescript
// src/ai/market-connector.ts

export interface MarketConnector {
  /**
   * 从 URL 抓取 Skill
   */
  fetchSkill(url: string): Promise<ExternalSkill>;
  
  /**
   * 转换为 ACL 格式
   */
  convertToACL(externalSkill: ExternalSkill): Promise<Asset>;
  
  /**
   * 安全性审计
   */
  auditSecurity(asset: Asset): Promise<SecurityReport>;
}

export class UniversalMarketConnector implements MarketConnector {
  constructor(
    private httpClient: HttpClient,
    private aiProvider: AIProvider,
    private logger: Logger
  ) {}
  
  async fetchSkill(url: string): Promise<ExternalSkill> {
    // 解析 URL，判断来源
    const source = this.parseSource(url);
    
    switch (source) {
      case 'clawhub':
        return this.fetchFromClawHub(url);
      case 'github':
        return this.fetchFromGitHub(url);
      case 'cloudhub':
        return this.fetchFromCloudHub(url);
      default:
        return this.fetchGeneric(url);
    }
  }
  
  private async fetchFromClawHub(url: string): Promise<ExternalSkill> {
    // 解析 ClawHub 页面
    const html = await this.httpClient.get(url);
    const parser = new ClawHubParser();
    return parser.parse(html);
  }
  
  async convertToACL(external: ExternalSkill): Promise<Asset> {
    // 使用 AI 进行智能转换
    const prompt = `
将以下外部 Skill 转换为 ACL 标准格式：

来源: ${external.source}
名称: ${external.name}
描述: ${external.description}
原始格式: ${external.format}
内容: ${external.content}

请转换为以下格式之一：
1. Skill (工具型能力)
2. Prompt (指令集)
3. Agent (角色定义)

返回符合 ACL Schema 的 JSON。
`;

    const result = await this.aiProvider.extractSkill(prompt, {
      projectName: external.name,
      techStack: external.tags
    });
    
    return {
      ...result,
      metadata: {
        ...result.metadata,
        '@source': external.source,
        '@imported_at': new Date().toISOString(),
        '@original_url': external.url
      }
    };
  }
  
  async auditSecurity(asset: Asset): Promise<SecurityReport> {
    // 检查代码中的安全风险
    const checks = [
      this.checkForSecrets(asset),
      this.checkForMaliciousCode(asset),
      this.checkForUnsafePermissions(asset)
    ];
    
    const results = await Promise.all(checks);
    
    return {
      risk_level: this.calculateRiskLevel(results),
      findings: results.flat(),
      recommendations: this.generateRecommendations(results)
    };
  }
}
```

---

## 六、Git 集成设计

### 6.1 Git Manager

```typescript
// src/git/manager.ts

export interface GitManager {
  clone(repoUrl: string, localPath: string): Promise<void>;
  pull(branch?: string): Promise<void>;
  push(branch?: string): Promise<void>;
  commit(message: string, files?: string[]): Promise<void>;
  diff(): Promise<string>;
  getStatus(): Promise<GitStatus>;
  getCurrentBranch(): Promise<string>;
}

export class IsomorphicGitManager implements GitManager {
  constructor(
    private fs: FileSystem,
    private http: GitHttpClient,
    private auth: GitAuthProvider
  ) {}
  
  async clone(repoUrl: string, localPath: string): Promise<void> {
    await git.clone({
      fs: this.fs,
      http: this.http,
      dir: localPath,
      url: repoUrl,
      defaultBranch: 'main',
      onAuth: () => this.auth.getCredentials(repoUrl)
    });
  }
  
  async commit(message: string, files?: string[]): Promise<void> {
    // 暂存文件
    if (files && files.length > 0) {
      for (const file of files) {
        await git.add({ fs: this.fs, dir: '.', filepath: file });
      }
    } else {
      await git.add({ fs: this.fs, dir: '.', filepath: '.' });
    }
    
    // 提交
    await git.commit({
      fs: this.fs,
      dir: '.',
      message,
      author: await this.auth.getAuthor()
    });
  }
}
```

---

## 七、安全设计

### 7.1 凭证管理

```typescript
// src/security/credentials.ts

export interface CredentialManager {
  /**
   * 存储加密凭证
   */
  set(key: string, value: string): Promise<void>;
  
  /**
   * 获取解密凭证
   */
  get(key: string): Promise<string | null>;
  
  /**
   * 删除凭证
   */
  delete(key: string): Promise<void>;
  
  /**
   * 列出所有凭证键
   */
  list(): Promise<string[]>;
}

export class EncryptedCredentialManager implements CredentialManager {
  private readonly CREDENTIALS_FILE = '~/.acl/credentials.enc';
  private encryptionKey: Buffer;
  
  constructor(masterPassword: string) {
    // 从主密码派生加密密钥
    this.encryptionKey = crypto.pbkdf2Sync(
      masterPassword,
      'acl-salt',
      100000,
      32,
      'sha256'
    );
  }
  
  async set(key: string, value: string): Promise<void> {
    const credentials = await this.loadCredentials();
    
    // 加密值
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    credentials[key] = {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      created_at: new Date().toISOString()
    };
    
    await this.saveCredentials(credentials);
  }
  
  async get(key: string): Promise<string | null> {
    const credentials = await this.loadCredentials();
    const cred = credentials[key];
    
    if (!cred) return null;
    
    // 解密
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      Buffer.from(cred.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(cred.authTag, 'hex'));
    
    let decrypted = decipher.update(cred.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### 7.2 敏感信息检测

```typescript
// src/security/scanner.ts

export interface SecretScanner {
  scan(content: string): Promise<ScanResult>;
}

export class PatternBasedSecretScanner implements SecretScanner {
  private patterns: SecretPattern[] = [
    {
      name: 'OpenAI API Key',
      pattern: /sk-[a-zA-Z0-9]{48}/,
      severity: 'high'
    },
    {
      name: 'Anthropic API Key',
      pattern: /sk-ant-[a-zA-Z0-9]{32,}/,
      severity: 'high'
    },
    {
      name: 'GitHub Token',
      pattern: /gh[pousr]_[A-Za-z0-9_]{36}/,
      severity: 'high'
    },
    {
      name: 'AWS Access Key',
      pattern: /AKIA[0-9A-Z]{16}/,
      severity: 'high'
    },
    {
      name: 'Private Key',
      pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
      severity: 'critical'
    }
  ];
  
  async scan(content: string): Promise<ScanResult> {
    const findings: SecretFinding[] = [];
    
    for (const pattern of this.patterns) {
      const matches = content.matchAll(pattern.pattern);
      for (const match of matches) {
        findings.push({
          type: pattern.name,
          severity: pattern.severity,
          position: match.index || 0,
          snippet: match[0].substring(0, 20) + '...'
        });
      }
    }
    
    return {
      hasSecrets: findings.length > 0,
      findings,
      summary: `Found ${findings.length} potential secrets`
    };
  }
}
```

---

## 八、扩展性设计

### 8.1 插件系统

```typescript
// src/plugins/base.ts

export interface ACLPlugin {
  readonly name: string;
  readonly version: string;
  
  /**
   * 插件初始化
   */
  initialize(context: PluginContext): Promise<void>;
  
  /**
   * 注册钩子
   */
  registerHooks(): HookRegistration[];
  
  /**
   * 注册命令
   */
  registerCommands(): CommandRegistration[];
  
  /**
   * 注册适配器
   */
  registerAdapters(): AdapterRegistration[];
}

export class PluginManager {
  private plugins: Map<string, ACLPlugin> = new Map();
  
  async loadPlugin(pluginPath: string): Promise<void> {
    const pluginModule = await import(pluginPath);
    const plugin: ACLPlugin = new pluginModule.default();
    
    await plugin.initialize(this.createContext());
    this.plugins.set(plugin.name, plugin);
    
    // 注册钩子
    for (const hook of plugin.registerHooks()) {
      this.hookRegistry.register(hook);
    }
    
    // 注册命令
    for (const cmd of plugin.registerCommands()) {
      this.commandRegistry.register(cmd);
    }
  }
}
```

---

## 九、参考设计模式

### 9.1 从参考项目吸取的经验

#### oh-my-opencode 的启示

1. **多层级配置系统**: Project → User → Defaults 的三层覆盖机制
2. **Hook 系统**: 46 个生命周期钩子实现精细化控制
3. **Agent 分类**: primary/subagent/all 三种模式区分执行上下文
4. **工具注册表**: 集中式工具管理，支持动态发现和注册
5. **背景任务**: 并行 Agent 执行，支持 5 并发限制
6. **配置格式**: JSONC 支持注释，Zod 运行时校验

#### everything-claude-code 的启示

1. **Markdown + Frontmatter**: 人类可读，AI 可解析
2. **目录约定**: agents/, skills/, commands/, hooks/ 清晰分类
3. **跨平台脚本**: Node.js 实现跨平台兼容性
4. **测试体系**: 完整的验证脚本确保配置质量
5. **渐进式安装**: install.sh 支持语言选择性安装

### 9.2 乾乾的独特设计

1. **GitHub 中心化存储**: 所有资产托管于用户私有仓库
2. **主动分发机制**: CLI 主动向平台注入配置（而非被动等待）
3. **语义级冲突解决**: AI 辅助的 Markdown/YAML 合并
4. **兼容性矩阵**: 细粒度的平台能力检查
5. **本地覆写保护**: 三层同步策略确保本地配置不被覆盖

---

## 十、性能考虑

### 10.1 增量同步优化

```typescript
// 使用文件 hash 缓存避免重复计算
interface HashCache {
  [path: string]: {
    hash: string;
    mtime: number;
    size: number;
  };
}

// 只同步变更的文件
async function incrementalSync(
  remoteAssets: Asset[],
  localCache: HashCache
): Promise<Asset[]> {
  return remoteAssets.filter(asset => {
    const cached = localCache[asset.path];
    return !cached || cached.hash !== asset.hash;
  });
}
```

### 10.2 Git 操作优化

- 使用 `isomorphic-git` 的浅克隆 (`--depth 1`) 加速首次同步
- 缓存 Git 对象，避免重复下载
- 批量提交减少网络往返

### 10.3 AI 调用优化

- 实现请求去重（相同输入缓存结果）
- Token 预算管理，避免超限
- 流式响应支持大内容生成

---

## 附录 A: 目录结构总览

```
qianqian/
├── docs/
│   ├── technical/
│   │   ├── architecture.md      # 本文档
│   │   ├── implementation.md    # 实现细节
│   │   ├── api-reference.md     # API 参考
│   │   └── data-models.md       # 数据模型
│   ├── roadmap/
│   │   ├── master-roadmap.md    # 总路线图
│   │   ├── phase-1-mvp-core.md  # Phase 1 任务
│   │   ├── phase-2-mvp-plus.md  # Phase 2 任务
│   │   └── phase-3-full.md      # Phase 3 任务
│   └── reference/               # 参考资料
│
├── src/
│   ├── cli/                     # CLI 实现
│   ├── config/                  # 配置管理
│   ├── sync/                    # 同步引擎
│   ├── adapters/                # 平台适配器
│   ├── ai/                      # AI 集成
│   ├── git/                     # Git 操作
│   ├── security/                # 安全模块
│   ├── schemas/                 # Schema 定义
│   ├── utils/                   # 工具函数
│   └── index.ts                 # 入口
│
├── tests/
│   ├── unit/                    # 单元测试
│   ├── integration/             # 集成测试
│   └── fixtures/                # 测试数据
│
├── schemas/                     # JSON Schema 定义
├── templates/                   # 初始化模板
├── bin/                         # 可执行文件
├── package.json
├── tsconfig.json
└── README.md
```

---

**文档维护者**: Sisyphus  
**技术评审**: 待进行  
**下次评审日期**: 2026-03-05
