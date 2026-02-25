# Phase 3: Full Version - 详细研发计划

> **阶段**: Phase 3 - Full Version  
> **周期**: Week 11-20 (10 周)  
> **目标**: 完整 Plugin 生态与生产就绪  
> **前置条件**: Phase 2 完成  
> **负责人**: 待定

---

## 一、阶段细分

Phase 3 分为三个子阶段：
- **Phase 3a** (Week 11-13): Plugin 与 Flow 支持
- **Phase 3b** (Week 14-16): 多平台兼容性与生态
- **Phase 3c** (Week 17-20): 优化、测试与发布

---

## 二、Phase 3a: Plugin 与 Flow (Week 11-13)

### Week 11: Plugin 系统设计
**目标**: Plugin 框架就绪

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P3-W11-T1 | 设计 Plugin 架构 | P0 | 8h | - | - |
| P3-W11-T2 | 定义 Plugin Manifest Schema | P0 | 4h | - | T1 |
| P3-W11-T3 | 实现 Plugin 加载器 | P0 | 8h | - | T2 |
| P3-W11-T4 | 实现 Plugin 依赖解析 | P1 | 6h | - | T3 |
| P3-W11-T5 | 实现 `acl plugin install` | P0 | 6h | - | T3 |
| P3-W11-T6 | 实现 `acl plugin uninstall` | P1 | 3h | - | T5 |
| P3-W11-T7 | 实现 `acl plugin list` | P1 | 3h | - | T3 |
| P3-W11-T8 | 编写 Plugin 测试 | P1 | 4h | - | T3-6 |

**Week 11 里程碑**:
```bash
$ acl plugin list
Installed plugins:
  ✓ full-stack-dev v2.1.0
  ✓ cloud-native-kit v1.5.0

$ acl plugin install mobile-dev
✓ Resolved dependencies
✓ Installed mobile-dev v1.0.0
[!] 2 skills not compatible with current platform
```

### Week 12: Flow 支持 + Smart Ingester
**目标**: Flow 资产可用，外部市场抓取上线

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P3-W12-T1 | 设计 Flow Schema | P0 | 6h | - | - |
| P3-W12-T2 | 实现 Flow 引擎 (基础) | P0 | 10h | - | T1 |
| P3-W12-T3 | 更新适配器支持 Flow | P0 | 8h | - | T1, P1-W6 |
| P3-W12-T4 | 设计 Market Connector | P0 | 4h | - | - |
| P3-W12-T5 | 实现 GitHub 市场抓取 | P0 | 6h | - | T4 |
| P3-W12-T6 | 实现 ClawHub 市场抓取 | P1 | 8h | - | T4 |
| P3-W12-T7 | 实现 `acl fetch` | P0 | 6h | - | T5-6 |
| P3-W12-T8 | 编写 Flow 和 Market 测试 | P1 | 4h | - | T2-3, T5-6 |

**Week 12 里程碑**:
```bash
$ acl fetch https://github.com/user/awesome-skill
✓ Fetched from GitHub
✓ Analyzed compatibility
✓ Converted to ACL format
? Import to repository? [Y/n]

$ acl sync --target opencode
✓ Applied flow: ci-cd-automation
  - 5 nodes
  - 8 edges
  - 2 triggers
```

### Week 13: MCP Config + 兼容性系统
**目标**: 完整 MCP 支持，兼容性检查器上线

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P3-W13-T1 | 设计 MCP Config Schema | P0 | 4h | - | - |
| P3-W13-T2 | 实现 MCP Config 管理 | P0 | 6h | - | T1 |
| P3-W13-T3 | 实现敏感信息隔离 (.env.template) | P0 | 6h | - | T2 |
| P3-W13-T4 | 设计兼容性矩阵 Schema | P0 | 4h | - | - |
| P3-W13-T5 | 实现兼容性检查器 | P0 | 10h | - | T4, P1-W6 |
| P3-W13-T6 | 实现运行时兼容性报告 | P1 | 6h | - | T5 |
| P3-W13-T7 | 实现自动兼容性打标 (AI) | P1 | 8h | - | P2-W7, T5 |
| P3-W13-T8 | 编写 MCP 和兼容性测试 | P1 | 4h | - | T2-3, T5-6 |

