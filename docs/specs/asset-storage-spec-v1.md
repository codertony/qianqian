# 乾乾 (QianQian) 资产存储规范 v1.0

> **版本**: v1.0.0  
> **状态**: 草案  
> **最后更新**: 2026-02-26  
> **参考项目**: everything-claude-code, oh-my-opencode, OASF

---

## 一、设计原则

### 1.1 核心原则

1. **协议先行**: 所有资产采用自描述的存储规范，确保跨平台可解析
2. **渐进式披露**: 采用 Frontmatter → 主内容 → 支持文件的三层结构
3. **平台无关**: 资产定义独立于特定 IDE，通过适配器转换
4. **人类可读**: Markdown + YAML 格式，便于版本控制和人工编辑
5. **AI 可解析**: 结构化 Frontmatter，支持自动化处理

### 1.2 参考设计模式

| 来源项目 | 借鉴点 |
|---------|--------|
| **everything-claude-code** | SKILL.md 格式、渐进式披露、目录组织 |
| **oh-my-opencode** | Category 路由、Agent 注册表、配置分层 |
| **OASF** | Agent Schema 标准、扩展机制 |
| **MCP** | 工具权限声明、服务器配置格式 |

---

## 二、目录结构规范

### 2.1 用户资产仓库结构

```
acl-assets/                          # GitHub 私有仓库
├── README.md                        # 仓库说明（自动生成）
├── .acl/                            # ACL 系统元数据
│   ├── repo-config.yaml             # 仓库级配置
│   └── versions.lock                # 版本锁定文件
│
├── prompts/                         # Prompt 资产
│   ├── system/                      # 系统级 Prompts
│   │   └── frontend-expert.md       # YAML Frontmatter + Markdown
│   ├── tasks/                       # 任务级 Prompts
│   │   └── code-review.md
│   └── README.md
│
├── skills/                          # Skill 资产（多文件目录）
│   └── {skill-name}/                # kebab-case 命名
│       ├── SKILL.md                 # 【必需】主入口文件
│       ├── README.md                # 【可选】使用说明
│       ├── examples.md              # 【可选】示例（按需加载）
│       ├── references.md            # 【可选】参考文档（按需加载）
│       ├── schema.json              # 【可选】输入输出 Schema
│       └── scripts/                 # 【可选】可执行脚本
│           └── helper.js
│
├── agents/                          # Agent 资产（单文件）
│   └── {agent-name}.md              # kebab-case 命名
│       # YAML Frontmatter + Markdown
│
├── flows/                           # Flow 资产
│   └── {flow-name}.yaml             # DAG 定义
│
├── mcp-configs/                     # MCP 服务配置
│   ├── github.yaml                  # 公开配置
│   └── github.env.template          # 敏感信息模板（.gitignore 保护）
│
└── plugins/                         # Plugin 资产（复合包）
    └── {plugin-name}/
        ├── package.json             # 包定义
        ├── compatibility.yaml       # 兼容性矩阵
        └── manifests/               # 平台差异化配置
```

### 2.2 命名规范

| 资产类型 | 命名格式 | 示例 | 限制 |
|---------|---------|------|------|
| **Prompt** | kebab-case | `frontend-expert.md` | 最大 64 字符 |
| **Skill** | kebab-case | `tdd-workflow/` | 最大 64 字符 |
| **Agent** | kebab-case | `code-reviewer.md` | 最大 64 字符 |
| **Flow** | kebab-case | `ci-cd-automation.yaml` | 最大 64 字符 |
| **MCP Config** | kebab-case | `github.yaml` | 最大 64 字符 |
| **Plugin** | kebab-case | `full-stack-dev/` | 最大 64 字符 |

**命名约束**:
- 只能包含小写字母、数字和连字符
- 不能以数字开头
- 不能使用保留词: `acl`, `qianqian`, `system`, `default`

---

## 三、文件格式规范

### 3.1 通用 Frontmatter 格式

所有 Markdown 资产文件（Prompts/Skills/Agents）均采用 YAML Frontmatter:

