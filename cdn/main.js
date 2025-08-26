
window.PrayerUtils = (function () { 

  // I think it is clear;
  // Maybe NOT THE CODE But Understanding

  const LOCATIONS_URL = 'https://cdn.jsdelivr.net/gh/BDXBB/prayer-first@v1.0.2/cdn/data/locations.json';
  const PRAYER_DATA_URL_BASE = 'https://cdn.jsdelivr.net/gh/BDXBB/prayer-first@v1.0.2/cdn/data/iraq/';

  function toRadians(deg) {
    return deg * (Math.PI / 180);
  }

  function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async function loadLocations() {
    const response = await fetch(LOCATIONS_URL);
    return await response.json();
  }

  function findClosestCity(lat, lon, locations, maxDistance = 5) {
    const nearby = locations.filter(loc =>
      getDistanceKm(lat, lon, loc.latitude, loc.longitude) <= maxDistance
    );

    if (nearby.length === 0) return null;

    let closest = null;
    let minDistance = Infinity;

    for (const city of nearby) {
      const dist = getDistanceKm(lat, lon, city.latitude, city.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closest = city;
      }
    }

    return closest;
  }

  async function getPrayerData(locationId) {
    const url = `${PRAYER_DATA_URL_BASE}${locationId}.json`;
    const response = await fetch(url);
    return await response.json();
  }


// calculate midnight And lastThird based on maghribTime & fajrTime //
function midNightAndLastThird(maghribTime, fajrTime) {
  function toMinutes(t) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  function toTimeString(minutes) {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  let maghrib = toMinutes(maghribTime);
  let fajr = toMinutes(fajrTime);

  // crossing midnight
  if (fajr <= maghrib) {
    fajr += 24 * 60;
  }

  const nightDuration = fajr - maghrib;

  const midNight = maghrib + Math.floor(nightDuration / 2);
  const lastThird = maghrib + Math.floor(nightDuration * 2 / 3);

  return {
    midNight: toTimeString(midNight),
    lastThirdStart: toTimeString(lastThird)
  };
}



// findCity & get Prayer Time Based on json files fixed prayer times //
  async function getPrayerTime(latitude, longitude, day, month, year, GetmidNightAndLastThird = false) {
    const locations = await loadLocations();
    const city = findClosestCity(latitude, longitude, locations);

    if (!city) {
      throw new Error("No data found for this location");
    }

    const data = await getPrayerData(city.prayer_dependent_id || city.location_id);

    /// Well it is from Gpt ///
    const isValidNumber = (val) => !isNaN(Number(val)) && val !== null && val !== undefined && val !== "";

    const normalizedMonth = isValidNumber(month) ? String(Number(month)) : null;
    const normalizedDay = isValidNumber(day) ? String(Number(day)) : null;
    /// ///
    let dayData;

    if (normalizedDay && normalizedMonth) {
      dayData = data?.[normalizedMonth]?.[normalizedDay];
    } else if (!normalizedDay && normalizedMonth) {
      dayData = data?.[normalizedMonth];
    } else if (!normalizedDay && !normalizedMonth && year) {
      dayData = data;
    }
 ////    ///// 
    if (!dayData) {
      throw new Error("No data found for date");
    }

    if (GetmidNightAndLastThird && normalizedDay && normalizedMonth) {
      const extra = midNightAndLastThird(dayData.fajr, dayData.isha);
      console.log(extra)
      return {
        ...dayData,
        midnight: extra.midNight,
        lastThird: extra.lastThirdStart,
      };
    }

    return dayData;
  }

  // expose to use
  return {
    getPrayerTime,
  };
})();
