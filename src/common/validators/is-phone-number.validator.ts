import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator for E.164 international phone number format
 * Validates phone numbers in the format: +[country code][number]
 * Example: +221770000000
 */
export function IsPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isPhoneNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'Phone number must be in E.164 format (e.g., +221770000000)',
        ...validationOptions,
      },
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }
          // E.164 format: + followed by country code and number (max 15 digits total)
          const e164Regex = /^\+[1-9]\d{1,14}$/;
          return e164Regex.test(value);
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be a valid phone number in E.164 format (e.g., +221770000000)`;
        },
      },
    });
  };
}
