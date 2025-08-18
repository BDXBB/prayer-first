import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const db = new Database('muslim_db_v2.5.1.db');
const outDir = './iraq/';

const iraqCountryId = 107;

// iraq cities only
const cities = db.prepare(`
  SELECT has_fixed_prayer_time, prayer_dependent_id, 
  location._id AS location_id, location.name AS city_name
  FROM location
  WHERE country_id = ?
`).all(iraqCountryId);

const stmt = db.prepare(`
  SELECT location_id, month, day, date, fajr, sunrise, dhuhr, asr, maghrib, isha
  FROM prayer_time
  WHERE location_id = ?
`);

for (const city of cities) {
    // ignore non has_fixed_prayer_time and prayer_dependent_id
    if (city.has_fixed_prayer_time && city.has_fixed_prayer_time !== 0 && !city.prayer_dependent_id){

        const times = stmt.all(city.location_id);
        const filePath = path.join(outDir, `${city.location_id}.json`);

       // something like index location_id → location → month → day → data
        let structured = {
            [city.location_id]: {}
        };

        for (const entry of times) {
            const { month, day, date, fajr, sunrise, dhuhr, asr, maghrib, isha } = entry;

            if (!structured[city.location_id][month]) {
            structured[city.location_id][month] = {}
            structured[city.location_id].name = city.city_name
            }

            structured[city.location_id][month][day] = {
            date,
            fajr,
            sunrise,
            dhuhr,
            asr,
            maghrib,
            isha
            };
        }

        fs.writeFileSync(filePath, JSON.stringify(structured, null, 2));

    }

}

console.log("Done");
