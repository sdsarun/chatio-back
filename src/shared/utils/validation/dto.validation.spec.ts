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

  it('should call onValidateDTOFailed when validation fails', async () => {
    const onValidateDTOFailedMock = jest.fn();

    await validateDTO(failedDTO, DTO, {
      throwErrorOnValidateFailed: false,
      onValidateDTOFailed: onValidateDTOFailedMock,
    });

    expect(onValidateDTOFailedMock).toHaveBeenCalled();
    expect(onValidateDTOFailedMock).toHaveBeenCalledWith(expect.any(Array));
  });

  it('should not call onValidateDTOFailed when validation succeeds', async () => {
    class ValidDTO {
      @IsString()
      property: string;
    }

    const validDTO = plainToInstance(ValidDTO, { property: 'valid value' });

    const onValidateDTOFailedMock = jest.fn();

    const errors = await validateDTO(validDTO, ValidDTO, {
      throwErrorOnValidateFailed: false,
      onValidateDTOFailed: onValidateDTOFailedMock,
    });

    expect(errors).toEqual([]);
    expect(onValidateDTOFailedMock).not.toHaveBeenCalled();
  });

  it('should throw an error when throwErrorOnValidateFailed is true and validation fails', async () => {
    await expect(
      validateDTO(failedDTO, DTO, { throwErrorOnValidateFailed: true }),
    ).rejects.toThrow(Error);
  });

  it('should call onValidateDTOFailed callback with errors if validation fails and throwErrorOnValidateFailed is false', async () => {
    const onValidateDTOFailedMock = jest.fn();

    await validateDTO(failedDTO, DTO, {
      throwErrorOnValidateFailed: false,
      onValidateDTOFailed: onValidateDTOFailedMock,
    });

    expect(onValidateDTOFailedMock).toHaveBeenCalledWith(expect.any(Array));
  });

  it('should not call onValidateDTOFailed when there are no errors and validation passes', async () => {
    class ValidDTO {
      @IsString()
      property: string;
    }

    const validDTO = plainToInstance(ValidDTO, { property: 'valid value' });

    const onValidateDTOFailedMock = jest.fn();

    await validateDTO(validDTO, ValidDTO, {
      throwErrorOnValidateFailed: false,
      onValidateDTOFailed: onValidateDTOFailedMock,
    });

    expect(onValidateDTOFailedMock).not.toHaveBeenCalled();
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
