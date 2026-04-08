#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Import after file exists
let tools;
try {
  tools = require('./tools');
} catch {
  console.error('cli/tools.js not found — implement it first');
  process.exit(1);
}

const { TOOLS, resolveTargetPath } = tools;
const HOME = os.homedir();
const CWD = process.cwd();

// Test: all expected tools are registered
const expectedTools = ['claude', 'codex', 'opencode', 'antigravity', 'cursor', 'trae', 'qoder'];
for (const name of expectedTools) {
  assert.ok(TOOLS[name], `Missing tool: ${name}`);
  assert.ok(TOOLS[name].project, `Missing project path for: ${name}`);
  assert.ok(TOOLS[name].global, `Missing global path for: ${name}`);
}

// Test: project-level path resolution
assert.strictEqual(
  resolveTargetPath('claude', 'docs-context', false, CWD, HOME),
  path.join(CWD, '.claude', 'skills', 'docs-context')
);

// Test: global path resolution for claude
assert.strictEqual(
  resolveTargetPath('claude', 'docs-context', true, CWD, HOME),
  path.join(HOME, '.claude', 'skills', 'docs-context')
);

// Test: opencode global uses ~/.config/opencode/skills/
assert.strictEqual(
  resolveTargetPath('opencode', 'docs-context', true, CWD, HOME),
  path.join(HOME, '.config', 'opencode', 'skills', 'docs-context')
);

// Test: antigravity global uses ~/.gemini/antigravity/skills/
assert.strictEqual(
  resolveTargetPath('antigravity', 'docs-context', true, CWD, HOME),
  path.join(HOME, '.gemini', 'antigravity', 'skills', 'docs-context')
);

console.log('tools tests: all passed');
