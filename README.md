# Houtu Project Skills

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

| Skill | Description | Languages |
|-------|-------------|-----------|
| [docs-context](skills/docs-context/) | Project development context loader & documentation synchronizer. Automatically loads project standards before coding and syncs documentation after code changes. | [EN](skills/docs-context/SKILL.md) / [中文](skills/docs-context/SKILL-CN.md) |

### docs-context

A two-mode skill for managing project documentation throughout the development lifecycle:

- **Read Mode** — Triggered before coding (design, implementation, bug fix, etc.). Loads relevant project docs (`architecture.md`, `tech-stack.md`, `coding.md`, `modules.md`, `decisions.md`) based on task type, ensuring correct context awareness.
- **Write Mode** — Triggered after coding (pre-commit, feature complete, etc.). Checks code changes against a sync checklist and updates affected documentation to keep docs in sync with code.

Includes templates for initializing missing documentation under `docs/`.

---

## 📥 Installation

Install skills via `npx` — no global install needed. Requires **Node.js >= 18** and **git**.

**List available skills:**

```bash
npx houtu-project-skills list
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
