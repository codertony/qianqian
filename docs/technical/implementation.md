# 乾乾 (QianQian) - 技术实现文档

> **版本**: v1.0.0  
> **状态**: 实现规划阶段  
> **最后更新**: 2026-02-26

---

## 一、项目初始化与工程搭建

### 1.1 技术栈初始化

```bash
# 创建项目目录
mkdir qianqian && cd qianqian

# 使用 Bun 初始化（推荐）
bun init -y

# 或 Node.js + TypeScript
npm init -y
npx tsc --init
```

### 1.2 依赖安装

```bash
# 核心依赖
bun add commander zod js-yaml picocolors
bun add isomorphic-git @isomorphic-git/http-client
bun add @anthropic-ai/sdk openai
bun add diff picomatch

# 开发依赖
bun add -d @types/node @types/js-yaml @types/diff
bun add -d typescript

# 可选：AST 工具（用于代码分析）
bun add @ast-grep/napi
```

### 1.3 项目结构初始化

```bash
mkdir -p src/{cli/{commands,middleware,utils},config,sync,adapters,ai,git,security,schemas,utils}
mkdir -p tests/{unit,integration,fixtures}
mkdir -p templates/{init,skills,agents,prompts}
mkdir -p schemas
mkdir -p bin
```

### 1.4 TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 1.5 构建配置

```json
// package.json scripts
{
  "scripts": {
    "build": "bun build src/index.ts --outdir dist --target bun --format esm",
    "build:cli": "bun build src/cli/index.ts --outdir dist/cli --target bun --format esm",
    "build:all": "bun run build && bun run build:cli && bun run build:binaries",
    "build:binaries": "bun run scripts/build-binaries.ts",
    "typecheck": "tsc --noEmit",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "lint": "eslint src --ext .ts",
    "dev": "bun run --watch src/cli/index.ts"
  }
}
```

---

## 二、核心模块实现

### 2.1 错误处理体系

```typescript
// src/utils/errors.ts

export class ACLError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ACLError';
  }
}

export class ConfigError extends ACLError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'CONFIG_ERROR', details);
    this.name = 'ConfigError';
  }
}

export class GitError extends ACLError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'GIT_ERROR', details);
    this.name = 'GitError';
  }
}

export class SyncError extends ACLError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'SYNC_ERROR', details);
    this.name = 'SyncError';
  }
}

export class AdapterError extends ACLError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'ADAPTER_ERROR', details);
    this.name = 'AdapterError';
  }
}

export class ValidationError extends ACLError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}
```

### 2.2 日志系统实现

```typescript
// src/utils/logger.ts

import { createWriteStream } from 'fs';
import { format } from 'util';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  file?: string;
  console: boolean;
}

export class Logger {
  private static LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };
  
  private config: LoggerConfig;
  private fileStream?: ReturnType<typeof createWriteStream>;
  
  constructor(config: LoggerConfig) {
    this.config = config;
    if (config.file) {
      this.fileStream = createWriteStream(config.file, { flags: 'a' });
    }
  }
  
  private shouldLog(level: LogLevel): boolean {
    return Logger.LEVELS[level] >= Logger.LEVELS[this.config.level];
  }
  
  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
  }
  
  private write(level: LogLevel, message: string, meta?: any): void {
    if (!this.shouldLog(level)) return;
    
    const formatted = this.formatMessage(level, message, meta);
    
    // 写入文件
    if (this.fileStream) {
      this.fileStream.write(formatted);
    }
    
    // 控制台输出
    if (this.config.console) {
      const consoleMethod = level === 'error' ? console.error :
                           level === 'warn' ? console.warn :
                           level === 'debug' ? console.debug : console.log;
      consoleMethod(formatted.trim());
    }
  }
  
  debug(message: string, meta?: any): void {
    this.write('debug', message, meta);
  }
  
  info(message: string, meta?: any): void {
    this.write('info', message, meta);
  }
  
  warn(message: string, meta?: any): void {
    this.write('warn', message, meta);
  }
  
  error(message: string, meta?: any): void {
    this.write('error', message, meta);
  }
}

// 全局日志实例
export const logger = new Logger({
  level: process.env.ACL_LOG_LEVEL as LogLevel || 'info',
  file: process.env.ACL_LOG_FILE,
  console: true
});
```

### 2.3 文件系统工具

```typescript
// src/utils/fs.ts

import { promises as fs, constants } from 'fs';
import { join, dirname } from 'path';

export async function ensureDir(path: string): Promise<void> {
  try {
    await fs.mkdir(path, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function readJson<T = any>(path: string): Promise<T> {
  const content = await fs.readFile(path, 'utf-8');
  return JSON.parse(content);
}

export async function writeJson(path: string, data: any): Promise<void> {
  await ensureDir(dirname(path));
  await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
}

export async function copyFile(src: string, dest: string): Promise<void> {
  await ensureDir(dirname(dest));
  await fs.copyFile(src, dest);
}

export async function* walkDir(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(fullPath);
    } else {
      yield fullPath;
    }
  }
}

export async function getFileHash(path: string): Promise<string> {
  const content = await fs.readFile(path);
  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(content).digest('hex');
}
```

### 2.4 交互式提示工具

