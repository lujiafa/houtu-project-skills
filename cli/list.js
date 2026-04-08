'use strict';

const https = require('https');

const API_URL = 'https://api.github.com/repos/lujiafa/houtu-project-skills/contents/skills';
const REPO_URL = 'https://github.com/lujiafa/houtu-project-skills';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'houtu-project-skills-cli' } }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid JSON response')); }
      });
    }).on('error', reject);
  });
}

async function list() {
  try {
    const entries = await fetchJson(API_URL);
    if (!Array.isArray(entries)) {
      throw new Error('Unexpected API response format');
    }
    const skills = entries
      .filter(e => e.type === 'dir')
      .map(e => e.name);

    if (skills.length === 0) {
      console.log('No skills found.');
      return;
    }
    console.log('Available skills:');
    for (const skill of skills) {
      console.log(`  - ${skill}`);
    }
  } catch {
    // Graceful degradation: print fallback URL and exit 0 (not a hard error)
    console.log(`Could not fetch skill list. Visit: ${REPO_URL}`);
  }
}

module.exports = { list };
