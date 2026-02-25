/**
 * 乾乾 (QianQian) - Phase 2 功能测试 (完整版)
 *
 * 验证 Phase 2 AI 功能、冲突解决、依赖管理
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
  ConflictType,
  ConflictStrategy,
  ConflictResolver,
  createConflictResolver,
  DependencyType,
  DependencyManager,
  createDependencyManager,
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

// ============ Week 7: AI Provider 测试 ============
test('AI Provider - 枚举值正确', () => {
  if (AIProviderType.ANTHROPIC !== 'anthropic') throw new Error('ANTHROPIC enum mismatch');
  if (AIProviderType.OPENAI !== 'openai') throw new Error('OPENAI enum mismatch');
});

test('AI Provider - 消息角色枚举', () => {
  if (AIMessageRole.SYSTEM !== 'system') throw new Error('SYSTEM enum mismatch');
  if (AIMessageRole.USER !== 'user') throw new Error('USER enum mismatch');
  if (AIMessageRole.ASSISTANT !== 'assistant') throw new Error('ASSISTANT enum mismatch');
});

test('AI Provider - 任务类型枚举', () => {
  if (AITaskType.SKILL_EXTRACTION !== 'skill_extraction') throw new Error('SKILL_EXTRACTION enum mismatch');
  if (AITaskType.COMMIT_MESSAGE !== 'commit_message') throw new Error('COMMIT_MESSAGE enum mismatch');
  if (AITaskType.SEMANTIC_MERGE !== 'semantic_merge') throw new Error('SEMANTIC_MERGE enum mismatch');
});

test('AI Provider - 限流器创建', () => {
  const limiter = new RateLimiter({
    maxRequestsPerMinute: 10,
    maxConcurrent: 2,
  });
  if (!limiter) throw new Error('Failed to create RateLimiter');
  
  const status = limiter.getStatus();
  if (!status.canProceed) throw new Error('RateLimiter should allow requests initially');
});

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

test('AI Provider - 工厂创建', () => {
  const factory = createAIProviderFactory({
    defaultProvider: AIProviderType.OPENAI,
    providers: [],
  });
  if (!factory) throw new Error('Failed to create AIProviderFactory');
});

// ============ Week 9: 冲突解决 测试 ============
test('冲突解决 - 冲突类型枚举', () => {
  if (ConflictType.LOCAL_REMOTE !== 'local_remote') throw new Error('LOCAL_REMOTE enum mismatch');
  if (ConflictType.CONTENT !== 'content') throw new Error('CONTENT enum mismatch');
});

test('冲突解决 - 策略枚举', () => {
  if (ConflictStrategy.LOCAL !== 'local') throw new Error('LOCAL enum mismatch');
  if (ConflictStrategy.REMOTE !== 'remote') throw new Error('REMOTE enum mismatch');
  if (ConflictStrategy.MERGE !== 'merge') throw new Error('MERGE enum mismatch');
  if (ConflictStrategy.AI_MERGE !== 'ai_merge') throw new Error('AI_MERGE enum mismatch');
});

test('冲突解决 - 创建解决器', () => {
  const resolver = createConflictResolver();
  if (!resolver) throw new Error('Failed to create ConflictResolver');
});

test('冲突解决 - 检测冲突', () => {
  const resolver = createConflictResolver();
  
  const local = new Map([['file1.txt', 'content1'], ['file2.txt', 'local']]);
  const remote = new Map([['file1.txt', 'content1'], ['file2.txt', 'remote']]);
  
  const conflicts = resolver.detectConflicts(local, remote);
  
  if (conflicts.length !== 1) throw new Error(`Expected 1 conflict, got ${conflicts.length}`);
  if (conflicts[0].assetName !== 'file2.txt') throw new Error('Wrong conflict detected');
});

// ============ Week 10: 依赖管理 测试 ============
test('依赖管理 - 依赖类型枚举', () => {
  if (DependencyType.NPM !== 'npm') throw new Error('NPM enum mismatch');
  if (DependencyType.PIP !== 'pip') throw new Error('PIP enum mismatch');
});

test('依赖管理 - 创建管理器', () => {
  const manager = createDependencyManager();
  if (!manager) throw new Error('Failed to create DependencyManager');
});

console.log('\n' + '='.repeat(50));
console.log(`测试结果: ${passed} 通过, ${failed} 失败`);
console.log('='.repeat(50));

process.exit(failed > 0 ? 1 : 0);
