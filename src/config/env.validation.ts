import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  // Database
  DATABASE_URL: Joi.string().required(),
  DATABASE_URL_TEST: Joi.string().optional(),

  // API Configuration
  API_KEYS: Joi.string().required(),

  // Transfer Configuration
  DEFAULT_CURRENCY: Joi.string().default('XOF'),
  FEE_PERCENTAGE: Joi.number().min(0).max(100).default(0.8),
  MIN_FEE: Joi.number().min(0).default(100),
  MAX_FEE: Joi.number().min(0).default(1500),
});
