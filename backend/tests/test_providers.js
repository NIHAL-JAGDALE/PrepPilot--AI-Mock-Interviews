import dotenv from 'dotenv';
dotenv.config();

const testPrompt = 'Say "hello" in one word.';

// ── Test Claude (Anthropic) ──
async function testClaude() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.includes('...') || key.length < 20) {
    return { provider: 'Claude', status: '⚠️ SKIPPED', reason: 'Placeholder or missing key' };
  }
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: key });
    const res = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: testPrompt }],
    });
    return { provider: 'Claude', status: '✅ WORKING', response: res.content[0]?.text };
  } catch (e) {
    return { provider: 'Claude', status: '❌ FAILED', reason: e.message };
  }
}

// ── Test OpenAI ──
async function testOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.includes('...') || key.length < 20) {
    return { provider: 'OpenAI', status: '⚠️ SKIPPED', reason: 'Placeholder or missing key' };
  }
  try {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: key });
    const res = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 10,
      messages: [{ role: 'user', content: testPrompt }],
    });
    return { provider: 'OpenAI', status: '✅ WORKING', response: res.choices[0]?.message?.content };
  } catch (e) {
    return { provider: 'OpenAI', status: '❌ FAILED', reason: e.message };
  }
}

// ── Test Groq ──
async function testGroq(envKey = 'GROQ_API_KEY') {
  const key = process.env[envKey];
  if (!key || key.includes('...') || key.length < 20) {
    return { provider: `Groq (${envKey})`, status: '⚠️ SKIPPED', reason: 'Placeholder or missing key' };
  }
  try {
    const { default: Groq } = await import('groq-sdk');
    const client = new Groq({ apiKey: key });
    const res = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 10,
      messages: [{ role: 'user', content: testPrompt }],
    });
    return { provider: `Groq (${envKey})`, status: '✅ WORKING', response: res.choices[0]?.message?.content };
  } catch (e) {
    return { provider: `Groq (${envKey})`, status: '❌ FAILED', reason: e.message };
  }
}

// ── Run all tests ──
console.log('\n═══════════════════════════════════════');
console.log('  🔑 PrepPilot API Key Verification');
console.log('═══════════════════════════════════════\n');

const results = [];

console.log('Testing Claude (Anthropic)...');
results.push(await testClaude());
console.log(`  → ${results[results.length-1].status}\n`);

console.log('Testing OpenAI...');
results.push(await testOpenAI());
console.log(`  → ${results[results.length-1].status}\n`);

console.log('Testing Groq...');
results.push(await testGroq('GROQ_API_KEY'));
console.log(`  → ${results[results.length-1].status}\n`);

for (let i = 1; i <= 5; i++) {
  console.log(`Testing Groq ${i}...`);
  results.push(await testGroq(`GROQ_API_KEY_${i}`));
  console.log(`  → ${results[results.length-1].status}\n`);
}

console.log('═══════════════════════════════════════');
console.log('  RESULTS:');
console.log('═══════════════════════════════════════');
for (const r of results) {
  console.log(`  ${r.provider}: ${r.status}`);
  if (r.reason) console.log(`    Reason: ${r.reason}`);
  if (r.response) console.log(`    Response: "${r.response}"`);
}

const working = results.filter(r => r.status === '✅ WORKING');
console.log(`\n  ${working.length}/${results.length} providers are working.`);
if (working.length === 0) {
  console.log('  ⚠️  You need at least 1 working provider!');
  console.log('  Get free Groq key at: https://console.groq.com/keys');
}
console.log('═══════════════════════════════════════\n');
