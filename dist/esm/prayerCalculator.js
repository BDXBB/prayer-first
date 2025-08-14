/**
 * PrayerTimes Class
 * ----------------
 * This class calculates Islamic prayer times given geographical location (latitude, longitude)
 * and timezone.
 * It calculates prayer times such as Fajr, Sunrise,
 * Dhuhr, Asr, Maghrib, and Isha
 *
 * Parameters:
 * - latitude, longitude: the location's geographic coordinates
 * - timeZone: local timezone offset from UTC
* - methodParams: Parameters for default Calculation Method are [18, 1, 0, 0, 17] which is MWL - Muslim World League method that dictates angles
 * you can use

MWL - Muslim World League        [18, 1, 0, 0, 17]
ISNA - North America             [15, 1, 0, 0, 15]
Egyptian General Authority      [19.5, 1, 0, 0, 17.5]
 Umm al-Qura University (مكة)     [18.5, 1, 0, 90, 0] 
 Dubai (UAE)                       [18.2, 1, 0, 0, 18.2]
Qatar                            [18, 1, 0, 90, 0]
 Kuwait                           [18, 1, 0, 0, 17.5]
Karachi (Pakistan)               [18, 1, 0, 0, 18]   
 Tehran (Iran)                    [17.7, 1, 0, 0, 14]
 Moonsighting Committee           [18, 1, 0, 0, 18]
Custom / Manual              [0, 0, 0, 0, 0] by region and sect

 * - asrMethod: how to compute azimuth of Asr prayer (1 for Shafii, 2 for Hanafi)
 * - higherLatitudeMethod: how to make time adjustments at high latitude ('NONE', 'ANGLE_BASED', 'MID_NIGHT', 'ONE_SEVEN')
 
 * Principal Methods:
* - getPrayerTimes(date): returns prayer times for the given date in 24-hour format.
 *
 *
 * Usage example:
 *
 * const { PrayerTimes } = require('prayer-first');
 * const pt = new PrayerTimes(40.7128, -74.0060, -4); // e.g New York coordinates and timezone
 * const times = pt.getPrayerTimes(new Date());
 * console.log(times);
 *
 * Output:
 * {
 *   status: true
*   city: "Based on latitude and longitude",
 *   times: {
 *     fajr: "05:12",
 *     sunrise: "06:30",
 *     dhuhr: "12:45",
 *     asr: "15:30",
 *     maghrib: "18:00",
 *     isha: "19:15"
 *   }
 * }
 **/

