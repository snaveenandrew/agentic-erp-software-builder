/**
 * Agent Orchestration Engine
 * 
 * Implements deterministic state machine runtime transitions:
 * Trigger -> ValidateInput -> HydratePrompt -> ExecuteModel -> ParseOutput -> SchemaCheck -> EvalHarness -> GateCheck -> Commit
 */

const fs = require('fs');
const path = require('path');
const { ScoringEvaluator } = require('./scoring_evaluator');
const { auditText } = require('./ste100_auditor');

class ERPOrchestrator {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.memory = {
      working: {},
      episodic: [],
      semantic: {}
    };
  }

  /**
   * Validates a handoff package against the structural schema
   */
  validateHandoff(pkg) {
    const requiredFields = ['taskId', 'requirementIds', 'targetAgent', 'inputArtifacts', 'acceptanceCriteria'];
    for (const field of requiredFields) {
      if (!pkg[field]) {
        throw new Error(`Invalid Handoff Package: Missing field "${field}"`);
      }
    }
    if (!Array.isArray(pkg.requirementIds) || pkg.requirementIds.length === 0) {
      throw new Error('Invalid Handoff Package: requirementIds must be a non-empty array');
    }
    return true;
  }

  /**
   * Runs the evaluation harness for a target vertical slice
   */
  evaluateVerticalSlice(slicePath) {
    const evaluator = new ScoringEvaluator({ rootDir: this.rootDir });
    return evaluator.evaluateSlice(slicePath);
  }

  /**
   * Audits document files within the slice for ASD-STE100 compliance
   */
  auditSliceDocumentation(docsDir) {
    if (!fs.existsSync(docsDir)) return { score: 1.0, compliant: true };
    const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));
    let totalSentences = 0;
    let compliantSentences = 0;

    for (const file of files) {
      const content = fs.readFileSync(path.join(docsDir, file), 'utf8');
      const res = auditText(content, file);
      totalSentences += res.totalSentences;
      compliantSentences += res.compliantSentences;
    }

    const score = totalSentences > 0 ? compliantSentences / totalSentences : 1.0;
    return {
      score,
      compliant: score >= 0.80,
      totalSentences,
      compliantSentences
    };
  }
}

module.exports = { ERPOrchestrator };
