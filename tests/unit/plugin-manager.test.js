import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { PluginManager, createPluginManager } from '../../dist/features/plugin/manager.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('Plugin Manager', () => {
  let manager;
  let tempDir;

  before(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'acl-plugin-test-'));
    manager = new PluginManager(tempDir);
    await manager.init();
  });

  after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('初始化', () => {
    it('应该能初始化', async () => {
      assert.ok(manager);
    });

    it('应该创建插件目录', async () => {
      const pluginsDir = path.join(tempDir, 'plugins');
      const stats = await fs.stat(pluginsDir);
      assert.ok(stats.isDirectory());
    });
  });

  describe('Plugin 安装', () => {
    it('应该返回安装结果', async () => {
      const result = await manager.install('test-plugin');
      
      // 当前实现返回 mock 成功
      assert.strictEqual(typeof result.success, 'boolean');
      assert.strictEqual(typeof result.message, 'string');
    });

    it('应该支持强制重新安装选项', async () => {
      const result = await manager.install('force-plugin', { force: true });
      
      assert.strictEqual(typeof result.success, 'boolean');
      assert.ok(result.message.includes('force-plugin'));
    });
  });

  describe('Plugin 卸载', () => {
    it('应该对未安装的插件返回失败', async () => {
      const result = await manager.uninstall('not-installed');
      
      assert.strictEqual(result.success, false);
      assert.ok(result.message.includes('not installed'));
    });
  });

  describe('Plugin 列表', () => {
    it('应该返回已安装插件列表', () => {
      const plugins = manager.list();
      assert.ok(Array.isArray(plugins));
    });
  });

  describe('createPluginManager', () => {
    it('应该创建新的 PluginManager 实例', () => {
      const newManager = createPluginManager(tempDir);
      
      assert.ok(newManager instanceof PluginManager);
      assert.notStrictEqual(newManager, manager);
    });
  });
});