```yaml
---
# ========== 核心字段（必需）==========
name: "asset-name"                    # 资产名称（与文件名一致）
description: "资产描述"               # 一句话描述（最大 1024 字符）

# ========== 元数据字段（可选）==========
version: "1.0.0"                     # 语义化版本
type: "system"                       # 类型（system/task/skill/agent）
author: "user@example.com"           # 作者
license: "MIT"                       # 许可证
tags:                                # 分类标签（建议 3-5 个）
  - "frontend"
  - "react"
  - "performance"

# ========== 平台相关字段（可选）==========
platforms:                           # 支持的平台（空表示全部）
  - "cursor"
  - "opencode"
  - "claude-code"

# ========== 同步策略字段（可选）==========
sync_policy: "merge"                 # 同步策略: full/merge/local
scope: "project"                     # 作用域: global/project
always_apply: false                  # 是否始终应用（Cursor 特定）
globs: ["src/**/*.{ts,tsx}"]         # 文件匹配模式（Cursor 特定）

# ========== 扩展字段（可选）==========
variables:                           # 变量定义（动态 Prompt）
  - name: "framework"
    type: "enum"                     # string/number/boolean/enum/array
    options: ["react", "vue", "angular"]
    default: "react"
    
inherits:                            # 继承其他资产
  - "base-coding-guidelines"
  
compatibility:                       # 兼容性声明
  cursor: ">=0.45"
  opencode: ">=1.0"
---
```

### 3.2 Prompt 资产格式

**文件**: `prompts/{scope}/{name}.md`

```markdown
---
name: "frontend-performance-expert"
description: "前端性能优化专家，专注于 Core Web Vitals"
type: "system"                       # system | task
version: "2.1.0"
tags: ["frontend", "performance", "optimization"]
scope: "global"                      # global | project
sync_policy: "merge"
variables:
  - name: "framework"
    type: "enum"
    options: ["react", "vue", "angular"]
    default: "react"
  - name: "target_metrics"
    type: "array"
    default: ["LCP", "FID", "CLS"]
inherits:
  - "base-coding-guidelines"
platforms: ["cursor", "opencode", "claude-code"]
---

# Frontend Performance Expert

You are a frontend performance optimization expert...

## Core Principles

1. Always measure before optimizing
2. Focus on Core Web Vitals
3. Prefer code splitting over monolithic bundles

## Workflow

1. Analyze current performance metrics
2. Identify bottlenecks
3. Propose optimizations
4. Validate improvements

## Examples

### Example 1: Image Optimization
```
[示例内容...]
```
```

### 3.3 Skill 资产格式

**主文件**: `skills/{skill-name}/SKILL.md`

```markdown
---
name: "tdd-workflow"
description: "测试驱动开发工作流，确保 80%+ 覆盖率"
version: "2.0.0"
type: "skill"
tags: ["testing", "tdd", "quality"]
entry: "logic.js"                    # 入口文件（如果有执行逻辑）
language: "javascript"               # 执行语言
permissions:                         # 权限声明
  filesystem: ["read", "write"]
  network: false
  shell: false
  mcp: ["github"]
dependencies:                        # 依赖声明
  npm: ["@testing-library/react", "jest"]
  pip: []
  system: ["node>=18"]
platforms: ["cursor", "opencode"]
---

# TDD Workflow

Expert TDD practitioner guiding test-first development...

## When to Use

Use this skill when:
- Starting a new feature
- Refactoring existing code
- Fixing a bug

## Workflow

1. **Red**: Write a failing test
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code quality

## Input Schema

```json
{
  "type": "object",
  "properties": {
    "feature": { "type": "string" },
    "tech_stack": { "type": "string" }
  },
  "required": ["feature"]
}
```

## Output Schema

```json
{
  "type": "object",
  "properties": {
    "tests": { "type": "array" },
    "implementation": { "type": "string" }
  }
}
```
```

**支持文件**（按需加载）:

```markdown
<!-- examples.md -->
# TDD Examples

## Example 1: React Component
...

## Example 2: API Endpoint
...
```

```markdown
<!-- references.md -->
# TDD References

- [TDD by Kent Beck](...)
- [Testing Pyramid](...)
```

### 3.4 Agent 资产格式

**文件**: `agents/{agent-name}.md`