```typescript
// src/cli/utils/prompt.ts

import { text, select, confirm, multiselect } from '@clack/prompts';
import { cyan, gray, green } from 'picocolors';

export async function input(message: string, placeholder?: string): Promise<string> {
  const result = await text({
    message: cyan(message),
    placeholder,
    validate(value) {
      if (!value) return 'Please enter a value';
    }
  });
  
  if (typeof result === 'symbol') {
    throw new Error('User cancelled');
  }
  
  return result;
}

export async function choose<T extends string>(
  message: string,
  options: { value: T; label: string; hint?: string }[]
): Promise<T> {
  const result = await select({
    message: cyan(message),
    options
  });
  
  if (typeof result === 'symbol') {
    throw new Error('User cancelled');
  }
  
  return result as T;
}

export async function yesNo(message: string, initialValue = true): Promise<boolean> {
  const result = await confirm({
    message: cyan(message),
    initialValue
  });
  
  if (typeof result === 'symbol') {
    throw new Error('User cancelled');
  }
  
  return result;
}

export async function multiSelect<T extends string>(
  message: string,
  options: { value: T; label: string }[]
): Promise<T[]> {
  const result = await multiselect({
    message: cyan(message),
    options
  });
  
  if (typeof result === 'symbol') {
    throw new Error('User cancelled');
  }
  
  return result as T[];
}
```

### 2.5 进度指示器

```typescript
// src/cli/utils/spinner.ts

import { spinner as clackSpinner } from '@clack/prompts';

export class Spinner {
  private spin: ReturnType<typeof clackSpinner> | null = null;
  
  start(message: string): void {
    this.spin = clackSpinner();
    this.spin.start(message);
  }
  
  stop(message?: string, code = 0): void {
    if (this.spin) {
      if (code === 0) {
        this.spin.stop(message);
      } else {
        this.spin.stop(message || 'Failed');
      }
    }
  }
  
  succeed(message: string): void {
    this.stop(message, 0);
  }
  
  fail(message: string): void {
    this.stop(message, 1);
  }
}
```

---

## 三、CLI 命令实现

### 3.1 命令注册器

```typescript
// src/cli/command-registry.ts

import { Command } from 'commander';
import { Logger } from '../utils/logger';

export interface CommandContext {
  logger: Logger;
  config: UserConfig;
}

export type CommandHandler = (args: any, options: any, context: CommandContext) => Promise<void>;

export interface CommandDefinition {
  name: string;
  description: string;
  aliases?: string[];
  arguments?: { name: string; description: string; required?: boolean }[];
  options?: { flags: string; description: string; defaultValue?: any }[];
  handler: CommandHandler;
  middleware?: ((context: CommandContext) => Promise<void>)[];
}

export class CommandRegistry {
  private commands: Map<string, CommandDefinition> = new Map();
  private program: Command;
  
  constructor(private context: CommandContext) {
    this.program = new Command();
    this.program
      .name('acl')
      .description('AI Capability Library - 跨平台 AI 资产管理中枢')
      .version('1.0.0');
  }
  
  register(def: CommandDefinition): void {
    this.commands.set(def.name, def);
    
    let cmd = this.program
      .command(def.name)
      .description(def.description);
    
    if (def.aliases) {
      def.aliases.forEach(alias => cmd.alias(alias));
    }
    
    // 添加参数
    def.arguments?.forEach(arg => {
      const syntax = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
      cmd.argument(syntax, arg.description);
    });
    
    // 添加选项
    def.options?.forEach(opt => {
      cmd.option(opt.flags, opt.description, opt.defaultValue);
    });
    
    // 注册处理函数
    cmd.action(async (...args) => {
      const options = args[args.length - 1];
      const commandArgs = args.slice(0, -1);
      
      try {
        // 执行中间件
        for (const middleware of def.middleware || []) {
          await middleware(this.context);
        }
        
        // 执行命令
        await def.handler(commandArgs, options, this.context);
      } catch (error) {
        this.context.logger.error(`Command failed: ${def.name}`, error);
        process.exit(1);
      }
    });
  }
  
  async parse(argv: string[]): Promise<void> {
    await this.program.parseAsync(argv);
  }
}
```

### 3.2 Init 命令实现

