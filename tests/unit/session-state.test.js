/**
 * Session State Manager Tests - 会话状态管理器测试
 * 
 * @module session-state-tests
 * @phase 3.5
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { SessionStateManager, createSessionStateManager } from '../../dist/features/session/state-manager.js';

describe('Session State Manager', () => {
  let manager;
  let tempDir;

  before(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'acl-session-test-'));
    manager = createSessionStateManager(tempDir);
    await manager.init();
  });

  after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('初始化', () => {
    it('应该能创建实例', () => {
      assert.ok(manager instanceof SessionStateManager);
    });

    it('应该创建会话状态目录', async () => {
      const stateDir = path.join(tempDir, 'session-states');
      const stats = await fs.stat(stateDir);
      assert.ok(stats.isDirectory());
    });
  });

  describe('saveState & loadState', () => {
    it('应该能保存和加载会话状态', async () => {
      const state = {
        id: 'session-1',
        platform: 'cursor',
        context: { project: 'test-project' },
        history: [
          { timestamp: new Date(), action: 'init', data: {} },
        ],
        lastUpdated: new Date(),
      };

      await manager.saveState(state);
      const loaded = await manager.loadState('cursor', 'session-1');

      assert.ok(loaded);
      assert.strictEqual(loaded.id, 'session-1');
      assert.strictEqual(loaded.platform, 'cursor');
      assert.ok(loaded.context);
      assert.strictEqual(loaded.context.project, 'test-project');
    });

    it('对不存在的会话应该返回 null', async () => {
      const loaded = await manager.loadState('cursor', 'nonexistent');
      assert.strictEqual(loaded, null);
    });
  });

  describe('getPlatformSessions', () => {
    it('应该返回平台所有会话', async () => {
      await manager.saveState({
        id: 'session-a',
        platform: 'opencode',
        context: {},
        lastUpdated: new Date(),
      });
      await manager.saveState({
        id: 'session-b',
        platform: 'opencode',
        context: {},
        lastUpdated: new Date(),
      });

      const sessions = await manager.getPlatformSessions('opencode');

      assert.ok(Array.isArray(sessions));
      assert.ok(sessions.length >= 2);
    });
  });

  describe('deleteState', () => {
    it('应该能删除会话状态', async () => {
      await manager.saveState({
        id: 'to-delete',
        platform: 'claude',
        context: {},
        lastUpdated: new Date(),
      });

      let loaded = await manager.loadState('claude', 'to-delete');
      assert.ok(loaded);

      await manager.deleteState('claude', 'to-delete');

      loaded = await manager.loadState('claude', 'to-delete');
      assert.strictEqual(loaded, null);
    });
  });

  describe('syncStates', () => {
    it('应该能同步会话状态到另一平台', async () => {
      await manager.saveState({
        id: 'sync-test',
        platform: 'cursor',
        context: { key: 'value' },
        lastUpdated: new Date(),
      });

      const result = await manager.syncStates('cursor', 'opencode');

      assert.ok(result.success);
      assert.ok(result.syncedSessions.includes('sync-test'));

      const syncedSession = await manager.loadState('opencode', 'sync-test-synced');
      assert.ok(syncedSession);
      assert.strictEqual(syncedSession.platform, 'opencode');
    });
  });

  describe('createSessionStateManager', () => {
    it('应该创建新的 SessionStateManager 实例', () => {
      const newManager = createSessionStateManager(tempDir);

      assert.ok(newManager instanceof SessionStateManager);
      assert.notStrictEqual(newManager, manager);
    });
  });
});
