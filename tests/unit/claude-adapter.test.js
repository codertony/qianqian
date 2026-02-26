/**
 * Claude Code Adapter Tests - Claude Code 适配器测试
 * 
 * @module claude-adapter-tests
 * @phase 3.4
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { ClaudeCodeAdapter } from '../../dist/adapters/claude-code.js';
import { AssetType } from '../../dist/core/asset/index.js';

describe('Claude Code 适配器', () => {
  let adapter;
  let tempDir;
  let originalCwd;

  before(async () => {
    adapter = new ClaudeCodeAdapter();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'acl-claude-test-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  after(async () => {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('detect', () => {
    it('应该检测到 Claude Code 环境', async () => {
      await fs.mkdir('.claude', { recursive: true });
      
      const detected = await adapter.detect();
      assert.strictEqual(detected, true);
      
      // 清理
      await fs.rm('.claude', { recursive: true, force: true });
    });

    it('应该返回 false 如果没有 Claude Code 环境', async () => {
      const detected = await adapter.detect();
      assert.strictEqual(detected, false);
    });
  });
});
