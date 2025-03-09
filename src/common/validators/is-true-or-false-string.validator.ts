import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsTrueOrFalseString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTrueOrFalseString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return (
            typeof value === 'string' && (value === 'true' || value === 'false')
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a string containing "true" or "false".`;
        },
      },
    });
  };
}
