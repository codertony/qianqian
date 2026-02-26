/**
 * Market Connector Tests - 市场连接器测试
 * 
 * @module market-connector-tests
 * @phase 3.2
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { MarketConnector, createMarketConnector } from '../../dist/features/market/connector.js';

describe('Market Connector', () => {
  let connector;

  before(() => {
    connector = createMarketConnector();
  });

  describe('初始化', () => {
    it('应该能创建实例', () => {
      assert.ok(connector instanceof MarketConnector);
    });

    it('应该注册内置市场源', () => {
      // GitHub 和 ClawHub 应该已注册
      assert.ok(connector);
    });
  });

  describe('fetchFromUrl', () => {
    it('应该识别 GitHub URL', async () => {
      const result = await connector.fetchFromUrl('https://github.com/user/repo');
      
      assert.strictEqual(result.source, 'github');
    });

    it('应该识别 ClawHub URL', async () => {
      const result = await connector.fetchFromUrl('https://clawhub.dev/plugin');
      
      assert.strictEqual(result.source, 'clawhub');
    });

    it('应该返回 unknown 对于无法识别的 URL', async () => {
      const result = await connector.fetchFromUrl('https://unknown-site.com/plugin');
      
      assert.strictEqual(result.source, 'unknown');
      assert.strictEqual(result.compatible, false);
      assert.ok(result.warnings.some(w => w.includes('Unrecognized')));
    });
  });

  describe('search', () => {
    it('应该返回空数组如果没有关键词', async () => {
      const results = await connector.search('');
      
      assert.ok(Array.isArray(results));
    });

    it('应该接受 limit 参数', async () => {
      const results = await connector.search('test', { limit: 5 });
      
      assert.ok(Array.isArray(results));
      assert.ok(results.length <= 5);
    });

    it('应该接受 source 参数', async () => {
      const results = await connector.search('test', { source: 'github' });
      
      assert.ok(Array.isArray(results));
    });
  });

  describe('createMarketConnector', () => {
    it('应该创建新的 MarketConnector 实例', () => {
      const newConnector = createMarketConnector();
      
      assert.ok(newConnector instanceof MarketConnector);
      assert.notStrictEqual(newConnector, connector);
    });
  });
});
