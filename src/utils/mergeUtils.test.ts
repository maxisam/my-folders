import { mergeConfig, uniqueArrayMerge } from './mergeUtils'; // Adjust the path as needed

describe('uniqueArrayMerge', () => {
    test('should return an empty array when both arrays are empty', () => {
        expect(uniqueArrayMerge([], [])).toEqual([]);
    });

    test('should return the target array when the source array is empty', () => {
        expect(uniqueArrayMerge([1, 2, 3], [])).toEqual([1, 2, 3]);
    });

    test('should return the source array when the target array is empty', () => {
        expect(uniqueArrayMerge([], [4, 5, 6])).toEqual([4, 5, 6]);
    });

    test('should merge two arrays without duplicates', () => {
        expect(uniqueArrayMerge([1, 2, 3], [3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });

    test('should handle arrays with identical elements', () => {
        expect(uniqueArrayMerge([1, 1, 1], [1, 1, 1])).toEqual([1]);
    });

    test('should handle arrays with different data types', () => {
        expect(uniqueArrayMerge([1, 'a', true], [1, 'b', false])).toEqual([
            1,
            'a',
            true,
            'b',
            false,
        ]);
    });

    test('should maintain the order of elements from target and source', () => {
        expect(uniqueArrayMerge([1, 2], [2, 3])).toEqual([1, 2, 3]);
    });
});

describe('mergeConfig', () => {
    test('should return the original config when newConfig is empty', () => {
        const origConfig = { key1: 'value1' };
        const newConfig = {};
        const result = mergeConfig(origConfig, newConfig);
        expect(result).toEqual({ key1: 'value1' });
        expect(origConfig).toBe(result);
    });

    test('should overwrite primitive values in origConfig with values from newConfig', () => {
        const origConfig = { key1: 'value1', key2: 'value2' };
        const newConfig = { key2: 'newValue2' };
        const result = mergeConfig(origConfig, newConfig);
        expect(result).toEqual({ key1: 'value1', key2: 'newValue2' });
        expect(origConfig).toBe(result);
    });

    test('should merge nested objects in origConfig and newConfig', () => {
        const origConfig = { key1: { nestedKey1: 'nestedValue1' } };
        const newConfig = { key1: { nestedKey2: 'nestedValue2' } };
        const result = mergeConfig(origConfig, newConfig);
        expect(result).toEqual({
            key1: {
                nestedKey1: 'nestedValue1',
                nestedKey2: 'nestedValue2',
            },
        });
        expect(origConfig).toBe(result);
    });

    test('should replace arrays with unique merged values using uniqueArrayMerge', () => {
        const origConfig = { key1: [1, 2, 3] };
        const newConfig = { key1: [3, 4, 5] };
        const expectedMergedArray = [1, 2, 3, 4, 5]; // Expected result from uniqueArrayMerge

        const result = mergeConfig(origConfig, newConfig);
        expect(result).toEqual({ key1: expectedMergedArray });
        expect(origConfig).toBe(result);
    });

    test('should add new keys from newConfig to origConfig', () => {
        const origConfig = { key1: 'value1' };
        const newConfig = { key2: 'value2' };
        const result = mergeConfig(origConfig, newConfig);
        expect(result).toEqual({ key1: 'value1', key2: 'value2' });
        expect(origConfig).toBe(result);
    });

    test('should handle complex nested structures', () => {
        const origConfig = {
            key1: { nestedKey1: 'nestedValue1', nestedKey2: [1, 2] },
            key2: 'value2',
        };
        const newConfig = {
            key1: { nestedKey1: 'newNestedValue1', nestedKey2: [2, 3] },
            key3: 'value3',
        };
        const result = mergeConfig(origConfig, newConfig);

        expect(result).toEqual({
            key1: {
                nestedKey1: 'newNestedValue1',
                nestedKey2: [1, 2, 3],
            },
            key2: 'value2',
            key3: 'value3',
        });
        expect(origConfig).toBe(result);
    });
});
