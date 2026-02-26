/**
 * Cloud Code Adapter Tests - Cloud Code 适配器测试
 * 
 * @module cloud-code-adapter-tests
 * @phase 3.4
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { CloudCodeAdapter, createCloudCodeAdapter } from '../../dist/adapters/cloud-code.js';
import { AssetType } from '../../dist/core/asset/index.js';

describe('Cloud Code 适配器', () => {
  let adapter;
  let tempDir;
  let originalCwd;
  let originalCodespaces;

  before(async () => {
    adapter = createCloudCodeAdapter();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'acl-cloudcode-test-'));
    originalCwd = process.cwd();
    originalCodespaces = process.env.CODESPACES;
    process.chdir(tempDir);
  });

  after(async () => {
    process.chdir(originalCwd);
    if (originalCodespaces !== undefined) {
      process.env.CODESPACES = originalCodespaces;
    } else {
      delete process.env.CODESPACES;
    }
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('detect', () => {
    it('应该检测到 Cloud Code 环境 (通过目录)', async () => {
      await fs.mkdir('.github/copilot', { recursive: true });
      
      const detected = await adapter.detect();
      assert.strictEqual(detected, true);

      await fs.rm('.github', { recursive: true, force: true });
    });

    it('应该检测到 Cloud Code 环境 (通过环境变量)', async () => {
      process.env.CODESPACES = 'true';
      
      const detected = await adapter.detect();
      assert.strictEqual(detected, true);

      delete process.env.CODESPACES;
    });

    it('应该返回 false 如果没有 Cloud Code 环境', async () => {
      delete process.env.CODESPACES;
      
      const detected = await adapter.detect();
      assert.strictEqual(detected, false);
    });
  });

  describe('adapt Prompt', () => {
    it('应该将 Prompt 转换为 Cloud Code Instructions 格式', async () => {
      const prompt = {
        id: 'test-prompt',
        name: 'code-reviewer',
        type: AssetType.PROMPT,
        version: '1.0.0',
        scope: 'system',
        content: 'Review code for best practices and potential bugs.',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await adapter.adapt(prompt);

      assert.ok(result.files);
      assert.strictEqual(result.files.length, 1);
      assert.strictEqual(result.files[0].path, '.github/copilot-instructions.md');
      assert.ok(result.files[0].content.includes('# code-reviewer'));
      assert.ok(result.files[0].content.includes('Review code'));
    });
  });

  describe('adapt Agent', () => {
    it('应该将 Agent 转换为 Cloud Code 配置', async () => {
      const agent = {
        id: 'test-agent',
        name: 'backend-expert',
        type: AssetType.AGENT,
        version: '1.0.0',
        purpose: 'Backend development expert',
        capabilities: ['API Design', 'Database Optimization', 'Testing'],
        knowledge: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await adapter.adapt(agent);

      assert.ok(result.files);
      assert.strictEqual(result.files.length, 1);
      assert.strictEqual(result.files[0].path, '.github/copilot/backend-expert.md');
      assert.ok(result.files[0].content.includes('# backend-expert'));
      assert.ok(result.files[0].content.includes('Backend development expert'));
      assert.ok(result.files[0].content.includes('API Design'));
    });
  });

  describe('getCompatibility', () => {
    it('应该报告 Prompt 完全兼容', () => {
      const prompt = {
        id: 'test',
        name: 'test',
        type: AssetType.PROMPT,
        version: '1.0.0',
        scope: 'system',
        content: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const compat = adapter.getCompatibility(prompt);

      assert.strictEqual(compat.compatible, true);
      assert.strictEqual(compat.unsupported.length, 0);
    });

    it('应该警告 Agent 支持有限', () => {
      const agent = {
        id: 'test',
        name: 'test',
        type: AssetType.AGENT,
        version: '1.0.0',
        purpose: 'Test',
        capabilities: [],
        knowledge: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const compat = adapter.getCompatibility(agent);

      assert.strictEqual(compat.compatible, true);
      assert.ok(compat.warnings.some(w => w.includes('basic')));
    });
  });

  describe('apply', () => {
    it('应该将文件写入目标目录', async () => {
      const adapted = {
        files: [
          {
            path: '.github/copilot-instructions.md',
            content: '# Test Instructions',
          },
        ],
      };

      await adapter.apply(adapted, tempDir);

      const filePath = path.join(tempDir, '.github/copilot-instructions.md');
      const content = await fs.readFile(filePath, 'utf-8');
      assert.strictEqual(content, '# Test Instructions');
    });
  });

  describe('reverseAdapt', () => {
    it('应该从 instructions 文件提取资产', async () => {
      await fs.mkdir('.github', { recursive: true });
      await fs.writeFile(
        '.github/copilot-instructions.md',
        '# my-prompt\n\nThis is my prompt content.',
        'utf-8'
      );

      const assets = await adapter.reverseAdapt(tempDir);

      assert.ok(Array.isArray(assets));
      assert.strictEqual(assets.length, 1);
      assert.strictEqual(assets[0].name, 'my-prompt');
      assert.strictEqual(assets[0].type, AssetType.PROMPT);

      await fs.rm('.github', { recursive: true, force: true });
    });
  });

  describe('createCloudCodeAdapter', () => {
    it('应该创建新的 CloudCodeAdapter 实例', () => {
      const newAdapter = createCloudCodeAdapter();

      assert.ok(newAdapter instanceof CloudCodeAdapter);
      assert.notStrictEqual(newAdapter, adapter);
    });
  });
});
