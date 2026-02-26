import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  ACLError, 
  ConfigError, 
  GitError, 
  SyncError,
  ValidationError,
  isACLError,
  toACLError,
  ErrorCodes 
} from '../../dist/utils/errors.js';

describe('错误处理体系', () => {
  describe('ACLError 基类', () => {
    it('应该正确创建错误实例', () => {
      const error = new ACLError('测试错误', 'TEST_ERROR', { detail: 'info' });
      assert.strictEqual(error.message, '测试错误');
      assert.strictEqual(error.code, 'TEST_ERROR');
      assert.deepStrictEqual(error.details, { detail: 'info' });
      assert.strictEqual(error.name, 'ACLError');
    });

    it('应该正确序列化为 JSON', () => {
      const error = new ACLError('测试错误', 'TEST_ERROR');
      const json = error.toJSON();
      assert.strictEqual(json.name, 'ACLError');
      assert.strictEqual(json.code, 'TEST_ERROR');
      assert.strictEqual(json.message, '测试错误');
    });

    it('应该提供用户友好的错误消息', () => {
      const error = new ACLError('测试错误', 'TEST_ERROR');
      assert.strictEqual(error.toUserMessage(), '测试错误 (TEST_ERROR)');
    });
  });

  describe('特定错误类型', () => {
    it('ConfigError 应该继承 ACLError', () => {
      const error = new ConfigError('配置错误');
      assert.ok(error instanceof ACLError);
      assert.strictEqual(error.code, 'CONFIG_ERROR');
      assert.strictEqual(error.name, 'ConfigError');
    });

    it('GitError 应该继承 ACLError', () => {
      const error = new GitError('Git 错误');
      assert.ok(error instanceof ACLError);
      assert.strictEqual(error.code, 'GIT_ERROR');
    });

    it('SyncError 应该继承 ACLError', () => {
      const error = new SyncError('同步错误');
      assert.ok(error instanceof ACLError);
      assert.strictEqual(error.code, 'SYNC_ERROR');
    });

    it('ValidationError 应该继承 ACLError', () => {
      const error = new ValidationError('验证错误');
      assert.ok(error instanceof ACLError);
      assert.strictEqual(error.code, 'VALIDATION_ERROR');
    });
  });

  describe('错误判断工具', () => {
    it('isACLError 应该正确识别 ACLError', () => {
      const aclError = new ACLError('测试', 'TEST');
      const normalError = new Error('普通错误');
      
      assert.strictEqual(isACLError(aclError), true);
      assert.strictEqual(isACLError(normalError), false);
      assert.strictEqual(isACLError(null), false);
      assert.strictEqual(isACLError(undefined), false);
    });

    it('toACLError 应该转换普通错误', () => {
      const normalError = new Error('普通错误');
      const converted = toACLError(normalError);
      
      assert.ok(converted instanceof ACLError);
      assert.strictEqual(converted.message, '普通错误');
      assert.strictEqual(converted.code, 'UNKNOWN_ERROR');
    });

    it('toACLError 应该保持 ACLError 不变', () => {
      const aclError = new ACLError('测试', 'TEST');
      const result = toACLError(aclError);
      assert.strictEqual(result, aclError);
    });
  });

  describe('错误代码常量', () => {
    it('应该包含所有预期的错误代码', () => {
      assert.strictEqual(ErrorCodes.CONFIG_NOT_FOUND, 'CONFIG_1001');
      assert.strictEqual(ErrorCodes.GIT_AUTH_FAILED, 'GIT_2002');
      assert.strictEqual(ErrorCodes.SYNC_CONFLICT, 'SYNC_3001');
      assert.strictEqual(ErrorCodes.AUTH_TOKEN_MISSING, 'AUTH_5001');
    });
  });
});
