# Phase 2: MVP+ - 详细研发计划

> **阶段**: Phase 2 - MVP+  > **周期**: Week 7-10 (4 周)  
> **目标**: AI 辅助能力与增强同步  
> **前置条件**: Phase 1 完成  
> **负责人**: 待定

---

## 一、交付物清单

### Week 7-8: AI 集成与自动化

#### Week 7: AI Provider 框架
**目标**: AI 功能基础设施就绪

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P2-W7-T1 | 设计 AI Provider 接口 | P0 | 4h | - | - |
| P2-W7-T2 | 实现 Anthropic Provider | P0 | 6h | - | T1 |
| P2-W7-T3 | 实现 OpenAI Provider | P1 | 4h | - | T1 |
| P2-W7-T4 | 实现 Provider 工厂 | P1 | 2h | - | T2-3 |
| P2-W7-T5 | 实现 AI 配置管理 | P1 | 3h | - | - |
| P2-W7-T6 | 实现 AI 调用限流 | P1 | 3h | - | T2 |
| P2-W7-T7 | 实现 Token 预算管理 | P2 | 4h | - | T2 |
| P2-W7-T8 | 编写 AI Provider 测试 | P1 | 4h | - | T2-4 |

**Week 7 里程碑**:
```bash
✓ AI Provider 可切换
✓ Token 预算可配置
✓ 限流保护生效
```

#### Week 8: 自动化功能
**目标**: AI 辅助能力上线

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P2-W8-T1 | 实现 Commit Message 生成 | P0 | 6h | - | P2-W7 |
| P2-W8-T2 | 实现 Skill 提取功能 | P0 | 10h | - | P2-W7 |
| P2-W8-T3 | 实现对话解析器 | P0 | 6h | - | T2 |
| P2-W8-T4 | 实现 `acl capture --ai` | P0 | 6h | - | T2-3 |
| P2-W8-T5 | 实现智能命名建议 | P1 | 4h | - | P2-W7 |
| P2-W8-T6 | 实现自动生成 README | P1 | 4h | - | P2-W7 |
| P2-W8-T7 | 编写自动化功能测试 | P1 | 4h | - | T1-4 |

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

---

### Week 9-10: 高级同步与冲突处理

#### Week 9: 冲突解决
**目标**: 智能冲突处理可用

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P2-W9-T1 | 设计冲突解决策略 | P0 | 4h | - | - |
| P2-W9-T2 | 实现三路合并算法 | P0 | 8h | - | T1 |
| P2-W9-T3 | 实现语义合并 (AI) | P0 | 8h | - | P2-W7, T2 |
| P2-W9-T4 | 实现 @sync 标记处理 | P0 | 6h | - | T1 |
| P2-W9-T5 | 实现冲突预览 (dry-run) | P1 | 4h | - | T2-3 |
| P2-W9-T6 | 实现本地覆写保护 | P1 | 4h | - | T4 |
| P2-W9-T7 | 编写冲突解决测试 | P1 | 4h | - | T2-4 |
| P2-W9-T8 | 更新 sync 命令支持策略 | P0 | 4h | - | T4 |

**Week 9 里程碑**:
```bash
✓ 三路合并工作正常
✓ 语义合并可用
✓ @sync:merge 标记生效
```

#### Week 10: Agent 支持 + 依赖管理
**目标**: 支持 Agent 资产管理

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P2-W10-T1 | 实现 Agent Schema | P0 | 4h | - | - |
| P2-W10-T2 | 更新适配器支持 Agent | P0 | 6h | - | T1, P1-W6 |
| P2-W10-T3 | 实现 Agent 反向适配 | P1 | 6h | - | T2 |
| P2-W10-T4 | 实现依赖检测 | P0 | 6h | - | - |
| P2-W10-T5 | 实现 `acl deps install` | P0 | 6h | - | T4 |
| P2-W10-T6 | 实现 `acl deps check` | P1 | 3h | - | T4 |
| P2-W10-T7 | 编写 Agent 和依赖测试 | P1 | 4h | - | T1-6 |
| P2-W10-T8 | 性能优化 (大仓库) | P1 | 4h | - | - |

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

