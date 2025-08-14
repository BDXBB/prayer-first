import { getPrayerTimeByCity } from 'prayer-first';

const country = 'IQ';
const city = 'Erbil';
const month = 8; // August

const result = getPrayerTimeByCity(country, city, month);

console.log(`Prayer times for ${city} (${country}) - Month ${month}:`);
console.log(result);
