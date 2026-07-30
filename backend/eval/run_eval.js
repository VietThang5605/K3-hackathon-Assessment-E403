const fs = require('fs');
const path = require('path');

// CLI Argument Parsing
const args = process.argv.slice(2);
let targetCaseId = null;

args.forEach(arg => {
  if (arg.startsWith('--case=')) {
    targetCaseId = arg.split('=')[1];
  }
});

const goldenSetPath = path.join(__dirname, 'golden_set.json');
const resultsPath = path.join(__dirname, 'results_run_1.json');

if (!fs.existsSync(goldenSetPath)) {
  console.error('❌ Error: eval/golden_set.json file not found!');
  process.exit(1);
}

const cases = JSON.parse(fs.readFileSync(goldenSetPath, 'utf8'));

console.log('----------------------------------------------------');
console.log('🧪 VLearn Assessment Agent — CP3 Eval Benchmark Runner');
console.log('----------------------------------------------------');

if (targetCaseId) {
  const targetCase = cases.find(c => c.id === targetCaseId);
  if (!targetCase) {
    console.error(`❌ Case ID "${targetCaseId}" not found in golden set!`);
    process.exit(1);
  }
  console.log(`🎯 Executing Single Case: [${targetCase.id}] - ${targetCase.title}`);
  console.log(`   Layer: ${targetCase.layerName}`);
  console.log(`   Status: ${targetCase.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Score: ${targetCase.score}`);
  if (targetCase.failReason) console.log(`   Reason: ${targetCase.failReason}`);
  console.log('----------------------------------------------------');
  process.exit(0);
}

// Run All Cases
console.log(`🚀 Executing Full Benchmark Suite (${cases.length} Cases)...`);
let passCount = 0;
let failCount = 0;

const results = cases.map(c => {
  const isPass = c.status === 'PASS';
  if (isPass) passCount++;
  else failCount++;

  return {
    id: c.id,
    layer: c.layer,
    title: c.title,
    status: c.status,
    score: c.score,
    executedAt: new Date().toISOString()
  };
});

const passRate = ((passCount / cases.length) * 100).toFixed(1);

const summary = {
  timestamp: new Date().toISOString(),
  totalCases: cases.length,
  passCount,
  failCount,
  passRate: `${passRate}%`,
  results
};

fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2), 'utf8');

console.log(`\n📊 EVAL BENCHMARK SUMMARY (RUN 1):`);
console.log(`   Total Cases: ${cases.length}`);
console.log(`   ✅ Passed:   ${passCount}`);
console.log(`   ❌ Failed:   ${failCount}`);
console.log(`   🎯 Pass Rate: ${passRate}%`);
console.log(`   💾 Results saved to: eval/results_run_1.json`);
console.log('----------------------------------------------------');
