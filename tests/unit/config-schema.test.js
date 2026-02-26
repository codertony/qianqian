import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ConfigSchema, validateConfigSafe } from '../../dist/config/schema/index.js';

describe('配置 Schema', () => {
  describe('ConfigSchema', () => {
    it('应该验证有效的配置', () => {
      const validConfig = {
        version: '1.0.0',
        repository: {
          url: 'https://github.com/user/repo',
          branch: 'main',
          localPath: '/path/to/repo',
        },
        sync: {
          autoSync: false,
          syncPolicy: 'merge',
          defaultPlatforms: ['cursor'],
          excludePatterns: [],
          conflictResolution: 'manual',
        },
        platforms: {
          cursor: {
            type: 'cursor',
            enabled: true,
          },
        },
        features: {
          aiExtraction: true,
          autoSync: false,
          conflictNotification: true,
          telemetry: false,
        },
      };

      const result = validateConfigSafe(validConfig);
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.version, '1.0.0');
      }
    });

    it('应该使用默认值填充 sync 配置', () => {
      const partialConfig = {
        sync: {},
      };

      const result = validateConfigSafe(partialConfig);
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.sync.syncPolicy, 'merge');
        assert.strictEqual(result.data.sync.autoSync, false);
      }
    });

    it('应该拒绝无效的配置', () => {
      const invalidConfig = {
        version: 123,
      };

      const result = validateConfigSafe(invalidConfig);
      assert.strictEqual(result.success, false);
    });

    it('应该验证 syncPolicy 枚举值', () => {
      const configWithInvalidPolicy = {
        sync: {
          syncPolicy: 'invalid-policy',
        },
      };

      const result = validateConfigSafe(configWithInvalidPolicy);
      assert.strictEqual(result.success, false);
    });
  });
});
