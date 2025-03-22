import { isDeepEmpty } from "./common.validation";

describe('isDeepEmpty', () => {
  describe('Basic Tests', () => {
    it.each([
      [{}, true, 'empty object'],
      [{ a: undefined }, true, 'object with undefined value'],
      [{ a: null }, true, 'object with null value'],
      [{ a: false }, true, 'object with false value'],
      [{ a: 0 }, true, 'object with zero value'],
      [{ a: '' }, true, 'object with empty string'],
      [{ a: NaN }, true, 'object with NaN value'],
      [{ a: 1 }, false, 'object with number value'],
      [{ a: 'text' }, false, 'object with string value'],
      [{ a: true }, false, 'object with true value'],
      [{ a: {} }, true, 'object with empty object'],
      [{ a: [] }, true, 'object with empty array']
    ])('should return %p for %s', (testValue, expected, description) => {
      expect(isDeepEmpty(testValue)).toBe(expected);
    });
  });

  describe('Nested Object Tests', () => {
    it.each([
      [{ a: { b: {} } }, true, 'nested empty objects'],
      [{ a: { b: undefined } }, true, 'nested object with undefined value'],
      [{ a: { b: null } }, true, 'nested object with null value'],
      [{ a: { b: false } }, true, 'nested object with false value'],
      [{ a: { b: 0 } }, true, 'nested object with zero value'],
      [{ a: { b: '' } }, true, 'nested object with empty string'],
      [{ a: { b: 1 } }, false, 'nested object with number value'],
      [{ a: { b: 'text' } }, false, 'nested object with string value'],
      [{ a: { b: true } }, false, 'nested object with true value']
    ])('should return %p for %s', (testValue, expected, description) => {
      expect(isDeepEmpty(testValue)).toBe(expected);
    });
  });

  describe('Multiple Properties Tests', () => {
    it.each([
      [{ a: undefined, b: undefined }, true, 'multiple undefined values'],
      [{ a: null, b: null }, true, 'multiple null values'],
      [{ a: false, b: 0 }, true, 'multiple falsy values'],
      [{ a: '', b: {} }, true, 'mixed falsy and empty values'],
      [{ a: undefined, b: 1 }, false, 'undefined and truthy value'],
      [{ a: null, b: 'text' }, false, 'null and truthy value'],
      [{ a: {}, b: true }, false, 'empty object and truthy value'],
      [{ a: {}, b: 1 }, false, 'empty object and number value']
    ])('should return %p for %s', (testValue, expected, description) => {
      expect(isDeepEmpty(testValue)).toBe(expected);
    });
  });

  describe('Array Tests', () => {
    it.each([
      [{ a: [] }, true, 'empty array'],
      [{ a: [undefined] }, true, 'array with undefined'],
      [{ a: [null] }, true, 'array with null'],
      [{ a: [false] }, true, 'array with false'],
      [{ a: [0] }, true, 'array with zero'],
      [{ a: [''] }, true, 'array with empty string'],
      [{ a: [{}] }, true, 'array with empty object'],
      [{ a: [[]] }, true, 'array with empty array'],
      [{ a: [1] }, false, 'array with number'],
      [{ a: ['text'] }, false, 'array with string'],
      [{ a: [true] }, false, 'array with true'],
      [{ a: [{ b: 1 }] }, false, 'array with object containing truthy value'],
      [{ a: [{ b: undefined }] }, true, 'array with object containing undefined'],
      [{ a: [undefined, null, 0, ''] }, true, 'array with multiple falsy values'],
      [{ a: [undefined, null, 0, '', 1] }, false, 'array with falsy and one truthy value'] // failed
    ])('should return %p for %s', (testValue, expected, description) => {
      expect(isDeepEmpty(testValue)).toBe(expected);
    });
  });

  describe('Complex Nested Tests', () => {
    it.each([
      [{ a: { b: { c: {} } } }, true, 'deeply nested empty objects'],
      [{ a: { b: { c: undefined } } }, true, 'deeply nested object with undefined'],
      [{ a: { b: { c: null } } }, true, 'deeply nested object with null'],
      [{ a: { b: { c: false } } }, true, 'deeply nested object with false'],
      [{ a: { b: { c: 0 } } }, true, 'deeply nested object with zero'],
      [{ a: { b: { c: '' } } }, true, 'deeply nested object with empty string'],
      [{ a: { b: { c: 1 } } }, false, 'deeply nested object with number'],
      [{ a: { b: { c: 'text' } } }, false, 'deeply nested object with string'],
      [{ a: { b: { c: true } } }, false, 'deeply nested object with true'],
      [{ a: { b: { c: {} } }, d: undefined }, true, 'multiple branches with empty values'],
      [{ a: { b: { c: {} } }, d: 1 }, false, 'one branch empty, one with truthy value']
    ])('should return %p for %s', (testValue, expected, description) => {
      expect(isDeepEmpty(testValue)).toBe(expected);
    });
  });

  describe('Mixed Complex Tests', () => {
    it.each([
      [{ a: { b: [] }, c: undefined }, true, 'mixed nested empty structures'],
      [{ a: { b: [{}] }, c: null }, true, 'mixed nested empty complex structures'],
      [{ a: { b: {} }, c: { d: false } }, true, 'multiple nested objects with falsy values'],
      [{ a: { b: 0 }, c: { d: '' } }, true, 'multiple nested objects with different falsy values'],
      [{ a: { b: undefined }, c: { d: 1 } }, false, 'mixed nested objects with one truthy value'],
      [{ a: { b: {} }, c: { d: [] }, e: 'text' }, false, 'complex structure with one truthy value'],
      [{ a: { b: { c: {} } }, d: [0, false, ''] }, true, 'deeply nested empty with array of falsy values'],
      [{ a: { b: { c: {} } }, d: [0, false, '', 1] }, false, 'deeply nested empty with array containing truthy value']
    ])('should return %p for %s', (testValue, expected, description) => {
      expect(isDeepEmpty(testValue)).toBe(expected);
    });
  });

  describe('Edge Cases', () => {
    it.each([
      [null, true, 'null input'],
      [undefined, true, 'undefined input'],
      [{}, true, 'empty object'],
      [{ a: {} }, true, 'object with empty object'],
      [{ a: { b: { c: { d: { e: {} } } } } }, true, 'deeply nested empty objects (5 levels)'],
      [{ a: { b: { c: { d: { e: 1 } } } } }, false, 'deeply nested objects with truthy at bottom'],
      [{ a: [], b: {}, c: undefined, d: null, e: 0, f: '', g: false }, true, 'object with all types of empty values'],
      [{ a: [[[{}]]] }, true, 'deeply nested empty arrays and objects'],
      [{ a: [[[{b: 1}]]] }, false, 'deeply nested arrays with one truthy value'],
      [{ a: Array(10).fill(undefined) }, true, 'large array of undefined values'],
      [{ a: Array(10).fill(null) }, true, 'large array of null values'],
      [{ a: Array(10).fill({}) }, true, 'large array of empty objects'],
      [{ a: Array(9).fill(0).concat([1]) }, false, 'large array with one truthy value at the end']
    ])('should return %p for %s', (testValue: any, expected, description) => {
      expect(isDeepEmpty(testValue)).toBe(expected);
    });
  });

  describe('Non-object Inputs', () => {
    it('should handle non-object inputs correctly', () => {
      expect(isDeepEmpty(null as any)).toBe(true);
      expect(isDeepEmpty(undefined as any)).toBe(true);
      expect(isDeepEmpty('string' as any)).toBe(true);
      expect(isDeepEmpty(123 as any)).toBe(true);
      expect(isDeepEmpty(true as any)).toBe(true);
      expect(isDeepEmpty(Symbol() as any)).toBe(true);
      expect(isDeepEmpty(function() {} as any)).toBe(true);
    });
  });

  describe('Specific Problem Cases', () => {
    it('should handle objects with first property empty but second not empty', () => {
      expect(isDeepEmpty({ a: {}, b: 1 })).toBe(false);
    });

    it('should handle objects with first property deeply empty but second not empty', () => {
      expect(isDeepEmpty({ a: { b: { c: {} } }, d: 'value' })).toBe(false);
    });

    it('should handle empty arrays vs arrays with empty objects', () => {
      expect(isDeepEmpty({ a: [] })).toBe(true);
      expect(isDeepEmpty({ a: [{}] })).toBe(true);
      expect(isDeepEmpty({ a: [{}, {}] })).toBe(true);
    });

    it('should distinguish between arrays with empty vs non-empty objects', () => {
      expect(isDeepEmpty({ a: [{ b: 1 }] })).toBe(false);
      expect(isDeepEmpty({ a: [{}, { b: 1 }] })).toBe(false);
    });
  });
});