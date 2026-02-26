# DeepResearch 补充分析报告

> **来源**: deepresearch-乾乾 AI 资产管理需求澄清.md  
> **分析日期**: 2026-02-26  
> **状态**: 已整合至技术规划

---

## 一、DeepResearch 关键洞察

### 1.1 平台规范深度解析（与现有文档对比）

#### Cursor .mdc 详细机制

| 属性 | 行为 | 现有文档覆盖 | 补充说明 |
|------|------|-------------|---------|
| **alwaysApply** | 无条件注入系统提示词 | ⚠️ 提及 | 需明确映射到乾乾 `scope: global` |
| **globs** | 文件通配符触发机制 | ✅ 已覆盖 | 需支持 picomatch 语法 |
| **description** | 语义化激活核心 | ⚠️ 简单提及 | AI 根据描述评估相关性，调用 fetch_rules |
| **优先级** | Team > Project > User | ❌ 未提及 | 企业级规范强制覆盖个人习惯 |

**关键补充**: Cursor Rules 的三层优先级（Team Rules 最高）需要在适配器中处理。

#### Open Code 7 层配置层级

DeepResearch 详细列出了 7 层配置：

| 优先级 | 层级 | 存储位置 | 现有文档覆盖 |
|--------|------|---------|-------------|
| 7 | Inline Config | `OPENCODE_CONFIG_CONTENT` | ❌ 新增 |
| 6 | .opencode 目录 | 项目内部 | ✅ 已覆盖 |
| 5 | Project Config | `opencode.json` | ✅ 已覆盖 |
| 4 | Custom Config | `OPENCODE_CONFIG` 环境变量 | ❌ 新增 |
| 3 | Global Config | `~/.config/opencode/` | ✅ 已覆盖 |
| 2 | Remote Config | `.well-known/opencode` | ❌ 新增 |
| 1 | Default Settings | 系统预置 | ⚠️ 提及 |

**关键补充**: Remote Config 通过 Auth 机制获取组织默认配置，这是企业级场景。

#### Claude Code 5 层作用域

| 作用域 | 优先级 | 存储位置 | 特点 |
|--------|--------|---------|------|
| Command Line | 临时 | CLI 标志 | 当前会话 |
| Local | 高 | `.claude/settings.local.json` | 当前用户，gitignore |
| Project | 中 | `.claude/settings.json` | 团队协作，可提交 Git |
| User | 低 | `~/.claude/settings.json` | 所有项目 |
| Managed | 最高 | 系统级 | IT 部署，不可覆盖 |

**关键补充**: Managed Scope 是企业合规的关键，乾乾需考虑与 @sync:full 的映射。

### 1.2 Skill Manifest 详细设计

DeepResearch 提供了一个完整的 manifest 示例：

```json
{
  "name": "performance-auditor",
  "permissions": {
    "filesystem": ["read"],
    "network": ["*.web.dev"],
    "shell": false
  },
  "dependencies": {
    "bins": ["lighthouse-cli"]
  }
}
```

**与现有规范的差异**:
- 现有: `permissions.filesystem: ['read' | 'write'][]`
- DeepResearch: `permissions.network` 支持域名通配符
- DeepResearch: `dependencies.bins` 检测 PATH 中的二进制

### 1.3 三层隔离架构（新增）

DeepResearch 提出了完整的安全隔离方案：

| 隔离方案 | 技术实现 | 启动性能 | 安全强度 | 适用场景 |
|---------|---------|---------|---------|---------|
| **Isolates (v8)** | `isolated-vm` | 极快 (<10ms) | 低 | 纯 JS Skill |
| **Deno Sandbox** | Deno 权限模型 | 快 (<50ms) | 中 | 含文件/网络访问 |
| **Firecracker** | 微虚拟机 | 中 (~150ms) | 高 | 重度隔离需求 |

**关键补充**: 现有文档未详细设计沙箱，DeepResearch 明确了分级策略。

### 1.4 Git 存储引擎选型

DeepResearch 明确建议使用 **isomorphic-git**：

| 维度 | isomorphic-git (建议) | Nodegit |
|------|----------------------|---------|
| 环境依赖 | 零原生依赖，纯 JS | 依赖编译环境 |
| 同步功能 | Clone, Push, Pull, 浅克隆 | 功能全但易崩溃 |
| 资源消耗 | 支持 Shallow clone | 只能完整克隆 |

