# Houtu Project Skills

中文 | [English](README.md)

> 贯穿项目全生命周期的 Skills 集合 — 从开发到测试，持续演进。

---

## 🌏 关于后土

**后土（Houtu）** 源自中国神话与传统文化中"黄天后土"的概念 — 象征广袤的天空与滋养万物的大地。

后土，即**后土娘娘**，象征着：
- **稳定** — 坚实可靠的基础
- **承载** — 承托与支撑万物
- **孕育** — 催生成长与进化

本项目以"后土"命名，寓意：
👉 打造一个**坚实可靠的工程技能基座**，支撑项目全生命周期。

---

## 🎯 目标

本仓库旨在：

- 📦 收集和整理**实战技能**
- 🔄 覆盖**项目全生命周期**：
  - 开发
  - 测试
  - 部署
  - 运维
- 🧠 沉淀**工程知识与最佳实践**
- 🚀 推动持续**学习、迭代与演进**

---

## 🧩 内容概览

本仓库将持续演进，可能包含：

### 🔧 开发
- 编码实践
- 设计模式
- 架构原则
- 代码质量与重构

### 🧪 测试
- 单元测试
- 集成测试
- 测试策略与框架
- 自动化

### ⚙️ 工程流程
- Git 工作流
- CI/CD 实践
- 代码评审规范
- 项目协作

### 📈 项目演进
- 迭代策略
- 技术决策记录
- 经验教训
- 性能优化

---

## 📚 Skills

| Skill | 描述 | 语言 |
|-------|------|------|
| [docs-context](skills/docs-context/) | 项目开发上下文加载器与文档同步器。编码前自动加载项目规范，代码变更后同步更新文档。 | [EN](skills/docs-context/SKILL.md) / [中文](skills/docs-context/SKILL-CN.md) |

### docs-context

一个双模式 Skill，用于在开发全周期中管理项目文档：

- **读取模式** — 在编码前触发（设计、实现、修复等）。根据任务类型加载相关项目文档（`architecture.md`、`tech-stack.md`、`coding.md`、`modules.md`、`decisions.md`），确保正确的上下文感知。
- **写入模式** — 在编码后触发（提交前、功能完成等）。对照同步检查清单检查代码变更，更新受影响的文档，保持文档与代码同步。

包含在 `docs/` 目录下文档缺失时，初始化缺失文档的模板。

---

## 📥 安装

通过 `npx` 安装 Skills。需要 **Node.js >= 18** 和 **git**。

**查看可用 Skills：**

```bash
npx houtu-project-skills list
```

### [Claude Code](https://code.claude.com/)

```bash
# 项目级
npx houtu-project-skills install docs-context --tool claude

# 全局
npx houtu-project-skills install docs-context --tool claude --global
```

### [Codex](https://codex.openai.com/)

```bash
# 项目级
npx houtu-project-skills install docs-context --tool codex

# 全局
npx houtu-project-skills install docs-context --tool codex --global
```

### [OpenCode](https://opencode.ai/)

```bash
# 项目级
npx houtu-project-skills install docs-context --tool opencode

# 全局
npx houtu-project-skills install docs-context --tool opencode --global
```

### [Antigravity](https://antigravity.google/)

```bash
# 项目级
npx houtu-project-skills install docs-context --tool antigravity

# 全局
npx houtu-project-skills install docs-context --tool antigravity --global
```

### [Cursor](https://cursor.com/)

```bash
# 项目级
npx houtu-project-skills install docs-context --tool cursor

# 全局
npx houtu-project-skills install docs-context --tool cursor --global
```

### [Trae](https://trae.ai/)

```bash
# 项目级
npx houtu-project-skills install docs-context --tool trae

# 全局
npx houtu-project-skills install docs-context --tool trae --global
```

### [Qoder](https://qoder.com/)

```bash
# 项目级
npx houtu-project-skills install docs-context --tool qoder

# 全局
npx houtu-project-skills install docs-context --tool qoder --global
```

---

## 🌱 理念

> 筑牢根基，持续生长。

- 从**实战技能**出发
- 注重**实际可用性**
- 在**项目与迭代**中演进
- 成长为**系统化的工程知识库**

---

## 🚧 状态

这是一个**持续成长的仓库**。
内容将不断补充、优化和结构化。

---

## 🤝 贡献

欢迎贡献！

如果你有：
- 实战技能
- 工程洞见
- 真实项目中的经验教训

欢迎：
- 提 Issue
- 提交 Pull Request

---

## 📜 许可证

MIT License