```typescript
// src/cli/commands/init.ts

import { input, confirm, choose } from '../utils/prompt';
import { Spinner } from '../utils/spinner';
import { ensureDir, writeJson, fileExists } from '../../utils/fs';
import { execSync } from 'child_process';

export const initCommand: CommandDefinition = {
  name: 'init',
  description: 'Initialize ACL configuration and bind GitHub repository',
  options: [
    { flags: '--repo <url>', description: 'GitHub repository URL' },
    { flags: '--force', description: 'Overwrite existing configuration' }
  ],
  
  async handler(args, options, context) {
    const spinner = new Spinner();
    
    // 检查现有配置
    const configExists = await fileExists('./.acl/config.jsonc');
    if (configExists && !options.force) {
      const overwrite = await confirm(
        'Configuration already exists. Overwrite?',
        false
      );
      if (!overwrite) {
        context.logger.info('Initialization cancelled');
        return;
      }
    }
    
    // 获取 GitHub 仓库信息
    let repoUrl = options.repo;
    if (!repoUrl) {
      repoUrl = await input(
        'Enter your GitHub repository URL for ACL assets:',
        'https://github.com/username/acl-assets'
      );
    }
    
    // 验证仓库 URL
    if (!isValidGitHubUrl(repoUrl)) {
      throw new ValidationError('Invalid GitHub repository URL');
    }
    
    // 配置选项
    const defaultPolicy = await choose(
      'Select default sync policy:',
      [
        { value: 'merge', label: 'Merge', hint: 'Combine local and remote changes' },
        { value: 'full', label: 'Full', hint: 'Remote overrides local' },
        { value: 'local', label: 'Local', hint: 'Keep local changes only' }
      ]
    );
    
    const autoPush = await confirm(
      'Automatically push changes to GitHub?',
      true
    );
    
    // 创建配置
    spinner.start('Creating configuration...');
    
    await ensureDir('./.acl');
    
    const config = {
      version: '1.0.0',
      github: {
        repo_url: repoUrl,
        branch: 'main',
        auto_push: autoPush,
        commit_message_template: 'feat({type}): {description}'
      },
      sync: {
        default_policy: defaultPolicy,
        auto_install_deps: true,
        confirm_before_push: true
      },
      platforms: {
        cursor: { enabled: true, auto_detect: true },
        opencode: { enabled: true, auto_detect: true },
        claude: { enabled: true, auto_detect: true }
      },
      ai: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        temperature: 0.3,
        auto_commit: false
      },
      logging: {
        level: 'info',
        file: '~/.acl/acl.log'
      }
    };
    
    await writeJson('./.acl/config.jsonc', config);
    
    // 创建 .gitignore
    await createGitignore();
    
    // 创建示例目录结构
    await createExampleStructure();
    
    spinner.succeed('Configuration created successfully!');
    
    // 提示下一步
    console.log('\n' + '='.repeat(50));
    console.log('Next steps:');
    console.log('  1. Run: acl auth github    # Authenticate with GitHub');
    console.log('  2. Run: acl pull           # Pull assets from repository');
    console.log('  3. Run: acl status         # Check sync status');
    console.log('='.repeat(50) + '\n');
  }
};

async function createGitignore(): Promise<void> {
  const content = `# ACL - Local overrides and sensitive files
.acl/local-only/
.acl/credentials
*.env.local
*.env

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
`;
  
  await fs.writeFile('./.acl/.gitignore', content);
}

async function createExampleStructure(): Promise<void> {
  await ensureDir('./.acl/overrides');
  await ensureDir('./.acl/local-only');
}

function isValidGitHubUrl(url: string): boolean {
  return /^https:\/\/github\.com\/[\w-]+\/[\w-]+/.test(url);
}
```

### 3.3 Sync 命令实现

```typescript
// src/cli/commands/sync.ts

import { Spinner } from '../utils/spinner';
import { choose, yesNo } from '../utils/prompt';

export const syncCommand: CommandDefinition = {
  name: 'sync',
  description: 'Synchronize assets to local platform',
  options: [
    { flags: '--target <platform>', description: 'Target platform' },
    { flags: '--dry-run', description: 'Preview changes' },
    { flags: '--force', description: 'Force sync' },
    { flags: '--asset <name>', description: 'Sync specific asset' }
  ],
  
  middleware: [loadConfigMiddleware, checkAuthMiddleware],
  
  async handler(args, options, context) {
    const spinner = new Spinner();
    
    // 检测或选择目标平台
    let targetPlatform = options.target;
    if (!targetPlatform) {
      const detected = await detectPlatforms();
      if (detected.length === 0) {
        throw new Error('No supported platform detected in current directory');
      }
      if (detected.length === 1) {
        targetPlatform = detected[0];
      } else {
        targetPlatform = await choose(
          'Multiple platforms detected. Select target:',
          detected.map(p => ({ value: p, label: p }))
        );
      }
    }
    
    context.logger.info(`Syncing to platform: ${targetPlatform}`);
    
    // 初始化同步引擎
    const syncEngine = new GitSyncEngine(
      context.config,
      context.logger
    );
    
    // 计算差异
    spinner.start('Analyzing differences...');
    const diff = await syncEngine.diff();
    spinner.stop(`Found ${diff.modified.length} changes`);
    
    // 展示差异
    if (diff.added.length > 0) {
      console.log('\n' + green('Added:'));
      diff.added.forEach(a => console.log(`  + ${a.name}`));
    }
    
    if (diff.modified.length > 0) {
      console.log('\n' + yellow('Modified:'));
      diff.modified.forEach(a => console.log(`  ~ ${a.name}`));
    }
    
    if (diff.conflict.length > 0) {
      console.log('\n' + red('Conflicts:'));
      diff.conflict.forEach(c => console.log(`  ! ${c.local.name}`));
    }
    
    // Dry run 模式
    if (options.dryRun) {
      context.logger.info('\nDry run complete. No changes applied.');
      return;
    }
    
    // 确认同步
    if (!options.force && diff.conflict.length > 0) {
      const proceed = await yesNo(
        `${diff.conflict.length} conflicts detected. Proceed with merge?`,
        false
      );
      if (!proceed) {
        context.logger.info('Sync cancelled');
        return;
      }
    }
    
    // 执行同步
    spinner.start('Applying changes...');
    
    const result = await syncEngine.sync({
      target: targetPlatform,
      force: options.force,
      policy: context.config.sync.default_policy
    });
    
    if (result.success) {
      spinner.succeed(`Sync completed: ${result.applied} assets applied`);
      
      if (result.warnings.length > 0) {
        console.log('\n' + yellow('Warnings:'));
        result.warnings.forEach(w => console.log(`  ⚠ ${w}`));
      }
    } else {
      spinner.fail('Sync failed');
      result.errors.forEach(e => console.error(red(`  ✗ ${e}`)));
      process.exit(1);
    }
  }
};
```

### 3.4 Capture 命令实现

