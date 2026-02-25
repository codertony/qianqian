/**
 * Flow Engine - 流程引擎
 *
 * @module flow-engine
 */

import {
  FlowDefinition,
  FlowNode,
  FlowEdge,
  FlowExecution,
  FlowValidation,
  FlowValidationError,
  FlowValidationWarning,
} from './types';
import { logger } from '../../shared/logger';

/**
 * Flow 引擎
 */
export class FlowEngine {
  /**
   * 验证 Flow 定义
   */
  validate(definition: FlowDefinition): FlowValidation {
    const errors: FlowValidationError[] = [];
    const warnings: FlowValidationWarning[] = [];

    // 检查是否有开始节点
    const startNodes = definition.nodes.filter((n) => n.type === 'start');
    if (startNodes.length === 0) {
      errors.push({
        type: 'node',
        location: 'root',
        message: 'Flow must have at least one start node',
      });
    }
    if (startNodes.length > 1) {
      warnings.push({
        type: 'node',
        location: 'root',
        message: 'Multiple start nodes found, only the first one will be used',
      });
    }

    // 检查是否有结束节点
    const endNodes = definition.nodes.filter((n) => n.type === 'end');
    if (endNodes.length === 0) {
      warnings.push({
        type: 'node',
        location: 'root',
        message: 'Flow has no end nodes',
      });
    }

    // 检查节点 ID 唯一性
    const nodeIds = new Set<string>();
    for (const node of definition.nodes) {
      if (nodeIds.has(node.id)) {
        errors.push({
          type: 'node',
          location: node.id,
          message: `Duplicate node ID: ${node.id}`,
        });
      }
      nodeIds.add(node.id);
    }

    // 检查边引用的节点是否存在
    for (const edge of definition.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push({
          type: 'edge',
          location: edge.id,
          message: `Edge references non-existent source node: ${edge.source}`,
        });
      }
      if (!nodeIds.has(edge.target)) {
        errors.push({
          type: 'edge',
          location: edge.id,
          message: `Edge references non-existent target node: ${edge.target}`,
        });
      }
    }

