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

Install a skill into your AI coding tool using `npx` — no global install needed:

```bash
# Project-level (default)
npx houtu-project-skills install <skill> --tool <tool>

# Global
npx houtu-project-skills install <skill> --tool <tool> --global
```

**Example — install `docs-context` for Claude Code:**

```bash
npx houtu-project-skills install docs-context --tool claude
```

**List available skills:**

```bash
npx houtu-project-skills list
```

### Supported Tools

| `--tool` value | Project path | Global path |
| :--- | :--- | :--- |
| `claude` | `.claude/skills/` | `~/.claude/skills/` |
| `codex` | `.agents/skills/` | `~/.agents/skills/` |
| `opencode` | `.opencode/skills/` | `~/.config/opencode/skills/` |
| `antigravity` | `.agent/skills/` | `~/.gemini/antigravity/skills/` |
| `cursor` | `.cursor/skills/` | `~/.cursor/skills/` |
| `trae` | `.trae/skills/` | `~/.trae/skills/` |
| `qoder` | `.qoder/skills/` | `~/.qoder/skills/` |

> **Requires:** Node.js >= 18 and git installed on your system.

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
