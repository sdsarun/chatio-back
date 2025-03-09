import { randomUUID } from 'node:crypto';

export function randomPrefixUUID(prefix: string = '') {
  return prefix.concat('_', randomUUID().replaceAll('-', ''));
}
