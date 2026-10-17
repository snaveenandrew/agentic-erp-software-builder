#!/usr/bin/env node

/**
 * Agentic ERP Software Builder CLI
 * 
 * Command-line interface for the autonomous multi-agent software factory.
 * Orchestrates vertical slice discovery, scaffolding, AST linting, ASD-STE100 auditing,
 * and mathematical goal-and-reward scoring.
 */

const fs = require('fs');
const path = require('path');
const { ScoringEvaluator } = require('../sample/src/engine/scoring_evaluator');
const { auditText, scanDirectory } = require('../sample/src/engine/ste100_auditor');
const { runLinter } = require('../sample/src/engine/lint_checker');

const args = process.argv.slice(2);
const command = args[0] || 'help';

function printBanner() {
  console.log('======================================================================');
  console.log('          ⚡ Agentic ERP Software Builder — Factory Engine ⚡          ');
  console.log('======================================================================');
}

function printUsage() {
  printBanner();
  console.log(`
Usage:
  agentic-erp <command> [options]

Commands:
  build [dir]       Execute full factory build & verification gate on an ERP slice
  score [dir]       Calculate the mathematical Goal-and-Reward score S for a slice
  audit [dir]       Audit Markdown specifications for ASD-STE100 compliance
  lint              Run static AST checks, security rule analysis, and 5-state verification
  scaffold <name>   Generate a new standard ERP vertical slice skeleton
  help              Display this help menu
`);
}

function handleBuild(targetDirName) {
  printBanner();
  const rootDir = process.cwd();
  const targetDir = path.resolve(rootDir, targetDirName || 'sample');

  console.log(`[FACTORY] Initiating vertical slice build gate for: ${path.relative(rootDir, targetDir)}\n`);

  if (!fs.existsSync(targetDir)) {
    console.error(`[ERROR] Target directory not found: ${targetDir}`);
    process.exit(1);
  }

  // 1. Run Static Linter
  console.log('--- Step 1: Running Static & Security Rules Verification ---');
  try {
    runLinter();
  } catch (err) {
    console.error(`[LINT EXCEPTION] ${err.message}`);
    process.exit(1);
  }

  // 2. Audit Documentation for ASD-STE100
  console.log('\n--- Step 2: Auditing ASD-STE100 Controlled Language Compliance ---');
  const docFiles = [];
  const docsDir = path.join(targetDir, 'docs');
  if (fs.existsSync(docsDir)) {
    scanDirectory(docsDir, docFiles);
  }

  let totalSentences = 0;
  let compliantSentences = 0;
  for (const doc of docFiles) {
    const res = auditText(fs.readFileSync(doc, 'utf8'), path.relative(rootDir, doc));
    totalSentences += res.totalSentences;
    compliantSentences += res.compliantSentences;
    console.log(`✓ [${(res.score * 100).toFixed(1)}%] ${res.filePath}`);
  }
  const steScore = totalSentences > 0 ? (compliantSentences / totalSentences) : 1.0;
  console.log(`Average STE100 Score: ${(steScore * 100).toFixed(2)}% (Threshold: >= 80%)`);

  if (steScore < 0.80) {
    console.error('[GATE HALT] ASD-STE100 compliance below 80% threshold.');
    process.exit(1);
  }

  // 3. Goal-and-Reward Evaluation
  console.log('\n--- Step 3: Computing Goal-and-Reward Gate Score ---');
  const evaluator = new ScoringEvaluator({ rootDir });
  const evalResult = evaluator.evaluateSlice(targetDir);

  console.log(`Base Score: ${evalResult.baseScore.toFixed(3)}`);
  console.log(`Total Deductions: -${evalResult.totalPenalties}`);
  console.log(`Safety Multiplier (I_Safety): ${evalResult.safetyIndicator}`);
  console.log(`Final Reward Score S: ${evalResult.finalScore.toFixed(3)} (Pass Gate: >= 0.900)`);

  if (!evalResult.passed) {
    console.error('\n[BUILD FAILED] Vertical slice failed the Goal-and-Reward gate.');
    process.exit(1);
  }

  console.log('\n======================================================================');
  console.log('✓ BUILD PASSED: Vertical Slice cleared all quality & security gates!');
  console.log('======================================================================\n');
  process.exit(0);
}

function handleScore(targetDirName) {
  printBanner();
  const rootDir = process.cwd();
  const targetDir = path.resolve(rootDir, targetDirName || 'sample');
  const evaluator = new ScoringEvaluator({ rootDir });
  const result = evaluator.evaluateSlice(targetDir);

  console.log(`Evaluated Target: ${result.sliceDir}`);
  console.log(`Final Score S: ${result.finalScore.toFixed(3)} / 1.000`);
  console.log(`Status: ${result.passed ? '✓ GATE CLEARED' : '✗ GATE FAILED'}`);
  process.exit(result.passed ? 0 : 1);
}

function handleScaffold(moduleName) {
  printBanner();
  if (!moduleName) {
    console.error('Error: Please provide a module name (e.g., agentic-erp scaffold procurement)');
    process.exit(1);
  }

  const cleanName = moduleName.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const rootDir = process.cwd();
  const sliceDir = path.join(rootDir, 'slices', cleanName);

  if (fs.existsSync(sliceDir)) {
    console.error(`Error: Slice directory already exists: ${sliceDir}`);
    process.exit(1);
  }

  fs.mkdirSync(path.join(sliceDir, 'docs'), { recursive: true });
  fs.mkdirSync(path.join(sliceDir, 'firebase'), { recursive: true });
  fs.mkdirSync(path.join(sliceDir, 'public'), { recursive: true });

  console.log(`✓ Scaffolded new ERP slice: slices/${cleanName}/`);
  console.log(`  - slices/${cleanName}/docs/`);
  console.log(`  - slices/${cleanName}/firebase/`);
  console.log(`  - slices/${cleanName}/public/`);
  process.exit(0);
}

switch (command) {
  case 'build':
    handleBuild(args[1]);
    break;
  case 'score':
    handleScore(args[1]);
    break;
  case 'audit':
    require('../src/engine/ste100_auditor');
    break;
  case 'lint':
    runLinter();
    break;
  case 'scaffold':
    handleScaffold(args[1]);
    break;
  case 'help':
  default:
    printUsage();
    break;
}
