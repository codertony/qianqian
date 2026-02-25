/**
 * 乾乾 (QianQian) - Phase 3 功能测试
 *
 * 验证 Phase 3 Plugin、Flow、MCP、兼容性系统
 */

const {
  PluginManager,
  createPluginManager,
  FlowEngine,
  createFlowEngine,
  MarketConnector,
  createMarketConnector,
  MCPConfigManager,
  createMCPConfigManager,
  CompatibilityChecker,
  createCompatibilityChecker,
} = require('./dist');

console.log('🧪 乾乾 (QianQian) Phase 3 功能测试\n');

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

// ============ Week 11: Plugin 系统测试 ============
test('Plugin - 创建管理器', () => {
  const manager = createPluginManager('/tmp/.acl');
  if (!manager) throw new Error('Failed to create PluginManager');
});

test('Plugin - list 方法存在', () => {
  const manager = createPluginManager('/tmp/.acl');
  if (typeof manager.list !== 'function') throw new Error('list method not found');
});

// ============ Week 12: Flow 系统测试 ============
test('Flow - 创建引擎', () => {
  const engine = createFlowEngine();
  if (!engine) throw new Error('Failed to create FlowEngine');
});

test('Flow - 验证空 Flow', () => {
  const engine = createFlowEngine();
  const result = engine.validate({
    name: 'test',
    version: '1.0.0',
    nodes: [],
    edges: [],
  });
  if (result.valid) throw new Error('Empty flow should not be valid');
  if (result.errors.length === 0) throw new Error('Should have errors');
});

// ============ Week 12: Market Connector 测试 ============
test('Market - 创建连接器', () => {
  const connector = createMarketConnector();
  if (!connector) throw new Error('Failed to create MarketConnector');
});

// ============ Week 13: MCP Config 测试 ============
test('MCP - 创建管理器', () => {
  const manager = createMCPConfigManager('/tmp/.acl');
  if (!manager) throw new Error('Failed to create MCPConfigManager');
});

// ============ Week 13: 兼容性系统测试 ============
test('Compatibility - 创建检查器', () => {
  const checker = createCompatibilityChecker();
  if (!checker) throw new Error('Failed to create CompatibilityChecker');
});

test('Compatibility - 注册平台', () => {
  const checker = createCompatibilityChecker();
  checker.registerPlatform('cursor', '0.45.0');
  // If no error thrown, test passes
});

console.log('\n' + '='.repeat(50));
console.log(`测试结果: ${passed} 通过, ${failed} 失败`);
console.log('='.repeat(50));

process.exit(failed > 0 ? 1 : 0);