class PrayerTimes {
  constructor(latitude, longitude, timeZone, methodParams = [18, 1, 0, 0, 17], asrMethod = 1, higherLatitudeMethod = 'NONE') {
    this.lat = latitude;
    this.lng = longitude;
    this.timeZone = timeZone;
    this.methodParams = methodParams;
    this.asrMethod = asrMethod; // 1 for Shafii, 2 for Hanafi
    this.higherLatitudeMethod = higherLatitudeMethod; // 'NONE', 'ANGLE_BASED', 'MID_NIGHT', 'ONE_SEVEN'

    this.invalidTime = "-----";
  }
  fixAngle(a) {
    a = a - 360 * Math.floor(a / 360);
    return a < 0 ? a + 360 : a;
  }
  fixHour(a) {
    a = a - 24 * Math.floor(a / 24);
    return a < 0 ? a + 24 : a;
  }
  radiansToDegrees(rad) {
    return rad * 180 / Math.PI;
  }
  degreesToRadians(deg) {
    return deg * Math.PI / 180;
  }
  dSin(d) {
    return Math.sin(this.degreesToRadians(d));
  }
  dCos(d) {
    return Math.cos(this.degreesToRadians(d));
  }
  dTan(d) {
    return Math.tan(this.degreesToRadians(d));
  }
  dArcSin(x) {
    return this.radiansToDegrees(Math.asin(x));
  }
  dArcCos(x) {
    return this.radiansToDegrees(Math.acos(x));
  }
  dArcTan2(y, x) {
    return this.radiansToDegrees(Math.atan2(y, x));
  }
  dArcCot(x) {
    return this.radiansToDegrees(Math.atan2(1, x));
  }
  julianDate(year, month, day) {
    if (month <= 2) {
      year -= 1;
      month += 12;
    }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
  }
  sunPosition(jd) {
    const D = jd - 2451545.0;
    const g = this.fixAngle(357.529 + 0.98560028 * D);
    const q = this.fixAngle(280.459 + 0.98564736 * D);
    const L = this.fixAngle(q + 1.915 * this.dSin(g) + 0.020 * this.dSin(2 * g));
    const e = 23.439 - 0.00000036 * D;
    const d = this.dArcSin(this.dSin(e) * this.dSin(L));
    let ra = this.dArcTan2(this.dCos(e) * this.dSin(L), this.dCos(L)) / 15;
    ra = this.fixHour(ra);
    const eqt = q / 15 - ra;
    return [d, eqt];
  }
  equationOfTime(jd) {
    return this.sunPosition(jd)[1];
  }
  sunDeclination(jd) {
    return this.sunPosition(jd)[0];
  }
  computeMidDay(t, jd) {
    const eqt = this.equationOfTime(jd + t);
    return this.fixHour(12 - eqt);
  }
  computeTime(angle, t, jd) {
    const d = this.sunDeclination(jd + t);
    const z = this.computeMidDay(t, jd);
    const beg = -this.dSin(angle) - this.dSin(d) * this.dSin(this.lat);
    const mid = this.dCos(d) * this.dCos(this.lat);
    const v = this.dArcCos(beg / mid) / 15;
    return z + (angle > 90 ? -v : v);
  }
  computeAsr(step, t, jd) {
    const d = this.sunDeclination(jd + t);
    const angle = -this.dArcCot(step + Math.tan(Math.abs(this.lat - d) * Math.PI / 180));
    return this.computeTime(angle, t, jd);
  }
  fixTimes(times) {
    // Convert times to fraction of day
    for (let i = 0; i < times.length; i++) {
      times[i] /= 24;
    }
    return times;
  }
  nightPortion(angle) {
    switch (this.higherLatitudeMethod) {
      case 'ANGLE_BASED':
        return angle / 60.0;
      case 'MID_NIGHT':
        return 0.5;
      case 'ONE_SEVEN':
        return 1.0 / 7.0;
      case 'NONE':
      default:
        return 0.0;
    }
  }
  timeDiff(time1, time2) {
    return this.fixHour(time2 - time1);
  }
  adjustHighLatTimes(times) {
    const nightTime = this.timeDiff(times[4], times[1]);
    const fajrDiff = this.nightPortion(this.methodParams[0]) * nightTime;
    if (isNaN(times[0]) || this.timeDiff(times[0], times[1]) > fajrDiff) {
      times[0] = times[1] - fajrDiff;
    }
    const ishaAngle = this.methodParams[4];
    const ishaDiff = this.nightPortion(ishaAngle) * nightTime;
    if (isNaN(times[6]) || this.timeDiff(times[4], times[6]) > ishaDiff) {
      times[6] = times[4] + ishaDiff;
    }
    if (this.methodParams[1] === 0) {
      const maghribAngle = this.methodParams[2];
      const maghribDiff = this.nightPortion(maghribAngle) * nightTime;
      if (isNaN(times[5]) || this.timeDiff(times[4], times[5]) > maghribDiff) {
        times[5] = times[4] + maghribDiff;
      }
    }
  }
  adjustTimes(times) {
    for (let i = 0; i < times.length; i++) {
      times[i] += this.timeZone - this.lng / 15;
    }
    if (this.methodParams[1] === 1) {
      times[5] = times[4] + this.methodParams[2] / 60;
    }
    if (this.methodParams[3] === 1) {
      times[6] = times[5] + this.methodParams[4] / 60;
    }
    if (this.higherLatitudeMethod !== 'NONE') {
      this.adjustHighLatTimes(times);
    }
    return times;
  }
  floatToTime24(time) {
    if (isNaN(time)) return this.invalidTime;
    time = this.fixHour(time + 0.5 / 60); // round
    const hours = Math.floor(time);
    const minutes = Math.floor((time - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  floatToTime12(time) {
    if (isNaN(time)) return this.invalidTime;
    time = this.fixHour(time + 0.5 / 60); // round
    let hours = Math.floor(time);
    const minutes = Math.floor((time - hours) * 60);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12; // 12 AM or 12 PM
    return `${hours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
  }
  computeTimes(jd) {
    let times = [5, 6, 12, 13, 18, 18, 18]; // guess times (Fajr, Sunrise, Dhuhr, Asr, Sunset, Maghrib, Isha)
    times = this.fixTimes(times);
    for (let i = 0; i < 1; i++) {
      // iterations
      times[0] = this.computeTime(180 - this.methodParams[0], times[0], jd); // Fajr
      times[1] = this.computeTime(180 - 0.833, times[1], jd); // Sunrise
      times[2] = this.computeMidDay(times[2], jd); // Dhuhr
      times[3] = this.computeAsr(this.asrMethod, times[3], jd); // Asr
      times[4] = this.computeTime(0.833, times[4], jd); // Sunset
      times[5] = this.computeTime(this.methodParams[2], times[5], jd); // Maghrib
      times[6] = this.computeTime(this.methodParams[4], times[6], jd); // Isha
    }
    times = this.adjustTimes(times);
    return times;
  }
  getPrayerTimes(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let jd = this.julianDate(year, month, day);

    // Correct Julian Date for longitude
    jd -= this.lng / (15 * 24);
    const times = this.computeTimes(jd);
    return {
      status: true,
      city: "Based on Astronomical Calculation",
      day: day,
      month: month,
      times: {
        fajr: this.floatToTime24(times[0]),
        sunrise: this.floatToTime24(times[1]),
        dhuhr: this.floatToTime24(times[2]),
        asr: this.floatToTime24(times[3]),
        maghrib: this.floatToTime24(times[5]),
        isha: this.floatToTime24(times[6])
      }
    };
  }
}
export { PrayerTimes };