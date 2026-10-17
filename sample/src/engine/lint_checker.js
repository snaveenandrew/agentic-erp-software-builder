#!/usr/bin/env node

/**
 * Static Linter & Security Pattern Checker
 * Enforces ERP Software Factory quality gates:
 * 1. Prohibits wildcard security rules: `allow read, write: if true;`
 * 2. Checks UI components for the 5 mandatory states: loading, empty, error, unauthorized, default.
 * 3. Enforces valid JSON syntax in schema and index files.
 * 4. Prohibits hardcoded private API keys and tokens.
 */

const fs = require('fs');
const path = require('path');

function runLinter() {
  console.log('=====================================================');
  console.log('      Agentic ERP Software Factory Static Linter     ');
  console.log('=====================================================\n');

  let hasErrors = false;
  const rootDir = process.cwd();

  // 1. Check Security Rules
  const rulesCandidates = [
    path.join(rootDir, 'firebase', 'firestore.rules'),
    path.join(rootDir, 'sample', 'firebase', 'firestore.rules'),
    path.join(rootDir, 'firestore.rules')
  ];

  for (const rulesPath of rulesCandidates) {
    if (fs.existsSync(rulesPath)) {
      const content = fs.readFileSync(rulesPath, 'utf8');
      if (/allow\s+read,\s*write\s*:\s*if\s+true\s*;/i.test(content)) {
        console.error(`[CRITICAL] Wildcard rule detected in ${rulesPath}: "allow read, write: if true;" is forbidden!`);
        hasErrors = true;
      } else {
        console.log(`✓ Firestore Rules Validated: ${path.relative(rootDir, rulesPath)} (No wildcard bypass)`);
      }
    }
  }

  // 2. Check JSON Files
  const jsonCandidates = [
    path.join(rootDir, 'firebase', 'firestore.indexes.json'),
    path.join(rootDir, 'sample', 'firebase', 'firestore.indexes.json'),
    path.join(rootDir, 'firebase', 'seed_data.json'),
    path.join(rootDir, 'sample', 'firebase', 'seed_data.json'),
    path.join(rootDir, 'firestore.indexes.json')
  ];

  for (const jsonPath of jsonCandidates) {
    if (fs.existsSync(jsonPath)) {
      try {
        JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`✓ JSON Syntax Validated: ${path.relative(rootDir, jsonPath)}`);
      } catch (err) {
        console.error(`[ERROR] Invalid JSON in ${jsonPath}: ${err.message}`);
        hasErrors = true;
      }
    }
  }

  // 3. Check Mandatory 5 UI States in Frontend
  const frontendCandidates = [
    path.join(rootDir, 'public', 'index.html'),
    path.join(rootDir, 'public', 'app.js'),
    path.join(rootDir, 'sample', 'public', 'index.html'),
    path.join(rootDir, 'sample', 'public', 'app.js')
  ];

  const mandatoryStates = ['loading', 'empty', 'error', 'unauthorized', 'default'];
  for (const fePath of frontendCandidates) {
    if (fs.existsSync(fePath)) {
      const content = fs.readFileSync(fePath, 'utf8').toLowerCase();
      const missingStates = mandatoryStates.filter(state => !content.includes(state));
      if (missingStates.length > 0) {
        console.warn(`[WARNING] UI file ${path.relative(rootDir, fePath)} does not explicitly reference states: ${missingStates.join(', ')}`);
      } else {
        console.log(`✓ UI States Inventory Complete: ${path.relative(rootDir, fePath)} (All 5 mandatory states handled)`);
      }
    }
  }

  // 4. Check for Hardcoded Secrets
  const secretPatterns = [
    /-----BEGIN (RSA )?PRIVATE KEY-----/,
    /AIzaSy[A-Za-z0-9_-]{33}/,
    /ghp_[A-Za-z0-9]{36}/
  ];

  function scanForSecrets(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
          scanForSecrets(fullPath);
        }
      } else if (entry.isFile() && /\.(js|json|md|html|yml)$/.test(entry.name)) {
        const text = fs.readFileSync(fullPath, 'utf8');
        for (const pattern of secretPatterns) {
          if (pattern.test(text)) {
            console.error(`[CRITICAL] Potential hardcoded secret in ${path.relative(rootDir, fullPath)} matching ${pattern}`);
            hasErrors = true;
          }
        }
      }
    }
  }

  scanForSecrets(rootDir);

  console.log('\n-----------------------------------------------------');
  if (hasErrors) {
    console.error('[LINT FAILED] One or more safety or syntactic checks failed.');
    if (require.main === module) process.exit(1);
    return false;
  } else {
    console.log('[LINT PASSED] Static verification and safety gates cleared.');
    if (require.main === module) process.exit(0);
    return true;
  }
}

if (require.main === module) {
  runLinter();
}

module.exports = { runLinter };
