import { isInstance, validate, ValidationError } from 'class-validator';
import { ServiceActionOptions } from '../../types/service-action';
import { ClassConstructor, plainToInstance } from 'class-transformer';

export async function validateDTO<T extends object>(
  plainDTO: T,
  classDTO: ClassConstructor<T>,
  options?: ServiceActionOptions,
): Promise<ValidationError[]> {
  const ensurePlainToInstanceDTO = isInstance(plainDTO, classDTO) ? plainDTO: plainToInstance(classDTO, plainDTO);
  const errors: ValidationError[] = await validate(ensurePlainToInstanceDTO, { whitelist: true });

  if (errors.length > 0) {
    if (typeof options?.onValidateDTOFailed === 'function') {
      options?.onValidateDTOFailed(errors);
    }

    const throwErrorOnValidateFailed: boolean = options?.throwErrorOnValidateFailed ?? true;
    if (throwErrorOnValidateFailed) {
      throw new Error(errors.toString());
    } else {
      return errors;
    }
  }

  return [];
}
