#!/usr/bin/env node
/**
 * 乾乾 (QianQian) - 功能测试脚本
 *
 * 验证 Phase 1 核心功能
 */

const { 
  createLogger, 
  logger,
  CursorAdapter,
  createCursorAdapter,
  GitSyncEngine,
  ConfigLoader,
  ACLError,
  tryCatch,
  ok,
  err
} = require('./dist');

console.log('🧪 乾乾 (QianQian) Phase 1 功能测试\n');

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

// 测试 1: 日志系统
test('日志系统 - 创建日志记录器', () => {
  const customLogger = createLogger({ level: 'debug', console: true });
  if (!customLogger) throw new Error('Failed to create logger');
});

// 测试 2: 错误系统
test('错误系统 - 创建 ACL 错误', () => {
  const error = new ACLError('Test error', 'TEST_ERROR');
  if (error.code !== 'TEST_ERROR') throw new Error('Error code mismatch');
});

// 测试 3: Result 模式
test('Result 模式 - ok 和 err', () => {
  const success = ok({ data: 'test' });
  const failure = err(new Error('test'));
  
  if (!success.success) throw new Error('ok should return success');
  if (failure.success) throw new Error('err should return failure');
});

// 测试 4: Cursor 适配器
test('Cursor 适配器 - 创建实例', () => {
  const adapter = createCursorAdapter();
  if (!adapter) throw new Error('Failed to create adapter');
  if (adapter.name !== 'cursor') throw new Error('Adapter name mismatch');
});

// 测试 5: 配置加载器
test('配置加载器 - 创建实例', () => {
  const loader = new ConfigLoader();
  if (!loader) throw new Error('Failed to create config loader');
});

// 测试 6: 常量定义
test('常量定义 - 导出的常量', () => {
  const { APP_NAME, APP_VERSION, ACL_DIR } = require('./dist');
  if (!APP_NAME) throw new Error('APP_NAME not exported');
  if (!APP_VERSION) throw new Error('APP_VERSION not exported');
  if (!ACL_DIR) throw new Error('ACL_DIR not exported');
});

console.log('\n' + '='.repeat(50));
console.log(`测试结果: ${passed} 通过, ${failed} 失败`);
console.log('='.repeat(50));

process.exit(failed > 0 ? 1 : 0);