```typescript
// src/cli/commands/capture.ts

import { input, choose, yesNo } from '../utils/prompt';
import { Spinner } from '../utils/spinner';

export const captureCommand: CommandDefinition = {
  name: 'capture',
  aliases: ['save'],
  description: 'Capture current IDE capabilities',
  arguments: [
    { name: 'name', description: 'Asset name', required: false }
  ],
  options: [
    { flags: '--type <type>', description: 'Asset type' },
    { flags: '--tag <tag>', description: 'Add tag' },
    { flags: '--scope <scope>', description: 'Scope (global|project)' },
    { flags: '--ai', description: 'Use AI extraction' }
  ],
  
  middleware: [loadConfigMiddleware],
  
  async handler(args, options, context) {
    const spinner = new Spinner();
    
    // 获取资产名称
    let name = args[0];
    if (!name) {
      name = await input('Enter asset name:');
    }
    
    // 验证名称格式
    if (!/^[a-z0-9-]+$/.test(name)) {
      throw new ValidationError(
        'Asset name must be lowercase alphanumeric with hyphens only'
      );
    }
    
    // 检测或选择资产类型
    let type = options.type;
    if (!type) {
      const detected = await detectAssetType();
      if (detected) {
        type = detected;
      } else {
        type = await choose(
          'Select asset type:',
          [
            { value: 'prompt', label: 'Prompt', hint: 'AI instruction set' },
            { value: 'skill', label: 'Skill', hint: 'Reusable capability' },
            { value: 'agent', label: 'Agent', hint: 'AI role definition' }
          ]
        );
      }
    }
    
    context.logger.info(`Capturing ${type}: ${name}`);
    
    // 根据类型执行捕获
    spinner.start(`Capturing ${type}...`);
    
    let asset: Asset;
    switch (type) {
      case 'prompt':
        asset = await capturePrompt(name, options, context);
        break;
      case 'skill':
        asset = await captureSkill(name, options, context);
        break;
      case 'agent':
        asset = await captureAgent(name, options, context);
        break;
      default:
        throw new Error(`Unknown asset type: ${type}`);
    }
    
    spinner.succeed(`${type} captured: ${name}`);
    
    // 展示预览
    console.log('\n' + '='.repeat(50));
    console.log('Asset Preview:');
    console.log(`  Name: ${asset.name}`);
    console.log(`  Type: ${asset.type}`);
    console.log(`  Version: ${asset.version}`);
    console.log(`  Scope: ${asset.scope}`);
    console.log('='.repeat(50) + '\n');
    
    // 确认提交
    const shouldCommit = await yesNo('Commit to repository?', true);
    if (shouldCommit) {
      const commitMessage = options.ai
        ? await generateCommitMessageWithAI(asset, context)
        : `feat(${type}): add ${name}`;
      
      await commitAsset(asset, commitMessage, context);
      context.logger.info('Asset committed successfully');
    }
  }
};

async function capturePrompt(
  name: string,
  options: any,
  context: CommandContext
): Promise<PromptAsset> {
  // 读取当前 IDE 的 prompt 配置
  const platform = await detectCurrentPlatform();
  const extractor = createExtractor(platform);
  
  const rawContent = await extractor.extractPrompt();
  
  let content = rawContent;
  
  // 如果使用 AI 提取
  if (options.ai) {
    const aiProvider = createAIProvider(context.config);
    const extracted = await aiProvider.extractPrompt(rawContent);
    content = extracted.content;
  }
  
  return {
    id: `prompt-${name}`,
    name,
    type: 'prompt',
    version: '1.0.0',
    content,
    scope: options.scope || 'project',
    tags: options.tag ? [options.tag] : [],
    metadata: {
      extracted_from: platform,
      extracted_at: new Date().toISOString()
    }
  };
}

async function captureSkill(
  name: string,
  options: any,
  context: CommandContext
): Promise<SkillAsset> {
  // 类似实现...
}

async function captureAgent(
  name: string,
  options: any,
  context: CommandContext
): Promise<AgentAsset> {
  // 类似实现...
}
```

---

## 四、适配器实现

### 4.1 Cursor 适配器详细实现

```typescript
// src/adapters/cursor.ts

import { BaseAdapter } from './base';
import { fileExists, ensureDir, writeFile, readFile } from '../utils/fs';
import { join } from 'path';

export class CursorAdapter extends BaseAdapter {
  readonly name = 'cursor';
  readonly version = '0.45';
  readonly supportedAssets = ['prompt', 'agent', 'skill'];
  
  private readonly RULES_DIR = '.cursor/rules';
  private readonly CURSOR_RULES = '.cursorrules';
  
  async detect(): Promise<boolean> {
    return await fileExists('.cursor') || 
           await fileExists('.cursorrules');
  }
  
  async adapt(asset: Asset): Promise<PlatformConfig[]> {
    switch (asset.type) {
      case 'prompt':
        return this.adaptPrompt(asset as PromptAsset);
      case 'agent':
        return this.adaptAgent(asset as AgentAsset);
      case 'skill':
        return this.adaptSkill(asset as SkillAsset);
      default:
        throw new UnsupportedAssetError(asset.type, this.name);
    }
  }
  
  private async adaptPrompt(prompt: PromptAsset): Promise<PlatformConfig[]> {
    // 转换为 .mdc 格式
    const mdcContent = this.toMDCFormat(prompt);
    
    return [{
      path: join(this.RULES_DIR, `${prompt.name}.mdc`),
      content: mdcContent,
      metadata: {
        globs: prompt.globs || ['*'],
        alwaysApply: prompt.scope === 'global',
        description: prompt.description
      }
    }];
  }
  
  private toMDCFormat(prompt: PromptAsset): string {
    const frontmatter = {
      description: prompt.description || prompt.name,
      globs: prompt.globs?.join(',') || '*',
      alwaysApply: prompt.scope === 'global'
    };
    
    // 如果有变量定义，添加到 frontmatter
    if (prompt.variables && prompt.variables.length > 0) {
      (frontmatter as any).variables = prompt.variables;
    }
    
    return `---