**Phase 3a 里程碑**:
```bash
$ acl sync --plugin full-stack
Compatibility Report:
  ✓ Frontend Agent (all platforms)
  ✓ Backend Agent (cursor, opencode)
  ⚠ DevOps Agent (local only)
  ✓ Database Skill (all platforms)

[!] DevOps Agent skipped (incompatible with Cloud Code)
Applied: 3/4 assets
```

---

## 三、Phase 3b: 多平台与生态 (Week 14-16)

### Week 14: 新平台适配器
**目标**: Claude Code + 更多平台支持

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P3-W14-T1 | 调研 Claude Code 格式 | P0 | 4h | - | - |
| P3-W14-T2 | 实现 Claude Code 适配器 | P0 | 10h | - | T1, P1-W6 |
| P3-W14-T3 | 调研 Cloud Code 格式 | P1 | 4h | - | - |
| P3-W14-T4 | 实现 Cloud Code 适配器 | P1 | 8h | - | T3, P1-W6 |
| P3-W14-T5 | 实现适配器版本管理 | P1 | 6h | - | P1-W6 |
| P3-W14-T6 | 更新平台检测逻辑 | P1 | 4h | - | T2, T4 |
| P3-W14-T7 | 编写新适配器测试 | P1 | 4h | - | T2, T4 |

**Week 14 里程碑**:
```bash
✓ Claude Code 适配器可用
✓ Cloud Code 适配器可用
✓ 支持平台: 4 个
```

### Week 15: 版本降级 + 状态同步
**目标**: 高级兼容性特性

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P3-W15-T1 | 实现版本检测 | P0 | 6h | - | - |
| P3-W15-T2 | 实现版本降级策略 | P1 | 8h | - | T1 |
| P3-W15-T3 | 设计 Session 状态同步 | P1 | 4h | - | - |
| P3-W15-T4 | 实现 MCP Session 共享 | P2 | 10h | - | T3 |
| P3-W15-T5 | 实现资产版本锁定 | P1 | 6h | - | P1-W5 |
| P3-W15-T6 | 更新 sync 支持版本参数 | P1 | 4h | - | T2, T5 |
| P3-W15-T7 | 编写版本管理测试 | P1 | 4h | - | T1-2, T5 |

**Week 15 里程碑**:
```bash
$ acl sync --target cursor --version 1.2.0
✓ Synced to version 1.2.0
[!] 3 assets downgraded for compatibility
```

### Week 16: 安全增强 + 性能优化
**目标**: 生产级安全和性能

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P3-W16-T1 | 实现敏感信息扫描 | P0 | 8h | - | - |
| P3-W16-T2 | 实现自动 .gitignore 更新 | P1 | 4h | - | T1 |
| P3-W16-T3 | 实现提交前检查 | P1 | 6h | - | T1 |
| P3-W16-T4 | 优化大仓库性能 | P0 | 10h | - | - |
| P3-W16-T5 | 实现增量同步缓存 | P0 | 8h | - | T4 |
| P3-W16-T6 | 实现并行下载 | P1 | 6h | - | T4 |
| P3-W16-T7 | 性能基准测试 | P1 | 4h | - | T4-6 |
| P3-W16-T8 | 编写安全和性能测试 | P1 | 4h | - | T1-3, T4-6 |

**Phase 3b 里程碑**:
```bash
$ acl push
✓ Pre-push checks passed
✓ No secrets detected
✓ All tests passed
Pushed to origin/main

Performance Benchmark:
  Sync 100 assets: 2.3s (target: < 5s) ✓
  Memory usage: 45MB (target: < 100MB) ✓
```

---

## 四、Phase 3c: 发布准备 (Week 17-20)

