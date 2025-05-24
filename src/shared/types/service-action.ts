import { Transaction } from "sequelize";

export type ServiceActionOptions = {
  validateDTO?: boolean;
  throwErrorOnValidateFailed?: boolean;
};

export type TransactionalServiceActionOptions = ServiceActionOptions & {
  transaction?: Transaction;
}
