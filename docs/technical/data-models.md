# 乾乾 (QianQian) - 数据模型参考

> **版本**: v1.0.0  
> **状态**: 设计阶段  
> **最后更新**: 2026-02-26

---

## 一、核心实体关系图

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  UserConfig │──────▶│   Asset     │◀──────│   Plugin    │
└─────────────┘       └──────┬──────┘       └─────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
      ┌──────────┐    ┌──────────┐    ┌──────────┐
      │  Prompt  │    │  Skill   │    │  Agent   │
      └──────────┘    └──────────┘    └──────────┘
            │                │                │
            └────────────────┼────────────────┘
                             ▼
                      ┌──────────┐
                      │   Flow   │
                      └──────────┘
                             │
                             ▼
                      ┌──────────┐
                      │ MCPConfig│
                      └──────────┘
```

---

## 二、配置模型

### UserConfig

```typescript
interface UserConfig {
  version: string;                    // 配置版本
  
  github: {
    repo_url: string;                 // GitHub 仓库 URL
    branch: string;                   // 默认分支
    token?: string;                   // GitHub Token (加密存储)
    auto_push: boolean;               // 是否自动推送
    commit_message_template: string;  // Commit 消息模板
  };
  
  sync: {
    default_policy: 'full' | 'merge' | 'local';
    auto_install_deps: boolean;       // 自动安装依赖
    confirm_before_push: boolean;     // 推送前确认
    ignored_assets: string[];         // 忽略的资产
  };
  
  platforms: {
    [platform: string]: {
      enabled: boolean;
      config_path?: string;           // 自定义配置路径
      auto_detect: boolean;
    }
  };
  
  ai: {
    provider: 'anthropic' | 'openai';
    model: string;
    api_key?: string;                 // API Key (加密存储)
    temperature: number;
    auto_commit: boolean;
    max_tokens_per_request?: number;  // Token 预算
  };
  
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    file?: string;
    max_size: string;
  };
}
```

### ProjectConfig (项目级配置)

```typescript
interface ProjectConfig {
  // 项目级覆盖配置
  sync?: Partial<UserConfig['sync']>;
  platforms?: Partial<UserConfig['platforms']>;
  
  // 项目特定设置
  overrides: {
    [assetName: string]: {
      path: string;                   // 覆写文件路径
      policy: 'merge' | 'replace';
    }
  };
  
  // 本地专属资产
  local_only: string[];
}
```

---

## 三、资产模型

### BaseAsset (基础资产)

```typescript
interface BaseAsset {
  id: string;                         // 唯一标识 (type-name)
  name: string;                       // 资产名称
  type: 'prompt' | 'skill' | 'agent' | 'flow' | 'mcp-config';
  version: string;                    // 语义化版本
  description: string;
  author?: string;
  tags: string[];
  
  // 元数据
  metadata: {
    created_at: string;
    updated_at: string;
    hash: string;                     // 内容哈希
    
    // 同步相关
    sync_policy?: 'full' | 'merge' | 'local';
    scope?: 'global' | 'project';
    
    // 来源追踪
    imported_from?: string;
    imported_at?: string;
    original_url?: string;
    
    // 兼容性
    compatibility?: CompatibilityMatrix;
    
    // 扩展字段
    [key: string]: any;
  };
}
```

### PromptAsset (Prompt 资产)

```typescript
interface PromptAsset extends BaseAsset {
  type: 'prompt';
  
  // 内容
  content: string;                    // Prompt 内容 (Markdown)
  
  // 分类
  prompt_type: 'system' | 'task' | 'composite';
  
  // 适用范围
  globs?: string[];                   // 文件匹配模式
  scope: 'global' | 'project';
  
  // 变量定义 (支持动态 Prompt)
  variables?: VariableDefinition[];
  
  // 继承机制
  inherits?: string[];                // 继承的 Prompt 名称
  
  // 平台特定
  platforms?: string[];               // 适用平台
}

interface VariableDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'array';
  description?: string;
  default?: any;
  options?: any[];                    // enum 类型选项
  required?: boolean;
}
```

### SkillAsset (Skill 资产)

```typescript
interface SkillAsset extends BaseAsset {
  type: 'skill';
  