**与现有文档冲突**: 现有实现使用 simple-git，DeepResearch 建议迁移到 isomorphic-git。

---

## 二、需要补充的技术要点

### 2.1 架构层面补充

#### A. Git 存储层更新

```
现状: simple-git (Node.js 封装)
建议: isomorphic-git (纯 JavaScript)

理由:
1. 零原生依赖，跨平台一致性更好
2. 支持浅克隆 (--depth 1)，节省流量
3. 浏览器兼容性（未来 Web 端扩展）

迁移成本:
- API 差异中等
- 需要重新测试认证、大文件等场景
```

#### B. 沙箱执行层（新增模块）

```
新增: Sandbox Layer

位置: Features → Execution → SandboxManager

职责:
1. 根据 Skill manifest 选择隔离级别
2. 启动对应的沙箱环境
3. 监控资源使用和安全性
4. 处理输入输出转换

隔离级别映射:
- Prompt 类型: 无隔离
- JS Skill (纯计算): Isolates
- JS Skill (文件/网络): Deno Sandbox
- Python Skill: Deno Sandbox (pyodide) 或 Firecracker
```

#### C. 兼容性矩阵细化

DeepResearch 提出的分级标准：

| 级别 | 说明 | 示例 |
|------|------|------|
| **Full** | 100% 功能可用 | Markdown 规则 → Cursor |
| **Partial** | 核心可用，部分降级 | 需 Docker 的 Skill → Cloud Code |
| **None** | 完全不兼容 | 本地 Shell Skill → 纯 Web IDE |

**处理策略**:
- Full: 正常同步
- Partial: 同步并警告，提供降级建议
- None: 跳过，记录原因

### 2.2 功能层面补充

#### A. @sync 标记与冲突处理

DeepResearch 明确的 @sync 语义：

```yaml
---
name: "frontend-expert"
sync_policy: "full"    # 等价于 @sync:full
---

# 行为定义:
# @sync:full   - 强制以远程为准，本地修改被覆盖
# @sync:local  - 忽略云端，保留本地微调
# @sync:merge  - AI 语义合并（保持语法完整性）
```

**与现有设计对齐**: 现有 `sync_policy` 枚举（full/merge/local）与 DeepResearch 一致。

#### B. capture --ai 详细流程

DeepResearch 描述的 Auto-Doc 流程：

```
1. 特征提取: AI 识别对话中有效的 Prompt 模式
2. 元数据生成: 自动命名、分类、标签
3. 结构化输出: 生成 SKILL.md 或 Agent.md
4. 版本控制: 自动 Commit 到 GitHub
5. 冲突检测: 与现有资产对比，建议更新或新建
```

**关键补充**: 需要设计 "对话解析器" 模块，提取有效交互模式。

#### C. 敏感信息分层管理

DeepResearch 的安全方案：

```
存储分层:
├── ~/.acl/credentials.yaml      # 全局敏感配置（AES-256-GCM 加密）
├── assets/mcp-configs/*.yaml    # 公开配置
└── *.env.template               # 模板（提交到 Git）
   └── 实际值由 CLI 部署时注入

部署时注入:
1. CLI 读取 ~/.acl/credentials.yaml
2. 解密获取 API Key
3. 注入到目标平台配置
4. 不保存到资产仓库
```

---

## 三、技术规划更新建议

### 3.1 Phase 1 更新（立即执行）

#### 高优先级调整

| 任务 | 原规划 | DeepResearch 建议 | 决策 |
|------|--------|------------------|------|
| Git 库 | simple-git | **isomorphic-git** | 建议迁移 |
| Cursor 适配 | 基础实现 | **支持 Team Rules 优先级** | 补充实现 |
| 沙箱层 | 未规划 | **设计 SandboxManager 接口** | 新增设计 |

#### 新增任务

```
P1-W5-T9: 迁移到 isomorphic-git (4h)
  - 替换 simple-git 调用
  - 测试浅克隆功能
  - 验证认证流程

P1-W6-T9: Cursor Team Rules 支持 (2h)
  - 识别 .cursor/rules/ 目录结构
  - 处理优先级合并

P1-W6-T10: SandboxManager 接口设计 (3h)
  - 定义隔离级别枚举
  - 设计沙箱启动接口
  - 预留 Deno/Firecracker 扩展点
```