```markdown
---
name: "code-reviewer"
description: "代码审查专家，关注质量、安全和最佳实践"
version: "1.5.0"
type: "agent"
purpose: |
  审查代码变更，确保代码质量、安全性和可维护性。
  提供建设性的反馈和改进建议。
knowledge_base:
  - ref: "prompts://system/coding-standards"
  - ref: "docs://company/security-guidelines"
  - file: "./knowledge/review-checklist.md"
assigned_skills:
  - "security-review"
  - "performance-analysis"
model: "claude-sonnet-4-20250514"
temperature: 0.3
max_tokens: 8000
tools:                               # 工具权限
  - "read"
  - "write"
  - "bash"
  - "glob"
  - "grep"
  - "diff"
  - "skill:security-scan"
capabilities:
  - "code-review"
  - "security-audit"
  - "performance-review"
platforms: ["cursor", "opencode", "claude-code"]
---

# Code Reviewer Agent

You are an expert code reviewer with 10+ years of experience...

## Review Checklist

### Quality
- [ ] Code follows SOLID principles
- [ ] Functions are small and focused
- [ ] Naming is clear and consistent

### Security
- [ ] No hardcoded secrets
- [ ] Input validation is present
- [ ] Dependencies are up to date

### Performance
- [ ] No unnecessary computations
- [ ] Efficient data structures
- [ ] Proper async/await usage

## Response Format

```
## Summary
Brief summary of the review

## Issues Found
### [Severity] Issue Title
- **Location**: file:line
- **Description**: What's wrong
- **Suggestion**: How to fix

## Positive Findings
What's done well

## Recommendations
Optional improvements
```
```

### 3.5 Flow 资产格式

**文件**: `flows/{flow-name}.yaml`

```yaml
# Flow 定义
name: "feature-development"
version: "1.0.0"
description: "完整的特性开发流程"

triggers:
  - type: "manual"
    name: "start"
  - type: "webhook"
    name: "pr_created"
    config:
      endpoint: "/webhooks/pr"

variables:
  - name: "feature_name"
    type: "string"
    description: "特性名称"
  - name: "tech_stack"
    type: "enum"
    options: ["react", "vue", "angular"]
    default: "react"

nodes:
  # 开始节点
  - id: "start"
    type: "start"
    name: "开始"
    next: "plan"

  # Agent 节点
  - id: "plan"
    type: "agent"
    name: "制定计划"
    ref: "agents://planner"
    inputs:
      feature: "{{variables.feature_name}}"
    next: "implement"

  # Agent 节点
  - id: "implement"
    type: "agent"
    name: "实现代码"
    ref: "agents://developer"
    inputs:
      plan: "{{nodes.plan.outputs.plan}}"
    next: "review"

  # Skill 节点
  - id: "review"
    type: "skill"
    name: "代码审查"
    ref: "skills://code-review"
    inputs:
      code: "{{nodes.implement.outputs.code}}"
    next: "decision"

  # 条件节点
  - id: "decision"
    type: "condition"
    name: "审查结果判断"
    condition: "{{nodes.review.outputs.passed}} == true"
    next:
      - target: "test"
        condition: "true"
      - target: "implement"
        condition: "false"

  # Skill 节点
  - id: "test"
    type: "skill"
    name: "运行测试"
    ref: "skills://tdd-workflow"
    inputs:
      action: "run_tests"
    next: "end"

  # 结束节点
  - id: "end"
    type: "end"
    name: "完成"

edges:
  - id: "e1"
    source: "start"
    target: "plan"
  - id: "e2"
    source: "plan"
    target: "implement"
  - id: "e3"
    source: "implement"
    target: "review"
  - id: "e4"
    source: "review"
    target: "decision"
  - id: "e5-true"
    source: "decision"
    target: "test"
    condition: "passed"
  - id: "e5-false"
    source: "decision"
    target: "implement"
    condition: "needs_fix"
  - id: "e6"
    source: "test"
    target: "end"
```

### 3.6 MCP Config 格式

**文件**: `mcp-configs/{service}.yaml`

```yaml
name: "github"
description: "GitHub MCP 服务"
version: "1.0.0"

# 服务器配置
server:
  command: "npx"
  args: 
    - "-y"
    - "@modelcontextprotocol/server-github"
  env:
    GITHUB_TOKEN: "${GITHUB_TOKEN}"    # 从环境变量读取

# 权限声明
permissions:
  repositories:
    - "owner/repo"
  scopes:
    - "read:issues"
    - "write:issues"

# 工具映射
tools:
  - name: "create_issue"
    description: "创建 GitHub Issue"
  - name: "search_issues"
    description: "搜索 Issues"

# 环境变量模板（敏感信息）
# 保存到 github.env.template，.gitignore 保护
env_template: |
  # GitHub Personal Access Token
  # 获取地址: https://github.com/settings/tokens
  GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

---

## 四、Schema 验证

### 4.1 Zod Schema 定义

```typescript
// schemas/prompt.ts
import { z } from 'zod';

