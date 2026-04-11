#!/usr/bin/env node
'use strict';

const { TOOLS } = require('./tools');

const USAGE = `
Usage:
  npx houtu-project-skills install <skill> --tool <tool> [--version <version>] [--global]
  npx houtu-project-skills list [--version <version>]

Commands:
  install   Install a skill into an AI coding tool's skills directory
  list      List available skills in the repository

Options:
  --tool      Target AI tool (required for install)
  --version   Install from a specific branch/version (default: main branch)
  --global    Install globally instead of project-level

Supported tools: ${Object.keys(TOOLS).join(', ')}
`.trim();

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0] || null;
  const isGlobal = args.includes('--global');
  const toolIdx = args.indexOf('--tool');
  const tool = (toolIdx !== -1 && toolIdx + 1 < args.length) ? args[toolIdx + 1] : null;
  const versionIdx = args.indexOf('--version');
  const version = (versionIdx !== -1 && versionIdx + 1 < args.length) ? args[versionIdx + 1] : null;
  // positional args: everything that is not a flag, not the command, not the --tool/--version value
  const flagValues = new Set([command, tool, version]);
  const positionals = args.filter(a => !a.startsWith('--') && !flagValues.has(a));
  const skill = positionals[0] || null;
  return { command, skill, tool, isGlobal, version };
}

async function main() {
  const { command, skill, tool, isGlobal, version } = parseArgs(process.argv);

  if (!command) {
    console.log(USAGE);
    process.exit(1);
  }

  if (command === 'list') {
    const { list } = require('./list');
    await list(version);
    return;
  }

  if (command === 'install') {
    if (!skill || !tool) {
      console.log(USAGE);
      process.exit(1);
    }
    if (!TOOLS[tool]) {
      console.log(`Unknown tool: "${tool}"\nSupported tools: ${Object.keys(TOOLS).join(', ')}`);
      process.exit(1);
    }
    const { install } = require('./install');
    await install(skill, tool, isGlobal, version);
    return;
  }

  console.log(`Unknown command: "${command}"\n\n${USAGE}`);
  process.exit(1);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
