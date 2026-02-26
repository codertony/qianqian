/**
 * Claude Code Adapter
 * 
 * 将 ACL 资产转换为 Claude Code 格式
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { Asset, AssetType, PromptAsset, AgentAsset } from '../core/asset';
import { logger } from '../shared/logger';
import { ensureDir, fileExists } from '../shared/utils';

/**
 * Claude Code 适配器
 */
export class ClaudeCodeAdapter {
  readonly name = 'claude-code';
  readonly displayName = 'Claude Code';
  readonly supportedAssetTypes = ['prompt', 'agent'];

  private readonly configDir = '.claude';

  /**
   * 检测当前环境是否为 Claude Code
   */
  async detect(): Promise<boolean> {
    try {
      return await fileExists(this.configDir);
    } catch {
      return false;
    }
  }

  /**
   * 获取 Claude Code 版本
   */
  async getVersion(): Promise<string | undefined> {
    return undefined;
  }

  /**
   * 将资产转换为 Claude Code 格式
   */
  async adapt(asset: Asset): Promise<Array<{ path: string; content: string }>> {
    switch (asset.type) {
      case 'prompt':
        return this.adaptPrompt(asset as PromptAsset);
      case 'agent':
        return this.adaptAgent(asset as AgentAsset);
      default:
        logger.warn(`Asset type ${asset.type} not supported by Claude Code adapter`);
        return [];
    }
  }

  /**
   * 转换 Prompt 为 Claude Code 格式
   */
  private async adaptPrompt(prompt: PromptAsset): Promise<Array<{ path: string; content: string }>> {
    const content = `# ${prompt.name}\n\n${prompt.description || ''}\n\n${prompt.content}`;
    const filePath = path.join(this.configDir, 'prompts', `${prompt.name}.md`);

    return [{ path: filePath, content }];
  }

  /**
   * 转换 Agent 为 Claude Code 格式
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
    const filePath = path.join(this.configDir, 'agents', `${agent.name}.md`);

    return [{ path: filePath, content }];
  }

  /**
   * 应用配置到 Claude Code
   */
  async apply(configs: Array<{ path: string; content: string }>): Promise<void> {
    for (const config of configs) {
      try {
        const fullPath = path.join(process.cwd(), config.path);
        await ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, config.content, 'utf-8');

        logger.info(`Applied Claude Code config: ${config.path}`);
      } catch (error) {
        logger.error(`Failed to apply Claude Code config: ${config.path}`, { error });
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

      if (configPath.includes('/prompts/')) {
        return this.parsePromptFile(content, configPath);
      } else if (configPath.includes('/agents/')) {
        return this.parseAgentFile(content, configPath);
      }

      return null;
    } catch (error) {
      logger.error(`Failed to reverse adapt: ${configPath}`, { error });
      return null;
    }
  }

  /**
   * 解析 Prompt 文件
   */
  private parsePromptFile(content: string, filePath: string): PromptAsset | null {
    const lines = content.split('\n');
    const name = lines[0]?.replace('# ', '') || 'unknown';
    const body = lines.slice(2).join('\n').trim();

    return {
      id: `prompt-${name}`,
      name,
      type: AssetType.PROMPT,
      version: '1.0.0',
      description: '',
      content: body,
      scope: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PromptAsset;
  }

  /**
   * 解析 Agent 文件
   */
  private parseAgentFile(content: string, filePath: string): AgentAsset | null {
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
        reason: `Claude Code does not support ${asset.type} assets`,
      };
    }

    return { compatible: true };
  }
}

/**
 * 创建 Claude Code 适配器实例
 */
export function createClaudeCodeAdapter(): ClaudeCodeAdapter {
  return new ClaudeCodeAdapter();
}
