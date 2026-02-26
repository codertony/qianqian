import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { CompatibilityChecker } from '../../dist/features/compatibility/checker.js';

describe('兼容性检查器', () => {
  let checker;

  before(() => {
    checker = new CompatibilityChecker();
  });

  describe('初始化', () => {
    it('应该能创建实例', () => {
      assert.ok(checker);
    });
  });

  describe('平台注册', () => {
    it('应该能注册平台', () => {
      assert.doesNotThrow(() => {
        checker.registerPlatform('cursor', '0.45.0');
      });
    });
  });
});