    // 检查是否有孤立的节点
    const connectedNodes = new Set<string>();
    for (const edge of definition.edges) {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    }
    for (const node of definition.nodes) {
      if (!connectedNodes.has(node.id) && node.type !== 'start' && node.type !== 'end') {
        warnings.push({
          type: 'node',
          location: node.id,
          message: `Node ${node.id} is isolated and will never be executed`,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 执行 Flow
   */
  async execute(
    definition: FlowDefinition,
    inputs: Record<string, unknown> = {}
  ): Promise<FlowExecution> {
    const execution: FlowExecution = {
      id: `exec-${Date.now()}`,
      flowId: definition.name,
      status: 'running',
      startedAt: new Date(),
      results: {},
    };

    try {
      logger.info(`Starting flow execution: ${execution.id}`);

      // 获取开始节点
      const startNode = definition.nodes.find((n) => n.type === 'start');
      if (!startNode) {
        throw new Error('No start node found');
      }

      // 执行节点
      const executedNodes = new Set<string>();
      await this.executeNode(
        startNode,
        definition,
        execution,
        executedNodes,
        inputs
      );

      execution.status = 'completed';
      execution.endedAt = new Date();

      logger.info(`Flow execution completed: ${execution.id}`);
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.endedAt = new Date();

      logger.error(`Flow execution failed: ${execution.id}`, { error });
    }

    return execution;
  }

  /**
   * 执行单个节点
   */
  private async executeNode(
    node: FlowNode,
    definition: FlowDefinition,
    execution: FlowExecution,
    executedNodes: Set<string>,
    context: Record<string, unknown>
  ): Promise<void> {
    // 防止循环执行
    if (executedNodes.has(node.id)) {
      return;
    }
    executedNodes.add(node.id);

    execution.currentNode = node.id;
    logger.debug(`Executing node: ${node.id} (${node.type})`);

    // 根据节点类型执行
    switch (node.type) {
      case 'start':
        // 开始节点：继续执行下游节点
        await this.executeNextNodes(node.id, definition, execution, executedNodes, context);
        break;

      case 'end':
        // 结束节点：停止执行
        break;

      case 'agent':
      case 'skill':
        // Agent/Skill 节点：执行对应的 Agent 或 Skill
        // TODO: 调用 Agent/Skill 执行器
        execution.results![node.id] = {
          nodeId: node.id,
          type: node.type,
          ref: node.ref,
          status: 'executed',
        };
        await this.executeNextNodes(node.id, definition, execution, executedNodes, context);
        break;

      case 'condition':
        // 条件节点：根据条件选择分支
        await this.executeConditionNode(node, definition, execution, executedNodes, context);
        break;

      case 'parallel':
        // 并行节点：并行执行多个下游节点
        await this.executeParallelNode(node, definition, execution, executedNodes, context);
        break;

      default:
        logger.warn(`Unknown node type: ${node.type}`);
        await this.executeNextNodes(node.id, definition, execution, executedNodes, context);
    }
  }

  /**
   * 执行下游节点
   */
  private async executeNextNodes(
    nodeId: string,
    definition: FlowDefinition,
    execution: FlowExecution,
    executedNodes: Set<string>,
    context: Record<string, unknown>
  ): Promise<void> {
    const outgoingEdges = definition.edges.filter((e) => e.source === nodeId);

    for (const edge of outgoingEdges) {
      const targetNode = definition.nodes.find((n) => n.id === edge.target);
      if (targetNode) {
        await this.executeNode(
          targetNode,
          definition,
          execution,
          executedNodes,
          context
        );
      }
    }
  }

  /**
   * 执行条件节点
   */
  private async executeConditionNode(
    node: FlowNode,
    definition: FlowDefinition,
    execution: FlowExecution,
    executedNodes: Set<string>,
    context: Record<string, unknown>
  ): Promise<void> {
    const outgoingEdges = definition.edges.filter((e) => e.source === node.id);

    for (const edge of outgoingEdges) {
      // 简化版本：如果没有条件或条件为真，执行该分支
      const conditionMet = !edge.condition || this.evaluateCondition(edge.condition, context);

      if (conditionMet) {
        const targetNode = definition.nodes.find((n) => n.id === edge.target);
        if (targetNode) {
          await this.executeNode(targetNode, definition, execution, executedNodes, context);
        }
        break; // 条件节点只执行第一个满足条件的分支
      }
    }
  }

  /**
   * 执行并行节点
   */
  private async executeParallelNode(
    node: FlowNode,
    definition: FlowDefinition,
    execution: FlowExecution,
    executedNodes: Set<string>,
    context: Record<string, unknown>
  ): Promise<void> {
    const outgoingEdges = definition.edges.filter((e) => e.source === node.id);

    // 并行执行所有下游节点
    await Promise.all(
      outgoingEdges.map(async (edge) => {
        const targetNode = definition.nodes.find((n) => n.id === edge.target);
        if (targetNode) {
          await this.executeNode(targetNode, definition, execution, executedNodes, context);
        }
      })
    );
  }

  /**
   * 评估条件
   */
  private evaluateCondition(condition: string, context: Record<string, unknown>): boolean {
    // 简化版本：仅支持简单的变量检查
    // TODO: 实现更复杂的条件表达式解析
    try {
      const value = context[condition];
      return value !== undefined && value !== false && value !== null;
    } catch {
      return false;
    }
  }

  /**
   * 获取执行图（用于可视化）
   */
  getExecutionGraph(definition: FlowDefinition): {
    nodes: Array<{ id: string; type: string; name: string; x: number; y: number }>;
    edges: Array<{ source: string; target: string; condition?: string }>;
  } {
    return {
      nodes: definition.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        name: n.name || n.id,
        x: n.position?.x || 0,
        y: n.position?.y || 0,
      })),
      edges: definition.edges.map((e) => ({
        source: e.source,
        target: e.target,
        condition: e.condition,
      })),
    };
  }
}

/**
 * 创建 Flow 引擎
 */
export function createFlowEngine(): FlowEngine {
  return new FlowEngine();
}
