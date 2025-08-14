"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PrayerTimes = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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
var PrayerTimes = exports.PrayerTimes = /*#__PURE__*/function () {
  function PrayerTimes(latitude, longitude, timeZone) {
    var methodParams = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [18, 1, 0, 0, 17];
    var asrMethod = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
    var higherLatitudeMethod = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'NONE';
    _classCallCheck(this, PrayerTimes);
    this.lat = latitude;
    this.lng = longitude;
    this.timeZone = timeZone;
    this.methodParams = methodParams;
    this.asrMethod = asrMethod; // 1 for Shafii, 2 for Hanafi
    this.higherLatitudeMethod = higherLatitudeMethod; // 'NONE', 'ANGLE_BASED', 'MID_NIGHT', 'ONE_SEVEN'

    this.invalidTime = "-----";
  }
  return _createClass(PrayerTimes, [{
    key: "fixAngle",
    value: function fixAngle(a) {
      a = a - 360 * Math.floor(a / 360);
      return a < 0 ? a + 360 : a;
    }
  }, {
    key: "fixHour",
    value: function fixHour(a) {
      a = a - 24 * Math.floor(a / 24);
      return a < 0 ? a + 24 : a;
    }
  }, {
    key: "radiansToDegrees",
    value: function radiansToDegrees(rad) {
      return rad * 180 / Math.PI;
    }
  }, {
    key: "degreesToRadians",
    value: function degreesToRadians(deg) {
      return deg * Math.PI / 180;
    }
  }, {
    key: "dSin",
    value: function dSin(d) {
      return Math.sin(this.degreesToRadians(d));
    }
  }, {
    key: "dCos",
    value: function dCos(d) {
      return Math.cos(this.degreesToRadians(d));
    }
  }, {
    key: "dTan",
    value: function dTan(d) {
      return Math.tan(this.degreesToRadians(d));
    }
  }, {
    key: "dArcSin",
    value: function dArcSin(x) {
      return this.radiansToDegrees(Math.asin(x));
    }
  }, {
    key: "dArcCos",
    value: function dArcCos(x) {
      return this.radiansToDegrees(Math.acos(x));
    }
  }, {
    key: "dArcTan2",
    value: function dArcTan2(y, x) {
      return this.radiansToDegrees(Math.atan2(y, x));
    }
  }, {
    key: "dArcCot",
    value: function dArcCot(x) {
      return this.radiansToDegrees(Math.atan2(1, x));
    }
  }, {
    key: "julianDate",
    value: function julianDate(year, month, day) {
      if (month <= 2) {
        year -= 1;
        month += 12;
      }
      var A = Math.floor(year / 100);
      var B = 2 - A + Math.floor(A / 4);
      return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
    }
  }, {
    key: "sunPosition",
    value: function sunPosition(jd) {
      var D = jd - 2451545.0;
      var g = this.fixAngle(357.529 + 0.98560028 * D);
      var q = this.fixAngle(280.459 + 0.98564736 * D);
      var L = this.fixAngle(q + 1.915 * this.dSin(g) + 0.020 * this.dSin(2 * g));
      var e = 23.439 - 0.00000036 * D;
      var d = this.dArcSin(this.dSin(e) * this.dSin(L));
      var ra = this.dArcTan2(this.dCos(e) * this.dSin(L), this.dCos(L)) / 15;
      ra = this.fixHour(ra);
      var eqt = q / 15 - ra;
      return [d, eqt];
    }
  }, {
    key: "equationOfTime",
    value: function equationOfTime(jd) {
      return this.sunPosition(jd)[1];
    }
  }, {
    key: "sunDeclination",
    value: function sunDeclination(jd) {
      return this.sunPosition(jd)[0];
    }
  }, {
    key: "computeMidDay",
    value: function computeMidDay(t, jd) {
      var eqt = this.equationOfTime(jd + t);
      return this.fixHour(12 - eqt);
    }
  }, {
    key: "computeTime",
    value: function computeTime(angle, t, jd) {
      var d = this.sunDeclination(jd + t);
      var z = this.computeMidDay(t, jd);
      var beg = -this.dSin(angle) - this.dSin(d) * this.dSin(this.lat);
      var mid = this.dCos(d) * this.dCos(this.lat);
      var v = this.dArcCos(beg / mid) / 15;
      return z + (angle > 90 ? -v : v);
    }
  }, {
    key: "computeAsr",
    value: function computeAsr(step, t, jd) {
      var d = this.sunDeclination(jd + t);
      var angle = -this.dArcCot(step + Math.tan(Math.abs(this.lat - d) * Math.PI / 180));
      return this.computeTime(angle, t, jd);
    }
  }, {
    key: "fixTimes",
    value: function fixTimes(times) {
      // Convert times to fraction of day
      for (var i = 0; i < times.length; i++) {
        times[i] /= 24;
      }
      return times;
    }
  }, {
    key: "nightPortion",
    value: function nightPortion(angle) {
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
  }, {
    key: "timeDiff",
    value: function timeDiff(time1, time2) {
      return this.fixHour(time2 - time1);
    }
  }, {
    key: "adjustHighLatTimes",
    value: function adjustHighLatTimes(times) {
      var nightTime = this.timeDiff(times[4], times[1]);
      var fajrDiff = this.nightPortion(this.methodParams[0]) * nightTime;
      if (isNaN(times[0]) || this.timeDiff(times[0], times[1]) > fajrDiff) {
        times[0] = times[1] - fajrDiff;
      }
      var ishaAngle = this.methodParams[4];
      var ishaDiff = this.nightPortion(ishaAngle) * nightTime;
      if (isNaN(times[6]) || this.timeDiff(times[4], times[6]) > ishaDiff) {
        times[6] = times[4] + ishaDiff;
      }
      if (this.methodParams[1] === 0) {
        var maghribAngle = this.methodParams[2];
        var maghribDiff = this.nightPortion(maghribAngle) * nightTime;
        if (isNaN(times[5]) || this.timeDiff(times[4], times[5]) > maghribDiff) {
          times[5] = times[4] + maghribDiff;
        }
      }
    }
  }, {
    key: "adjustTimes",
    value: function adjustTimes(times) {
      for (var i = 0; i < times.length; i++) {
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
  }, {
    key: "floatToTime24",
    value: function floatToTime24(time) {
      if (isNaN(time)) return this.invalidTime;
      time = this.fixHour(time + 0.5 / 60); // round
      var hours = Math.floor(time);
      var minutes = Math.floor((time - hours) * 60);
      return "".concat(hours.toString().padStart(2, '0'), ":").concat(minutes.toString().padStart(2, '0'));
    }
  }, {
    key: "floatToTime12",
    value: function floatToTime12(time) {
      if (isNaN(time)) return this.invalidTime;
      time = this.fixHour(time + 0.5 / 60); // round
      var hours = Math.floor(time);
      var minutes = Math.floor((time - hours) * 60);
      var suffix = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      if (hours === 0) hours = 12; // 12 AM or 12 PM
      return "".concat(hours, ":").concat(minutes.toString().padStart(2, '0'), " ").concat(suffix);
    }
  }, {
    key: "computeTimes",
    value: function computeTimes(jd) {
      var times = [5, 6, 12, 13, 18, 18, 18]; // guess times (Fajr, Sunrise, Dhuhr, Asr, Sunset, Maghrib, Isha)
      times = this.fixTimes(times);
      for (var i = 0; i < 1; i++) {
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
  }, {
    key: "getPrayerTimes",
    value: function getPrayerTimes(date) {
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      var jd = this.julianDate(year, month, day);

      // Correct Julian Date for longitude
      jd -= this.lng / (15 * 24);
      var times = this.computeTimes(jd);
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
  }]);
}();