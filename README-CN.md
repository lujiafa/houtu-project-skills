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

| Skill | 描述 | Skill 文件 |
|-------|------|------|
| [docs-context](skills/docs-context/) | 项目开发上下文加载器与文档同步器。编码前自动加载项目规范，用于上下文修正、补全和重建，代码变更后同步更新文档。[详情 [EN](skills/docs-context/README.md)/[中文](skills/docs-context/README-CN.md)] | [SKILL.md](skills/docs-context/SKILL.md) |
| [houtu-dependencies](skills/houtu-dependencies/) | Houtu 企业级 Java 框架使用指南。根据场景（会话管理、分布式锁、数据加密、灰度路由等）选择正确的模块、注解和 API。[详情 [EN](skills/houtu-dependencies/README.md)/[中文](skills/houtu-dependencies/README-CN.md)] | [SKILL.md](skills/houtu-dependencies/SKILL.md) |

---

## 📥 安装

两种安装方式 —— 按需选择。

### 方式 A —— Claude Code 原生插件市场

订阅本仓库为插件市场，再按需安装你想要的 skill。

```bash
/plugin marketplace add lujiafa/houtu-project-skills

# 按需单装
/plugin install docs-context@houtu-project-skills
/plugin install houtu-dependencies@houtu-project-skills

/reload-plugins
```

插件内的 skill 带命名空间 `/<plugin>:<skill>`，例如 `/docs-context:docs-context`、`/houtu-dependencies:houtu-dependencies`。

### 方式 B —— npx CLI（覆盖所有受支持工具）

通过 `npx` 安装 Skills。需要 **Node.js >= 18** 和 **git**。

**查看可用 Skills：**

```bash
npx houtu-project-skills list [--version <version>]
```

**安装命令：**

```bash
# 项目级
npx houtu-project-skills install <skill-name> --tool <tool-name> [--version <version>]

# 全局
npx houtu-project-skills install <skill-name> --tool <tool-name> [--version <version>] --global
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
