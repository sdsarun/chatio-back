export function isDeepEmpty(obj: Record<string, any>): boolean {
  if (!obj || typeof obj !== 'object') return true;
  
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        if (value.some(item => {
          if (typeof item !== 'object' || item === null) {
            return !!item;
          }
          return !isDeepEmpty(item);
        })) {
          return false;
        }
      }
      else if (!isDeepEmpty(value)) {
        return false;
      }
    }
    else if (value) {
      return false;
    }
  }
  return true;
}
