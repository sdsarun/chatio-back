import { ValidationError } from 'class-validator';

export type ServiceActionOptions = {
  validateDTO?: boolean;
  throwErrorOnValidateFailed?: boolean;
  onValidateDTOFailed?: (errors: ValidationError[]) => void;
};
