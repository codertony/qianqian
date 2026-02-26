/**
 * Flow Engine Tests - 流程引擎测试
 * 
 * @module flow-engine-tests
 * @phase 3.2
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { FlowEngine, createFlowEngine } from '../../dist/features/flow/engine.js';

describe('FlowEngine', () => {
  let engine;

  before(() => {
    engine = createFlowEngine();
  });

  describe('validate()', () => {
    it('应该验证有效的 Flow 定义', () => {
      const definition = {
        name: 'test-flow',
        version: '1.0.0',
        nodes: [
          { id: 'start', type: 'start', name: 'Start' },
          { id: 'end', type: 'end', name: 'End' },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'end' },
        ],
      };

      const result = engine.validate(definition);

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('应该检测缺少开始节点', () => {
      const definition = {
        name: 'test-flow',
        version: '1.0.0',
        nodes: [
          { id: 'end', type: 'end', name: 'End' },
        ],
        edges: [],
      };

      const result = engine.validate(definition);

      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.errors.length, 1);
      assert.strictEqual(result.errors[0].type, 'node');
      assert.ok(result.errors[0].message.includes('start node'));
    });

    it('应该警告多个开始节点', () => {
      const definition = {
        name: 'test-flow',
        version: '1.0.0',
        nodes: [
          { id: 'start1', type: 'start', name: 'Start 1' },
          { id: 'start2', type: 'start', name: 'Start 2' },
          { id: 'end', type: 'end', name: 'End' },
        ],
        edges: [
          { id: 'e1', source: 'start1', target: 'end' },
        ],
      };

      const result = engine.validate(definition);

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.warnings.length, 1);
      assert.ok(result.warnings[0].message.includes('Multiple start nodes'));
    });

    it('应该警告缺少结束节点', () => {
      const definition = {
        name: 'test-flow',
        version: '1.0.0',
        nodes: [
          { id: 'start', type: 'start', name: 'Start' },
        ],
        edges: [],
      };

      const result = engine.validate(definition);

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.warnings.length, 1);
      assert.ok(result.warnings[0].message.includes('no end nodes'));
    });

    it('应该检测重复的节点 ID', () => {
      const definition = {
        name: 'test-flow',
        version: '1.0.0',
        nodes: [
          { id: 'start', type: 'start', name: 'Start' },
          { id: 'start', type: 'agent', name: 'Duplicate' },
        ],
        edges: [],
      };

      const result = engine.validate(definition);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.message.includes('Duplicate node ID')));
    });

    it('应该检测边引用不存在的源节点', () => {
      const definition = {
        name: 'test-flow',
        version: '1.0.0',
        nodes: [
          { id: 'start', type: 'start', name: 'Start' },
        ],
        edges: [
          { id: 'e1', source: 'nonexistent', target: 'start' },
        ],
      };

      const result = engine.validate(definition);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.message.includes('non-existent source')));
    });

    it('应该检测边引用不存在的目标节点', () => {
      const definition = {
        name: 'test-flow',
        version: '1.0.0',
        nodes: [
          { id: 'start', type: 'start', name: 'Start' },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'nonexistent' },
        ],
      };

      const result = engine.validate(definition);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.message.includes('non-existent target')));
    });

    it('应该警告孤立的节点', () => {
      const definition = {
        name: 'test-flow',
        version: '1.0.0',
        nodes: [
          { id: 'start', type: 'start', name: 'Start' },
          { id: 'end', type: 'end', name: 'End' },
          { id: 'isolated', type: 'agent', name: 'Isolated Agent' },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'end' },
        ],
      };

      const result = engine.validate(definition);

      assert.strictEqual(result.valid, true);
      assert.ok(result.warnings.some(w => w.message.includes('isolated')));
    });
  });

  describe('execute()', () => {
    it('应该执行简单的线性 Flow', async () => {
      const definition = {
        name: 'linear-flow',
        version: '1.0.0',
        nodes: [
          { id: 'start', type: 'start', name: 'Start' },
          { id: 'agent1', type: 'agent', name: 'Agent 1', ref: 'test-agent' },
          { id: 'end', type: 'end', name: 'End' },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'agent1' },
          { id: 'e2', source: 'agent1', target: 'end' },
        ],
      };

      const execution = await engine.execute(definition);

      assert.strictEqual(execution.status, 'completed');
      assert.ok(execution.endedAt);
      assert.ok(execution.results);
      assert.ok(execution.results['agent1']);
    });

    it('当没有开始节点时应该执行失败', async () => {
      const definition = {
        name: 'no-start-flow',
        version: '1.0.0',
        nodes: [
          { id: 'agent1', type: 'agent', name: 'Agent 1' },
        ],
        edges: [],
      };

      const execution = await engine.execute(definition);

      assert.strictEqual(execution.status, 'failed');
      assert.ok(execution.error);
    });

    it('应该正确处理条件节点', async () => {
      const definition = {
        name: 'condition-flow',
        version: '1.0.0',
        nodes: [
          { id: 'start', type: 'start', name: 'Start' },
          { id: 'condition', type: 'condition', name: 'Check Value' },
          { id: 'true-branch', type: 'agent', name: 'True Agent' },
          { id: 'false-branch', type: 'agent', name: 'False Agent' },
          { id: 'end', type: 'end', name: 'End' },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'condition' },
          { id: 'e2', source: 'condition', target: 'true-branch', condition: 'shouldProceed' },
          { id: 'e3', source: 'condition', target: 'false-branch' },
          { id: 'e4', source: 'true-branch', target: 'end' },
          { id: 'e5', source: 'false-branch', target: 'end' },
        ],
      };

      // Test with condition = true
      const execution1 = await engine.execute(definition, { shouldProceed: true });
      assert.strictEqual(execution1.status, 'completed');

      // Test with condition = false
      const execution2 = await engine.execute(definition, { shouldProceed: false });
      assert.strictEqual(execution2.status, 'completed');
    });

    it('应该正确处理并行节点', async () => {
      const definition = {
        name: 'parallel-flow',
        version: '1.0.0',
        nodes: [
          { id: 'start', type: 'start', name: 'Start' },
          { id: 'parallel', type: 'parallel', name: 'Parallel Split' },
          { id: 'branch1', type: 'agent', name: 'Branch 1' },
          { id: 'branch2', type: 'agent', name: 'Branch 2' },
          { id: 'end', type: 'end', name: 'End' },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'parallel' },
          { id: 'e2', source: 'parallel', target: 'branch1' },
          { id: 'e3', source: 'parallel', target: 'branch2' },
          { id: 'e4', source: 'branch1', target: 'end' },
          { id: 'e5', source: 'branch2', target: 'end' },
        ],
      };

      const execution = await engine.execute(definition);

      assert.strictEqual(execution.status, 'completed');
      assert.ok(execution.results['branch1']);
      assert.ok(execution.results['branch2']);
    });

    it('应该防止循环执行', async () => {
      const definition = {
        name: 'cyclic-flow',
        version: '1.0.0',
        nodes: [
          { id: 'start', type: 'start', name: 'Start' },
          { id: 'agent1', type: 'agent', name: 'Agent 1' },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'agent1' },
          { id: 'e2', source: 'agent1', target: 'start' },
        ],
      };

      const execution = await engine.execute(definition);

      // Should complete without infinite loop
      assert.strictEqual(execution.status, 'completed');
    });

    it('应该包含执行 ID 和时间戳', async () => {
      const definition = {
        name: 'timestamp-flow',
        version: '1.0.0',
        nodes: [
          { id: 'start', type: 'start', name: 'Start' },
          { id: 'end', type: 'end', name: 'End' },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'end' },
        ],
      };

      const execution = await engine.execute(definition);

      assert.ok(execution.id.startsWith('exec-'));
      assert.ok(execution.startedAt instanceof Date);
      assert.ok(execution.endedAt instanceof Date);
      assert.strictEqual(execution.flowId, 'timestamp-flow');
    });
  });

  describe('getExecutionGraph()', () => {
    it('应该返回可视化的图形格式', () => {
      const definition = {
        name: 'visual-flow',
        version: '1.0.0',
        nodes: [
          { 
            id: 'start', 
            type: 'start', 
            name: 'Start',
            position: { x: 100, y: 100 }
          },
          { 
            id: 'agent', 
            type: 'agent', 
            name: 'Process',
            position: { x: 200, y: 200 }
          },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'agent', condition: 'ready' },
        ],
      };

      const graph = engine.getExecutionGraph(definition);

      assert.strictEqual(graph.nodes.length, 2);
      assert.strictEqual(graph.edges.length, 1);
      
      assert.strictEqual(graph.nodes[0].id, 'start');
      assert.strictEqual(graph.nodes[0].x, 100);
      assert.strictEqual(graph.nodes[0].y, 100);
      
      assert.strictEqual(graph.edges[0].source, 'start');
      assert.strictEqual(graph.edges[0].target, 'agent');
      assert.strictEqual(graph.edges[0].condition, 'ready');
    });

    it('当未指定位置时应该使用默认值', () => {
      const definition = {
        name: 'no-position-flow',
        version: '1.0.0',
        nodes: [
          { id: 'start', type: 'start' },
        ],
        edges: [],
      };

      const graph = engine.getExecutionGraph(definition);

      assert.strictEqual(graph.nodes[0].x, 0);
      assert.strictEqual(graph.nodes[0].y, 0);
      assert.strictEqual(graph.nodes[0].name, 'start');
    });
  });

  describe('createFlowEngine()', () => {
    it('应该创建新的 FlowEngine 实例', () => {
      const newEngine = createFlowEngine();
      
      assert.ok(newEngine instanceof FlowEngine);
      assert.notStrictEqual(newEngine, engine);
    });
  });
});
