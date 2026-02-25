# 乾乾 (QianQian) - 总体研发路线图

> **版本**: v1.0.0  
> **状态**: 规划阶段  
> **最后更新**: 2026-02-26  
> **预计总周期**: 16-20 周

---

## 一、阶段划分

```
Phase 1: MVP Core (基础核心)          ──────── 6 周
  ├── Week 1-2: 工程搭建与基础设施
  ├── Week 3-4: 核心 CLI 与配置系统
  └── Week 5-6: 基础同步与适配器

Phase 2: MVP+ (增强功能)              ──────── 4 周
  ├── Week 7-8: AI 集成与自动化
  └── Week 9-10: 高级同步与冲突处理

Phase 3: Full Version (完整版)        ──────── 6 周
  ├── Week 11-13: Plugin 与 Flow 支持
  ├── Week 14-15: 多平台兼容性与生态
  └── Week 16-20: 优化、测试与发布
```

---

## 二、里程碑定义

### Milestone 1: Hello QianQian (Week 2)
**目标**: 可运行的 CLI 框架
- [ ] 项目初始化完成
- [ ] CLI 基础命令可用 (`init`, `help`, `version`)
- [ ] 配置系统工作正常
- [ ] 测试框架就绪

**验收标准**:
```bash
$ acl --version
1.0.0-alpha.1

$ acl init --help
Initialize ACL configuration...

$ acl init --force
✓ Configuration created
```

### Milestone 2: First Sync (Week 6)
**目标**: 实现首次跨平台同步
- [ ] GitHub 集成完成
- [ ] Cursor 适配器可用
- [ ] Open Code 适配器可用
- [ ] 基础同步流程跑通

**验收标准**:
```bash
$ acl sync --target cursor
✓ Detected Cursor environment
✓ Fetched 3 assets from GitHub
✓ Applied to .cursor/rules/
Sync complete: 3/3 assets
```

### Milestone 3: AI Powered (Week 10)
**目标**: AI 辅助能力上线
- [ ] AI Provider 集成完成
- [ ] 自动 Commit Message 生成
- [ ] Skill 提取功能可用
- [ ] 语义合并初步实现

**验收标准**:
```bash
$ acl capture --ai "优化这个 Prompt"
✓ AI extracted 2 key capabilities
✓ Generated skill: code-optimizer
? Commit to repository? [Y/n]
```

### Milestone 4: Ecosystem Ready (Week 16)
**目标**: 完整 Plugin 生态支持
- [ ] Plugin 系统上线
- [ ] Flow 支持完成
- [ ] 兼容性检查器工作
- [ ] 外部市场抓取可用

**验收标准**:
```bash
$ acl plugin install full-stack-dev
✓ Installed plugin with 5 agents
✓ Compatibility check passed
[!] 2 skills limited on current platform
```

### Milestone 5: Production Ready (Week 20)
**目标**: 生产环境就绪
- [ ] 完整测试覆盖 (>80%)
- [ ] 文档完善
- [ ] 二进制分发就绪
- [ ] 社区插件指南发布

---

## 三、详细任务分解

### Phase 1: MVP Core (Weeks 1-6)

详见 [phase-1-mvp-core.md](./phase-1-mvp-core.md)

**核心交付物**:
- CLI 框架 (`init`, `sync`, `pull`, `status`)
- GitHub 集成
- Cursor 适配器
- Open Code 适配器
- Prompt/Skill 资产管理

**关键决策点**:
- Week 1: 技术栈最终确认
- Week 3: CLI 命令设计评审
- Week 5: 适配器接口冻结

### Phase 2: MVP+ (Weeks 7-10)

详见 [phase-2-mvp-plus.md](./phase-2-mvp-plus.md)

**核心交付物**:
- AI Provider 集成 (Anthropic/OpenAI)
- 自动 Commit Message
- Skill 提取功能
- 语义合并 (基础版)
- Agent 资产管理

**关键决策点**:
- Week 7: AI 集成策略确认
- Week 9: 冲突解决策略评审

### Phase 3: Full Version (Weeks 11-20)