${this.yamlStringify(frontmatter)}---

${prompt.content}`;
  }
  
  private async adaptAgent(agent: AgentAsset): Promise<PlatformConfig[]> {
    // Cursor 通过 .cursorrules 文件支持 Agent 定义
    const existingRules = await this.readExistingRules();
    
    const agentRule = `
# ${agent.name}
## Description
${agent.description}

## Purpose
${agent.purpose}

## Instructions
${agent.instructions || ''}
`;
    
    const updatedRules = existingRules 
      ? `${existingRules}\n${agentRule}`
      : agentRule;
    
    return [{
      path: this.CURSOR_RULES,
      content: updatedRules,
      metadata: {
        append: !!existingRules
      }
    }];
  }
  
  private async adaptSkill(skill: SkillAsset): Promise<PlatformConfig[]> {
    // Skills 在 Cursor 中通常映射为自定义工具
    // 这需要 Cursor 的扩展支持，目前仅作文档化
    return [{
      path: join(this.RULES_DIR, `${skill.name}-skill.mdc`),
      content: this.skillToDoc(skill),
      metadata: {
        globs: '*',
        alwaysApply: false
      }
    }];
  }
  
  private skillToDoc(skill: SkillAsset): string {
    return `---
description: Skill documentation for ${skill.name}
globs: *
alwaysApply: false
---

# ${skill.name}

${skill.description}

## Usage

This skill provides the following capabilities:

${skill.capabilities?.map(c => `- ${c}`).join('\n') || 'No capabilities defined'}

## Input Schema

\`\`\`json
${JSON.stringify(skill.input, null, 2)}
\`\`\`
`;
  }
  
  async reverseAdapt(configPath: string): Promise<Asset> {
    const content = await readFile(configPath, 'utf-8');
    
    if (configPath.endsWith('.mdc')) {
      return this.parseMDCFile(content, configPath);
    } else if (configPath === '.cursorrules') {
      return this.parseCursorRulesFile(content);
    }
    
    throw new Error(`Unknown Cursor config format: ${configPath}`);
  }
  
  private parseMDCFile(content: string, path: string): PromptAsset {
    // 解析 frontmatter
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) {
      throw new Error('Invalid MDC format');
    }
    
    const frontmatter = this.yamlParse(match[1]);
    const body = match[2].trim();
    
    const name = path.split('/').pop()?.replace('.mdc', '') || 'unknown';
    
    return {
      id: `prompt-${name}`,
      name,
      type: 'prompt',
      version: '1.0.0',
      content: body,
      description: frontmatter.description,
      globs: frontmatter.globs?.split(',').map((g: string) => g.trim()),
      scope: frontmatter.alwaysApply ? 'global' : 'project',
      variables: frontmatter.variables || [],
      metadata: {
        imported_from: 'cursor',
        imported_at: new Date().toISOString()
      }
    };
  }
  
  async apply(configs: PlatformConfig[]): Promise<void> {
    for (const config of configs) {
      await ensureDir(config.path.split('/').slice(0, -1).join('/'));
      
      if (config.metadata?.append) {
        // 追加模式
        const existing = await fileExists(config.path)
          ? await readFile(config.path, 'utf-8')
          : '';
        await writeFile(config.path, existing + '\n' + config.content);
      } else {
        // 覆盖模式
        await writeFile(config.path, config.content);
      }
    }
  }
  
  checkCompatibility(asset: Asset): CompatibilityReport {
    const issues: string[] = [];
    
    if (asset.type === 'skill') {
      issues.push('Skills are limited to documentation in Cursor');
    }
    
    if (asset.type === 'flow') {
      issues.push('Flows are not supported in Cursor');
    }
    
    return {
      compatible: asset.type === 'prompt' || asset.type === 'agent',
      level: issues.length > 0 ? 'partial' : 'full',
      issues,
      workarounds: issues.map(i => `Consider using ${this.suggestAlternative(asset)}`)
    };
  }
  
  private suggestAlternative(asset: Asset): string {
    switch (asset.type) {
      case 'skill':
        return 'a Prompt with detailed instructions';
      case 'flow':
        return 'multiple Agents coordinated via prompts';
      default:
        return 'a different platform';
    }
  }
  
  private async readExistingRules(): Promise<string | null> {
    try {
      return await readFile(this.CURSOR_RULES, 'utf-8');
    } catch {
      return null;
    }
  }
  
  private yamlStringify(obj: any): string {
    // 简化的 YAML 序列化
    return Object.entries(obj)
      .map(([k, v]) => {
        if (typeof v === 'boolean') return `${k}: ${v}`;
        if (typeof v === 'string') return `${k}: ${v}`;
        return `${k}: ${JSON.stringify(v)}`;
      })
      .join('\n') + '\n';
  }
  
  private yamlParse(str: string): any {
    // 简化的 YAML 解析
    const result: any = {};
    for (const line of str.split('\n')) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        if (value === 'true') result[key] = true;
        else if (value === 'false') result[key] = false;
        else result[key] = value;
      }
    }
    return result;
  }
}
```

### 4.2 Open Code 适配器实现

```typescript
// src/adapters/opencode.ts

