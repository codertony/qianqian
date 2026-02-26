# 乾乾项目 - 快速参考卡片

## 🚀 常用命令

```bash
# 开发
bun install                    # 安装依赖
bun run dev                    # 开发模式
bun run build                  # 构建
bun run test                   # 运行测试
bun run lint                   # 代码检查

# CLI（本地测试）
./dist/acl init                # 初始化
./dist/acl sync --target cursor    # 同步到 Cursor
./dist/acl status              # 查看状态
./dist/acl --version           # 查看版本
```

---

## 📁 项目结构速查

```
qianqian/
├── src/
│   ├── cli/commands/           # CLI 命令
│   ├── core/                   # 核心模块
│   │   ├── asset/              # 资产类型定义
│   │   ├── platform/           # 平台抽象
│   │   └── sync/               # 同步引擎
│   ├── adapters/               # 平台适配器
│   │   ├── cursor.ts
│   │   └── opencode.ts
│   ├── features/               # 功能模块
│   │   ├── ai/                 # AI Provider
│   │   ├── sandbox/            # 沙箱层（新增）
│   │   └── compatibility/      # 兼容性检查
│   └── shared/                 # 共享工具
├── docs/
│   ├── specs/                  # 规范文档
│   ├── roadmap/                # 路线图
│   ├── technical/              # 技术文档
│   └── tracking/               # 跟踪清单（你在看这里）
└── tests/                      # 测试文件
```

---

## 📋 关键决策速查

| 决策 | 选择 | 状态 |
|------|------|------|
| Git 库 | isomorphic-git | ✅ 确认 |
| Skill 执行 | 仅 Prompt（MVP） | ⏳ 待确认 |
| 平台支持 | Cursor + OpenCode | ⏳ 待确认 |
| 适配器工厂 | 硬编码 Map | ⏳ 待确认 |

---

## 🔴 当前阻塞

1. `createAdapter()` 返回 null
2. `acl sync` 仅有 TODO
3. 8/10 CLI 命令未实现

---

## 📞 快速链接

- [统一清单](docs/tracking/unified-checklist.md)
- [本周执行](docs/tracking/weekly-execution-week6.md)
- [技术架构 v2](docs/technical/architecture-v2.md)
- [路线图 v1.1](docs/roadmap/technical-roadmap-v1.1.md)

---

*打印此页，贴在显示器旁*