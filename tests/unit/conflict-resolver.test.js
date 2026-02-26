import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  ConflictType, 
  ConflictStrategy, 
  ConflictResolver 
} from '../../dist/features/conflict/resolver.js';

describe('冲突解决器', () => {
  describe('ConflictType', () => {
    it('应该定义所有冲突类型', () => {
      assert.strictEqual(ConflictType.LOCAL_REMOTE, 'local_remote');
      assert.strictEqual(ConflictType.FILE_EXISTS, 'file_exists');
      assert.strictEqual(ConflictType.CONTENT, 'content');
    });
  });

  describe('ConflictStrategy', () => {
    it('应该定义所有解决策略', () => {
      assert.strictEqual(ConflictStrategy.LOCAL, 'local');
      assert.strictEqual(ConflictStrategy.REMOTE, 'remote');
      assert.strictEqual(ConflictStrategy.MERGE, 'merge');
      assert.strictEqual(ConflictStrategy.AI_MERGE, 'ai_merge');
    });
  });

  describe('ConflictResolver', () => {
    it('应该能创建实例', () => {
      const resolver = new ConflictResolver();
      assert.ok(resolver);
    });

    it('应该支持 LOCAL 策略', async () => {
      const resolver = new ConflictResolver();
      const conflict = {
        id: 'test-1',
        assetId: 'asset-1',
        assetName: 'test-prompt',
        assetType: 'prompt',
        type: ConflictType.CONTENT,
        localContent: 'local version',
        remoteContent: 'remote version',
      };

      const result = await resolver.resolveConflict(conflict, ConflictStrategy.LOCAL);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.resolvedContent, 'local version');
    });

    it('应该支持 REMOTE 策略', async () => {
      const resolver = new ConflictResolver();
      const conflict = {
        id: 'test-2',
        assetId: 'asset-2',
        assetName: 'test-prompt',
        assetType: 'prompt',
        type: ConflictType.CONTENT,
        localContent: 'local version',
        remoteContent: 'remote version',
      };

      const result = await resolver.resolveConflict(conflict, ConflictStrategy.REMOTE);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.resolvedContent, 'remote version');
    });
  });
});