import { BaseAdapter } from './base';
import { fileExists, ensureDir, writeFile, readFile } from '../utils/fs';
import { join } from 'path';

export class OpenCodeAdapter extends BaseAdapter {
  readonly name = 'opencode';
  readonly version = '1.0';
  readonly supportedAssets = ['agent', 'skill', 'flow', 'command'];
  
  private readonly OPENCODE_DIR = '.opencode';
  
  async detect(): Promise<boolean> {
    return await fileExists('.opencode') || 
           await fileExists('opencode.json');
  }
  
  async adapt(asset: Asset): Promise<PlatformConfig[]> {
    switch (asset.type) {
      case 'agent':
        return this.adaptAgent(asset as AgentAsset);
      case 'skill':
        return this.adaptSkill(asset as SkillAsset);
      case 'flow':
        return this.adaptFlow(asset as FlowAsset);
      case 'command':
        return this.adaptCommand(asset as CommandAsset);
      default:
        throw new UnsupportedAssetError(asset.type, this.name);
    }
  }
  
  private async adaptAgent(agent: AgentAsset): Promise<PlatformConfig[]> {
    const config = {
      name: agent.name,
      description: agent.description,
      instructions: agent.purpose,
      tools: agent.assigned_skills || [],
      model: agent.llm_config?.model,
      temperature: agent.llm_config?.temperature
    };
    
    return [{
      path: join(this.OPENCODE_DIR, 'agents', `${agent.name}.yaml`),
      content: this.yamlStringify(config)
    }];
  }
  
  private async adaptSkill(skill: SkillAsset): Promise<PlatformConfig[]> {
    const configs: PlatformConfig[] = [];
    
    // Skill 定义
    configs.push({
      path: join(this.OPENCODE_DIR, 'skills', skill.name, 'SKILL.md'),
      content: this.generateSkillMD(skill)
    });
    
    // 如果有逻辑文件，复制
    if (skill.entry) {
      configs.push({
        path: join(this.OPENCODE_DIR, 'skills', skill.name, skill.entry),
        content: skill.logic || ''
      });
    }
    
    return configs;
  }
  
  private generateSkillMD(skill: SkillAsset): string {
    return `---
name: ${skill.name}
version: ${skill.version}
description: ${skill.description}
tools:
${skill.tools?.map(t => `  - ${t}`).join('\n') || ''}
---

# ${skill.name}

${skill.description}

## Overview

${skill.overview || 'No overview provided'}

## Input Schema

\`\`\`yaml
${this.yamlStringify(skill.input)}
\`\`\`

## Output Schema

\`\`\`yaml
${this.yamlStringify(skill.output)}
\`\`\`

## Examples

${skill.examples?.map((ex, i) => `### Example ${i + 1}

Input:
\`\`\`json
${JSON.stringify(ex.input, null, 2)}
\`\`\`

Output:
\`\`\`json
${JSON.stringify(ex.output, null, 2)}
\`\`\`
`).join('\n') || 'No examples provided'}
`;
  }
  
  private async adaptFlow(flow: FlowAsset): Promise<PlatformConfig[]> {
    // Open Code 支持 Flow 的 DAG 定义
    return [{
      path: join(this.OPENCODE_DIR, 'flows', `${flow.name}.json`),
      content: JSON.stringify({
        name: flow.name,
        description: flow.description,
        nodes: flow.nodes,
        edges: flow.edges,
        triggers: flow.triggers
      }, null, 2)
    }];
  }
  
  private async adaptCommand(command: CommandAsset): Promise<PlatformConfig[]> {
    return [{
      path: join(this.OPENCODE_DIR, 'commands', `${command.name}.md`),
      content: `---
name: ${command.name}
description: ${command.description}
slash: /${command.slash}
---

${command.content}
`
    }];
  }
  
  async reverseAdapt(configPath: string): Promise<Asset> {
    // 根据文件路径和类型反向解析
    if (configPath.includes('/agents/')) {
      return this.parseAgentFile(await readFile(configPath, 'utf-8'));
    } else if (configPath.includes('/skills/')) {
      return this.parseSkillFile(configPath);
    } else if (configPath.includes('/flows/')) {
      return this.parseFlowFile(await readFile(configPath, 'utf-8'));
    }
    
    throw new Error(`Unknown OpenCode config: ${configPath}`);
  }
  
  private parseAgentFile(content: string): AgentAsset {
    const parsed = this.yamlParse(content);
    
    return {
      id: `agent-${parsed.name}`,
      name: parsed.name,
      type: 'agent',
      version: '1.0.0',
      description: parsed.description,
      purpose: parsed.instructions,
      assigned_skills: parsed.tools || [],
      llm_config: {
        model: parsed.model,
        temperature: parsed.temperature
      },
      metadata: {
        imported_from: 'opencode'
      }
    };
  }
  
  async apply(configs: PlatformConfig[]): Promise<void> {
    for (const config of configs) {
      await ensureDir(config.path.split('/').slice(0, -1).join('/'));
      await writeFile(config.path, config.content);
    }
  }
  
  checkCompatibility(asset: Asset): CompatibilityReport {
    // Open Code 支持更丰富的资产类型
    if (this.supportedAssets.includes(asset.type)) {
      return {
        compatible: true,
        level: 'full',
        issues: []
      };
    }
    
    return {
      compatible: false,
      level: 'none',
      issues: [`${asset.type} is not supported in Open Code`]
    };
  }
}
```

