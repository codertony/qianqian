/**
 * AI Provider - Anthropic 实现
 *
 * Anthropic Claude API 集成
 *
 * @module anthropic-provider
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  AIProvider,
  AIProviderType,
  AIMessage,
  AIMessageRole,
  AICallOptions,
  AICallResult,
  AIProviderConfig,
} from '../types';
import { logger } from '../../../shared/logger';

/**
 * Anthropic 模型映射
 */
const ANTHROPIC_MODELS: Record<string, string> = {
  'claude-3-opus': 'claude-3-opus-20240229',
  'claude-3-sonnet': 'claude-3-sonnet-20240229',
  'claude-3-haiku': 'claude-3-haiku-20240307',
  'claude-3-5-sonnet': 'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku': 'claude-3-5-haiku-20241022',
};

/**
 * 默认 Anthropic 模型
 */
const DEFAULT_MODEL = 'claude-3-5-sonnet-20241022';

/**
 * Anthropic Provider
 */
export class AnthropicProvider implements AIProvider {
  readonly name = 'Anthropic';
  readonly type = AIProviderType.ANTHROPIC;
  readonly defaultModel: string;
  private client: Anthropic;
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.defaultModel = config.defaultModel || DEFAULT_MODEL;
    
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  /**
   * 是否可用 (API Key 是否配置)
   */
  get isAvailable(): boolean {
    return !!this.config.apiKey;
  }

  /**
   * 发送消息并获取回复
   */
  async chat(messages: AIMessage[], options: AICallOptions = {}): Promise<AICallResult> {
    const startTime = Date.now();
    const model = this.resolveModel(options.model);
    
    try {
      // 转换消息格式
      const anthropicMessages = messages
        .filter(m => m.role !== AIMessageRole.SYSTEM)
        .map(m => ({
          role: m.role === AIMessageRole.USER ? 'user' as const : 'assistant' as const,
          content: m.content,
        }));

      // 提取系统提示词
      const systemPrompt = options.systemPrompt || 
        messages.find(m => m.role === AIMessageRole.SYSTEM)?.content;

      const response = await this.client.messages.create({
        model,
        messages: anthropicMessages,
        system: systemPrompt,
        max_tokens: options.maxTokens || this.config.defaultMaxTokens || 4096,
        temperature: options.temperature ?? this.config.defaultTemperature ?? 0.7,
      });

      const duration = Date.now() - startTime;

      return {
        content: response.content
          .filter((c): c is Anthropic.TextBlock => c.type === 'text')
          .map(c => c.text)
          .join(''),
        model,
        inputTokens: response.usage?.input_tokens || 0,
        outputTokens: response.usage?.output_tokens || 0,
        totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
        duration,
      };
    } catch (error) {
      logger.error('Anthropic API call failed', { error, model });
      throw error;
    }
  }

  /**
   * 生成完成内容
   */
  async complete(prompt: string, options: AICallOptions = {}): Promise<AICallResult> {
    const messages: AIMessage[] = [
      { role: AIMessageRole.USER, content: prompt },
    ];
    return this.chat(messages, options);
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.complete('Hello', { maxTokens: 10 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 解析模型名称
   */
  private resolveModel(model?: string): string {
    if (!model) return this.defaultModel;
    return ANTHROPIC_MODELS[model] || model;
  }
}
