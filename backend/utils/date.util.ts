
const VALID_TIME_STRING_UNITS = ["s", "m", "h", "d", "w"];

export const parseTimeString = (timeString: string): number => {
  const match = timeString.match(/^(\d+)([smhdw])$/);
  if (!match) {
    throw new Error(`Invalid time string format: ${timeString}`);
  }

  const [, valueStr, unit] = match;
  if(!valueStr) {
    throw new Error(`Invalid time string format: ${timeString}`);
  }

  if(!unit){
    throw new Error(`Invalid time string format: ${timeString}`);
  }
  
  if(!VALID_TIME_STRING_UNITS.includes(unit)) {
    throw new Error(`Invalid time string format: ${timeString}`);
  }

  const value = parseInt(valueStr, 10);

  const multipliers = {
    s: 1000,                    // 초
    m: 1000 * 60,               // 분
    h: 1000 * 60 * 60,          // 시간
    d: 1000 * 60 * 60 * 24,     // 일
    w: 1000 * 60 * 60 * 24 * 7  // 주
  };

  return value * multipliers[unit as keyof typeof multipliers];
};

export const addTimeToDate = (date: Date, timeString: string): Date => {
  const timeInMs = parseTimeString(timeString);
  return new Date(date.getTime() + timeInMs);
}; 