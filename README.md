# Houtu Project Skills

[中文](README-CN.md) | English

> A curated collection of skills, practices, and tooling used throughout the project lifecycle — from development to testing and beyond.

---

## 🌏 About Houtu

**Houtu (后土)** originates from Chinese mythology and traditional culture, particularly the concept of *“黄天后土”* — representing the vast sky and the nurturing earth.

Houtu, known as the **Earth Deity (后土娘娘)**, symbolizes:
- **Stability** — a solid and reliable foundation  
- **Support** — bearing and sustaining all things  
- **Nurturing** — enabling growth and evolution  

This project adopts the name *Houtu* to reflect its purpose:  
👉 to serve as a **strong, dependable foundation of engineering skills** that support the entire project lifecycle.

---

## 🎯 Purpose

This repository is designed to:

- 📦 Collect and organize **practical skills** used in real-world projects  
- 🔄 Support the **full project lifecycle**:
  - Development
  - Testing
  - Deployment
  - Maintenance
- 🧠 Accumulate **engineering knowledge and best practices**
- 🚀 Enable continuous **learning, iteration, and evolution**

---

## 🧩 What’s Inside

The repository will continuously evolve and may include:

### 🔧 Development
- Coding practices
- Design patterns
- Architecture principles
- Code quality & refactoring

### 🧪 Testing
- Unit testing
- Integration testing
- Test strategies & frameworks
- Automation

### ⚙️ Engineering Workflow
- Git workflows
- CI/CD practices
- Code review guidelines
- Project collaboration

### 📈 Project Evolution
- Iteration strategies
- Technical decision records
- Lessons learned
- Performance optimization

---

## 📚 Skills

| Skill | Description | Skill File |
|-------|-------------|-----------|
| [docs-context](skills/docs-context/) | Project development context loader & documentation synchronizer. Automatically loads project standards before coding for context correction, completion, and reconstruction, then syncs documentation after code changes. [Details [EN](skills/docs-context/README.md)/[中文](skills/docs-context/README-CN.md)] | [SKILL.md](skills/docs-context/SKILL.md) |
| [houtu-dependencies](skills/houtu-dependencies/) | Houtu enterprise Java framework usage guide. Helps select the correct module, annotation, and API for scenarios like session management, distributed locking, data encryption, gray routing, and more. [Details [EN](skills/houtu-dependencies/README.md)/[中文](skills/houtu-dependencies/README-CN.md)] | [SKILL.md](skills/houtu-dependencies/SKILL.md) |

---

## 📥 Installation

Two installation paths — pick whichever fits your workflow.

### Option A — Claude Code native plugin marketplace

Subscribe the repo as a marketplace, then install the individual skills you need.

```bash
/plugin marketplace add lujiafa/houtu-project-skills

# Install on demand
/plugin install docs-context@houtu-project-skills
/plugin install houtu-dependencies@houtu-project-skills

/reload-plugins
```

Plugin skills are namespaced as `/<plugin>:<skill>`, e.g. `/docs-context:docs-context`, `/houtu-dependencies:houtu-dependencies`.

### Option B — npx CLI (works across every supported tool)

Install skills via `npx`. Requires **Node.js >= 18** and **git**.

**List available skills:**

```bash
npx houtu-project-skills list [--version <version>]
```

**Install command:**

```bash
# Project-level
npx houtu-project-skills install <skill-name> --tool <tool-name> [--version <version>]

# Global
npx houtu-project-skills install <skill-name> --tool <tool-name> [--version <version>] --global
```

### [Claude Code](https://code.claude.com/)

```bash
# Project-level
npx houtu-project-skills install docs-context --tool claude

# Global
npx houtu-project-skills install docs-context --tool claude --global
```

### [Codex](https://codex.openai.com/)

```bash
# Project-level
npx houtu-project-skills install docs-context --tool codex

# Global
npx houtu-project-skills install docs-context --tool codex --global
```

### [OpenCode](https://opencode.ai/)

```bash
# Project-level
npx houtu-project-skills install docs-context --tool opencode

# Global
npx houtu-project-skills install docs-context --tool opencode --global
```

### [Antigravity](https://antigravity.google/)

```bash
# Project-level
npx houtu-project-skills install docs-context --tool antigravity

# Global
npx houtu-project-skills install docs-context --tool antigravity --global
```

### [Cursor](https://cursor.com/)

```bash
# Project-level
npx houtu-project-skills install docs-context --tool cursor

# Global
npx houtu-project-skills install docs-context --tool cursor --global
```

### [Trae](https://trae.ai/)

```bash
# Project-level
npx houtu-project-skills install docs-context --tool trae

# Global
npx houtu-project-skills install docs-context --tool trae --global
```

### [Qoder](https://qoder.com/)

```bash
# Project-level
npx houtu-project-skills install docs-context --tool qoder

# Global
npx houtu-project-skills install docs-context --tool qoder --global
```

---

## 🌱 Philosophy

> Build solid foundations. Enable continuous growth.

- Start from **practical skills**
- Focus on **real-world applicability**
- Evolve through **projects and iteration**
- Grow into a **systematic engineering knowledge base**

---

## 🚧 Status

This is a **growing repository**.  
Content will be continuously added, refined, and structured over time.

---

## 🤝 Contribution

Contributions are welcome!

If you have:
- Practical skills
- Engineering insights
- Lessons from real projects  

Feel free to:
- Open an issue
- Submit a pull request

---

## 📜 License

MIT License
