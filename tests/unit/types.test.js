import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ok, err } from '../../dist/shared/types/index.js';

describe('共享类型', () => {
  describe('Result 类型', () => {
    it('ok 应该创建成功的 Result', () => {
      const result = ok(42);
      
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data, 42);
      }
    });

    it('err 应该创建失败的 Result', () => {
      const error = new Error('test error');
      const result = err(error);
      
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.strictEqual(result.error, error);
      }
    });
  });
});
