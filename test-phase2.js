/**
 * 乾乾 (QianQian) - Phase 2 功能测试
 *
 * 验证 Phase 2 AI 功能
 */

const {
  AIProviderType,
  AIMessageRole,
  AITaskType,
  AnthropicProvider,
  OpenAIProvider,
  AIProviderFactory,
  createAIProviderFactory,
  RateLimiter,
  TokenBudgetManager,
} = require('./dist');

console.log('🧪 乾乾 (QianQian) Phase 2 功能测试\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

// 测试 1: AI Provider 类型
test('AI Provider - 枚举值正确', () => {
  if (AIProviderType.ANTHROPIC !== 'anthropic') throw new Error('ANTHROPIC enum mismatch');
  if (AIProviderType.OPENAI !== 'openai') throw new Error('OPENAI enum mismatch');
});

// 测试 2: AI 消息角色
test('AI Provider - 消息角色枚举', () => {
  if (AIMessageRole.SYSTEM !== 'system') throw new Error('SYSTEM enum mismatch');
  if (AIMessageRole.USER !== 'user') throw new Error('USER enum mismatch');
  if (AIMessageRole.ASSISTANT !== 'assistant') throw new Error('ASSISTANT enum mismatch');
});

// 测试 3: AI 任务类型
test('AI Provider - 任务类型枚举', () => {
  if (AITaskType.SKILL_EXTRACTION !== 'skill_extraction') throw new Error('SKILL_EXTRACTION enum mismatch');
  if (AITaskType.COMMIT_MESSAGE !== 'commit_message') throw new Error('COMMIT_MESSAGE enum mismatch');
  if (AITaskType.SEMANTIC_MERGE !== 'semantic_merge') throw new Error('SEMANTIC_MERGE enum mismatch');
});

// 测试 4: RateLimiter
test('AI Provider - 限流器创建', () => {
  const limiter = new RateLimiter({
    maxRequestsPerMinute: 10,
    maxConcurrent: 2,
  });
  if (!limiter) throw new Error('Failed to create RateLimiter');
  
  const status = limiter.getStatus();
  if (!status.canProceed) throw new Error('RateLimiter should allow requests initially');
});

// 测试 5: TokenBudgetManager
test('AI Provider - Token 预算管理器', () => {
  const budget = new TokenBudgetManager({
    dailyMaxTokens: 10000,
    perCallMaxTokens: 2000,
    warningThreshold: 80,
  });
  if (!budget) throw new Error('Failed to create TokenBudgetManager');
  
  const stats = budget.getStats();
  if (stats.dailyMax !== 10000) throw new Error('Daily max tokens mismatch');
});

// 测试 6: AIProviderFactory (无 API Key)
test('AI Provider - 工厂创建', () => {
  const factory = createAIProviderFactory({
    defaultProvider: AIProviderType.OPENAI,
    providers: [],
  });
  if (!factory) throw new Error('Failed to create AIProviderFactory');
});

console.log('\n' + '='.repeat(50));
console.log(`测试结果: ${passed} 通过, ${failed} 失败`);
console.log('='.repeat(50));

process.exit(failed > 0 ? 1 : 0);
