"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDistanceLatLonInKm = getDistanceLatLonInKm;
exports.parseDate = parseDate;
exports.to12Hour = to12Hour;
exports.toradians = toradians;
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
//              calculate distance                //

// degrees to radians by radians = degrees × (piay / 180)
function toradians(deg) {
  return deg * (Math.PI / 180);
}

// Haversine math to calculate distance between two location //
function getDistanceLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = toradians(lat2 - lat1);
  var dLon = toradians(lon2 - lon1);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toradians(lat1)) * Math.cos(toradians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}
//              calculate distance                //

//              parsing date                //

function to12Hour(time24) {
  var _time24$split$map = time24.split(':').map(Number),
    _time24$split$map2 = _slicedToArray(_time24$split$map, 2),
    hour = _time24$split$map2[0],
    minute = _time24$split$map2[1];
  var ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12; // 0 تصبح 12 في نظام 12 ساعة
  return "".concat(hour.toString().padStart(2, '0'), ":").concat(minute.toString().padStart(2, '0'), " ").concat(ampm);
}
function parseDate(inputDate) {
  var dbFormat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "MM-DD";
  // only "DD-MM" or "YYYY-MM-DD" or "DD-M-YYYY" date
  var dateObj;
  if (inputDate.includes('-')) {
    var parts = inputDate.split('-');
    if (parts[0].length === 4) {
      // "YYYY-MM-DD"
      dateObj = new Date(inputDate);
    } else {
      // "DD-M-YYYY"
      var _parts$map = parts.map(Number),
        _parts$map2 = _slicedToArray(_parts$map, 3),
        _day = _parts$map2[0],
        _month = _parts$map2[1],
        year = _parts$map2[2];
      dateObj = new Date(year, _month - 1, _day);
    }
  }
  var day = String(dateObj.getDate()).padStart(2, '0');
  var month = String(dateObj.getMonth() + 1).padStart(2, '0');
  if (dbFormat === "MM-DD") {
    return "".concat(month, "-").concat(day);
  } else {
    return "".concat(day, "-").concat(month);
  }
}

//              parsing date                //