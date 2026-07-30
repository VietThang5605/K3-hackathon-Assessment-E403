/**
 * VLearn Teacher Agent — Backend Integration Test
 * Tests the full 5-phase pipeline: Upload → Generate Quiz → Publish → Submit → Heatmap
 * Runs locally without PostgreSQL (uses in-memory fallback).
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const teacherAgent = require('./src/services/teacherAgent');
const dbClient = require('./src/db/dbClient');
const { mineChatlogs } = require('./src/services/chatlogMiner');

const SEP = '─'.repeat(60);

async function runTest() {
  console.log(SEP);
  console.log('🧪 VLearn Teacher Agent — Full Pipeline Integration Test');
  console.log(SEP);

  let passed = 0;
  let failed = 0;

  function assert(label, condition) {
    if (condition) {
      console.log(`  ✅ ${label}`);
      passed++;
    } else {
      console.log(`  ❌ ${label}`);
      failed++;
    }
  }

  // ===== Phase 1: Upload Document =====
  console.log('\n📋 Phase 1: Upload Document & Store in DB');
  let doc;
  try {
    doc = await teacherAgent.uploadDocument({
      title: 'Bài 4: RAG Architecture',
      course_name: 'K3-AI Product Architecture',
      author: 'Giảng viên VLearn',
      file_size: '2.4 MB',
      page_count: 28,
      content_text: 'RAG Architecture, Vector DB, Chunking Strategy, Hybrid Search, Sparse & Dense Retrieval. Embedding models, FAISS, Pinecone.',
      metadata: { source: 'test' }
    });
    assert('Document uploaded successfully', doc && doc.id);
    assert('Document has title', doc.title === 'Bài 4: RAG Architecture');
    assert('Document has content_text', doc.content_text && doc.content_text.length > 10);
    console.log(`  📄 Document ID: ${doc.id}`);
  } catch (err) {
    console.log(`  ❌ Upload failed: ${err.message}`);
    failed++;
  }

  // Verify we can fetch the document back
  const allDocs = await dbClient.getAllDocuments();
  assert('getAllDocuments returns array', Array.isArray(allDocs));
  assert('getAllDocuments includes our doc', allDocs.some(d => d.id === doc?.id));

  const fetchedDoc = await dbClient.getDocumentById(doc?.id);
  assert('getDocumentById returns the doc', fetchedDoc && fetchedDoc.id === doc?.id);

  // ===== Phase 1b: Chatlog Mining =====
  console.log('\n🔍 Phase 1b: Chatlog Mining');
  const { minedConceptPains, chatlogCount } = mineChatlogs();
  assert('Chatlog miner returns concept pains', Array.isArray(minedConceptPains) && minedConceptPains.length > 0);
  assert('Chatlog has frequency data', minedConceptPains[0].frequency > 0);
  console.log(`  📊 Mined ${minedConceptPains.length} concept pains from ${chatlogCount} chatlogs`);
  minedConceptPains.forEach(p => {
    console.log(`     - ${p.concept} (freq: ${p.frequency}): ${p.painDescription.substring(0, 60)}...`);
  });

  // ===== Phase 2: Generate Draft Quiz =====
  console.log('\n🤖 Phase 2: Generate Draft Quiz (AI + Chatlog Context)');
  let draftQuiz;
  try {
    draftQuiz = await teacherAgent.generateDraftQuiz({
      documentId: doc?.id,
      slideTitle: 'Bài 4: RAG Architecture',
      numQuestions: 5,
      provider: process.env.DEFAULT_AI_PROVIDER || 'gemini'
    });
    assert('Draft quiz generated', draftQuiz && draftQuiz.id);
    assert('Quiz has questions array', Array.isArray(draftQuiz.questions));
    assert('Quiz has ≥1 question', draftQuiz.questions.length >= 1);
    assert('Questions have correct structure', draftQuiz.questions[0].question && draftQuiz.questions[0].options);
    assert('Questions have concept tags', !!draftQuiz.questions[0].concept);
    assert('Questions have confidenceScore', typeof draftQuiz.questions[0].confidenceScore === 'number');
    console.log(`  🎯 Quiz ID: ${draftQuiz.id} | Questions: ${draftQuiz.questions.length}`);

    // Check for low-confidence flagging
    const lowConfCount = draftQuiz.questions.filter(q => q.isLowConfidence).length;
    console.log(`  ⚠️  Low-confidence questions: ${lowConfCount} / ${draftQuiz.questions.length}`);
  } catch (err) {
    console.log(`  ❌ Quiz generation failed: ${err.message}`);
    failed++;
  }

  // ===== Phase 3: Publish Quiz =====
  console.log('\n📢 Phase 3: Publish Quiz (Teacher Approval)');
  let publishResult;
  try {
    publishResult = await teacherAgent.publishQuiz({
      quizId: draftQuiz?.id,
      title: draftQuiz?.title,
      questions: draftQuiz?.questions
    });
    assert('Quiz published successfully', publishResult && publishResult.success);
    assert('Shareable link generated', publishResult.shareableLink && publishResult.shareableLink.includes(draftQuiz?.id));
    console.log(`  🔗 Shareable link: ${publishResult.shareableLink}`);
  } catch (err) {
    console.log(`  ❌ Publish failed: ${err.message}`);
    failed++;
  }

  // ===== Phase 4: Student Quiz Submission =====
  console.log('\n📝 Phase 4: Student Quiz Submission & Grading');
  const quizId = draftQuiz?.id;
  const questions = draftQuiz?.questions || [];

  // Simulate 3 students with varying correct/wrong answers
  const students = [
    { name: 'Nguyễn Văn A', id: 'std-001' },
    { name: 'Trần Thị B', id: 'std-002' },
    { name: 'Lê Hoàng C', id: 'std-003' }
  ];

  for (const student of students) {
    try {
      const answers = {};
      questions.forEach((q, i) => {
        if (student.id === 'std-001') {
          // Student A: answers all correctly
          answers[q.id] = q.correctAnswer;
        } else if (student.id === 'std-002') {
          // Student B: gets first 2 wrong
          answers[q.id] = i < 2 ? 'Z' : q.correctAnswer;
        } else {
          // Student C: gets all wrong
          answers[q.id] = 'Z';
        }
      });

      const result = await teacherAgent.submitQuizAnswers({
        quizId,
        studentId: student.id,
        studentName: student.name,
        answers
      });
      assert(`${student.name} submitted (score: ${result.score}%)`, result.score >= 0);
    } catch (err) {
      console.log(`  ❌ Submission failed for ${student.name}: ${err.message}`);
      failed++;
    }
  }

  // ===== Phase 5: Knowledge Gap Heatmap =====
  console.log('\n🗺️  Phase 5: Knowledge Gap Heatmap & AI 3-min Recap');
  try {
    const heatmap = await teacherAgent.getKnowledgeGapHeatmap(quizId);
    assert('Heatmap generated', heatmap && heatmap.quizId);
    assert('Heatmap has totalSubmissions', heatmap.totalSubmissions === 3);
    assert('Heatmap has redConcepts array', Array.isArray(heatmap.redConcepts));
    assert('Heatmap has yellowConcepts array', Array.isArray(heatmap.yellowConcepts));
    assert('Heatmap has greenConcepts array', Array.isArray(heatmap.greenConcepts));
    assert('AI recap suggestion exists', heatmap.aiRecapSuggestion && heatmap.aiRecapSuggestion.length > 10);

    console.log(`\n  📊 Heatmap Results (${heatmap.totalSubmissions} submissions):`);
    console.log(`  🔴 Red   (>40% error): ${heatmap.redConcepts.length} concepts`);
    heatmap.redConcepts.forEach(c => console.log(`     - ${c.concept}: ${c.errorRate}% error (${c.wrongCount}/${c.totalAttempts})`));
    console.log(`  🟡 Yellow (15-40%):    ${heatmap.yellowConcepts.length} concepts`);
    heatmap.yellowConcepts.forEach(c => console.log(`     - ${c.concept}: ${c.errorRate}% error`));
    console.log(`  🟢 Green  (<15%):      ${heatmap.greenConcepts.length} concepts`);
    heatmap.greenConcepts.forEach(c => console.log(`     - ${c.concept}: ${c.errorRate}% error`));

    console.log(`\n  🎯 AI 3-Minute Recap Suggestion:`);
    console.log(`  ${heatmap.aiRecapSuggestion.substring(0, 200)}...`);
  } catch (err) {
    console.log(`  ❌ Heatmap generation failed: ${err.message}`);
    failed++;
  }

  // ===== Phase Bonus: Delete Document =====
  console.log('\n🗑️  Bonus: Delete Document');
  try {
    await dbClient.deleteDocument(doc?.id);
    const afterDelete = await dbClient.getDocumentById(doc?.id);
    assert('Document deleted from DB', !afterDelete);
  } catch (err) {
    console.log(`  ❌ Delete failed: ${err.message}`);
    failed++;
  }

  // ===== Summary =====
  console.log('\n' + SEP);
  console.log(`📊 TEST SUMMARY: ${passed} passed, ${failed} failed (${passed + failed} total)`);
  console.log(SEP);

  if (failed > 0) {
    console.log('⚠️  Some tests failed. Review the output above.');
    process.exit(1);
  } else {
    console.log('🎉 All tests passed! Teacher Agent is ready for production.');
    process.exit(0);
  }
}

runTest().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
