export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL,
    testUrl: process.env.DATABASE_URL_TEST,
  },

  api: {
    keys: process.env.API_KEYS?.split(',').map((k) => k.trim()) || [],
  },

  transfer: {
    defaultCurrency: process.env.DEFAULT_CURRENCY || 'XOF',
    feePercentage: parseFloat(process.env.FEE_PERCENTAGE || '0.8'),
    minFee: parseInt(process.env.MIN_FEE || '100', 10),
    maxFee: parseInt(process.env.MAX_FEE || '1500', 10),
  },
});