  // 入口配置
  entry: string;                      // 入口文件
  language: 'javascript' | 'typescript' | 'python' | 'go' | 'rust';
  
  // 执行逻辑
  logic?: string;                     // 内联逻辑 (小 Skill)
  logic_path?: string;                // 外部文件路径
  
  // 权限声明
  permissions: {
    filesystem: ('read' | 'write' | 'execute')[];
    network: boolean;
    shell: boolean;
    mcp: string[];                    // 允许的 MCP
    env: string[];                    // 需要的环境变量
  };
  
  // Schema 定义
  input?: JSONSchema;                 // 输入 Schema
  output?: JSONSchema;                // 输出 Schema
  
  // 依赖管理
  dependencies?: {
    npm?: string[];                   // npm 包依赖
    pip?: string[];                   // pip 包依赖
    system?: string[];                // 系统依赖
  };
  
  // 能力描述
  capabilities?: string[];            // 能力列表
  examples?: SkillExample[];          // 使用示例
  
  // 文档
  readme?: string;                    // README 内容
  overview?: string;                  // 概述
}

interface SkillExample {
  description: string;
  input: any;
  output: any;
}
```

### AgentAsset (Agent 资产)

```typescript
interface AgentAsset extends BaseAsset {
  type: 'agent';
  
  // 核心使命 (OASF Purpose)
  purpose: string;
  
  // 详细指令
  instructions?: string;
  
  // 知识库引用
  knowledge_base: KnowledgeReference[];
  
  // 关联技能
  assigned_skills: string[];          // Skill ID 列表
  
  // 记忆配置
  memory: {
    type: 'session' | 'persistent' | 'none';
    storage?: string;                 // persistent 时的存储路径
  };
  
  // LLM 配置
  llm_config: {
    model: string;
    temperature: number;
    max_tokens?: number;
    top_p?: number;
    system_prompt?: string;
  };
  
  // 工具权限
  allowed_tools?: string[];           // 允许的工具列表
  blocked_tools?: string[];           // 禁止的工具列表
  
  // 行为配置
  behavior?: {
    auto_confirm?: boolean;           // 自动确认低风险操作
    verbose?: boolean;                // 详细输出
    max_iterations?: number;          // 最大迭代次数
  };
}

interface KnowledgeReference {
  type: 'prompt' | 'doc' | 'skill' | 'url' | 'file';
  ref: string;                        // 引用路径/URL
  description?: string;
}
```

### FlowAsset (Flow 资产)

```typescript
interface FlowAsset extends BaseAsset {
  type: 'flow';
  
  // DAG 定义
  nodes: FlowNode[];
  edges: FlowEdge[];
  
  // 触发器
  triggers: FlowTrigger[];
  
  // 变量
  variables?: FlowVariable[];
  
  // 错误处理
  error_handling?: {
    strategy: 'stop' | 'continue' | 'retry';
    max_retries?: number;
    fallback?: string;                // 失败时执行的节点
  };
  
  // 执行配置
  execution?: {
    parallel: boolean;                // 是否允许并行
    timeout?: number;                 // 超时时间 (秒)
  };
}

interface FlowNode {
  id: string;
  type: 'agent' | 'skill' | 'condition' | 'action' | 'start' | 'end';
  name: string;
  config?: {
    agent?: string;                   // Agent ID
    skill?: string;                   // Skill ID
    condition?: string;               // 条件表达式
    action?: string;                  // 动作类型
  };
  position?: { x: number; y: number }; // 可视化位置
}

interface FlowEdge {
  id: string;
  source: string;                     // 源节点 ID
  target: string;                     // 目标节点 ID
  condition?: string;                 // 条件 (用于条件分支)
  label?: string;
}

interface FlowTrigger {
  type: 'manual' | 'scheduled' | 'event' | 'webhook';
  config: {
    cron?: string;                    // scheduled 类型
    event?: string;                   // event 类型
    webhook_url?: string;             // webhook 类型
  };
}

