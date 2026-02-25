/**
 * Plugin System - 入口
 *
 * @module plugin-system
 */

export {
  PluginManager,
  createPluginManager,
} from './manager';

export type {
  PluginAsset,
  PluginManifest,
  PlatformCompatibility as PluginCompatibility,
  CompatibilityMatrix,
  InstalledPlugin,
  PluginInstallOptions,
  PluginDependency,
  PluginMarketInfo,
} from './types';
