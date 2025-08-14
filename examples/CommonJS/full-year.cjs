const { getPrayerTimeByCity } = require('prayer-first');

const country = 'IQ';
const city = 'Erbil';
const year = 2025;

const result = getPrayerTimeByCity(country, city, year);

console.log(`Prayer times for ${city} (${country}) - Year ${year}:`);
console.log(result);
