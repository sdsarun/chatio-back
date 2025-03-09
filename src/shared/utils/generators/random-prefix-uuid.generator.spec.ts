import { randomPrefixUUID } from './random-prefix-uuid.generator'; // Adjust the path as needed
import { randomUUID } from 'node:crypto';

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(),
}));

describe('randomPrefixUUID', () => {
  it('should concatenate prefix with a UUID without dashes', () => {
    const prefix = 'request-auto-gen';
    const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
    (randomUUID as jest.Mock).mockReturnValue(mockUUID);

    const result = randomPrefixUUID(prefix);

    expect(randomUUID).toHaveBeenCalled();
    expect(result).toEqual('request-auto-gen_123e4567e89b12d3a456426614174000');
  });

  it('should handle an empty prefix', () => {
    const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
    (randomUUID as jest.Mock).mockReturnValue(mockUUID);

    const result = randomPrefixUUID('');

    expect(randomUUID).toHaveBeenCalled();
    expect(result).toEqual('_123e4567e89b12d3a456426614174000');
  });
});
