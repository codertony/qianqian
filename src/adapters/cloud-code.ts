/**
 * Adapters - Cloud Code 平台适配器
 *
 * 将 ACL 资产转换为 Cloud Code (GitHub Codespaces) 格式
 *
 * @module cloud-code-adapter
 * @phase 3.4
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { Asset, AssetType, PromptAsset, AgentAsset } from '../core/asset';
import { logger } from '../shared/logger';
import { ensureDir, fileExists } from '../shared/utils';

/**
 * Cloud Code 配置
 */
interface CloudCodeConfig {
  description?: string;
  instructions?: string[];
}

/**
 * Cloud Code 适配器
 */
export class CloudCodeAdapter {
  readonly name = 'cloud-code';
  readonly displayName = 'Cloud Code';
  readonly supportedAssetTypes = ['prompt', 'agent'];

  private readonly configDir = '.github/copilot';
  private readonly instructionsFile = '.github/copilot-instructions.md';

  /**
   * 检测当前环境是否为 Cloud Code
   */
  async detect(): Promise<boolean> {
    try {
      // 检测 GitHub Codespaces 环境
      const hasConfigDir = await fileExists(this.configDir);
      const hasInstructionsFile = await fileExists(this.instructionsFile);
      const isCodespaces = process.env.CODESPACES === 'true';
      
      return hasConfigDir || hasInstructionsFile || isCodespaces;
    } catch {
      return false;
    }
  }

  /**
   * 获取 Cloud Code 版本
   */
  async getVersion(): Promise<string> {
    // Cloud Code 版本跟随 GitHub Copilot 扩展版本
    return 'github-copilot-latest';
  }

  /**
   * 获取支持的资产类型
   */
  getSupportedAssetTypes(): AssetType[] {
    return [AssetType.PROMPT, AssetType.AGENT];
  }

  /**
   * 将 ACL 资产转换为 Cloud Code 格式
   */
  async adapt(asset: Asset): Promise<{ files: Array<{ path: string; content: string }> }> {
    switch (asset.type) {
      case AssetType.PROMPT:
        return this.adaptPrompt(asset as PromptAsset);
      case AssetType.AGENT:
        return this.adaptAgent(asset as AgentAsset);
      default:
        throw new Error(`Unsupported asset type: ${asset.type}`);
    }
  }

  /**
   * 应用转换后的配置到 Cloud Code
   */
  async apply(
    adapted: { files: Array<{ path: string; content: string }> },
    targetDir: string
  ): Promise<void> {
    for (const file of adapted.files) {
      const filePath = path.join(targetDir, file.path);
      await ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, file.content, 'utf-8');
      logger.debug(`Written: ${filePath}`);
    }
  }

  /**
   * 从 Cloud Code 配置反向提取资产
   */
  async reverseAdapt(targetDir: string): Promise<Asset[]> {
    const assets: Asset[] = [];

    try {
      // 读取 instructions 文件
      const instructionsPath = path.join(targetDir, this.instructionsFile);
      if (await fileExists(instructionsPath)) {
        const content = await fs.readFile(instructionsPath, 'utf-8');
        const prompt = this.parseInstructionsFile(content, instructionsPath);
        if (prompt) {
          assets.push(prompt);
        }
      }

      // 读取 copilot 配置目录
      const configPath = path.join(targetDir, this.configDir);
      if (await fileExists(configPath)) {
        const files = await fs.readdir(configPath);
        for (const file of files) {
          if (file.endsWith('.md')) {
            const filePath = path.join(configPath, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const prompt = this.parseInstructionsFile(content, filePath);
            if (prompt) {
              assets.push(prompt);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Failed to reverse adapt Cloud Code config', { error });
    }

    return assets;
  }

  /**
   * 获取兼容性报告
   */
  getCompatibility(asset: Asset): {
    compatible: boolean;
    warnings: string[];
    unsupported: string[];
  } {
    const warnings: string[] = [];
    const unsupported: string[] = [];

    switch (asset.type) {
      case AssetType.PROMPT:
        // Cloud Code 支持大部分 Prompt 特性
        break;
      case AssetType.AGENT:
        // Cloud Code 的 Agent 支持有限
        warnings.push('Agent support in Cloud Code is basic');
        break;
      default:
        unsupported.push(`Asset type: ${asset.type}`);
    }

    return {
      compatible: unsupported.length === 0,
      warnings,
      unsupported,
    };
  }

  /**
   * 转换 Prompt 为 Cloud Code Instructions 格式
   */
  private adaptPrompt(prompt: PromptAsset): { files: Array<{ path: string; content: string }> } {
    const content = `# ${prompt.name}\n\n${prompt.content}`;

    return {
      files: [
        {
          path: this.instructionsFile,
          content,
        },
      ],
    };
  }

  /**
   * 转换 Agent 为 Cloud Code 配置
   */
  private adaptAgent(agent: AgentAsset): { files: Array<{ path: string; content: string }> } {
    const instructions = [
      `# ${agent.name}`,
      '',
      `## Purpose`,
      agent.purpose || '',
      '',
      `## Capabilities`,
      ...(agent.capabilities?.map((cap) => `- ${cap}`) || []),
    ].join('\n');

    return {
      files: [
        {
          path: `${this.configDir}/${agent.name}.md`,
          content: instructions,
        },
      ],
    };
  }

  /**
   * 解析 Instructions 文件
   */
  private parseInstructionsFile(content: string, filePath: string): PromptAsset | null {
    try {
      const lines = content.split('\n');
      const name = lines[0]?.replace('# ', '') || 'unknown';
      const body = lines.slice(1).join('\n').trim();

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
      };
    } catch {
      return null;
    }
  }
}

/**
 * 创建 Cloud Code 适配器
 */
export function createCloudCodeAdapter(): CloudCodeAdapter {
  return new CloudCodeAdapter();
}
