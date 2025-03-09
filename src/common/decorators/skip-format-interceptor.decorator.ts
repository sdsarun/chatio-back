export const SkipFormatResponseInterceptorPropertyName = Symbol(
  'SkipFormatResponseInterceptorPropertyName',
);

export function SkipFormatResponseInterceptor() {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    descriptor.value[SkipFormatResponseInterceptorPropertyName] = true;
  };
}