export const PromptFrontmatterSchema = z.object({
  name: z.string()
    .regex(/^[a-z0-9-]+$/)
    .max(64),
  description: z.string()
    .min(1)
    .max(1024),
  version: z.string()
    .regex(/^\d+\.\d+\.\d+$/)
    .default('1.0.0'),
  type: z.enum(['system', 'task'])
    .default('task'),
  author: z.string().email().optional(),
  tags: z.array(z.string()).max(10).default([]),
  platforms: z.array(z.string()).optional(),
  sync_policy: z.enum(['full', 'merge', 'local']).default('merge'),
  scope: z.enum(['global', 'project']).default('project'),
  always_apply: z.boolean().default(false),
  globs: z.array(z.string()).optional(),
  variables: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'enum', 'array']),
    description: z.string().optional(),
    default: z.any().optional(),
    options: z.array(z.any()).optional(),
  })).default([]),
  inherits: z.array(z.string()).default([]),
  compatibility: z.record(z.string()).optional(),
});

export type PromptFrontmatter = z.infer<typeof PromptFrontmatterSchema>;
```

### 4.2 验证工具

```bash
# 验证单个资产
acl validate prompts/system/frontend-expert.md

# 验证整个仓库
acl validate --all

# CI 集成
acl validate --ci
```

---

## 五、跨平台转换规则

### 5.1 Prompt 转换矩阵

| 乾乾字段 | Cursor .mdc | Open Code | Claude Code |
|---------|-------------|-----------|-------------|
| `name` | filename | name | name |
| `description` | description | description | description |
| `always_apply` | alwaysApply | - | - |
| `globs` | globs | - | - |
| `scope: global` | alwaysApply: true | scope: global | - |
| `scope: project` | alwaysApply: false | scope: project | - |
| `sync_policy` | - | - | - |
| `variables` | - | variables | - |

### 5.2 Agent 转换矩阵

| 乾乾字段 | Cursor .cursorrules | Open Code | Claude Code |
|---------|---------------------|-----------|-------------|
| `name` | # Title | name | name |
| `description` | ## Description | description | description |
| `purpose` | ## Purpose | instructions | instructions |
| `capabilities` | ## Capabilities | tools | tools |
| `model` | - | model | model |
| `temperature` | - | - | temperature |
| `knowledge_base` | - | - | - |
| `assigned_skills` | - | skills | mcpServers |

---

## 六、版本管理

### 6.1 版本控制策略

```
assets/
├── prompts/
│   └── frontend-expert.md          # 当前版本
├── skills/
│   └── tdd-workflow/
│       ├── v1.0.0/                 # 历史版本（可选）
│       │   └── SKILL.md
│       ├── v1.1.0/
│       │   └── SKILL.md
│       └── SKILL.md                # 当前版本（符号链接或副本）
```

### 6.2 版本锁定

```yaml
# .acl/versions.lock
lockfileVersion: "1.0"
assets:
  prompts/frontend-expert.md:
    version: "2.1.0"
    hash: "sha256:abc123..."
    updatedAt: "2026-02-26T10:00:00Z"
  skills/tdd-workflow:
    version: "2.0.0"
    hash: "sha256:def456..."
    updatedAt: "2026-02-26T10:00:00Z"
```

---

## 七、示例资产

### 7.1 完整 Prompt 示例

参见: `examples/prompts/frontend-expert.md`

### 7.2 完整 Skill 示例

参见: `examples/skills/tdd-workflow/`

### 7.3 完整 Agent 示例

参见: `examples/agents/code-reviewer.md`

---

## 八、附录

### 8.1 术语表

| 术语 | 定义 |
|------|------|
| **Frontmatter** | 文件头部的 YAML 元数据，用 `---` 包裹 |
| **渐进式披露** | 按需加载内容，管理上下文窗口 |
| **Globs** | 文件路径匹配模式，如 `src/**/*.{ts,tsx}` |
| **Sync Policy** | 同步策略：full/merge/local |
| **OASF** | Open Agentic Schema Framework |
| **MCP** | Model Context Protocol |

### 8.2 参考资料

1. [Cursor Rules Documentation](https://cursor.com/docs/context/rules)
2. [Open Code Configuration](https://open-code.ai/docs/config/)
3. [Claude Code Settings](https://code.claude.com/docs/en/settings)
4. [OASF Specification](https://docs.agntcy.org/oasf/)
5. [MCP Specification](https://modelcontextprotocol.io/)

---

**文档维护者**: Sisyphus  
**审核状态**: 草案  
**下次评审**: 2026-03-05