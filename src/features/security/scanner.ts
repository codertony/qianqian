/**
 * Security Scanner - 安全扫描器
 *
 * 敏感信息扫描和安全检查
 *
 * @module security-scanner
 * @phase 3.6
 */

import * as path from 'path';
import { promises as fs } from 'fs';
import { logger } from '../../shared/logger';
import { fileExists } from '../../shared/utils';

/**
 * 扫描结果
 */
export interface ScanResult {
  /** 是否发现敏感信息 */
  hasSecrets: boolean;
  /** 发现的敏感信息 */
  findings: Array<{
    file: string;
    line: number;
    type: string;
    match: string;
  }>;
  /** 扫描的文件数 */
  scannedFiles: number;
}

/**
 * 敏感信息模式
 */
interface SecretPattern {
  name: string;
  regex: RegExp;
  severity: 'high' | 'medium' | 'low';
}

/**
 * 安全扫描器
 */
export class SecurityScanner {
  private patterns: SecretPattern[] = [
    // API Keys
    {
      name: 'API Key',
      regex: /['"\b]([a-zA-Z0-9_-]*(?:api[_-]?key|apikey)[a-zA-Z0-9_-]*)['"]\s*[:=]\s*['"]([a-zA-Z0-9_\-\.]+)['"]/i,
      severity: 'high',
    },
    // Private Keys
    {
      name: 'Private Key',
      regex: /-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/,
      severity: 'high',
    },
    // AWS Access Key ID
    {
      name: 'AWS Access Key ID',
      regex: /AKIA[0-9A-Z]{16}/,
      severity: 'high',
    },
    // AWS Secret Access Key
    {
      name: 'AWS Secret Key',
      regex: /['"]([0-9a-zA-Z/+]{40})['"]/,
      severity: 'high',
    },
    // GitHub Token
    {
      name: 'GitHub Token',
      regex: /gh[pousr]_[a-zA-Z0-9]{36}/,
      severity: 'high',
    },
    // Slack Token
    {
      name: 'Slack Token',
      regex: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}(-[a-zA-Z0-9]{24})?/,
      severity: 'high',
    },
    // Generic Password
    {
      name: 'Password',
      regex: /['"\b](?:password|passwd|pwd)['"]\s*[:=]\s*['"]([^'"\s]{8,})['"]/i,
      severity: 'medium',
    },
    // Secret
    {
      name: 'Secret',
      regex: /['"\b](?:secret|private[_-]?key|auth[_-]?token)['"]\s*[:=]\s*['"]([^'"\s]{8,})['"]/i,
      severity: 'medium',
    },
    // URL with credentials
    {
      name: 'URL with Credentials',
      regex: /(https?:\/\/)([^:\s]+):([^@\s]+)@/,
      severity: 'high',
    },
    // JWT Token
    {
      name: 'JWT Token',
      regex: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/,
      severity: 'medium',
    },
  ];

  private excludedPatterns = [
    /node_modules/,
    /\.git\//,
    /\.env\.template/,
    /\.env\.example/,
    /dist\//,
    /build\//,
    /coverage\//,
  ];

  /**
   * 扫描目录
   */
  async scanDirectory(dirPath: string): Promise<ScanResult> {
    const result: ScanResult = {
      hasSecrets: false,
      findings: [],
      scannedFiles: 0,
    };

    try {
      await this.scanRecursive(dirPath, result);
    } catch (error) {
      logger.error('Security scan failed', { error });
    }

    result.hasSecrets = result.findings.length > 0;
    
    if (result.hasSecrets) {
      logger.warn(`Security scan found ${result.findings.length} potential secrets`);
    } else {
      logger.info('Security scan completed - no secrets found');
    }

    return result;
  }

  /**
   * 扫描单个文件
   */
  async scanFile(filePath: string): Promise<ScanResult> {
    const result: ScanResult = {
      hasSecrets: false,
      findings: [],
      scannedFiles: 0,
    };

    if (!(await fileExists(filePath))) {
      return result;
    }

    await this.scanFileContent(filePath, result);
    
    result.hasSecrets = result.findings.length > 0;
    return result;
  }

  /**
   * 递归扫描
   */
  private async scanRecursive(dirPath: string, result: ScanResult): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // 检查排除模式
      if (this.shouldExclude(fullPath)) {
        continue;
      }

      if (entry.isDirectory()) {
        await this.scanRecursive(fullPath, result);
      } else if (entry.isFile()) {
        await this.scanFileContent(fullPath, result);
      }
    }
  }

  /**
   * 扫描文件内容
   */
  private async scanFileContent(filePath: string, result: ScanResult): Promise<void> {
    // 只扫描文本文件
    const textExtensions = ['.js', '.ts', '.json', '.yaml', '.yml', '.md', '.txt', '.env', '.pem', '.key'];
    const ext = path.extname(filePath).toLowerCase();
    
    if (!textExtensions.includes(ext) && !filePath.includes('.env')) {
      return;
    }

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];

        for (const pattern of this.patterns) {
          const matches = line.match(pattern.regex);
          if (matches) {
            result.findings.push({
              file: filePath,
              line: lineNum + 1,
              type: pattern.name,
              match: matches[0].substring(0, 50) + (matches[0].length > 50 ? '...' : ''),
            });
          }
        }
      }

      result.scannedFiles++;
    } catch {
      // 忽略无法读取的文件
    }
  }

  /**
   * 检查是否应该排除
   */
  private shouldExclude(filePath: string): boolean {
    return this.excludedPatterns.some((pattern) => pattern.test(filePath));
  }

  /**
   * 生成 .gitignore 建议
   */
  generateGitignoreRecommendations(findings: ScanResult['findings']): string[] {
    const recommendations = new Set<string>();

    for (const finding of findings) {
      const dir = path.dirname(finding.file);
      const filename = path.basename(finding.file);

      if (filename.includes('.env') && !filename.includes('.template')) {
        recommendations.add('*.env.local');
        recommendations.add('*.env.secrets');
      }

      if (filename.includes('config') && finding.type.includes('Key')) {
        recommendations.add('config.local.json');
      }
    }

    return Array.from(recommendations);
  }

  /**
   * 添加自定义模式
   */
  addPattern(name: string, regex: RegExp, severity: 'high' | 'medium' | 'low'): void {
    this.patterns.push({ name, regex, severity });
  }

  /**
   * 排除路径
   */
  excludePattern(pattern: RegExp): void {
    this.excludedPatterns.push(pattern);
  }
}

/**
 * 创建安全扫描器
 */
export function createSecurityScanner(): SecurityScanner {
  return new SecurityScanner();
}
