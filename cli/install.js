'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { resolveTargetPath } = require('./tools');

const REPO_URL = 'https://github.com/lujiafa/houtu-project-skills.git';

/**
 * Prompt user for confirmation via stdin.
 */
function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

/**
 * Copy a directory recursively.
 */
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function install(skill, toolName, isGlobal, version) {
  // 1. Check git is available
  try {
    execSync('git --version', { stdio: 'ignore' });
  } catch {
    console.log('git is required. Please install git first.');
    process.exit(1);
  }

  // 2. Resolve target path
  const targetPath = resolveTargetPath(toolName, skill, isGlobal, process.cwd(), os.homedir());

  // 3. Check if already installed — ask user whether to reinstall
  if (fs.existsSync(targetPath)) {
    const answer = await confirm(
      `"${skill}" already exists at ${targetPath}.\nReinstall? This will remove the existing version. (y/N) `
    );
    if (answer !== 'y' && answer !== 'yes') {
      console.log('Skipped. Existing installation unchanged.');
      process.exit(0);
    }
    fs.rmSync(targetPath, { recursive: true, force: true });
    console.log(`Removed existing "${skill}".`);
  }

  // 4. Create unique temp directory
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'houtu-'));

  try {
    // 5. Sparse clone (with optional branch for version)
    const versionHint = version ? ` (version: ${version})` : '';
    console.log(`Fetching skill "${skill}"${versionHint} from repository...`);
    const branchArg = version ? `--branch "${version}"` : '';
    execSync(
      `git clone --depth 1 --filter=blob:none --sparse ${branchArg} "${REPO_URL}" "${tmpDir}"`,
      { stdio: ['ignore', 'inherit', 'pipe'] }
    );

    // 6. Sparse checkout the skill directory
    execSync(
      `git -C "${tmpDir}" sparse-checkout set --no-cone "skills/${skill}/**"`,
      { stdio: ['ignore', 'inherit', 'pipe'] }
    );

    // 7. Verify skill directory exists and is non-empty
    const skillSrc = path.join(tmpDir, 'skills', skill);
    if (!fs.existsSync(skillSrc) || fs.readdirSync(skillSrc).length === 0) {
      console.log(`Skill "${skill}" not found in repository.`);
      process.exit(1);
    }

    // 8. Copy to target
    copyDir(skillSrc, targetPath);

    // 9. Success
    const versionTag = version ? ` [${version}]` : '';
    console.log(`Installed "${skill}"${versionTag} to ${targetPath}`);
  } catch (err) {
    if (err.stderr) {
      process.stderr.write(err.stderr);
    } else {
      console.error(err.message);
    }
    console.error(`Failed to install "${skill}".`);
    process.exit(1);
  } finally {
    // Always clean up temp dir
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

module.exports = { install };