详见 [phase-3-full.md](./phase-3-full.md)

**核心交付物**:
- Plugin 系统
- Flow 支持
- MCP Config 管理
- 完整兼容性矩阵
- 外部市场抓取
- 高级 AI 功能

**关键决策点**:
- Week 12: Plugin API 设计冻结
- Week 15: 兼容性矩阵标准确认
- Week 18: 发布候选版本

---

## 四、资源需求

### 人力资源

| 角色 | Phase 1 | Phase 2 | Phase 3 | 说明 |
|------|---------|---------|---------|------|
| **核心开发** | 2 人 | 2 人 | 2 人 | CLI、同步引擎、适配器 |
| **AI 集成** | 0.5 人 | 1 人 | 1 人 | AI Provider、提取算法 |
| **测试/QA** | 0.5 人 | 1 人 | 1 人 | 自动化测试、集成测试 |
| **技术写作** | 0.25 人 | 0.5 人 | 1 人 | 文档、教程、API 参考 |

### 基础设施

- **GitHub 仓库**: 主仓库 + 示例仓库
- **CI/CD**: GitHub Actions
- **测试环境**: 
  - macOS (arm64/x64)
  - Linux (arm64/x64)
  - Windows (x64)
- **AI API**: 
  - Anthropic API Key
  - OpenAI API Key (备用)

---

## 五、风险与缓解

### 技术风险

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|---------|
| Git 操作跨平台兼容性 | 中 | 高 | 早期测试，使用 isomorphic-git |
| AI Provider 稳定性 | 中 | 中 | 多 Provider 支持，降级机制 |
| 平台适配器接口变更 | 高 | 高 | 抽象层设计，版本锁定 |
| 性能问题（大仓库） | 中 | 中 | 增量同步，缓存优化 |

### 进度风险

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|---------|
| Phase 1 延期 | 低 | 高 | 明确 MVP 边界，可裁剪功能 |
| AI 功能开发超预期 | 中 | 中 | 预留缓冲时间，可降级方案 |
| 测试覆盖不足 | 中 | 高 | 自动化测试，CI 门禁 |

---

## 六、成功指标

### 技术指标

- [ ] 测试覆盖率 > 80%
- [ ] CLI 启动时间 < 500ms
- [ ] 同步操作 < 5s (100 assets)
- [ ] 二进制大小 < 50MB

### 用户指标

- [ ] GitHub Stars > 100 (Month 1)
- [ ] 活跃用户 > 50 (Month 3)
- [ ] 社区 Plugin > 10 (Month 6)

### 生态指标

- [ ] 支持平台数 >= 4
- [ ] 支持资产类型 >= 5
- [ ] 官方 Plugin >= 3

---

## 七、依赖项跟踪

### 外部依赖

| 依赖 | 当前版本 | 目标版本 | 状态 | 备注 |
|------|---------|---------|------|------|
| isomorphic-git | 1.x | 1.x | ✅ | 核心依赖 |
| @anthropic-ai/sdk | 0.x | 0.x | ✅ | AI 集成 |
| commander | 12.x | 12.x | ✅ | CLI 框架 |
| zod | 3.x | 3.x | ✅ | 配置校验 |

### 平台依赖

| 平台 | 接口稳定性 | 适配优先级 | 状态 |
|------|-----------|-----------|------|
| Cursor | 高 | P0 | 开发中 |
| Open Code | 中 | P0 | 开发中 |
| Claude Code | 中 | P1 | 规划中 |
| Cloud Code | 低 | P2 | 待评估 |
| OpenClaw | 低 | P2 | 待评估 |

---

## 八、沟通计划

### 内部沟通

- **Daily Standup**: 核心团队每日 15 分钟
- **Weekly Review**: 每周五进度评审
- **Milestone Review**: 里程碑完成时复盘

### 外部沟通

- **Development Log**: 每周发布开发日志
- **Alpha/Beta 测试**: Milestone 2/4 时招募测试者
- **Community**: Discord/GitHub Discussions

---

**文档维护者**: Sisyphus  
**项目经理**: 待定  
**下次评审**: 每周五
