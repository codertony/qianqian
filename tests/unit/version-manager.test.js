/**
 * Version Manager Tests - 版本管理器测试
 * 
 * @module version-manager-tests
 * @phase 3.5
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import simpleGit from 'simple-git';
import { VersionManager, createVersionManager, DowngradeStrategy } from '../../dist/features/version/manager.js';

describe('Version Manager', () => {
  let manager;
  let tempDir;
  let git;

  before(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'acl-version-test-'));
    git = simpleGit(tempDir);
    
    // 初始化 Git 仓库
    await git.init();
    await git.addConfig('user.email', 'test@test.com');
    await git.addConfig('user.name', 'Test User');
    
    // 创建初始提交
    await fs.writeFile(path.join(tempDir, 'README.md'), '# Test', 'utf-8');
    await git.add('.');
    await git.commit('Initial commit');
    
    manager = createVersionManager(git, tempDir);
  });

  after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('detectCurrentVersion', () => {
    it('应该检测当前版本', async () => {
      const version = await manager.detectCurrentVersion();

      assert.ok(version);
      assert.ok(version.hash);
      assert.ok(version.date);
      assert.ok(version.message);
    });
  });

  describe('getAvailableVersions', () => {
    it('应该返回可用版本列表', async () => {
      const versions = await manager.getAvailableVersions();

      assert.ok(Array.isArray(versions));
      assert.ok(versions.length >= 1);
    });
  });

  describe('版本锁定', () => {
    it('应该能锁定资产版本', async () => {
      await manager.lockVersion('asset-1', '1.0.0', 'Testing lock');

      const lock = await manager.getLock('asset-1');
      assert.ok(lock);
      assert.strictEqual(lock.assetId, 'asset-1');
      assert.strictEqual(lock.lockedVersion, '1.0.0');
      assert.strictEqual(lock.reason, 'Testing lock');
    });

    it('应该能解锁资产版本', async () => {
      await manager.lockVersion('asset-to-unlock', '2.0.0');
      
      let lock = await manager.getLock('asset-to-unlock');
      assert.ok(lock);

      await manager.unlockVersion('asset-to-unlock');
      
      lock = await manager.getLock('asset-to-unlock');
      assert.strictEqual(lock, null);
    });

    it('应该能检查资产是否已锁定', async () => {
      await manager.lockVersion('locked-asset', '1.5.0');

      const isLocked = await manager.isLocked('locked-asset');
      assert.strictEqual(isLocked, true);

      const isNotLocked = await manager.isLocked('nonexistent-asset');
      assert.strictEqual(isNotLocked, false);
    });

    it('应该返回所有版本锁定', async () => {
      const locks = await manager.getAllLocks();

      assert.ok(Array.isArray(locks));
      assert.ok(locks.length >= 1);
    });
  });

  describe('compareVersions', () => {
    it('应该正确比较版本号', () => {
      assert.strictEqual(manager.compareVersions('1.0.0', '1.0.0'), 0);
      assert.strictEqual(manager.compareVersions('1.1.0', '1.0.0'), 1);
      assert.strictEqual(manager.compareVersions('1.0.0', '1.1.0'), -1);
      assert.strictEqual(manager.compareVersions('2.0.0', '1.9.9'), 1);
      assert.strictEqual(manager.compareVersions('1.10.0', '1.2.0'), 1);
    });
  });

  describe('downgrade', () => {
    it('应该报告版本不存在', async () => {
      const result = await manager.downgrade('999.999.999');

      assert.strictEqual(result.success, false);
      assert.ok(result.error);
      assert.ok(result.error.includes('not found'));
    });
  });

  describe('createVersionManager', () => {
    it('应该创建新的 VersionManager 实例', () => {
      const newManager = createVersionManager(git, tempDir);

      assert.ok(newManager instanceof VersionManager);
      assert.notStrictEqual(newManager, manager);
    });
  });
});
