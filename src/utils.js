



//              calculate distance                //

// degrees to radians by radians = degrees × (piay / 180)
function toradians(deg) {
  return deg * (Math.PI / 180);
}

// Haversine math to calculate distance between two location //
function getDistanceLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toradians(lat2 - lat1);
  const dLon = toradians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toradians(lat1)) * Math.cos(toradians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}
//              calculate distance                //

//              parsing date                //

function to12Hour(time24) {
  let [hour, minute] = time24.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12; // 0 تصبح 12 في نظام 12 ساعة
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

function parseDate(inputDate, dbFormat = "MM-DD") {
  // only "DD-MM" or "YYYY-MM-DD" or "DD-M-YYYY" date
  let dateObj;

  if (inputDate.includes('-')) {
    const parts = inputDate.split('-');
    if (parts[0].length === 4) {
      // "YYYY-MM-DD"
      dateObj = new Date(inputDate);
    } else {
      // "DD-M-YYYY"
      const [day, month, year] = parts.map(Number);
      dateObj = new Date(year, month - 1, day);
    }
  }

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');

  if (dbFormat === "MM-DD") {
    return `${month}-${day}`;
  } else {
    return `${day}-${month}`;
  }
}

//              parsing date                //

module.exports = { toradians,to12Hour, getDistanceLatLonInKm ,parseDate};