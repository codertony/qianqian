/**
 * AI Provider - 工厂
 *
 * 创建和管理 AI Provider 实例
 *
 * @module ai-provider-factory
 */

import {
  AIProvider,
  AIProviderType,
  AIMessageRole,
  AIProviderConfig,
  AIConfig,
  AICallOptions,
  AICallResult,
  AIMessage,
  AITaskType,
  AITaskOptions,
  AITaskResult,
} from './types';
import { AnthropicProvider } from './providers/anthropic';
import { OpenAIProvider } from './providers/openai';
import { logger } from '../../shared/logger';
import { RateLimiter } from './rate-limiter';
import { TokenBudgetManager } from './token-budget';

/**
 * AI Provider 工厂
 */
export class AIProviderFactory {
  private providers: Map<AIProviderType, AIProvider> = new Map();
  private config: AIConfig;
  private rateLimiter?: RateLimiter;
  private tokenBudget?: TokenBudgetManager;

  constructor(config: AIConfig) {
    this.config = config;
    this.initializeProviders();
    this.initializeRateLimiter();
    this.initializeTokenBudget();
  }

  /**
   * 初始化所有配置的 Provider
   */
  private initializeProviders(): void {
    for (const providerConfig of this.config.providers) {
      try {
        const provider = this.createProvider(providerConfig);
        if (provider) {
          this.providers.set(providerConfig.type, provider);
          logger.debug(`AI Provider initialized: ${providerConfig.type}`);
        }
      } catch (error) {
        logger.warn(`Failed to initialize AI Provider: ${providerConfig.type}`, { error });
      }
    }
  }

  /**
   * 初始化限流器
   */
  private initializeRateLimiter(): void {
    if (this.config.rateLimit) {
      this.rateLimiter = new RateLimiter(this.config.rateLimit);
    }
  }

  /**
   * 初始化 Token 预算管理器
   */
  private initializeTokenBudget(): void {
    if (this.config.tokenBudget) {
      this.tokenBudget = new TokenBudgetManager(this.config.tokenBudget);
    }
  }

  /**
   * 创建单个 Provider 实例
   */
  private createProvider(config: AIProviderConfig): AIProvider | null {
    switch (config.type) {
      case AIProviderType.ANTHROPIC:
        return new AnthropicProvider(config);
      case AIProviderType.OPENAI:
        return new OpenAIProvider(config);
      default:
        logger.warn(`Unknown AI Provider type: ${config.type}`);
        return null;
    }
  }

  /**
   * 获取指定类型的 Provider
   */
  getProvider(type?: AIProviderType): AIProvider | null {
    const targetType = type || this.config.defaultProvider;
    return this.providers.get(targetType) || null;
  }

  /**
   * 获取默认 Provider
   */
  getDefaultProvider(): AIProvider | null {
    return this.getProvider(this.config.defaultProvider);
  }

  /**
   * 获取所有可用的 Provider
   */
  getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.values()).filter(p => p.isAvailable);
  }

  /**
   * 检查是否有可用的 Provider
   */
  hasAvailableProvider(): boolean {
    return this.getAvailableProviders().length > 0;
  }

  /**
   * 获取默认 Provider 的名称
   */
  getDefaultProviderName(): string {
    const provider = this.getDefaultProvider();
    return provider?.name || 'None';
  }

  /**
   * 执行 AI 任务 (带限流和预算检查)
   */
  async executeTask<T = string>(
    taskType: AITaskType,
    messages: AIMessage[],
    options: AITaskOptions = {}
  ): Promise<AITaskResult<T>> {
    // 限流检查
    if (this.rateLimiter && !this.rateLimiter.canProceed()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Token 预算检查
    if (this.tokenBudget && options.maxTokens) {
      const canProceed = await this.tokenBudget.checkBudget(options.maxTokens);
      if (!canProceed) {
        throw new Error('Token budget exceeded. Please try again tomorrow or increase your budget.');
      }
    }

    const provider = this.getProvider(options.model as AIProviderType);
    if (!provider) {
      throw new Error(`No AI Provider available. Please configure ${this.config.defaultProvider} API key.`);
    }

    const startTime = Date.now();
    try {
      const result = await provider.chat(messages, options);
      
      // 记录限流
      this.rateLimiter?.recordRequest();
      
      // 记录 Token 使用
      this.tokenBudget?.recordUsage(result.totalTokens);

      return {
        ...result,
        data: result.content as unknown as T,
      };
    } catch (error) {
      logger.error(`AI task failed: ${taskType}`, { error });
      throw error;
    }
  }

  /**
   * 生成 Commit Message
   */
  async generateCommitMessage(diff: string): Promise<string> {
    const systemPrompt = `You are a commit message generator. Generate a concise, conventional commit message based on the git diff provided.
Follow the Conventional Commits format: type(scope): description
Types: feat, fix, docs, style, refactor, test, chore
Keep the message under 72 characters.`;

    const prompt = `Generate a commit message for the following changes:\n\n${diff}`;

    const messages: AIMessage[] = [
      { role: AIMessageRole.USER, content: prompt },
    ];

    const result = await this.executeTask<string>(
      AITaskType.COMMIT_MESSAGE,
      messages,
      {
        systemPrompt,
        maxTokens: 100,
        temperature: 0.3,
      }
    );

    return result.content.trim();
  }

  /**
   * 提取 Skill
   */
  async extractSkill(conversation: string): Promise<{
    name: string;
    description: string;
    capabilities: string[];
    inputSchema?: Record<string, unknown>;
    examples?: string[];
  }> {
    const systemPrompt = `You are a skill extraction assistant. Analyze the conversation and extract a reusable skill.
Return ONLY a JSON object with no markdown formatting:
{
  "name": "skill-name",
  "description": "Brief description of what this skill does",
  "capabilities": ["capability1", "capability2"],
  "inputSchema": { "type": "object", "properties": {} },
  "examples": ["example1", "example2"]
}`;

    const messages: AIMessage[] = [
      { role: AIMessageRole.USER, content: `Extract skill from this conversation:\n\n${conversation}` },
    ];

    const result = await this.executeTask(
      AITaskType.SKILL_EXTRACTION,
      messages,
      {
        systemPrompt,
        maxTokens: 2000,
        temperature: 0.5,
      }
    );

    try {
      const parsed = JSON.parse(result.content);
      return {
        name: parsed.name || 'extracted-skill',
        description: parsed.description || '',
        capabilities: parsed.capabilities || [],
        inputSchema: parsed.inputSchema,
        examples: parsed.examples,
      };
    } catch {
      // 如果解析失败，返回基础结构
      return {
        name: 'extracted-skill',
        description: result.content.substring(0, 200),
        capabilities: [],
      };
    }
  }

  /**
   * 获取 Token 使用统计
   */
  getTokenStats(): { used: number; remaining: number; dailyMax: number } | null {
    if (!this.tokenBudget) return null;
    return this.tokenBudget.getStats();
  }

  /**
   * 重置每日 Token 预算
   */
  resetDailyBudget(): void {
    this.tokenBudget?.resetDaily();
  }
}

/**
 * 创建 AI Provider 工厂
 */
export function createAIProviderFactory(config: AIConfig): AIProviderFactory {
  return new AIProviderFactory(config);
}
