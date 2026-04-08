'use strict';

const path = require('path');

const TOOLS = {
  claude:      { project: '.claude/skills',              global: '.claude/skills' },
  codex:       { project: '.agents/skills',              global: '.agents/skills' },
  opencode:    { project: '.opencode/skills',            global: '.config/opencode/skills' },
  antigravity: { project: '.agent/skills',               global: '.gemini/antigravity/skills' },
  cursor:      { project: '.cursor/skills',              global: '.cursor/skills' },
  trae:        { project: '.trae/skills',                global: '.trae/skills' },
  qoder:       { project: '.qoder/skills',               global: '.qoder/skills' },
};

/**
 * Resolve the absolute target path for a skill installation.
 * @param {string} toolName  - key from TOOLS
 * @param {string} skill     - skill directory name
 * @param {boolean} isGlobal - true = global install, false = project install
 * @param {string} cwd       - current working directory (for project installs)
 * @param {string} home      - user home directory (for global installs)
 * @returns {string} absolute path
 */
function resolveTargetPath(toolName, skill, isGlobal, cwd, home) {
  const tool = TOOLS[toolName];
  const base = isGlobal ? home : cwd;
  const relDir = isGlobal ? tool.global : tool.project;
  return path.join(base, relDir, skill);
}

module.exports = { TOOLS, resolveTargetPath };
