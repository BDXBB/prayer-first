"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPrayerTime = getPrayerTime;
exports.getPrayerTimeByCity = getPrayerTimeByCity;
exports.midNightAndLastThird = midNightAndLastThird;
var _db = require("./db.js");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
// findClosestCity & get Prayer Time Based on database fixed prayer times //
function getPrayerTime(latitude, longitude, day, month, year, GetmidNightAndLastThird) {
  var city = (0, _db.findClosestCity)(latitude, longitude);
  if (!city.status) {
    return city;
  }
  var isFixed = city.data.has_fixed_prayer_time && city.data.has_fixed_prayer_time !== 0;
  var times;
  if (isFixed) {
    times = (0, _db.getDbPrayerTime)(city.data.prayer_dependent_id || city.data._id, day, month, year);
    if (times.status) {
      times.city = city.data.city_name;
      times.country = city.data.country_name;
      if (GetmidNightAndLastThird && times.times.maghrib) {
        var _midNightAndLastThird = midNightAndLastThird(times.times.maghrib, times.times.fajr),
          midNight = _midNightAndLastThird.midNight,
          lastThirdStart = _midNightAndLastThird.lastThirdStart;
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
  var city = (0, _db.findCity)(countryName, countryCity);
  if (!city.status) {
    return city;
  }
  var isFixed = city.data.has_fixed_prayer_time && city.data.has_fixed_prayer_time !== 0;
  var times;
  if (isFixed) {
    times = (0, _db.getDbPrayerTime)(city.data.prayer_dependent_id || city.data._id, day, month, year);
    if (times.status) {
      times.city = city.data.city_name;
      times.country = city.data.country_name;
      times.code = city.data.code;
      if (GetmidNightAndLastThird) {
        var _midNightAndLastThird2 = midNightAndLastThird(times.times.maghrib, times.times.fajr),
          midNight = _midNightAndLastThird2.midNight,
          lastThirdStart = _midNightAndLastThird2.lastThirdStart;
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
    var _t$split$map = t.split(":").map(Number),
      _t$split$map2 = _slicedToArray(_t$split$map, 2),
      h = _t$split$map2[0],
      m = _t$split$map2[1];
    return h * 60 + m;
  }
  function toTimeString(minutes) {
    var h = Math.floor(minutes / 60) % 24;
    var m = minutes % 60;
    return "".concat(h.toString().padStart(2, '0'), ":").concat(m.toString().padStart(2, '0'));
  }
  var maghrib = toMinutes(maghribTime);
  var fajr = toMinutes(fajrTime);

  // crossing midnight
  if (fajr <= maghrib) {
    fajr += 24 * 60;
  }
  var nightDuration = fajr - maghrib;
  var midNight = maghrib + Math.floor(nightDuration / 2);
  var lastThird = maghrib + Math.floor(nightDuration * 2 / 3);
  return {
    midNight: toTimeString(midNight),
    lastThirdStart: toTimeString(lastThird)
  };
}