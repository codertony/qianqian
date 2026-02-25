# Skill: 代码审查助手

> **类型**: Skill  
> **版本**: 1.0.0  
> **标签**: code-review, quality

---

## 描述

自动化的代码审查助手，可以分析代码变更并提供改进建议。

## 权限声明

```json
{
  "permissions": {
    "filesystem": ["read"],
    "network": false,
    "shell": false
  }
}
```

## 功能

### 1. 静态分析
- ESLint 规则检查
- TypeScript 类型检查
- 代码复杂度分析

### 2. 最佳实践
- 设计模式检查
- 性能反模式检测
- 安全漏洞扫描

### 3. 输出格式
```markdown
## 代码审查报告

### 总体评分: 85/100

### 问题清单
1. **[ERROR]** 未处理的 Promise  rejection
   - 位置: `src/api.ts:42`
   - 建议: 添加 try/catch 或 .catch()

2. **[WARNING]** 函数过长（超过 50 行）
   - 位置: `src/utils.ts:15`
   - 建议: 拆分为更小的函数

### 改进建议
...
```

## 使用方式

```bash
# 审查当前变更
acl capture --name code-reviewer --type skill

# 审查指定文件
acl apply code-reviewer --target src/
```
