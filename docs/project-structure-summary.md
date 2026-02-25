# 乾乾项目结构创建完成

## 创建的文件和目录

### 📁 核心源码目录 (src/)

```
src/
├── core/                    # 领域模型层
│   ├── asset/              # 资产领域（Prompt/Skill/Agent/Flow）
│   ├── platform/           # 平台领域（Cursor/OpenCode/ClaudeCode）
│   └── sync/               # 同步领域（Pull/Push/Diff）
├── cli/                    # 命令行接口
│   ├── commands/           # 命令实现
│   │   ├── init.ts
│   │   ├── capture.ts
│   │   ├── sync.ts
│   │   ├── pull.ts
│   │   ├── push.ts
│   │   ├── status.ts
│   │   ├── list.ts
│   │   ├── show.ts
│   │   └── diff.ts
│   ├── config-manager/     # 配置管理
│   └── doctor/             # 诊断工具
├── config/                 # 配置系统
│   └── schema/             # Zod Schema 定义
├── features/               # 功能模块
│   ├── asset-manager/
│   ├── github-sync/
│   ├── platform-adapters/
│   ├── conflict-resolver/
│   ├── version-control/
│   └── ai-extractor/
├── hooks/                  # 生命周期钩子
│   ├── pre-sync/
│   ├── post-sync/
│   └── validation/
├── tools/                  # 工具封装
│   ├── git/
│   ├── github/
│   ├── ide-detect/
│   ├── file-ops/
│   └── template-engine/
├── shared/                 # 共享工具
│   ├── utils/              # 通用工具函数
│   ├── types/              # 全局类型定义
│   └── constants/          # 常量定义
└── index.ts                # 入口文件
```

### 📁 文档目录 (docs/)

```
docs/
├── architecture/           # 架构文档
│   ├── diagrams/
│   ├── decisions/
│   └── project-structure.md   # 详细架构文档
├── guide/                  # 用户指南
│   ├── quickstart/
│   └── advanced/
├── reference/              # 参考文档
│   ├── commands/
│   ├── api/
│   └── config/
└── api/                    # 程序化 API 文档
```

### 📁 示例资产 (examples/)

```
examples/
├── prompts/                # Prompt 示例
│   └── frontend-expert.md
├── skills/                 # Skill 示例
│   └── code-reviewer/
│       ├── SKILL.md
│       └── manifest.json
├── agents/                 # Agent 示例
│   └── architect-assistant/
│       ├── agent.yaml
│       └── purpose.md
└── flows/                  # Flow 示例
    └── feature-development.yaml
```

### 📁 其他重要目录

```
├── bin/                    # CLI 可执行文件入口
├── script/                 # 构建脚本
├── packages/               # 多平台发布包
├── test/                   # 测试目录
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
└── assets/                 # 静态资源
```

### 📄 配置文件

- `package.json` - npm 配置
- `tsconfig.json` - TypeScript 配置
- `.gitignore` - Git 忽略规则

---

## 架构设计原则

参考 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) 的设计：

### 1. 模块化分层架构

```
CLI Layer          (cli/)
    ↓
Features Layer     (features/)
    ↓
Core Layer         (core/)
    ↓
Shared Layer       (shared/)
```

- **单向依赖**: 上层可以依赖下层，下层不依赖上层
- **领域驱动**: Core 层定义业务领域模型
- **功能独立**: Features 层每个模块独立完整

### 2. Hook 生命周期系统

```
Pre-Sync Hooks
  ├── validation      # 校验资产
  ├── backup         # 备份本地配置
  └── compatibility  # 兼容性检查

Sync Operation

Post-Sync Hooks
  ├── notification   # 发送通知
  └── cleanup        # 清理临时文件
```

### 3. Agent 设计模式

| Agent | 职责 | 触发方式 |
|-------|------|----------|
| Capturer | 从 IDE 捕获能力 | `acl capture` |
| Syncer | 协调同步流程 | `acl sync` |
| Analyzer | 分析资产质量 | 后台分析 |
| Converter | 格式转换 | 同步时自动 |

### 4. 配置系统

采用三级配置合并策略：

```
用户全局配置  (~/.acl/config.yaml)
      ↓
项目级配置    (./.acl/config.yaml)
      ↓
默认配置      (内置)
```

### 5. 代码规范

- **文件命名**: kebab-case (`asset-manager.ts`)
- **模块导出**: Barrel export (`index.ts`)
- **类型安全**: Zod 运行时校验
- **错误处理**: 自定义错误类，禁止空 catch 块

---

## 下一步建议

1. **安装依赖**: `bun install` 或 `npm install`
2. **配置开发环境**: 参考 `docs/guide/quickstart/`
3. **实现核心功能**: 从 `features/asset-manager/` 开始
4. **添加测试**: 在 `test/` 目录编写单元测试
5. **完善文档**: 补充各模块的使用文档

---

## 参考文档

- [详细架构文档](./docs/architecture/project-structure.md)
- [oh-my-opencode AGENTS.md](./ReferenceRepo/oh-my-opencode/AGENTS.md)
- [产品需求文档](./product.md)
