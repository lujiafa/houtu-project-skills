'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { resolveTargetPath } = require('./tools');

const REPO_URL = 'https://github.com/lujiafa/houtu-project-skills.git';

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

async function install(skill, toolName, isGlobal) {
  // 1. Check git is available
  try {
    execSync('git --version', { stdio: 'ignore' });
  } catch {
    console.log('git is required. Please install git first.');
    process.exit(1);
  }

  // 2. Resolve target path
  const targetPath = resolveTargetPath(toolName, skill, isGlobal, process.cwd(), os.homedir());

  // 3. Check if already installed
  if (fs.existsSync(targetPath)) {
    console.log(`Already installed at ${targetPath}. Remove it first to reinstall.`);
    process.exit(0);
  }

  // 4. Create unique temp directory
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'houtu-'));

  try {
    // 5. Sparse clone
    console.log(`Fetching skill "${skill}" from repository...`);
    execSync(
      `git clone --depth 1 --filter=blob:none --sparse "${REPO_URL}" "${tmpDir}"`,
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
    console.log(`Installed "${skill}" to ${targetPath}`);
  } catch (err) {
    if (err.stderr) {
      process.stderr.write(err.stderr);
    } else {
      console.error(err.message);
    }
    process.exit(1);
  } finally {
    // Always clean up temp dir
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

module.exports = { install };