interface FlowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  default?: any;
  scope: 'global' | 'node';           // 作用域
}
```

### MCPConfigAsset (MCP 配置资产)

```typescript
interface MCPConfigAsset extends BaseAsset {
  type: 'mcp-config';
  
  // 服务信息
  service: {
    name: string;
    version: string;
    description: string;
  };
  
  // 连接配置 (公开)
  connection: {
    type: 'stdio' | 'http' | 'ws';
    command?: string;                 // stdio 类型
    args?: string[];                  // stdio 类型
    url?: string;                     // http/ws 类型
    headers?: Record<string, string>; // http 类型
  };
  
  // 环境变量模板
  env_template: {
    [key: string]: {
      description: string;
      required: boolean;
      default?: string;
      secret: boolean;                // 是否敏感
    }
  };
  
  // 权限声明
  permissions?: {
    resources: string[];              // 可访问的资源
    operations: string[];             // 可执行的操作
  };
  
  // 本地配置 (不提交到 Git)
  // 存储在 .env.local 或 credential manager 中
}
```

---

## 四、Plugin 模型

### PluginManifest

```typescript
interface PluginManifest {
  name: string;                       // 插件名称
  version: string;                    // 语义化版本
  description: string;
  author: string;
  license: string;
  
  // 入口配置
  main?: string;                      // 主入口文件
  
  // 包含的资产
  assets: {
    prompts?: string[];
    skills?: string[];
    agents?: string[];
    flows?: string[];
    mcp_configs?: string[];
  };
  
  // 依赖管理
  dependencies?: {
    plugins?: PluginDependency[];     // 插件依赖
    system?: string[];                // 系统依赖
  };
  
  // 兼容性矩阵
  compatibility: CompatibilityMatrix;
  
  // 平台特定配置
  platforms?: {
    [platform: string]: {
      manifest_path?: string;         // 差异化 manifest 路径
      config_override?: any;          // 配置覆盖
    }
  };
  
  // 安装/卸载钩子
  hooks?: {
    pre_install?: string;
    post_install?: string;
    pre_uninstall?: string;
    post_uninstall?: string;
  };
}

interface PluginDependency {
  name: string;
  version: string;                    // 支持 semver 范围
  optional?: boolean;
}
```

### CompatibilityMatrix

```typescript
interface CompatibilityMatrix {
  // 按平台
  [platform: string]: {
    status: 'full' | 'partial' | 'none';
    version?: string;                 // 最低版本要求
    notes?: string;
    
    // 部分兼容时说明
    missing_features?: string[];
    workarounds?: string[];
  };
  
  // 元数据
  _meta?: {
    last_checked: string;
    checked_by: 'manual' | 'ai' | 'ci';
  };
}
```

---

## 五、同步与版本模型

### SyncState

```typescript
interface SyncState {
  // 本地状态
  local: {
    branch: string;
    commit: string;
    last_sync: string;
    assets: AssetState[];
  };
  
  // 远程状态
  remote: {
    branch: string;
    commit: string;
    last_fetch: string;
    assets: AssetState[];
  };
  
  // 同步配置
  config: {
    target_platform: string;
    applied_assets: string[];         // 已应用的资产 ID
    skipped_assets: string[];         // 跳过的资产 ID
  };
}

interface AssetState {
  id: string;
  path: string;
  hash: string;
  version: string;
  modified: boolean;                  // 本地是否有修改
}
```

### DiffResult

```typescript
interface DiffResult {
  added: Asset[];                     // 远程新增
  modified: Asset[];                  // 双方都有变更
  deleted: Asset[];                   // 远程删除
  conflict: Conflict[];               // 冲突
  unchanged: Asset[];                 // 无变更
}

interface Conflict {
  local: Asset;
  remote: Asset;
  base?: Asset;                       // 共同祖先 (如有)
  type: 'content' | 'delete' | 'rename';
}
```

---

## 六、AI 相关模型

### ExtractionContext

```typescript
interface ExtractionContext {
  projectName: string;
  techStack: string[];
  conversation?: string;              // 对话内容
  currentFile?: string;               // 当前文件
  selection?: string;                 // 选中内容
}
```

### ExtractedSkill

```typescript
interface ExtractedSkill {
  name: string;
  description: string;
  version: string;
  
