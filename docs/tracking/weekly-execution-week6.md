# 本周执行清单（Week 6）

> **日期**: 2026-02-26 ~ 2026-03-05  
> **目标**: 打通核心同步流程，完成 MVP 演示准备  
> **状态**: 执行中

---

## 🔴 本周必须完成（P0）

### 1. Git 存储引擎迁移

| 任务 | 估时 | 状态 | 关键产出 |
|------|------|------|---------|
| 迁移到 isomorphic-git | 4h | ⏳ 待开始 | `src/core/sync/git-sync-engine.ts` 更新 |
| 实现浅克隆支持 | 2h | ⏳ 待开始 | `--depth 1` 参数支持 |
| 验证认证流程 | 2h | ⏳ 待开始 | GitHub Token 认证测试通过 |

**验收标准**:
```bash
$ acl pull
✓ Using isomorphic-git
✓ Shallow clone (--depth 1)
✓ Authenticated with GitHub
✓ Fetched 15 assets from remote
```

---

### 2. 适配器工厂实现

| 任务 | 估时 | 状态 | 关键产出 |
|------|------|------|---------|
| 实现 `createAdapter()` 硬编码 Map | 3h | ⏳ 待开始 | `src/core/platform/index.ts` 更新 |
| 修复类型定义 | 1h | ⏳ 待开始 | 无类型错误 |
| 编写基础测试 | 2h | ⏳ 待开始 | 适配器实例化测试 |

**验收标准**:
```typescript
const adapter = createAdapter('cursor');
assert(adapter instanceof CursorAdapter);
assert(adapter.name === 'cursor');
```

---

### 3. `acl sync` 命令实现

| 任务 | 估时 | 状态 | 关键产出 |
|------|------|------|---------|
| 实现 sync 核心逻辑 | 6h | ⏳ 待开始 | `src/cli/commands/sync.ts` 完整实现 |
| 集成适配器转换 | 2h | ⏳ 待开始 | 资产 → 平台配置转换 |
| 错误处理和日志 | 2h | ⏳ 待开始 | 用户友好错误提示 |

**验收标准**:
```bash
$ acl sync --target cursor
✓ Detected Cursor environment
✓ Connected to GitHub
✓ Fetched 3 prompts from remote
✓ Applied to .cursor/rules/
  + frontend-expert.mdc
  + backend-architect.mdc
Sync complete: 3/3 assets applied
```

---

### 4. 辅助命令实现

| 任务 | 估时 | 状态 | 关键产出 |
|------|------|------|---------|
| `acl pull` | 4h | ⏳ 待开始 | 拉取远程更新 |
| `acl status` | 4h | ⏳ 待开始 | 显示同步状态 |

---

## 🟡 本周尽力完成（P1）

### 5. Cursor Team Rules 支持

| 任务 | 估时 | 状态 | 说明 |
|------|------|------|------|
| 支持 .cursor/team/ 目录 | 2h | ⏳ 待开始 | DeepResearch 要求 |

### 6. SandboxManager 接口设计

| 任务 | 估时 | 状态 | 说明 |
|------|------|------|------|
| 定义隔离级别枚举 | 1h | ⏳ 待开始 | 为 Phase 2 沙箱做准备 |
| 设计管理器接口 | 2h | ⏳ 待开始 | 预留扩展点 |

---

## 📊 时间估算

```
P0 任务总计: 4+4+8+8 = 24h
P1 任务总计: 2+3 = 5h
─────────────────────
本周总计: 29h (~6天，按每天5h计算)
```

---

## ✅ 每日检查清单

### 开始工作前
- [ ] 查看昨日未完成任务
- [ ] 确认今日优先级
- [ ] 检查是否有阻塞项

### 结束工作前
- [ ] 更新任务状态
- [ ] 记录遇到的问题
- [ ] 提交代码（即使未完成）

---

## 🎯 MVP 演示标准

本周五需达到：
```bash
# 必须可用
✓ acl init          # 已可用
✓ acl sync          # 本周完成
✓ acl pull          # 本周完成
✓ acl status        # 本周完成

# 演示场景
1. 用户运行 acl init 配置仓库
2. 用户运行 acl sync --target cursor
3. 系统从 GitHub 拉取资产
4. 系统转换为 .mdc 格式
5. 系统应用到 .cursor/rules/
6. 用户打开 Cursor，规则已生效
```

---

## 🐛 已知阻塞

| 问题 | 影响 | 解决方案 | 状态 |
|------|------|---------|------|
| `createAdapter()` 返回 null | 无法实例化适配器 | 实现硬编码 Map | ⏳ 待解决 |
| simple-git 限制 | 无浅克隆支持 | 迁移 isomorphic-git | ⏳ 待解决 |

---

**更新频率**: 每日  
**维护者**: Sisyphus  
**最后更新**: 2026-02-26