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

// Arg-parsing tests — invoke cli.js as subprocess
const { execSync, spawnSync } = require('child_process');
const cliPath = path.join(__dirname, 'cli.js');

function runCli(args) {
  return spawnSync('node', [cliPath, ...args], { encoding: 'utf8' });
}

// Test: no args prints usage and exits 1
{
  const r = runCli([]);
  assert.strictEqual(r.status, 1, 'no args should exit 1');
  assert.ok(r.stdout.includes('Usage:'), 'no args should print usage');
}

// Test: unknown command exits 1
{
  const r = runCli(['unknown']);
  assert.strictEqual(r.status, 1, 'unknown command should exit 1');
}

// Test: install missing skill exits 1
{
  const r = runCli(['install', '--tool', 'claude']);
  assert.strictEqual(r.status, 1, 'missing skill should exit 1');
  assert.ok(r.stdout.includes('Usage:'), 'missing skill should print usage');
}

// Test: install missing --tool exits 1
{
  const r = runCli(['install', 'docs-context']);
  assert.strictEqual(r.status, 1, 'missing --tool should exit 1');
  assert.ok(r.stdout.includes('Usage:'), 'missing --tool should print usage');
}

// Test: install unknown tool exits 1
{
  const r = runCli(['install', 'docs-context', '--tool', 'unknowntool']);
  assert.strictEqual(r.status, 1, 'unknown tool should exit 1');
  assert.ok(r.stdout.includes('Supported tools:'), 'should list supported tools');
}

console.log('args tests: all passed');

// Install validation tests (subprocess, no network needed)
// Test: install with valid args passes arg validation (does not print Usage)
{
  const r = runCli(['install', 'docs-context', '--tool', 'claude']);
  assert.ok(!r.stdout.includes('Usage:'), 'valid args should not print usage');
}

console.log('install validation tests: all passed');