---

## 五、AI 集成实现

### 5.1 AI Provider 工厂

```typescript
// src/ai/factory.ts

import { AIProvider } from './provider';
import { AnthropicProvider } from './providers/anthropic';
import { OpenAIProvider } from './providers/openai';

export function createAIProvider(config: UserConfig): AIProvider {
  const { ai } = config;
  
  switch (ai.provider) {
    case 'anthropic':
      return new AnthropicProvider({
        apiKey: ai.api_key || loadCredential('anthropic_api_key'),
        model: ai.model,
        temperature: ai.temperature
      });
      
    case 'openai':
      return new OpenAIProvider({
        apiKey: ai.api_key || loadCredential('openai_api_key'),
        model: ai.model,
        temperature: ai.temperature
      });
      
    default:
      throw new Error(`Unknown AI provider: ${ai.provider}`);
  }
}

function loadCredential(key: string): string {
  // 从安全凭证存储加载
  const credentials = new EncryptedCredentialManager();
  const value = credentials.get(key);
  if (!value) {
    throw new Error(`Credential not found: ${key}`);
  }
  return value;
}
```

### 5.2 Anthropic Provider 实现

```typescript
// src/ai/providers/anthropic.ts

import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, ExtractedSkill, MergeResult } from '../provider';

interface AnthropicConfig {
  apiKey: string;
  model: string;
  temperature: number;
}

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private config: AnthropicConfig;
  
  constructor(config: AnthropicConfig) {
    this.config = config;
    this.client = new Anthropic({ apiKey: config.apiKey });
  }
  
  async extractSkill(
    conversation: string,
    context: ExtractionContext
  ): Promise<ExtractedSkill> {
    const systemPrompt = `You are an expert AI capability extraction specialist.
Your task is to analyze conversations and extract reusable AI capabilities.

Output must be valid JSON matching this schema:
{
  "name": "lowercase-with-hyphens",
  "description": "Brief description",
  "version": "1.0.0",
  "type": "skill",
  "purpose": "What this skill does",
  "instructions": "Detailed instructions for AI",
  "input_schema": { /* JSON Schema */ },
  "output_schema": { /* JSON Schema */ },
  "examples": [
    { "input": {}, "output": {}, "description": "" }
  ],
  "tags": ["tag1", "tag2"]
}`;

    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: 4000,
      temperature: this.config.temperature,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Extract a reusable AI skill from this conversation:

CONTEXT:
- Project: ${context.projectName}
- Tech Stack: ${context.techStack.join(', ')}

CONVERSATION:
${conversation}

Extract the core capability demonstrated in this conversation.`
      }]
    });
    
    const content = response.content[0].text;
    return JSON.parse(content);
  }
  
  async mergePrompts(
    local: string,
    remote: string,
    description: string
  ): Promise<MergeResult> {
    const systemPrompt = `You are an expert at merging AI prompts.
Your task is to combine two versions of a prompt into a coherent whole.

Rules:
1. Preserve all unique insights from both versions
2. Resolve contradictions by choosing the more specific/detailed option
3. Maintain consistent tone and style
4. Output valid Markdown with frontmatter`;

    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: 4000,
      temperature: 0.2,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Merge these two versions of a prompt:

DESCRIPTION: ${description}

LOCAL VERSION:
${local}

REMOTE VERSION:
${remote}

Output format:
{
  "content": "merged prompt content",
  "sections": ["list", "of", "merged", "sections"],
  "conflicts_resolved": ["description of each conflict resolution"],
  "explanation": "brief explanation of merge decisions"
}`
      }]
    });
    
    return JSON.parse(response.content[0].text);
  }
  
  async generateCommitMessage(changes: Change[]): Promise<string> {
    const changeSummary = changes.map(c => {
      const type = c.type === 'added' ? 'feat' :
                   c.type === 'modified' ? 'update' :
                   c.type === 'deleted' ? 'remove' : 'chore';
      return `${type}(${c.assetType}): ${c.name}`;
    }).join('\n');
    
    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: 100,
      temperature: 0.2,
      messages: [{
        role: 'user',
        content: `Generate a Conventional Commit message for these changes:

${changeSummary}

Output only the commit message, no explanation.`
      }]
    });
    
    return response.content[0].text.trim();
  }
  
  async analyzeCompatibility(code: string): Promise<CompatibilityAnalysis> {
    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: 2000,
      temperature: 0.2,
      messages: [{
        role: 'user',
        content: `Analyze this code for platform compatibility:

\`\`\`
${code}
\`\`\`

Identify:
1. Platform-specific APIs or calls
2. File system operations
3. Network dependencies
4. Environment requirements

Output JSON:
{
  "platform_dependencies": ["list"],
  "risk_level": "low|medium|high",
  "compatible_platforms": ["cursor", "opencode", "claude"],
  "incompatible_platforms": ["cloudcode"],
  "recommendations": ["list"]
}`
      }]
    });
    
    return JSON.parse(response.content[0].text);
  }
}
```

---

## 六、测试策略

### 6.1 单元测试示例

```typescript
// src/adapters/cursor.test.ts

import { describe, it, expect, beforeEach } from 'bun:test';
import { CursorAdapter } from './cursor';
import { mockFs } from '../test-utils/mock-fs';