  // 提取的内容
  purpose: string;
  instructions: string;
  input_schema?: JSONSchema;
  output_schema?: JSONSchema;
  examples: SkillExample[];
  tags: string[];
  
  // 元数据
  confidence: number;                 // AI 置信度
  extracted_sections: string[];       // 提取的章节
}
```

### MergeResult

```typescript
interface MergeResult {
  content: string;                    // 合并后的内容
  sections: string[];                 // 合并的章节
  conflicts_resolved: ResolvedConflict[];
  explanation: string;                // 合并说明
}

interface ResolvedConflict {
  location: string;
  local_value: string;
  remote_value: string;
  resolution: string;                 // 解决方案
  reason: string;                     // 选择理由
}
```

---

## 七、平台配置模型

### PlatformConfig

```typescript
interface PlatformConfig {
  path: string;                       // 配置文件路径
  content: string;                    // 文件内容
  metadata?: {
    // Cursor MDC
    globs?: string[];
    alwaysApply?: boolean;
    description?: string;
    
    // 写入模式
    append?: boolean;                 // 是否追加
    executable?: boolean;             // 是否可执行
  };
}
```

### AdapterCapabilities

```typescript
interface AdapterCapabilities {
  platform: string;
  version: string;
  
  // 支持的资产类型
  supported_assets: AssetType[];
  
  // 限制
  limitations?: {
    max_prompt_size?: number;
    max_agents?: number;
    max_skills?: number;
    supports_flows?: boolean;
    supports_mcp?: boolean;
  };
  
  // 文件映射
  file_mappings: {
    [assetType: string]: string;      // 资产类型到文件路径模板
  };
}
```

---

## 八、JSON Schema 定义

### 完整 Schema 文件

项目提供完整的 JSON Schema 用于验证：

```
schemas/
├── skill-v1.schema.json            # Skill 资产 Schema
├── prompt-v1.schema.json           # Prompt 资产 Schema
├── agent-v1.schema.json            # Agent 资产 Schema
├── flow-v1.schema.json             # Flow 资产 Schema
├── mcp-config-v1.schema.json       # MCP Config Schema
├── plugin-v1.schema.json           # Plugin Schema
└── user-config-v1.schema.json      # 用户配置 Schema
```

### Schema 使用示例

```typescript
import { z } from 'zod';
import { SkillManifestSchema } from './schemas';

// Zod 类型推导
type SkillManifest = z.infer<typeof SkillManifestSchema>;

// 运行时验证
const result = SkillManifestSchema.safeParse(data);
if (!result.success) {
  throw new ValidationError(result.error);
}
```

---

## 九、文件命名约定

### 资产文件

```
{asset-type}s/{name}/
├── manifest.json                   # 必需：元数据
├── README.md                       # 推荐：使用说明
└── [asset-specific files]          # 类型特定文件

# Prompt
prompts/{name}.md

# Skill
skills/{name}/
├── manifest.json
├── logic.{js,ts,py}
├── schema.json
└── README.md

# Agent
agents/{name}/
├── agent.yaml
├── purpose.md
└── knowledge/

# Flow
flows/{name}.json

# MCP Config
mcp-configs/{name}.yaml
└── {name}.env.template
```

### 命名规范

- **资产名称**: `kebab-case` (小写，连字符分隔)
- **版本号**: `semver` (如 1.2.3)
- **文件命名**: `kebab-case.ext`
- **目录命名**: `kebab-case`

---

## 十、扩展字段约定

资产支持扩展字段，以 `x-` 前缀标识：

```json
{
  "name": "example-skill",
  "version": "1.0.0",
  
  // 标准字段
  "description": "An example skill",
  
  // 扩展字段
  "x-custom-field": "custom value",
  "x-team": "platform-team",
  "x-priority": "high"
}
```

扩展字段：
- 不影响核心功能
- 可被适配器使用
- 可被自定义工具读取
- 不保证跨版本兼容性

---

**文档维护者**: Sisyphus  
**Schema 版本**: v1.0.0  
**最后更新**: 2026-02-26