### Week 17: 测试完善
**目标**: 测试覆盖率达 80%+

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P3-W17-T1 | 编写缺失单元测试 | P0 | 12h | - | - |
| P3-W17-T2 | 编写 E2E 测试 | P0 | 12h | - | T1 |
| P3-W17-T3 | 设置跨平台 CI | P0 | 8h | - | - |
| P3-W17-T4 | 性能压力测试 | P1 | 6h | - | - |
| P3-W17-T5 | Bug 修复 | P0 | 10h | - | T1-4 |
| P3-W17-T6 | 测试覆盖率报告 | P1 | 2h | - | T1-2 |

**Week 17 里程碑**:
```bash
✓ 测试覆盖率: 82%
✓ E2E 测试: 15 个场景
✓ CI 通过: macOS/Linux/Windows
```

### Week 18: 文档完善
**目标**: 完整文档体系

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P3-W18-T1 | 编写用户指南 | P0 | 12h | - | - |
| P3-W18-T2 | 编写 API 参考 | P0 | 10h | - | - |
| P3-W18-T3 | 编写配置参考 | P0 | 8h | - | - |
| P3-W18-T4 | 编写 Plugin 开发指南 | P1 | 10h | - | P3-W11 |
| P3-W18-T5 | 编写适配器开发指南 | P1 | 6h | - | P1-W6 |
| P3-W18-T6 | 制作示例和模板 | P1 | 6h | - | - |
| P3-W18-T7 | 编写 FAQ | P1 | 4h | - | - |
| P3-W18-T8 | 文档网站搭建 | P2 | 8h | - | T1-5 |

**Week 18 里程碑**:
```bash
✓ 用户指南完成
✓ API 参考完成
✓ Plugin 开发指南完成
```

### Week 19: 构建与分发
**目标**: 可分发版本

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P3-W19-T1 | 配置二进制构建 | P0 | 6h | - | - |
| P3-W19-T2 | 构建 macOS 二进制 | P0 | 4h | - | T1 |
| P3-W19-T3 | 构建 Linux 二进制 | P0 | 4h | - | T1 |
| P3-W19-T4 | 构建 Windows 二进制 | P0 | 4h | - | T1 |
| P3-W19-T5 | 签名配置 | P1 | 6h | - | T2-4 |
| P3-W19-T6 | 发布工作流 (GitHub Actions) | P0 | 8h | - | T1 |
| P3-W19-T7 | Homebrew 配方 | P1 | 4h | - | T2 |
| P3-W19-T8 | npm 发布配置 | P1 | 4h | - | - |

**Week 19 里程碑**:
```bash
✓ 二进制构建: macOS-arm64/x64, Linux-arm64/x64, Windows-x64
✓ GitHub Release 工作流
✓ npm install -g qianqian 可用
```

### Week 20: 发布与社区
**目标**: 正式发布，社区启动

| 任务 ID | 任务名称 | 优先级 | 估时 | 负责人 | 依赖 |
|---------|---------|--------|------|--------|------|
| P3-W20-T1 | 发布候选版本 (RC) | P0 | 2h | - | P3-W19 |
| P3-W20-T2 | Beta 测试 | P0 | 12h | - | T1 |
| P3-W20-T3 | Bug 修复 (RC) | P0 | 8h | - | T2 |
| P3-W20-T4 | 正式发布 v1.0.0 | P0 | 2h | - | T3 |
| P3-W20-T5 | 发布公告和博客 | P0 | 6h | - | T4 |
| P3-W20-T6 | 社区 Discord 启动 | P1 | 2h | - | T4 |
| P3-W20-T7 | 示例仓库发布 | P1 | 4h | - | T4 |
| P3-W20-T8 | 项目复盘 | P1 | 2h | - | T4 |

**Phase 3c / 项目 最终里程碑**:
```bash
🎉 QianQian v1.0.0 Released!

Features:
  ✓ 5 资产类型 (Prompt, Skill, Agent, Flow, MCP)
  ✓ 4 平台适配 (Cursor, Open Code, Claude, Cloud Code)
  ✓ Plugin 系统
  ✓ AI 辅助提取
  ✓ 智能冲突解决
  ✓ 兼容性矩阵

Downloads:
  npm: npm install -g qianqian
  Binary: https://github.com/user/qianqian/releases

Community:
  Discord: https://discord.gg/qianqian
  Docs: https://qianqian.dev
```