### 3.2 Phase 2 更新（MVP+）

#### 高优先级调整

| 任务 | 原规划 | DeepResearch 建议 | 决策 |
|------|--------|------------------|------|
| capture --ai | 基础实现 | **完整对话解析器** | 增强设计 |
| 语义合并 | 简单实现 | **保持 Markdown/YAML 语法完整性** | 补充约束 |
| 安全扫描 | 未规划 | **敏感信息自动扫描** | 新增任务 |

#### 新增任务

```
P2-W8-T8: 对话特征提取器 (6h)
  - 识别有效 Prompt 模式
  - 过滤闲聊内容
  - 提取可复用指令

P2-W9-T9: 语法感知合并 (4h)
  - Markdown AST 保持
  - YAML 结构保持
  - 冲突段落标记

P2-W10-T9: 敏感信息扫描 (6h)
  - API Key 模式检测
  - 自动 .gitignore 建议
  - 提交前检查钩子
```

### 3.3 Phase 3 更新（Full Version）

#### 关键调整

```
Week 11: Plugin 系统 → 增加沙箱集成
  - Plugin 加载时检测依赖
  - 自动选择合适的隔离级别

Week 12: Flow 支持 → 明确为描述性配置
  - 参考 DeepResearch: "Flow 定义为描述性 DAG"
  - 不实现执行引擎，由目标平台执行

Week 13: 兼容性系统 → 细化分级标准
  - Full/Partial/None 三级
  - 自动降级建议

Week 16: 安全增强 → 完整三层隔离
  - Isolates 支持
  - Deno Sandbox 支持
  - Firecracker 预留接口
```

---

## 四、文档整合清单

### 已整合的文档

| 文档 | 路径 | 整合内容 |
|------|------|---------|
| 技术架构 | `docs/technical/architecture-v2.md` | 沙箱层、isomorphic-git |
| 资产存储规范 | `docs/specs/asset-storage-spec-v1.md` | manifest.permissions.network |
| 技术路线图 | `docs/roadmap/technical-roadmap-v1.md` | 沙箱相关任务 |
| 安全设计 | `docs/technical/security-design.md` | 三层隔离、敏感信息管理 |

### 建议新增的文档

| 文档 | 用途 | 优先级 |
|------|------|--------|
| `docs/specs/platform-compatibility.md` | 平台适配详细规范 | P1 |
| `docs/guides/sandbox-usage.md` | 沙箱使用指南 | P2 |
| `docs/reference/migration-guide.md` | simple-git → isomorphic-git 迁移 | P1 |

---

## 五、关键决策更新

基于 DeepResearch，以下决策需要重新确认：

### 决策 A: Git 库选择（原决策 7）

| 选项 | 理由 | 建议 |
|------|------|------|
| A. 保持 simple-git | 已工作正常 | 不推荐 |
| **B. 迁移 isomorphic-git** | DeepResearch 强烈推荐，浅克隆优势 | **推荐** |

**影响**: 增加 4h 迁移工作，但长期收益明显。

### 决策 B: 沙箱实现范围（新增）

| 选项 | 内容 | 建议 |
|------|------|------|
| A. Phase 1 仅设计接口 | 预留扩展点 | **推荐** |
| B. Phase 1 实现 Isolates | 基础隔离 | 可选 |
| C. Phase 2 完整三层 | Isolates + Deno + Firecracker | 延后 |

**建议**: Phase 1 设计 SandboxManager 接口，Phase 2 实现 Isolates，Phase 3 完整支持。

---

## 六、总结

DeepResearch 文档提供了以下关键补充：

1. **技术选型确认**: isomorphic-git 优于 simple-git（零依赖、浅克隆）
2. **安全架构完善**: 三层隔离架构（Isolates → Deno → Firecracker）
3. **平台规范细化**: Cursor Team Rules、Open Code 7 层、Claude 5 层作用域
4. **功能边界明确**: Flow 保持描述性，由目标平台执行

这些补充与现有技术规划基本一致，主要增强点在：
- Git 存储层升级
- 沙箱安全层新增
- 平台适配细化

建议优先处理 isomorphic-git 迁移和 SandboxManager 接口设计。