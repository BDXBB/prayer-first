"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findCity = findCity;
exports.findClosestCity = findClosestCity;
exports.getDbPrayerTime = getDbPrayerTime;
var _path = _interopRequireDefault(require("path"));
var _url = require("url");
var _betterSqlite = _interopRequireDefault(require("better-sqlite3"));
var _utils = require("./utils.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// db path

var _filename = (0, _url.fileURLToPath)(import.meta.url);
var _dirname = _path["default"].dirname(_filename);
var dbPath = _path["default"].join(_dirname, 'muslim_db_v2.5.1.db');
var Db = new _betterSqlite["default"](dbPath);
function findClosestCity(latitude, longitude) {
  // const rows = Db.prepare('SELECT latitude, longitude , name,_id From location').all()

  var delta = 0.1;
  var rows = Db.prepare("\n  SELECT latitude, location.name AS city_name,\n  longitude,prayer_dependent_id,has_fixed_prayer_time, \n  location._id,\n  country.name AS country_name\n  FROM location\n  LEFT JOIN country ON country._id = location.country_id\n  WHERE latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?\n").all(latitude - delta, latitude + delta, longitude - delta, longitude + delta);
  var closestCity = null;
  var minDistance = Infinity;
  var _iterator = _createForOfIteratorHelper(rows),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var city = _step.value;
      var dist = (0, _utils.getDistanceLatLonInKm)(latitude, longitude, city.latitude, city.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closestCity = city;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  if (!closestCity) {
    return {
      status: false,
      error: "No data found for this location"
    };
  }
  return {
    status: true,
    data: closestCity
  };
}
function findCity(countryName, countryCity) {
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

  var city = Db.prepare("\n      SELECT country.name AS country_name,\n      country.code, location._id,\n      latitude, \n      location.name AS city_name, \n      longitude,prayer_dependent_id,has_fixed_prayer_time\n      FROM location\n      LEFT JOIN country ON country._id = location.country_id\n      WHERE (country.name = ? OR country.code = ?) AND location.name = ?\n      ").get(countryName, countryName, countryCity);
  if (!city) {
    return {
      status: false,
      error: "city not found Enter a city name"
    };
  }
  //  city.country = country.name;

  return {
    status: true,
    data: city
  };
}

// here date parameter can be a day or date to deal with difrent date format
function getDbPrayerTime(location_id, date, month, year) {
  var rows;
  if (date && month) {
    var dayNum = Number(date);
    var monthNum = Number(month);
    if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
      var row = Db.prepare("\n        SELECT month, day, fajr, sunrise, dhuhr, asr, maghrib, isha FROM prayer_time\n        WHERE location_id = ? AND month = ? AND day = ?\n      ").get(location_id, monthNum, dayNum);
      if (!row) {
        return {
          status: false,
          error: "No data found for this date"
        };
      }
      return {
        status: true,
        day: dayNum,
        month: monthNum,
        date: "".concat(month, "-").concat(date),
        times: row
      };
    } else {
      return {
        status: false,
        error: "month must be number btween 1-12 And day must be btween 1-31"
      };
    }
  }
  // return month
  else if (/^\d{1,2}$/.test(date) && !month && !year) {
    var _monthNum = Number(date);
    if (_monthNum >= 1 && _monthNum <= 12) {
      rows = Db.prepare("\n      SELECT month, day, fajr, sunrise, dhuhr, asr, maghrib, isha FROM prayer_time\n      WHERE location_id = ? AND month = ?\n    ").all(location_id, _monthNum);
      return {
        status: true,
        month: _monthNum,
        times: rows
      };
    } else {
      return {
        status: false,
        error: "for geting all month times enter number btween 1-12 with out month and year parameter"
      };
    }
    // return year
  } else if (/^\d{4}$/.test(date) || year && !date && !month) {
    rows = Db.prepare("\n      SELECT month, day, fajr, sunrise, dhuhr, asr, maghrib, isha FROM prayer_time\n      WHERE location_id = ?\n    ").all(location_id);
    return {
      status: true,
      times: rows
    };
    // spefic day
  } else {
    var formattedDate = (0, _utils.parseDate)(date, "MM-DD");
    var _row = Db.prepare("\n      SELECT fajr, sunrise, dhuhr, asr, maghrib, isha FROM prayer_time\n      WHERE location_id = ? AND date = ?\n    ").get(location_id, formattedDate);
    if (!_row) {
      return {
        status: false,
        error: "No data found for date"
      };
    }
    return {
      status: true,
      date: formattedDate,
      data: _row
    };
  }
}