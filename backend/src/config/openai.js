// OpenAI configuration
// This file can be extended for OpenAI-specific settings

const config = {
  defaultModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '150'),
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
};

module.exports = config;
