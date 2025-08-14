import { getPrayerTimeByCity } from 'prayer-first';

const country = 'IQ';
const city = 'Erbil';
const day = 15;
const month = 8;
const year = 2025;
const midnight = true;

const result = getPrayerTimeByCity(country, city, day, month, year, midnight);

if (result.status) {
  console.log('Prayer times for:', result.city, result.country);
  console.log(result.times);
} else {
  console.error('Error:', result.error);
}
