import { findClosestCity, findCity, getDbPrayerTime } from './db.js';

// findClosestCity & get Prayer Time Based on database fixed prayer times //
function getPrayerTime(latitude, longitude, day, month, year, GetmidNightAndLastThird) {
  let city = findClosestCity(latitude, longitude);
  if (!city.status) {
    return city;
  }
  const isFixed = city.data.has_fixed_prayer_time && city.data.has_fixed_prayer_time !== 0;
  let times;
  if (isFixed) {
    times = getDbPrayerTime(city.data.prayer_dependent_id || city.data._id, day, month, year);
    if (times.status) {
      times.city = city.data.city_name;
      times.country = city.data.country_name;
      if (GetmidNightAndLastThird && times.times.maghrib) {
        let {
          midNight,
          lastThirdStart
        } = midNightAndLastThird(times.times.maghrib, times.times.fajr);
        times.times.midNight = midNight;
        times.times.lastThirdStart = lastThirdStart;
      }
    }
    return times;
  } else {
    return {
      status: false,
      error: "There are no fixed prayer times for this location"
    };
  }
}

// findCity & get Prayer Time Based on database fixed prayer times //
function getPrayerTimeByCity(countryName, countryCity, day, month, year, GetmidNightAndLastThird) {
  let city = findCity(countryName, countryCity);
  if (!city.status) {
    return city;
  }
  const isFixed = city.data.has_fixed_prayer_time && city.data.has_fixed_prayer_time !== 0;
  let times;
  if (isFixed) {
    times = getDbPrayerTime(city.data.prayer_dependent_id || city.data._id, day, month, year);
    if (times.status) {
      times.city = city.data.city_name;
      times.country = city.data.country_name;
      times.code = city.data.code;
      if (GetmidNightAndLastThird) {
        let {
          midNight,
          lastThirdStart
        } = midNightAndLastThird(times.times.maghrib, times.times.fajr);
        times.times.midNight = midNight;
        times.times.lastThirdStart = lastThirdStart;
      }
    }
    return times;
  } else {
    return {
      status: false,
      error: "There are no fixed prayer times for this location"
    };
  }
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
export { getPrayerTime, getPrayerTimeByCity, midNightAndLastThird };