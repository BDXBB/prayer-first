import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'src', 'muslim_db_v2.5.1.db');
const db = new Database(dbPath);
const outDir = path.join(__dirname, '..', 'data', 'iraq');
const outDirL = path.join(__dirname, '..', 'data','locations.json');

const iraqCountryId = 107;

// iraq cities only
const cities = db.prepare(`
  SELECT has_fixed_prayer_time, prayer_dependent_id,
  latitude, longitude,
  location._id AS location_id, location.name AS city_name
  FROM location
  WHERE country_id = ?
`).all(iraqCountryId);

const stmt = db.prepare(`
  SELECT location_id, month, day, date, fajr, sunrise, dhuhr, asr, maghrib, isha
  FROM prayer_time
  WHERE location_id = ?
`);

let locations = []; // location var

for (const cityl of cities) {
    
    const {has_fixed_prayer_time , ...CLcities} = cityl

    CLcities.country_name = "Iraq";
    CLcities.country_code = "IQ";

    locations.push(CLcities)
}

    // locations
    fs.writeFileSync(outDirL, JSON.stringify(locations, null, 2));

for (const city of cities) {
    // ignore non has_fixed_prayer_time and prayer_dependent_id
    if (city.has_fixed_prayer_time && city.has_fixed_prayer_time !== 0 && !city.prayer_dependent_id){

        const times = stmt.all(city.location_id);
        const filePath = path.join(outDir, `${city.location_id}.json`);

       // something like index location_id → month → day → data
        let structured = {
            name : city.city_name
        };

        for (const entry of times) {
            const { month, day, date, fajr, sunrise, dhuhr, asr, maghrib, isha } = entry;

            if (!structured[month]) {
            structured[month] = {}
            }

            structured[month][day] = {
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
