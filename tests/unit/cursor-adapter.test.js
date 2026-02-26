import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { CursorAdapter } from '../../dist/adapters/cursor.js';
import { AssetType } from '../../dist/core/asset/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('Cursor 适配器', () => {
  let adapter;
  let tempDir;
  let originalCwd;

  before(async () => {
    adapter = new CursorAdapter();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'acl-cursor-test-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  after(async () => {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('adapt Prompt', () => {
    it('应该将 Prompt 转换为 MDC 格式', async () => {
      const prompt = {
        id: 'prompt-test',
        name: 'test-prompt',
        type: AssetType.PROMPT,
        version: '1.0.0',
        description: 'Test description',
        content: 'You are a helpful assistant.',
        scope: 'project',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const configs = await adapter.adapt(prompt);

      assert.strictEqual(configs.length, 1);
      // 使用 path.normalize 来处理 Windows 路径
      assert.ok(configs[0].path.includes(path.normalize('.cursor/rules')));
      assert.ok(configs[0].path.includes('test-prompt.mdc'));
      assert.ok(configs[0].content.includes('---'));
      assert.ok(configs[0].content.includes('Test description'));
      assert.ok(configs[0].content.includes('You are a helpful assistant.'));
    });
  });

  describe('getCompatibility', () => {
    it('应该报告 Prompt 完全兼容', () => {
      const prompt = {
        id: 'prompt-test',
        name: 'test',
        type: AssetType.PROMPT,
        version: '1.0.0',
        scope: 'project',
        content: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const compatibility = adapter.getCompatibility(prompt);
      assert.strictEqual(compatibility.compatible, true);
    });
  });
});