---

## 五、技术决策点

### Phase 3a
- **决策 1**: Plugin 依赖解析算法
  - 截止时间: Week 11 Day 2
  
- **决策 2**: Flow 执行引擎范围
  - 确定是仅描述还是支持执行
  - 截止时间: Week 12 Day 1

- **决策 3**: 兼容性矩阵粒度
  - 确定检查级别 (Plugin/Agent/Skill/功能)
  - 截止时间: Week 13 Day 2

### Phase 3b
- **决策 4**: Cloud Code 适配器优先级
  - 评估是否延后到 Post-v1
  - 截止时间: Week 14 Day 1

- **决策 5**: Session 状态同步实现
  - 确定 MVP 是否包含
  - 截止时间: Week 15 Day 2

### Phase 3c
- **决策 6**: 发布标准
  - 定义 v1.0.0 的最低要求
  - 截止时间: Week 17 Day 3

---

## 六、风险缓解

### 技术风险

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|---------|
| Plugin 系统复杂度 | 高 | 高 | 参考 npm/yarn，先简化 |
| Flow 引擎范围蔓延 | 中 | 高 | 明确边界，先用描述性格式 |
| 平台适配器维护 | 高 | 中 | 社区驱动，核心维护 2-3 个 |
| 版本降级逻辑复杂 | 中 | 中 | 先用简单规则，逐步增强 |

### 进度风险

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|---------|
| Phase 3a 功能过多 | 高 | 高 | MCP 可延后，Flow 可简化 |
| 测试覆盖率难达标 | 中 | 中 | 核心流程优先，边缘功能可延后 |
| 文档工作量超预期 | 中 | 中 | 先用 Markdown，网站可延后 |

---

## 七、交付标准

### 功能验收

- [ ] Plugin 安装/卸载/列表可用
- [ ] Flow 资产可同步到支持的平台
- [ ] 外部市场抓取 (GitHub/ClawHub) 可用
- [ ] 兼容性检查器自动生成报告
- [ ] Claude Code 适配器可用
- [ ] 敏感信息自动检测
- [ ] 版本降级可用
- [ ] 二进制分发就绪

### 代码质量

- [ ] 测试覆盖率 > 80%
- [ ] E2E 测试覆盖核心场景
- [ ] 性能测试通过
- [ ] 安全审计通过

### 文档

- [ ] 完整用户指南
- [ ] API 参考文档
- [ ] Plugin 开发指南
- [ ] 适配器开发指南
- [ ] 示例仓库

### 社区

- [ ] Discord 服务器
- [ ] GitHub Discussions
- [ ] 示例 Plugin 3+
- [ ] 博客文章 2+

---

## 八、可延后功能 (若进度紧张)

### 可移到 v1.1
- [ ] Session 状态同步
- [ ] 自动兼容性打标 (AI)
- [ ] 文档网站
- [ ] Homebrew 配方
- [ ] Cloud Code 适配器

### 可移到 v2.0
- [ ] Flow 执行引擎
- [ ] 图形化界面
- [ ] 市场托管服务
- [ ] 团队协作功能

---

## 九、成功指标

### 技术指标
- [ ] 测试覆盖率 >= 80%
- [ ] CLI 启动时间 < 500ms
- [ ] 同步 100 assets < 3s
- [ ] 二进制大小 < 50MB

### 用户指标 (发布后 1 个月)
- [ ] GitHub Stars >= 100
- [ ] npm 周下载 >= 500
- [ ] 活跃 Issue < 20
- [ ] Discord 成员 >= 50

### 生态指标 (发布后 3 个月)
- [ ] 社区 Plugin >= 10
- [ ] 第三方适配器 >= 2
- [ ] 博客/教程 >= 5

---

**阶段负责人**: 待定  
**开始日期**: Phase 2 结束后  
**目标发布日期**: 待定  
**状态**: 规划中
