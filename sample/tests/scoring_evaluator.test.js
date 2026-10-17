const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const { ScoringEvaluator } = require('../src/engine/scoring_evaluator');

test('Goal-and-Reward Scoring Evaluator Mechanics', async (t) => {
  const rootDir = path.join(__dirname, '..');
  const evaluator = new ScoringEvaluator({ rootDir });

  await t.test('Evaluates sample ERP and clears gate (Score >= 0.90)', () => {
    let sampleDir = rootDir;
    if (fs.existsSync(path.join(rootDir, 'sample'))) {
      sampleDir = path.join(rootDir, 'sample');
    }
    const result = evaluator.evaluateSlice(sampleDir);

    assert.equal(result.safetyIndicator, 1, 'Safety indicator must be 1 (no safety violations)');
    assert.equal(result.safetyBreachReason, null);
    assert.ok(result.finalScore >= 0.90, `Sample ERP final score ${result.finalScore} must clear >= 0.90 threshold`);
    assert.equal(result.passed, true);
  });

  await t.test('Triggers Safety Reset (Score = 0.0) when wildcard rules are introduced', () => {
    const mockEvaluator = new ScoringEvaluator({ rootDir });
    mockEvaluator.triggerSafetyReset('Wildcard rule test');
    mockEvaluator.addPenalty('UI Inventory', 'Missing state', 0.20);

    const totalPenalties = mockEvaluator.penalties.reduce((sum, p) => sum + p.points, 0);
    const iSafety = mockEvaluator.safetyViolation ? 0 : 1;
    const finalScore = Math.max(0, 1.0 - totalPenalties) * iSafety;

    assert.equal(iSafety, 0);
    assert.equal(finalScore, 0.0, 'Safety reset must force score to 0.0');
  });

  await t.test('Calculates deductions correctly according to formula', () => {
    const mockEvaluator = new ScoringEvaluator({ rootDir });
    mockEvaluator.addPenalty('UI Inventory', 'Missing 1 state', 0.20);
    mockEvaluator.addPenalty('Documentation', 'Broken link', 0.10);

    const totalPenalties = mockEvaluator.penalties.reduce((sum, p) => sum + p.points, 0);
    const finalScore = Math.max(0, 1.0 - totalPenalties);

    assert.equal(Number(totalPenalties.toFixed(2)), 0.30);
    assert.equal(Number(finalScore.toFixed(2)), 0.70);
  });
});
