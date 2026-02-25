/**
 * Adapters - Cursor 平台适配器
 *
 * 将 ACL 资产转换为 Cursor 格式
 *
 * @module cursor-adapter
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { Asset, AssetType, PromptAsset, AgentAsset } from '../core/asset';
import { logger } from '../shared/logger';
import { ensureDir, fileExists } from '../shared/utils';

/**
 * Cursor 配置
 */
interface CursorConfig {
  description?: string;
  globs?: string[];
  alwaysApply?: boolean;
}

/**
 * Cursor 适配器
 */
export class CursorAdapter {
  readonly name = 'cursor';
  readonly displayName = 'Cursor';
  readonly supportedAssetTypes = ['prompt', 'agent'];

  private readonly rulesDir = '.cursor/rules';
  private readonly rulesFile = '.cursorrules';

  /**
   * 检测当前环境是否为 Cursor
   */
  async detect(): Promise<boolean> {
    try {
      const hasRulesDir = await fileExists(this.rulesDir);
      const hasRulesFile = await fileExists(this.rulesFile);
      return hasRulesDir || hasRulesFile;
    } catch {
      return false;
    }
  }

  /**
   * 获取 Cursor 版本
   */
  async getVersion(): Promise<string | undefined> {
    return undefined;
  }

  /**
   * 将资产转换为 Cursor 格式
   */
  async adapt(asset: Asset): Promise<Array<{ path: string; content: string }>> {
    switch (asset.type) {
      case 'prompt':
        return this.adaptPrompt(asset as PromptAsset);
      case 'agent':
        return this.adaptAgent(asset as AgentAsset);
      default:
        logger.warn(`Asset type ${asset.type} not supported by Cursor adapter`);
        return [];
    }
  }

  /**
   * 转换 Prompt 为 MDC 格式
   */
  private async adaptPrompt(prompt: PromptAsset): Promise<Array<{ path: string; content: string }>> {
    const config: CursorConfig = {
      description: prompt.description || prompt.name,
      globs: ['*'],
      alwaysApply: false,
    };

    const frontmatter = this.buildFrontmatter(config);
    const content = `${frontmatter}\n${prompt.content}`;
    const filePath = path.join(this.rulesDir, `${prompt.name}.mdc`);

    return [{ path: filePath, content }];
  }

  /**
   * 转换 Agent 为 Cursor 规则
   */
  private async adaptAgent(agent: AgentAsset): Promise<Array<{ path: string; content: string }>> {
    const lines: string[] = [];

    lines.push(`# ${agent.name}`);
    lines.push('');
    lines.push(`## Description`);
    lines.push(agent.description || '');
    lines.push('');
    lines.push(`## Purpose`);
    lines.push(agent.purpose || '');
    lines.push('');

    if (agent.capabilities && agent.capabilities.length > 0) {
      lines.push(`## Capabilities`);
      agent.capabilities.forEach((cap: string) => {
        lines.push(`- ${cap}`);
      });
      lines.push('');
    }

    const content = lines.join('\n');
    const filePath = this.rulesFile;

    return [{ path: filePath, content }];
  }

  /**
   * 构建 frontmatter
   */
  private buildFrontmatter(config: CursorConfig): string {
    const lines: string[] = [];
    lines.push('---');

    if (config.description) {
      lines.push(`description: ${config.description}`);
    }

    if (config.globs) {
      lines.push(`globs: ${config.globs.join(', ')}`);
    }

    if (config.alwaysApply !== undefined) {
      lines.push(`alwaysApply: ${config.alwaysApply}`);
    }

    lines.push('---');

    return lines.join('\n');
  }

  /**
   * 应用配置到 Cursor
   */
  async apply(configs: Array<{ path: string; content: string }>): Promise<void> {
    for (const config of configs) {
      try {
        const fullPath = path.join(process.cwd(), config.path);
        await ensureDir(path.dirname(fullPath));

        if (config.path === this.rulesFile && (await fileExists(fullPath))) {
          const existing = await fs.readFile(fullPath, 'utf-8');
          await fs.writeFile(fullPath, existing + '\n\n' + config.content, 'utf-8');
        } else {
          await fs.writeFile(fullPath, config.content, 'utf-8');
        }

        logger.info(`Applied Cursor config: ${config.path}`);
      } catch (error) {
        logger.error(`Failed to apply Cursor config: ${config.path}`, { error });
        throw error;
      }
    }
  }

  /**
   * 反向转换
   */
  async reverseAdapt(configPath: string): Promise<Asset | null> {
    try {
      const fullPath = path.join(process.cwd(), configPath);
      const content = await fs.readFile(fullPath, 'utf-8');

      if (configPath.endsWith('.mdc')) {
        return this.parseMDCFile(content, configPath);
      } else if (configPath === this.rulesFile) {
        return this.parseRulesFile(content);
      }

      return null;
    } catch (error) {
      logger.error(`Failed to reverse adapt: ${configPath}`, { error });
      return null;
    }
  }

  /**
   * 解析 MDC 文件
   */
  private parseMDCFile(content: string, filePath: string): PromptAsset | null {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) {
      return null;
    }

    const frontmatter = match[1];
    const body = match[2].trim();

    const config: CursorConfig = {};
    for (const line of frontmatter.split('\n')) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        if (key === 'description') config.description = value;
        if (key === 'globs') config.globs = value.split(',').map((s) => s.trim());
        if (key === 'alwaysApply') config.alwaysApply = value === 'true';
      }
    }

    const name = path.basename(filePath, '.mdc');

    const result: Partial<PromptAsset> = {
      id: `prompt-${name}`,
      name,
      type: AssetType.PROMPT,
      version: '1.0.0',
      description: config.description || name,
      content: body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return result as PromptAsset;
  }

  /**
   * 解析规则文件
   */
  private parseRulesFile(content: string): AgentAsset | null {
    const lines = content.split('\n');
    let name = '';
    let description = '';
    let purpose = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('# ') && !name) {
        name = line.substring(2);
      } else if (line === '## Description' && i + 1 < lines.length) {
        description = lines[i + 1].trim();
      } else if (line === '## Purpose' && i + 1 < lines.length) {
        purpose = lines[i + 1].trim();
      }
    }

    if (!name) return null;

    return {
      id: `agent-${name}`,
      name,
      type: 'agent',
      version: '1.0.0',
      description,
      purpose,
      knowledge: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AgentAsset;
  }

  /**
   * 获取兼容性信息
   */
  getCompatibility(asset: Asset): { compatible: boolean; reason?: string } {
    if (!this.supportedAssetTypes.includes(asset.type)) {
      return {
        compatible: false,
        reason: `Cursor does not support ${asset.type} assets`,
      };
    }

    return { compatible: true };
  }
}

/**
 * 创建 Cursor 适配器实例
 */
export function createCursorAdapter(): CursorAdapter {
  return new CursorAdapter();
}
