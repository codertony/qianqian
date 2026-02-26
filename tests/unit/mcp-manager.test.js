/**
 * MCP Config Manager Tests - MCP 配置管理器测试
 * 
 * @module mcp-config-tests
 * @phase 3.3
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { MCPConfigManager, createMCPConfigManager } from '../../dist/features/mcp/manager.js';

describe('MCP Config Manager', () => {
  let manager;
  let tempDir;

  before(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'acl-mcp-test-'));
    manager = createMCPConfigManager(tempDir);
    await manager.init();
  });

  after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('初始化', () => {
    it('应该能创建实例', () => {
      assert.ok(manager instanceof MCPConfigManager);
    });

    it('应该创建 MCP 配置目录', async () => {
      const mcpDir = path.join(tempDir, 'mcp-configs');
      const stats = await fs.stat(mcpDir);
      assert.ok(stats.isDirectory());
    });
  });

  describe('save & load', () => {
    it('应该能保存和加载 MCP 配置', async () => {
      const config = {
        name: 'test-mcp',
        type: 'http',
        endpoint: 'https://api.example.com/mcp',
        timeout: 5000,
      };

      await manager.save(config);
      const loaded = await manager.load('test-mcp');

      assert.ok(loaded);
      assert.strictEqual(loaded.name, 'test-mcp');
      assert.strictEqual(loaded.type, 'http');
      assert.strictEqual(loaded.endpoint, 'https://api.example.com/mcp');
    });

    it('应该分离敏感信息到本地文件', async () => {
      const config = {
        name: 'secret-mcp',
        type: 'http',
        endpoint: 'https://api.example.com/mcp',
        env: {
          API_KEY: 'secret-key-123',
          TOKEN: 'token-456',
        },
      };

      await manager.save(config);

      // 检查公开配置不包含敏感信息
      const publicPath = path.join(tempDir, 'mcp-configs', 'secret-mcp.yaml');
      const publicContent = await fs.readFile(publicPath, 'utf-8');
      assert.ok(!publicContent.includes('secret-key-123'));
      assert.ok(!publicContent.includes('token-456'));

      // 检查敏感信息保存在本地文件
      const localPath = path.join(tempDir, 'mcp-configs', 'secret-mcp.env.local');
      const localContent = await fs.readFile(localPath, 'utf-8');
      assert.ok(localContent.includes('API_KEY=secret-key-123'));
      assert.ok(localContent.includes('TOKEN=token-456'));
    });

    it('应该能加载包含环境变量的配置', async () => {
      const loaded = await manager.load('secret-mcp');

      assert.ok(loaded);
      assert.ok(loaded.env);
      assert.strictEqual(loaded.env.API_KEY, 'secret-key-123');
      assert.strictEqual(loaded.env.TOKEN, 'token-456');
    });

    it('应该对不存在的配置返回 null', async () => {
      const loaded = await manager.load('nonexistent');

      assert.strictEqual(loaded, null);
    });
  });

  describe('list', () => {
    it('应该列出所有 MCP 配置', async () => {
      const configs = await manager.list();

      assert.ok(Array.isArray(configs));
      assert.ok(configs.length >= 2);
    });
  });

  describe('delete', () => {
    it('应该能删除 MCP 配置', async () => {
      const config = {
        name: 'to-delete',
        type: 'stdio',
        command: 'node',
        args: ['script.js'],
      };

      await manager.save(config);
      let loaded = await manager.load('to-delete');
      assert.ok(loaded);

      await manager.delete('to-delete');
      loaded = await manager.load('to-delete');
      assert.strictEqual(loaded, null);
    });
  });

  describe('createTemplate', () => {
    it('应该创建环境变量模板', async () => {
      await manager.createTemplate('my-mcp', ['API_KEY', 'SECRET', 'ENDPOINT']);

      const templatePath = path.join(tempDir, 'mcp-configs', 'my-mcp.env.template');
      const content = await fs.readFile(templatePath, 'utf-8');

      assert.ok(content.includes('API_KEY=your_api_key_here'));
      assert.ok(content.includes('SECRET=your_secret_here'));
      assert.ok(content.includes('ENDPOINT=your_endpoint_here'));
    });
  });

  describe('scanSecrets', () => {
    it('应该返回扫描结果数组', async () => {
      const results = await manager.scanSecrets();

      assert.ok(Array.isArray(results));
    });
  });

  describe('createMCPConfigManager', () => {
    it('应该创建新的 MCPConfigManager 实例', () => {
      const newManager = createMCPConfigManager(tempDir);

      assert.ok(newManager instanceof MCPConfigManager);
      assert.notStrictEqual(newManager, manager);
    });
  });
});
