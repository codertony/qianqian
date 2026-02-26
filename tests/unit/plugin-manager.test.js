import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { PluginManager } from '../../dist/features/plugin/manager.js';
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

  describe('Plugin 列表', () => {
    it('应该返回已安装插件列表', () => {
      const plugins = manager.list();
      assert.ok(Array.isArray(plugins));
    });
  });
});
