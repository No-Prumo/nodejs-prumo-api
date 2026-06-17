import { millisecondsPerSecond, secondsPerMinute } from './time.constants';

function secondsToMilliseconds(seconds: number): number {
  return seconds * millisecondsPerSecond;
}

function minutesToMilliseconds(minutes: number): number {
  return secondsToMilliseconds(minutes * secondsPerMinute);
}

function addSeconds(date: Date, seconds: number): Date {
  const millisecondsToAdd = secondsToMilliseconds(seconds);

  return new Date(date.getTime() + millisecondsToAdd);
}

function nowAsUnixSeconds(): number {
  return Math.floor(Date.now() / millisecondsPerSecond);
}

function unixSecondsToDate(unixSeconds: number): Date {
  return new Date(secondsToMilliseconds(unixSeconds));
}

function unixSecondsToMilliseconds(unixSeconds: number): number {
  return secondsToMilliseconds(unixSeconds);
}

export {
  addSeconds,
  minutesToMilliseconds,
  nowAsUnixSeconds,
  secondsToMilliseconds,
  unixSecondsToDate,
  unixSecondsToMilliseconds,
};
