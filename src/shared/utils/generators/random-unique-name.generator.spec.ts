import randomUniqueName from './random-unique-name.generator';
import { randomUUID } from 'node:crypto';

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(),
}));

describe('randomUniqueName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a valid unique guest username with the correct format', () => {
    (randomUUID as jest.Mock).mockReturnValue("12345678");

    const result = randomUniqueName();

    const resultParts = result.split('-');
    expect(resultParts.length).toBe(3);
    expect(resultParts[0]).toMatch(/^[a-z]+$/);
    expect(resultParts[1]).toMatch(/^[a-z]+$/);
    expect(resultParts[2]).toMatch(/^[A-Z0-9]{4}$/);
  });

  it('should generate unique usernames even if randomUUID is mocked', () => {
    (randomUUID as jest.Mock).mockReturnValue("12345678");

    const result1 = randomUniqueName();
    const result2 = randomUniqueName();

    expect(result1).not.toEqual(result2);
  });

  it('should ensure randomUUID is used to generate the UUID part of the username', () => {
    const uuid = "abcd1234";
    (randomUUID as jest.Mock).mockReturnValue(uuid);

    const result = randomUniqueName();

    const resultParts = result.split('-');
    expect(resultParts[2]).toBe(uuid.slice(0, 4).toUpperCase());
  });

  it('should return a different name when randomUUID generates different values', () => {
    (randomUUID as jest.Mock)
      .mockReturnValueOnce("abcd1234")
      .mockReturnValueOnce("efgh5678");

    const result1 = randomUniqueName();
    const result2 = randomUniqueName();

    expect(result1).not.toEqual(result2);
  });
});
