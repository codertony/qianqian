/**
 * Flow System - 流程类型定义
 *
 * @module flow-types
 */

import { Asset, AssetType } from '../../core/asset';

/**
 * Flow 资产
 */
export interface FlowAsset extends Asset {
  type: AssetType.FLOW;
  definition: FlowDefinition;
}

/**
 * Flow 定义
 */
export interface FlowDefinition {
  /** Flow 名称 */
  name: string;
  /** 版本 */
  version: string;
  /** 描述 */
  description?: string;
  /** 触发器 */
  triggers?: FlowTrigger[];
  /** 节点 */
  nodes: FlowNode[];
  /** 边（连接） */
  edges: FlowEdge[];
  /** 变量 */
  variables?: FlowVariable[];
}

/**
 * Flow 触发器
 */
export interface FlowTrigger {
  /** 触发器 ID */
  id: string;
  /** 触发器类型 */
  type: 'manual' | 'scheduled' | 'event' | 'webhook';
  /** 配置 */
  config?: Record<string, unknown>;
}

/**
 * Flow 节点
 */
export interface FlowNode {
  /** 节点 ID */
  id: string;
  /** 节点类型 */
  type: 'agent' | 'skill' | 'condition' | 'parallel' | 'start' | 'end';
  /** 节点名称 */
  name?: string;
  /** 关联的 Agent/Skill */
  ref?: string;
  /** 输入参数 */
  inputs?: Record<string, unknown>;
  /** 位置（用于可视化） */
  position?: { x: number; y: number };
}

/**
 * Flow 边
 */
export interface FlowEdge {
  /** 边 ID */
  id: string;
  /** 源节点 */
  source: string;
  /** 目标节点 */
  target: string;
  /** 条件（用于条件分支） */
  condition?: string;
}

/**
 * Flow 变量
 */
export interface FlowVariable {
  /** 变量名 */
  name: string;
  /** 类型 */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  /** 默认值 */
  default?: unknown;
  /** 描述 */
  description?: string;
}

/**
 * Flow 执行状态
 */
export interface FlowExecution {
  /** 执行 ID */
  id: string;
  /** Flow ID */
  flowId: string;
  /** 状态 */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  /** 开始时间 */
  startedAt: Date;
  /** 结束时间 */
  endedAt?: Date;
  /** 当前节点 */
  currentNode?: string;
  /** 执行结果 */
  results?: Record<string, unknown>;
  /** 错误信息 */
  error?: string;
}

/**
 * Flow 验证结果
 */
export interface FlowValidation {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  errors: FlowValidationError[];
  /** 警告信息 */
  warnings: FlowValidationWarning[];
}

/**
 * Flow 验证错误
 */
export interface FlowValidationError {
  /** 错误类型 */
  type: 'node' | 'edge' | 'trigger' | 'variable';
  /** 错误位置 */
  location: string;
  /** 错误信息 */
  message: string;
}

/**
 * Flow 验证警告
 */
export interface FlowValidationWarning {
  /** 警告类型 */
  type: 'node' | 'edge' | 'trigger' | 'variable';
  /** 警告位置 */
  location: string;
  /** 警告信息 */
  message: string;
}