describe('CursorAdapter', () => {
  let adapter: CursorAdapter;
  
  beforeEach(() => {
    adapter = new CursorAdapter();
    mockFs.reset();
  });
  
  describe('#detect', () => {
    it('should detect Cursor when .cursor directory exists', async () => {
      mockFs.addDirectory('.cursor');
      const detected = await adapter.detect();
      expect(detected).toBe(true);
    });
    
    it('should detect Cursor when .cursorrules file exists', async () => {
      mockFs.addFile('.cursorrules', '');
      const detected = await adapter.detect();
      expect(detected).toBe(true);
    });
    
    it('should not detect Cursor when neither exists', async () => {
      const detected = await adapter.detect();
      expect(detected).toBe(false);
    });
  });
  
  describe('#adapt', () => {
    it('should convert prompt to MDC format', async () => {
      const prompt: PromptAsset = {
        id: 'prompt-test',
        name: 'test-prompt',
        type: 'prompt',
        version: '1.0.0',
        content: 'You are a helpful assistant.',
        description: 'Test prompt',
        scope: 'global',
        globs: ['*.ts', '*.js']
      };
      
      const configs = await adapter.adapt(prompt);
      
      expect(configs).toHaveLength(1);
      expect(configs[0].path).toBe('.cursor/rules/test-prompt.mdc');
      expect(configs[0].content).toContain('---');
      expect(configs[0].content).toContain('description: Test prompt');
      expect(configs[0].content).toContain('globs: *.ts,*.js');
      expect(configs[0].content).toContain('alwaysApply: true');
    });
  });
  
  describe('#checkCompatibility', () => {
    it('should report full compatibility for prompts', () => {
      const report = adapter.checkCompatibility({
        id: 'prompt-test',
        name: 'test',
        type: 'prompt',
        version: '1.0.0'
      });
      
      expect(report.compatible).toBe(true);
      expect(report.level).toBe('full');
    });
    
    it('should report partial compatibility for skills', () => {
      const report = adapter.checkCompatibility({
        id: 'skill-test',
        name: 'test',
        type: 'skill',
        version: '1.0.0'
      });
      
      expect(report.compatible).toBe(true);
      expect(report.level).toBe('partial');
      expect(report.issues).toContain('Skills are limited to documentation in Cursor');
    });
  });
});
```

### 6.2 集成测试示例

```typescript
// tests/integration/sync.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { createTestRepo, cleanupTestRepo } from '../fixtures/repo';
import { GitSyncEngine } from '../../src/sync/engine';

describe('GitSyncEngine Integration', () => {
  let testRepo: TestRepo;
  let syncEngine: GitSyncEngine;
  
  beforeAll(async () => {
    testRepo = await createTestRepo({
      assets: [
        { type: 'prompt', name: 'test-prompt', content: 'Test content' }
      ]
    });
    
    syncEngine = new GitSyncEngine(testRepo.config);
  });
  
  afterAll(async () => {
    await cleanupTestRepo(testRepo);
  });
  
  describe('diff calculation', () => {
    it('should detect added assets', async () => {
      const diff = await syncEngine.diff();
      expect(diff.added).toHaveLength(1);
      expect(diff.added[0].name).toBe('test-prompt');
    });
    
    it('should detect modified assets', async () => {
      // 修改远程资产
      await testRepo.modifyAsset('test-prompt', 'Modified content');
      
      const diff = await syncEngine.diff();
      expect(diff.modified).toHaveLength(1);
    });
  });
  
  describe('sync operation', () => {
    it('should successfully sync assets', async () => {
      const result = await syncEngine.sync({ target: 'cursor' });
      
      expect(result.success).toBe(true);
      expect(result.applied).toBe(1);
      
      // 验证文件已创建
      const exists = await fileExists('.cursor/rules/test-prompt.mdc');
      expect(exists).toBe(true);
    });
  });
});
```

---

## 七、构建与发布

### 7.1 二进制构建脚本

```typescript
// scripts/build-binaries.ts

import { $ } from 'bun';

const PLATFORMS = [
  { os: 'darwin', arch: 'arm64', name: 'macos-arm64' },
  { os: 'darwin', arch: 'x64', name: 'macos-x64' },
  { os: 'linux', arch: 'arm64', name: 'linux-arm64' },
  { os: 'linux', arch: 'x64', name: 'linux-x64' },
  { os: 'windows', arch: 'x64', name: 'windows-x64' }
];

async function buildBinaries() {
  console.log('Building platform binaries...\n');
  
  for (const platform of PLATFORMS) {
    console.log(`Building for ${platform.name}...`);
    
    const ext = platform.os === 'windows' ? '.exe' : '';
    const output = `bin/acl-${platform.name}${ext}`;
    
    try {
      await $`bun build src/cli/index.ts --compile --target=bun-${platform.os}-${platform.arch} --outfile=${output}`;
      console.log(`  ✓ ${output}`);
    } catch (error) {
      console.error(`  ✗ Failed: ${error}`);
    }
  }
  
  console.log('\nBuild complete!');
}

buildBinaries().catch(console.error);
```

### 7.2 GitHub Actions 发布工作流

```yaml
# .github/workflows/release.yml

name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build-and-release:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install
      
      - name: Run tests
        run: bun test
      
      - name: Build
        run: bun run build:all
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: bin/*
          generate_release_notes: true
```

---

**文档维护者**: Sisyphus  
**实现状态**: 规划阶段  
**预计开发周期**: 12-16 周
