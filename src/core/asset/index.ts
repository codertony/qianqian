/**
 * Core - 资产领域
 * 
 * 定义资产（Prompt/Skill/Agent/Flow）的实体和操作
 */

// 资产类型枚举
export enum AssetType {
  PROMPT = 'prompt',
  SKILL = 'skill',
  AGENT = 'agent',
  FLOW = 'flow',
  MCP_CONFIG = 'mcp-config',
  PLUGIN = 'plugin',
}

// 资产接口
export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  version: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Prompt 资产
export interface PromptAsset extends Asset {
  type: AssetType.PROMPT;
  scope: 'system' | 'task' | 'composite';
  content: string;
  variables?: PromptVariable[];
  inherits?: string[];
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'enum' | 'number' | 'boolean';
  description?: string;
  default?: unknown;
  options?: string[];
}

// Skill 资产
export interface SkillAsset extends Asset {
  type: AssetType.SKILL;
  manifest: SkillManifest;
  logic?: SkillLogic;
}

export interface SkillManifest {
  entry: string;
  permissions?: SkillPermissions;
  dependencies?: string[];
}

export interface SkillPermissions {
  filesystem?: ('read' | 'write')[];
  network?: boolean;
  shell?: boolean;
  mcp?: string[];
}

export interface SkillLogic {
  language: 'python' | 'javascript' | 'typescript';
  code: string;
}

// Agent 资产
export interface AgentAsset extends Asset {
  type: AssetType.AGENT;
  purpose: string;
  knowledge?: string[];
  model?: string;
  capabilities?: string[];
}

// Flow 资产
export interface FlowAsset extends Asset {
  type: AssetType.FLOW;
  steps: FlowStep[];
  variables?: Record<string, unknown>;
}

export interface FlowStep {
  id: string;
  name: string;
  agent?: string;
  action: string;
  inputs?: Record<string, unknown>;
  outputs?: string[];
  next?: string | string[];
  condition?: string;
}

// 资产工厂函数
export function createAsset(
  type: AssetType,
  name: string,
  overrides: Partial<Asset> = {}
): Asset {
  const now = new Date();
  return {
    id: `${type}-${Date.now()}`,
    name,
    type,
    version: '1.0.0',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
