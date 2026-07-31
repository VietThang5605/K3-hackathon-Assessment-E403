const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { evaluateCaseWithGPT4o } = require('../src/services/liveEvaluator');
const { generateQuiz } = require('../src/services/aiProvider');

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
console.log('🧪 VLearn Assessment Agent — CP3 Live Eval Benchmark Runner');
console.log('⚖️ Judge Model: OpenAI GPT-4o');
console.log('⚙️ Generator Model: OpenAI GPT-4o Mini / Gemini 2.5 Flash');
console.log('----------------------------------------------------');

async function runBenchmark() {
  if (targetCaseId) {
    const targetCase = cases.find(c => c.id === targetCaseId);
    if (!targetCase) {
      console.error(`❌ Case ID "${targetCaseId}" not found in golden set!`);
      process.exit(1);
    }
    console.log(`🎯 Executing Single Case: [${targetCase.id}] - ${targetCase.title}`);
    console.log(`⚡ Step 1: Calling Generator Model (gpt-4o-mini) to generate Quiz live...`);
    
    let generatedQuiz = null;
    try {
      generatedQuiz = await generateQuiz({
        slideTitle: targetCase.title,
        documentContent: targetCase.documentContent || `Nội dung slide về ${targetCase.title}`,
        numQuestions: 2,
        provider: 'openai' // Uses gpt-4o-mini
      });
      console.log(`   ✓ Generator (gpt-4o-mini) produced ${generatedQuiz.length} questions.`);
    } catch (e) {
      console.warn(`   ⚠️ Generator (gpt-4o-mini) call failed: ${e.message}`);
    }

    console.log(`⚖️ Step 2: Calling Judge Model (gpt-4o) to evaluate generated Quiz...`);
    const evalResult = await evaluateCaseWithGPT4o({ testCase: targetCase, generatedQuiz });
    
    console.log(`\n📊 KẾT QUẢ ĐÁNH GIÁ THỰC TẾ (LIVE EVALUATION):`);
    console.log(`   Case ID: ${targetCase.id}`);
    console.log(`   Layer: ${targetCase.layerName || targetCase.layer}`);
    console.log(`   Status: ${evalResult.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Score: ${evalResult.score}`);
    console.log(`   Judge Model: ${evalResult.judgeModel}`);
    if (evalResult.reason) console.log(`   Reason: ${evalResult.reason}`);
    console.log('----------------------------------------------------');
    process.exit(0);
  }

  // Run All Cases with Live Evaluator (GPT-4o Judge)
  console.log(`🚀 Executing Full Benchmark Suite (${cases.length} Cases) with Live GPT-4o Judge...`);
  let passCount = 0;
  let failCount = 0;

  const results = [];
  for (const c of cases) {
    console.log(`\n▶ Processing [${c.id}] ${c.title}...`);
    let generatedQuiz = null;
    try {
      generatedQuiz = await generateQuiz({
        slideTitle: c.title,
        documentContent: c.documentContent || `Nội dung slide về ${c.title}`,
        numQuestions: 2,
        provider: 'openai'
      });
    } catch (e) {
      console.warn(`   ⚠️ Generator failed for ${c.id}: ${e.message}`);
    }

    const evalResult = await evaluateCaseWithGPT4o({ testCase: c, generatedQuiz });
    const isPass = evalResult.status === 'PASS';
    if (isPass) passCount++;
    else failCount++;

    results.push({
      id: c.id,
      layer: c.layer,
      title: c.title,
      status: evalResult.status,
      score: evalResult.score,
      reason: evalResult.reason,
      judgeModel: evalResult.judgeModel,
      executedAt: new Date().toISOString()
    });
  }

  const passRate = ((passCount / cases.length) * 100).toFixed(1);

  const summary = {
    timestamp: new Date().toISOString(),
    judgeModel: 'OpenAI GPT-4o',
    generatorModel: 'OpenAI GPT-4o Mini',
    totalCases: cases.length,
    passCount,
    failCount,
    passRate: `${passRate}%`,
    results
  };

  fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2), 'utf8');

  console.log(`\n📊 EVAL BENCHMARK SUMMARY (LIVE GPT-4o JUDGE):`);
  console.log(`   Total Cases: ${cases.length}`);
  console.log(`   ✅ Passed:   ${passCount}`);
  console.log(`   ❌ Failed:   ${failCount}`);
  console.log(`   🎯 Pass Rate: ${passRate}%`);
  console.log(`   💾 Results saved to: eval/results_run_1.json`);
  console.log('----------------------------------------------------');
}

runBenchmark();
