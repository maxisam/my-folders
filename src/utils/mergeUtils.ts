import { IConfiguration } from '../types/Configuration';

// mutates the original config and returns it
export function mergeConfig(origConfig: any, newConfig: any): IConfiguration {
    for (const key in newConfig) {
        if (newConfig[key] instanceof Object && !Array.isArray(newConfig[key])) {
            origConfig[key] = mergeConfig(origConfig[key], newConfig[key]);
        } else if (Array.isArray(newConfig[key])) {
            origConfig[key] = uniqueArrayMerge(origConfig[key], newConfig[key]);
        } else {
            origConfig[key] = newConfig[key];
        }
    }
    return origConfig;
}

// immutable array merge
export function uniqueArrayMerge(target: any[], source: any[]): any[] {
    const arr = target.concat(source);
    return arr.filter((item, index) => arr.indexOf(item) === index);
}
