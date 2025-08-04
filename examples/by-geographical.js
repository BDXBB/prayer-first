const { getPrayerTime } = require('prayer-first');

const latitude = 36.191196;
const longitude = 44.009962;
const day = 15;
const month = 8;
const year = 2025;
const midnight = true;

const result = getPrayerTime(latitude, longitude, day, month, year, midnight);

if (result.status) {
  console.log('Prayer times for:', result.city, result.country);
  console.log(result.times);
} else {
  console.error('Error:', result.error);
}
