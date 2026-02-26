/**
 * Performance Optimizer Tests - 性能优化器测试
 * 
 * @module performance-optimizer-tests
 * @phase 3.6
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { PerformanceOptimizer, createPerformanceOptimizer } from '../../dist/features/performance/optimizer.js';

describe('Performance Optimizer', () => {
  let optimizer;
  let tempDir;

  before(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'acl-perf-test-'));
    optimizer = createPerformanceOptimizer(tempDir);
    await optimizer.init();
  });

  after(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('初始化', () => {
    it('应该能创建实例', () => {
      assert.ok(optimizer instanceof PerformanceOptimizer);
    });

    it('应该创建缓存目录', async () => {
      const cacheDir = path.join(tempDir, '.cache');
      const stats = await fs.stat(cacheDir);
      assert.ok(stats.isDirectory());
    });
  });

  describe('set & get', () => {
    it('应该能设置和获取缓存', async () => {
      const data = { test: 'value', number: 123 };
      await optimizer.set('test-key', data, 10000);

      const retrieved = await optimizer.get('test-key');

      assert.ok(retrieved);
      assert.strictEqual(retrieved.test, 'value');
      assert.strictEqual(retrieved.number, 123);
    });

    it('过期缓存应该返回 null', async () => {
      await optimizer.set('expiring-key', { data: 'test' }, 1);
      
      // 等待过期
      await new Promise((resolve) => setTimeout(resolve, 10));

      const retrieved = await optimizer.get('expiring-key');
      assert.strictEqual(retrieved, null);
    });
  });

  describe('delete', () => {
    it('应该能删除缓存', async () => {
      await optimizer.set('delete-key', { data: 'to-delete' });
      
      let retrieved = await optimizer.get('delete-key');
      assert.ok(retrieved);

      await optimizer.delete('delete-key');

      retrieved = await optimizer.get('delete-key');
      assert.strictEqual(retrieved, null);
    });
  });

  describe('clear', () => {
    it('应该能清空所有缓存', async () => {
      await optimizer.set('key1', { data: 1 });
      await optimizer.set('key2', { data: 2 });

      await optimizer.clear();

      const retrieved1 = await optimizer.get('key1');
      const retrieved2 = await optimizer.get('key2');
      assert.strictEqual(retrieved1, null);
      assert.strictEqual(retrieved2, null);
    });
  });

  describe('recordMetric & getPerformanceReport', () => {
    it('应该能记录和获取性能指标', () => {
      optimizer.recordMetric({
        operation: 'sync',
        duration: 100,
        memoryUsage: 1024 * 1024,
        timestamp: new Date(),
      });

      optimizer.recordMetric({
        operation: 'sync',
        duration: 150,
        memoryUsage: 1024 * 1024 * 2,
        timestamp: new Date(),
      });

      const report = optimizer.getPerformanceReport();

      assert.ok(report.operations.sync);
      assert.strictEqual(report.operations.sync.count, 2);
      assert.ok(report.operations.sync.avg > 0);
      assert.ok(report.memoryTrend.length >= 2);
    });
  });

  describe('parallel', () => {
    it('应该能并行执行任务', async () => {
      const tasks = [
        async () => 'result1',
        async () => 'result2',
        async () => 'result3',
      ];

      const results = await optimizer.parallel(tasks, 2);

      assert.strictEqual(results.length, 3);
      assert.ok(results.includes('result1'));
      assert.ok(results.includes('result2'));
      assert.ok(results.includes('result3'));
    });
  });

  describe('createPerformanceOptimizer', () => {
    it('应该创建新的 PerformanceOptimizer 实例', () => {
      const newOptimizer = createPerformanceOptimizer(tempDir);

      assert.ok(newOptimizer instanceof PerformanceOptimizer);
      assert.notStrictEqual(newOptimizer, optimizer);
    });
  });
});
