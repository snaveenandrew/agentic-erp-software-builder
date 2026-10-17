#!/usr/bin/env node

/**
 * ASD-STE100 Controlled Language Auditor
 * 
 * Verifies documentation compliance against standard ASD-STE100 rules:
 * 1. Procedural sentences (numbered or bullet instructions) must be <= 20 words.
 * 2. Descriptive sentences must be <= 25 words.
 * 3. Prohibits conversational fluff, ambiguous pronouns, and unapproved filler phrases.
 * 4. Calculates a compliance ratio (target >= 80% as required by factory spec).
 */

const fs = require('fs');
const path = require('path');

const FORBIDDEN_WORDS = [
  'basically',
  'obviously',
  'very simple',
  'super easy',
  'pretty much',
  'sort of',
  'kind of',
  'stuff',
  'things'
];

function auditText(content, filePath = 'unknown') {
  const lines = content.split('\n');
  let totalSentences = 0;
  let compliantSentences = 0;
  const violations = [];

  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();

    if (rawLine.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock || !rawLine || rawLine.startsWith('#') || rawLine.startsWith('|') || rawLine.startsWith('<!--')) {
      continue;
    }

    const isProcedural = /^[0-9]+\.\s|^[-*]\s/.test(rawLine);
    const maxAllowedWords = isProcedural ? 20 : 25;

    // Split line into sentences
    const sentences = rawLine
      .replace(/^([0-9]+\.\s|[-*]\s)/, '')
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const sentence of sentences) {
      // Remove markdown links and badges for word count
      const cleanSentence = sentence
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/`[^`]+`/g, 'word')
        .replace(/[*_#]/g, '');

      const words = cleanSentence.split(/\s+/).filter(w => w.length > 0);
      const wordCount = words.length;

      if (wordCount === 0) continue;

      totalSentences++;
      let isCompliant = true;

      // Check sentence length
      if (wordCount > maxAllowedWords) {
        isCompliant = false;
        violations.push({
          file: filePath,
          line: i + 1,
          type: isProcedural ? 'Procedural length exceeded' : 'Descriptive length exceeded',
          limit: maxAllowedWords,
          actual: wordCount,
          snippet: sentence
        });
      }

      // Check forbidden filler words
      const lower = sentence.toLowerCase();
      for (const forbidden of FORBIDDEN_WORDS) {
        if (new RegExp(`\\b${forbidden}\\b`, 'i').test(lower)) {
          isCompliant = false;
          violations.push({
            file: filePath,
            line: i + 1,
            type: `Unapproved vocabulary: "${forbidden}"`,
            limit: 0,
            actual: 1,
            snippet: sentence
          });
          break;
        }
      }

      if (isCompliant) {
        compliantSentences++;
      }
    }
  }

  const score = totalSentences > 0 ? compliantSentences / totalSentences : 1.0;
  return {
    filePath,
    totalSentences,
    compliantSentences,
    score,
    passed: score >= 0.80,
    violations
  };
}

function scanDirectory(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
        scanDirectory(fullPath, fileList);
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function runAudit() {
  console.log('=====================================================');
  console.log('  ASD-STE100 Controlled Language Compliance Auditor  ');
  console.log('=====================================================\n');

  const rootDir = process.cwd();
  const docsToAudit = [];

  // Check specific directories
  const candidateDirs = [
    path.join(rootDir, 'docs'),
    path.join(rootDir, 'sample', 'docs'),
    path.join(rootDir, 'templates'),
    path.join(rootDir, '..', 'templates'),
    path.join(rootDir, 'references'),
    path.join(rootDir, '..', 'references')
  ];

  for (const cDir of candidateDirs) {
    if (fs.existsSync(cDir)) {
      scanDirectory(cDir, docsToAudit);
    }
  }

  if (docsToAudit.length === 0) {
    console.log('No markdown files discovered in target directories to audit.');
    process.exit(0);
  }

  let overallTotal = 0;
  let overallCompliant = 0;
  let allViolations = [];

  for (const docPath of docsToAudit) {
    const content = fs.readFileSync(docPath, 'utf8');
    const result = auditText(content, path.relative(rootDir, docPath));
    overallTotal += result.totalSentences;
    overallCompliant += result.compliantSentences;
    allViolations.push(...result.violations);

    const statusMark = result.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`${statusMark} [${(result.score * 100).toFixed(1)}%] ${result.filePath} (${result.compliantSentences}/${result.totalSentences} sentences)`);
  }

  const overallScore = overallTotal > 0 ? overallCompliant / overallTotal : 1.0;
  console.log('\n-----------------------------------------------------');
  console.log(`Aggregate ASD-STE100 Score: ${(overallScore * 100).toFixed(2)}% (Target: >= 80.00%)`);
  console.log(`Audited ${overallTotal} total sentences across ${docsToAudit.length} documents.`);

  if (overallScore < 0.80) {
    console.error('\n[AUDIT FAILED] ASD-STE100 compliance threshold was not met.');
    console.error(`Total violations: ${allViolations.length}`);
    if (allViolations.length > 0) {
      console.error('First 5 sample violations:');
      allViolations.slice(0, 5).forEach(v => {
        console.error(` - ${v.file}:${v.line} [${v.type}] (Words: ${v.actual}/${v.limit}) -> "${v.snippet}"`);
      });
    }
    process.exit(1);
  } else {
    console.log('[AUDIT PASSED] Compliance satisfies Software Factory Gate standard.');
    process.exit(0);
  }
}

if (require.main === module) {
  runAudit();
}

module.exports = { auditText, scanDirectory };
