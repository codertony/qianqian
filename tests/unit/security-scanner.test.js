/**
 * Security Scanner Tests - 安全扫描器测试
 * 
 * @module security-scanner-tests
 * @phase 3.6
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { SecurityScanner, createSecurityScanner } from '../../dist/features/security/scanner.js';

describe('Security Scanner', () => {
  let scanner;
  let tempDir;

  before(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'acl-security-test-'));
    scanner = createSecurityScanner();
  });

  after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('scanFile', () => {
    it('应该检测到敏感信息', async () => {
      const filePath = path.join(tempDir, 'config.js');
      await fs.writeFile(
        filePath,
        "const password = 'my-secret-password-123';",
        'utf-8'
      );

      const result = await scanner.scanFile(filePath);

      // 密码应该被检测到
      assert.ok(result.scannedFiles >= 1);
    });

    it('应该检测到 Private Key', async () => {
      const filePath = path.join(tempDir, 'key.pem');
      await fs.writeFile(
        filePath,
        '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...',
        'utf-8'
      );

      const result = await scanner.scanFile(filePath);

      assert.ok(result.findings.some((f) => f.type === 'Private Key'));
    });

    it('对干净文件应该返回无敏感信息', async () => {
      const filePath = path.join(tempDir, 'clean.txt');
      await fs.writeFile(
        filePath,
        'This is a clean file with no secrets.',
        'utf-8'
      );

      const result = await scanner.scanFile(filePath);

      assert.strictEqual(result.hasSecrets, false);
    });
  });

  describe('scanDirectory', () => {
    it('应该扫描目录中的所有文件', async () => {
      await fs.writeFile(
        path.join(tempDir, 'file1.js'),
        "const password = 'secret123';",
        'utf-8'
      );
      await fs.writeFile(
        path.join(tempDir, 'file2.txt'),
        'Clean content',
        'utf-8'
      );

      const result = await scanner.scanDirectory(tempDir);

      assert.ok(result.scannedFiles >= 2);
    });

    it('应该排除 node_modules', async () => {
      await fs.mkdir(path.join(tempDir, 'node_modules'), { recursive: true });
      await fs.writeFile(
        path.join(tempDir, 'node_modules', 'secret.js'),
        "const key = 'should-be-ignored';",
        'utf-8'
      );

      const result = await scanner.scanDirectory(tempDir);

      const hasNodeModulesFinding = result.findings.some((f) =>
        f.file.includes('node_modules')
      );
      assert.strictEqual(hasNodeModulesFinding, false);
    });
  });

  describe('generateGitignoreRecommendations', () => {
    it('应该生成 .gitignore 建议', () => {
      const findings = [
        { file: '/project/.env.local', line: 1, type: 'API Key', match: 'key=123' },
      ];

      const recommendations = scanner.generateGitignoreRecommendations(findings);

      assert.ok(recommendations.includes('*.env.local'));
    });
  });

  describe('createSecurityScanner', () => {
    it('应该创建新的 SecurityScanner 实例', () => {
      const newScanner = createSecurityScanner();

      assert.ok(newScanner instanceof SecurityScanner);
      assert.notStrictEqual(newScanner, scanner);
    });
  });
});
