import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * List of supported currencies
 * Can be extended to include more currencies
 */
const SUPPORTED_CURRENCIES = [
  'XOF', // West African CFA franc
  'XAF', // Central African CFA franc
  'USD', // US Dollar
  'EUR', // Euro
  'GBP', // British Pound
  'NGN', // Nigerian Naira
  'GHS', // Ghanaian Cedi
  'KES', // Kenyan Shilling
  'ZAR', // South African Rand
];

/**
 * Custom validator for currency codes
 * Validates that the currency is one of the supported currencies
 */
export function IsValidCurrency(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isValidCurrency',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `Currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }
          return SUPPORTED_CURRENCIES.includes(value.toUpperCase());
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be a valid currency code (${SUPPORTED_CURRENCIES.join(', ')})`;
        },
      },
    });
  };
}

/**
 * Checks if a currency code is valid (exported for use in services)
 */
export function isValidCurrencyCode(currency: string): boolean {
  return SUPPORTED_CURRENCIES.includes(currency.toUpperCase());
}

/**
 * Get list of supported currencies
 */
export function getSupportedCurrencies(): readonly string[] {
  return SUPPORTED_CURRENCIES;
}
