/**
 * Core - 平台领域
 * 
 * 定义支持的平台（Cursor/OpenCode/ClaudeCode/CloudCode）
 */

// 平台类型
export enum PlatformType {
  CURSOR = 'cursor',
  OPENCODE = 'opencode',
  CLAUDE_CODE = 'claude-code',
  CLOUD_CODE = 'cloud-code',
  WINDSURF = 'windsurf',
  VSCODE = 'vscode',
}

// 平台接口
export interface Platform {
  type: PlatformType;
  name: string;
  displayName: string;
  configDir: string;
  supportedAssets: AssetType[];
  capabilities: PlatformCapability[];
}

// 平台能力
export enum PlatformCapability {
  PROMPT = 'prompt',
  SKILL = 'skill',
  AGENT = 'agent',
  FLOW = 'flow',
  MCP = 'mcp',
  PLUGIN = 'plugin',
}

// 平台配置
export interface PlatformConfig {
  type: PlatformType;
  enabled: boolean;
  configPath?: string;
  overrides?: Record<string, unknown>;
}

// 平台适配器接口
export interface PlatformAdapter {
  readonly platform: Platform;
  
  // 检测当前环境是否支持该平台
  detect(): Promise<boolean>;
  
  // 读取该平台配置
  readConfig(): Promise<Record<string, unknown>>;
  
  // 写入配置到该平台
  writeConfig(config: Record<string, unknown>): Promise<void>;
  
  // 验证资产是否兼容该平台
  validateAsset(assetType: AssetType): boolean;
  
  // 转换资产为该平台格式
  convertAsset<T>(asset: unknown): Promise<T>;
}

// 平台定义
export const PLATFORMS: Record<PlatformType, Platform> = {
  [PlatformType.CURSOR]: {
    type: PlatformType.CURSOR,
    name: 'cursor',
    displayName: 'Cursor',
    configDir: '.cursor',
    supportedAssets: [
      AssetType.PROMPT,
      AssetType.AGENT,
      AssetType.MCP_CONFIG,
    ],
    capabilities: [
      PlatformCapability.PROMPT,
      PlatformCapability.AGENT,
      PlatformCapability.MCP,
    ],
  },
  [PlatformType.OPENCODE]: {
    type: PlatformType.OPENCODE,
    name: 'opencode',
    displayName: 'OpenCode',
    configDir: '.opencode',
    supportedAssets: [
      AssetType.PROMPT,
      AssetType.SKILL,
      AssetType.AGENT,
      AssetType.MCP_CONFIG,
      AssetType.PLUGIN,
    ],
    capabilities: [
      PlatformCapability.PROMPT,
      PlatformCapability.SKILL,
      PlatformCapability.AGENT,
      PlatformCapability.MCP,
      PlatformCapability.PLUGIN,
    ],
  },
  [PlatformType.CLAUDE_CODE]: {
    type: PlatformType.CLAUDE_CODE,
    name: 'claude-code',
    displayName: 'Claude Code',
    configDir: '.claude-code',
    supportedAssets: [
      AssetType.PROMPT,
      AssetType.SKILL,
      AssetType.MCP_CONFIG,
    ],
    capabilities: [
      PlatformCapability.PROMPT,
      PlatformCapability.SKILL,
      PlatformCapability.MCP,
    ],
  },
  [PlatformType.CLOUD_CODE]: {
    type: PlatformType.CLOUD_CODE,
    name: 'cloud-code',
    displayName: 'Cloud Code',
    configDir: '.cloudcode',
    supportedAssets: [
      AssetType.SKILL,
      AssetType.AGENT,
    ],
    capabilities: [
      PlatformCapability.SKILL,
      PlatformCapability.AGENT,
    ],
  },
  [PlatformType.WINDSURF]: {
    type: PlatformType.WINDSURF,
    name: 'windsurf',
    displayName: 'Windsurf',
    configDir: '.windsurf',
    supportedAssets: [AssetType.PROMPT],
    capabilities: [PlatformCapability.PROMPT],
  },
  [PlatformType.VSCODE]: {
    type: PlatformType.VSCODE,
    name: 'vscode',
    displayName: 'VS Code',
    configDir: '.vscode',
    supportedAssets: [AssetType.PROMPT],
    capabilities: [PlatformCapability.PROMPT],
  },
};

// 导入 AssetType
import { AssetType } from '../asset';
