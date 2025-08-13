import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { getDistanceLatLonInKm, parseDate } from './utils.js';

// db path

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'muslim_db_v2.5.1.db');
const Db = new Database(dbPath);



function findClosestCity(latitude,longitude) {
// const rows = Db.prepare('SELECT latitude, longitude , name,_id From location').all()

const delta = 0.1;

const rows = Db.prepare(`
  SELECT latitude, location.name AS city_name,
  longitude,prayer_dependent_id,has_fixed_prayer_time, 
  location._id,
  country.name AS country_name
  FROM location
  LEFT JOIN country ON country._id = location.country_id
  WHERE latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?
`).all(latitude - delta, latitude + delta, longitude - delta, longitude + delta);


let closestCity = null;
let minDistance = Infinity;

for (const city of rows) {
  const dist = getDistanceLatLonInKm(latitude, longitude, city.latitude, city.longitude);
  if (dist < minDistance) {
    minDistance = dist;
    closestCity = city;
  }
}
    if (!closestCity) {
      return {status :false, error:"No data found for this location"};
    }
return {status :true, data:closestCity};
}

function findCity(countryName,countryCity){

    //   const country = Db.prepare(`
    //   SELECT name, code, _id FROM country
    //   WHERE name = ? OR code = ?
    // `).get(countryName,countryName);

    //  if (!country){
    //   return {status :false, error:"Country not found Enter a country name or country code"}
    //  }
    //   const city = Db.prepare(`
    //   SELECT latitude, name, longitude,prayer_dependent_id,has_fixed_prayer_time, _id FROM location
    //   WHERE country_id = ? AND name = ?
    // `).get(country._id,countryCity);
      
    const city = Db.prepare(`
      SELECT country.name AS country_name,
      country.code, location._id,
      latitude, 
      location.name AS city_name, 
      longitude,prayer_dependent_id,has_fixed_prayer_time
      FROM location
      LEFT JOIN country ON country._id = location.country_id
      WHERE (country.name = ? OR country.code = ?) AND location.name = ?
      `).get(countryName, countryName ,countryCity)
    
    if (!city){
      return {status :false, error:"city not found Enter a city name"};
     }
    //  city.country = country.name;

    return {status :true, data:city};

}

// here date parameter can be a day or date to deal with difrent date format
function getDbPrayerTime(location_id, date, month, year) {
  let rows;

  if (date && month) {
      const dayNum = Number(date);
      const monthNum  = Number(month);
    if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31){
      const row = Db.prepare(`
        SELECT month, day, fajr, sunrise, dhuhr, asr, maghrib, isha FROM prayer_time
        WHERE location_id = ? AND month = ? AND day = ?
      `).get(location_id, monthNum, dayNum);

      if (!row) {
        return {status :false, error:"No data found for this date"};
      }
      return {status :true, day:dayNum, month:monthNum, date:`${month}-${date}` , times:row};
    } else {
       return {status :false, error:"month must be number btween 1-12 And day must be btween 1-31"}
    }
  }
  // return month
  else if (/^\d{1,2}$/.test(date) && !month && !year) {
    const monthNum = Number(date);
    if (monthNum >= 1 && monthNum <= 12){

    rows = Db.prepare(`
      SELECT month, day, fajr, sunrise, dhuhr, asr, maghrib, isha FROM prayer_time
      WHERE location_id = ? AND month = ?
    `).all(location_id, monthNum);
    
    return {status: true, month: monthNum, times: rows};
    
    } else {
      return {status :false, error:"for geting all month times enter number btween 1-12 with out month and year parameter"}
    }
  // return year
  } else if (/^\d{4}$/.test(date) || (year && !date && !month)) {
    rows = Db.prepare(`
      SELECT month, day, fajr, sunrise, dhuhr, asr, maghrib, isha FROM prayer_time
      WHERE location_id = ?
    `).all(location_id);

    return {status: true, times: rows};
  // spefic day
  } else {
    const formattedDate = parseDate(date, "MM-DD");

    const row = Db.prepare(`
      SELECT fajr, sunrise, dhuhr, asr, maghrib, isha FROM prayer_time
      WHERE location_id = ? AND date = ?
    `).get(location_id, formattedDate);

    if (!row) {
      return {status :false, error:"No data found for date"}
    }

    return {status :true, date:formattedDate, data:row};
  }

}




export { findClosestCity, findCity, getDbPrayerTime };