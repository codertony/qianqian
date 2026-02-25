/**
 * MCP Config - MCP 配置管理
 *
 * @module mcp-config
 */

import * as path from 'path';
import { promises as fs } from 'fs';
import { logger } from '../../shared/logger';
import { fileExists, ensureDir } from '../../shared/utils';
import { readYaml, writeYaml } from '../../shared/fs';

/**
 * MCP 配置
 */
export interface MCPConfig {
  /** 服务名称 */
  name: string;
  /** 服务类型 */
  type: 'sse' | 'stdio' | 'http';
  /** 服务端点 */
  endpoint?: string;
  /** 命令（stdio 类型） */
  command?: string;
  /** 参数（stdio 类型） */
  args?: string[];
  /** 环境变量 */
  env?: Record<string, string>;
  /** 超时时间（毫秒） */
  timeout?: number;
}

/**
 * MCP 配置管理器
 */
export class MCPConfigManager {
  private mcpDir: string;

  constructor(aclDir: string) {
    this.mcpDir = path.join(aclDir, 'mcp-configs');
  }

  /**
   * 初始化
   */
  async init(): Promise<void> {
    await ensureDir(this.mcpDir);
  }

  /**
   * 获取所有 MCP 配置
   */
  async list(): Promise<MCPConfig[]> {
    if (!(await fileExists(this.mcpDir))) {
      return [];
    }

    const configs: MCPConfig[] = [];
    const files = await fs.readdir(this.mcpDir);

    for (const file of files) {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        const config = await this.load(file.replace(/\.ya?ml$/, ''));
        if (config) {
          configs.push(config);
        }
      }
    }

    return configs;
  }

  /**
   * 加载 MCP 配置
   */
  async load(name: string): Promise<MCPConfig | null> {
    const configPath = path.join(this.mcpDir, `${name}.yaml`);
    const templatePath = path.join(this.mcpDir, `${name}.env.template`);
    const localPath = path.join(this.mcpDir, `${name}.env.local`);

    if (!(await fileExists(configPath))) {
      return null;
    }

    try {
      const config = (await readYaml(configPath)) as MCPConfig;

      // 加载本地环境变量（敏感信息）
      if (await fileExists(localPath)) {
        const localEnv = await this.loadEnvFile(localPath);
        config.env = { ...config.env, ...localEnv };
      }

      return config;
    } catch (error) {
      logger.error(`Failed to load MCP config: ${name}`, { error });
      return null;
    }
  }

  /**
   * 保存 MCP 配置
   */
  async save(config: MCPConfig): Promise<void> {
    const configPath = path.join(this.mcpDir, `${config.name}.yaml`);
    const localPath = path.join(this.mcpDir, `${config.name}.env.local`);

    // 分离敏感信息
    const publicConfig: MCPConfig = {
      ...config,
      env: undefined,
    };

    // 保存公开配置
    await writeYaml(configPath, publicConfig);

    // 保存敏感信息到本地文件
    if (config.env && Object.keys(config.env).length > 0) {
      await this.saveEnvFile(localPath, config.env);
      // 确保 .gitignore 包含 .env.local
      await this.ensureGitignore();
    }

    logger.info(`MCP config saved: ${config.name}`);
  }

  /**
   * 删除 MCP 配置
   */
  async delete(name: string): Promise<void> {
    const configPath = path.join(this.mcpDir, `${name}.yaml`);
    const templatePath = path.join(this.mcpDir, `${name}.env.template`);
    const localPath = path.join(this.mcpDir, `${name}.env.local`);

    for (const file of [configPath, templatePath, localPath]) {
      if (await fileExists(file)) {
        await fs.unlink(file);
      }
    }

    logger.info(`MCP config deleted: ${name}`);
  }

  /**
   * 创建环境变量模板
   */
  async createTemplate(name: string, envVars: string[]): Promise<void> {
    const templatePath = path.join(this.mcpDir, `${name}.env.template`);

    const template = envVars
      .map((key) => `${key}=your_${key.toLowerCase()}_here`)
      .join('\n');

    await fs.writeFile(templatePath, template, 'utf-8');
    logger.info(`Created env template: ${name}`);
  }

  /**
   * 扫描敏感信息
   */
  async scanSecrets(): Promise<Array<{ file: string; secrets: string[] }>> {
    const results: Array<{ file: string; secrets: string[] }> = [];
    const files = await fs.readdir(this.mcpDir);

    for (const file of files) {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        const filePath = path.join(this.mcpDir, file);
        const content = await fs.readFile(filePath, 'utf-8');

        const secrets = this.detectSecrets(content);
        if (secrets.length > 0) {
          results.push({ file, secrets });
        }
      }
    }

    return results;
  }

  /**
   * 检测敏感信息
   */
  private detectSecrets(content: string): string[] {
    const secrets: string[] = [];
    const patterns = [
      { name: 'API Key', regex: /['"]?(api[_-]?key|apikey)['"]?\s*[:=]\s*['"]([a-zA-Z0-9_-]+)['"]/i },
      { name: 'Token', regex: /['"]?token['"]?\s*[:=]\s*['"]([a-zA-Z0-9_-]+)['"]/i },
      { name: 'Password', regex: /['"]?password['"]?\s*[:=]\s*['"]([^'"]+)['"]/i },
      { name: 'Secret', regex: /['"]?(secret|private[_-]?key)['"]?\s*[:=]\s*['"]([^'"]+)['"]/i },
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(content)) {
        secrets.push(pattern.name);
      }
    }

    return secrets;
  }

  /**
   * 加载环境变量文件
   */
  private async loadEnvFile(filePath: string): Promise<Record<string, string>> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const env: Record<string, string> = {};

      for (const line of content.split('\n')) {
        const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
        if (match) {
          env[match[1]] = match[2];
        }
      }

      return env;
    } catch {
      return {};
    }
  }

  /**
   * 保存环境变量文件
   */
  private async saveEnvFile(filePath: string, env: Record<string, string>): Promise<void> {
    const content = Object.entries(env)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    await fs.writeFile(filePath, content, 'utf-8');
  }

  /**
   * 确保 .gitignore 包含敏感文件
   */
  private async ensureGitignore(): Promise<void> {
    const gitignorePath = path.join(this.mcpDir, '.gitignore');
    const entries = ['*.env.local', '*.env.secrets'];

    let content = '';
    if (await fileExists(gitignorePath)) {
      content = await fs.readFile(gitignorePath, 'utf-8');
    }

    for (const entry of entries) {
      if (!content.includes(entry)) {
        content += `\n${entry}`;
      }
    }

    await fs.writeFile(gitignorePath, content.trim(), 'utf-8');
  }
}

/**
 * 创建 MCP 配置管理器
 */
export function createMCPConfigManager(aclDir: string): MCPConfigManager {
  return new MCPConfigManager(aclDir);
}
