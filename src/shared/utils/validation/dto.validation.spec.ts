/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { plainToInstance } from 'class-transformer';
import { IsString } from 'class-validator';
import { validateDTO } from './dto.validation';

describe('validateDTO', () => {
  class DTO {
    @IsString()
    property: string;
  }

  const failedDTO = plainToInstance(DTO, {});

  beforeEach(() => jest.clearAllMocks());

  it('should throw error by default', () => {
    expect(validateDTO(failedDTO, DTO)).rejects.toThrow(Error);
  });

  it('should not throw error if set throwErrorOnValidateFailed to false', () => {
    expect(
      validateDTO(failedDTO, DTO, { throwErrorOnValidateFailed: false }),
    ).resolves.toHaveLength(1);
  });

  it('should pass once plain object not instance from class-validator', async () => {
    class MockDTO {
      @IsString()
      property: string;

      otherProperty: string | undefined;
    }

    const plainDTO: MockDTO = {
      property: '',
      otherProperty: undefined,
    };

    const errros = await validateDTO(plainDTO, MockDTO, {
      throwErrorOnValidateFailed: false,
    });
    expect(errros).toHaveLength(0);
  });

  it('should error once plain object without class', async () => {
    class UnknownDTO {
      property: any;
      otherProperty: any;
    }

    const plainDTO = {
      property: '',
      otherProperty: undefined,
    };

    const errros1 = await validateDTO(plainDTO, undefined as any, {
      throwErrorOnValidateFailed: false,
    });
    expect(errros1.length).toBeGreaterThan(0);

    const errros2 = await validateDTO(plainDTO, UnknownDTO, {
      throwErrorOnValidateFailed: false,
    });
    expect(errros2.length).toBeGreaterThan(0);
  });
});