---

## 二、技术决策点

### Week 7
- **决策 1**: AI Provider 默认选择
  - 选项: Anthropic vs OpenAI
  - 建议: Anthropic (Claude 在指令遵循方面更强)
  - 截止时间: Week 7 Day 1
  
- **决策 2**: Token 预算策略
  - 确定默认限制和超额处理
  - 截止时间: Week 7 Day 3

### Week 8
- **决策 3**: Skill 提取提示词设计
  - 确定提取质量和速度的平衡
  - 截止时间: Week 8 Day 2

### Week 9
- **决策 4**: 冲突解决 UX
  - 确定交互流程 (自动/半自动/手动)
  - 截止时间: Week 9 Day 2

- **决策 5**: 语义合并触发条件
  - 何时调用 AI (文件大小、类型等)
  - 截止时间: Week 9 Day 3

### Week 10
- **决策 6**: Agent 定义格式
  - 基于 OASF 的扩展设计
  - 截止时间: Week 10 Day 2

---

## 三、风险缓解

### 技术风险

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|---------|
| AI API 响应慢 | 高 | 中 | 添加超时、缓存、降级 |
| AI 提取质量不稳定 | 中 | 高 | 提示词优化、人工确认 |
| 合并算法复杂度 | 中 | 中 | 先用简单实现，逐步优化 |
| Agent 格式不统一 | 高 | 高 | 参考 everything-claude-code |

### 进度风险

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|---------|
| AI 功能开发超预期 | 中 | 高 | 可先实现基础提取，高级功能延后 |
| 冲突解决 UX 复杂 | 中 | 中 | 简化流程，先做核心场景 |

---

## 四、交付标准

### 功能验收

- [ ] `acl capture --ai` 成功提取 Skill
- [ ] 自动 Commit Message 生成合理
- [ ] `@sync:merge` 触发 AI 合并
- [ ] `@sync:local` 保护本地配置
- [ ] `@sync:full` 完全覆盖
- [ ] 三路合并处理文本冲突
- [ ] `acl deps install` 安装依赖
- [ ] Agent 资产可同步到平台

### 代码质量

- [ ] 测试覆盖率 > 70%
- [ ] AI 调用有 Mock 测试
- [ ] 合并算法有边界测试
- [ ] 性能测试 (100 assets < 5s)

### 文档

- [ ] AI 功能使用指南
- [ ] 冲突解决文档
- [ ] 同步策略说明

---

## 五、依赖项

### 内部依赖 (Phase 1)
- CLI 框架
- 配置系统
- Git 集成
- 适配器接口

### 外部依赖
| 依赖 | 版本 | 用途 |
|------|------|------|
| @anthropic-ai/sdk | ^0.25.0 | Anthropic AI |
| openai | ^4.0.0 | OpenAI 备用 |
| diff | ^5.1.0 | 文本差异 |

### API 依赖
| API | 用途 | 成本预估 |
|-----|------|---------|
| Anthropic Claude | Skill 提取、合并 | ~$50/月 (开发) |
| OpenAI GPT-4 | 备用/对比 | ~$20/月 (开发) |

---

## 六、与其他阶段关系

### 从 Phase 1 继承
- 所有基础功能
- 适配器框架
- Git 集成

### 向 Phase 3 输出
- AI 框架
- Agent 支持
- 冲突解决机制

### 可延后功能 (若进度紧张)
- Token 预算管理 (可先用简单限制)
- OpenAI Provider (可先用 Anthropic)
- 自动生成 README (可用模板)

---

## 七、测试策略

### 单元测试
- AI Provider Mock
- 合并算法边界条件
- 依赖检测逻辑

### 集成测试
- 完整 capture --ai 流程
- 冲突解决端到端
- 依赖安装流程

### 手动测试
- AI 提取质量评估
- 合并结果人工审核
- 大仓库性能测试

---

**阶段负责人**: 待定  
**开始日期**: Phase 1 结束后  
**结束日期**: 待定  
**状态**: 规划中
