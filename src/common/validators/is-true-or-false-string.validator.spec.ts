import { IsOptional, validateSync } from "class-validator";
import { IsTrueOrFalseString } from "./is-true-or-false-string.validator";

describe('IsTrueOrFalseString', () => {

  it("should valid if string is 'true' or 'false'", () => {
    class MockValidDTO {
      @IsTrueOrFalseString()
      property: string;

      @IsOptional()
      other_property: any;
    }

    const dto = new MockValidDTO();
    dto.property = "true";

    const errors1 = validateSync(dto)
    expect(errors1).toHaveLength(0);

    dto.property = "false";

    const errors2 = validateSync(dto)
    expect(errors2).toHaveLength(0);

    const errors3 = validateSync(dto)
    expect(errors3).toHaveLength(0);
  });

  it("should throw error if value is not valid 'true' or 'false'", () => {
    class MockInValidDTO {
      @IsTrueOrFalseString()
      property: any;
    }

    const dto = new MockInValidDTO();
    dto.property = "truee"

    const errors1 = validateSync(dto);
    expect(errors1.length).toBeGreaterThan(0);

    dto.property = undefined;
    const errors2 = validateSync(dto);
    expect(errors2.length).toBeGreaterThan(0);

    dto.property = null;
    const errors3 = validateSync(dto);
    expect(errors3.length).toBeGreaterThan(0);

    dto.property = 1;
    const errors4 = validateSync(dto);
    expect(errors4.length).toBeGreaterThan(0);
  })
});
