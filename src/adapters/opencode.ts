/**
 * Adapters - OpenCode 平台适配器
 *
 * 将 ACL 资产转换为 OpenCode 格式
 *
 * @module opencode-adapter
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { Asset, AssetType, PromptAsset, SkillAsset, AgentAsset } from '../core/asset';
import { logger } from '../shared/logger';
import { ensureDir, fileExists } from '../shared/utils';
import * as yaml from 'js-yaml';

/**
 * OpenCode 适配器
 */
export class OpenCodeAdapter {
  readonly name = 'opencode';
  readonly displayName = 'OpenCode';
  readonly supportedAssetTypes = ['prompt', 'skill', 'agent'];

  private readonly configDir = '.opencode';

  /**
   * 检测当前环境是否为 OpenCode
   */
  async detect(): Promise<boolean> {
    try {
      return await fileExists(this.configDir);
    } catch {
      return false;
    }
  }

  /**
   * 获取 OpenCode 版本
   */
  async getVersion(): Promise<string | undefined> {
    return undefined;
  }

  /**
   * 将资产转换为 OpenCode 格式
   */
  async adapt(asset: Asset): Promise<Array<{ path: string; content: string }>> {
    switch (asset.type) {
      case 'prompt':
        return this.adaptPrompt(asset as PromptAsset);
      case 'skill':
        return this.adaptSkill(asset as SkillAsset);
      case 'agent':
        return this.adaptAgent(asset as AgentAsset);
      default:
        logger.warn(`Asset type ${asset.type} not supported by OpenCode adapter`);
        return [];
    }
  }

  /**
   * 转换 Prompt
   */
  private async adaptPrompt(prompt: PromptAsset): Promise<Array<{ path: string; content: string }>> {
    const config = {
      name: prompt.name,
      description: prompt.description,
      type: 'prompt',
      content: prompt.content,
      scope: 'project',
    };

    const filePath = path.join(this.configDir, 'prompts', `${prompt.name}.yaml`);
    const content = yaml.dump(config);

    return [{ path: filePath, content }];
  }

  /**
   * 转换 Skill
   */
  private async adaptSkill(skill: SkillAsset): Promise<Array<{ path: string; content: string }>> {
    const configs: Array<{ path: string; content: string }> = [];

    // Skill 定义
    const config = {
      name: skill.name,
      description: skill.description,
      type: 'skill',
      manifest: skill.manifest,
    };

    configs.push({
      path: path.join(this.configDir, 'skills', skill.name, 'SKILL.md'),
      content: yaml.dump(config),
    });

    // 如果有逻辑代码，单独保存
    if (skill.logic) {
      const ext = skill.logic.language === 'python' ? 'py' : 'js';
      configs.push({
        path: path.join(this.configDir, 'skills', skill.name, `logic.${ext}`),
        content: skill.logic.code,
      });
    }

    return configs;
  }

  /**
   * 转换 Agent
   */
  private async adaptAgent(agent: AgentAsset): Promise<Array<{ path: string; content: string }>> {
    const config = {
      name: agent.name,
      description: agent.description,
      type: 'agent',
      purpose: agent.purpose,
      model: agent.model,
      capabilities: agent.capabilities,
    };

    const filePath = path.join(this.configDir, 'agents', `${agent.name}.yaml`);
    const content = yaml.dump(config);

    return [{ path: filePath, content }];
  }

  /**
   * 应用配置到 OpenCode
   */
  async apply(configs: Array<{ path: string; content: string }>): Promise<void> {
    for (const config of configs) {
      try {
        const fullPath = path.join(process.cwd(), config.path);
        await ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, config.content, 'utf-8');

        logger.info(`Applied OpenCode config: ${config.path}`);
      } catch (error) {
        logger.error(`Failed to apply OpenCode config: ${config.path}`, { error });
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

      if (configPath.endsWith('.yaml') || configPath.endsWith('.yml')) {
        return this.parseYamlFile(content, configPath);
      }

      return null;
    } catch (error) {
      logger.error(`Failed to reverse adapt: ${configPath}`, { error });
      return null;
    }
  }

  /**
   * 解析 YAML 文件
   */
  private parseYamlFile(content: string, filePath: string): Asset | null {
    try {
      const parsed = yaml.load(content) as Record<string, unknown>;

      if (!parsed || typeof parsed !== 'object') {
        return null;
      }

      const type = parsed.type as string;
      const name = (parsed.name as string) || path.basename(filePath, path.extname(filePath));

      const baseAsset = {
        id: `${type}-${name}`,
        name,
        version: '1.0.0',
        description: (parsed.description as string) || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      switch (type) {
        case 'prompt':
          return {
            ...baseAsset,
            type: AssetType.PROMPT,
            scope: 'task',
            content: (parsed.content as string) || '',
          } as PromptAsset;

        case 'agent':
          return {
            ...baseAsset,
            type: AssetType.AGENT,
            purpose: (parsed.purpose as string) || '',
            knowledge: [],
            model: parsed.model as string,
            capabilities: (parsed.capabilities as string[]) || [],
          } as AgentAsset;

        default:
          return null;
      }
    } catch (error) {
      logger.error('Failed to parse YAML file', { error });
      return null;
    }
  }

  /**
   * 获取兼容性信息
   */
  getCompatibility(asset: Asset): { compatible: boolean; reason?: string } {
    if (!this.supportedAssetTypes.includes(asset.type)) {
      return {
        compatible: false,
        reason: `OpenCode does not support ${asset.type} assets`,
      };
    }

    return { compatible: true };
  }
}

/**
 * 创建 OpenCode 适配器实例
 */
export function createOpenCodeAdapter(): OpenCodeAdapter {
  return new OpenCodeAdapter();
}
