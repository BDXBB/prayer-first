const { PrayerTimes } = require('prayer-first');

const latitude = 24.7136;
const longitude = 46.6753;
const timeZone = 3;

const methodParams = [18, 1, 0, 0, 17]; // MWL
const asrMethod = 1; // 1 = Shafi'i
const highLatitudeRule = 'NONE';

const today = new Date();

const calculator = new PrayerTimes(latitude, longitude, timeZone, methodParams, asrMethod, highLatitudeRule);
const result = calculator.getPrayerTimes(today);

console.log("Astronomical Prayer Times:");
console.log(result.times);
