import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { 
  ensureDir, 
  fileExists, 
  readJson, 
  writeJson, 
  getContentHash,
  resolveHome 
} from '../../dist/shared/fs/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('文件系统工具', () => {
  let tempDir;

  before(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'acl-fs-test-'));
  });

  after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('ensureDir', () => {
    it('应该创建不存在的目录', async () => {
      const newDir = path.join(tempDir, 'new', 'nested', 'dir');
      await ensureDir(newDir);
      
      const stats = await fs.stat(newDir);
      assert.strictEqual(stats.isDirectory(), true);
    });

    it('不应该抛出错误如果目录已存在', async () => {
      const existingDir = path.join(tempDir, 'existing');
      await fs.mkdir(existingDir);
      
      await assert.doesNotReject(ensureDir(existingDir));
    });
  });

  describe('fileExists', () => {
    it('应该返回 true 如果文件存在', async () => {
      const filePath = path.join(tempDir, 'test.txt');
      await fs.writeFile(filePath, 'content');
      
      assert.strictEqual(await fileExists(filePath), true);
    });

    it('应该返回 false 如果文件不存在', async () => {
      const filePath = path.join(tempDir, 'nonexistent.txt');
      assert.strictEqual(await fileExists(filePath), false);
    });
  });

  describe('readJson / writeJson', () => {
    it('应该正确写入和读取 JSON', async () => {
      const filePath = path.join(tempDir, 'data.json');
      const data = { name: 'test', value: 123 };
      
      await writeJson(filePath, data);
      const result = await readJson(filePath);
      
      assert.deepStrictEqual(result, data);
    });

    it('应该返回 null 如果文件不存在', async () => {
      const filePath = path.join(tempDir, 'nonexistent.json');
      const result = await readJson(filePath);
      
      assert.strictEqual(result, null);
    });
  });

  describe('getContentHash', () => {
    it('应该为相同内容生成相同哈希', () => {
      const hash1 = getContentHash('test content');
      const hash2 = getContentHash('test content');
      
      assert.strictEqual(hash1, hash2);
      assert.strictEqual(hash1.length, 64);
    });

    it('应该为不同内容生成不同哈希', () => {
      const hash1 = getContentHash('content1');
      const hash2 = getContentHash('content2');
      
      assert.notStrictEqual(hash1, hash2);
    });
  });

  describe('resolveHome', () => {
    it('应该解析 ~ 为 home 目录', () => {
      const home = process.env.HOME || process.env.USERPROFILE || '';
      const result = resolveHome('~/test');
      assert.strictEqual(result, path.join(home, 'test'));
    });
  });
});
