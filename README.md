# prayer-first

**Accurate Islamic prayer times by city and location**  
A developer-focused Node.js package for retrieving Islamic prayer times based on city and country.


## 📦 Installation

```bash
npm install prayer-first
```

## Usage

### Import the library and functions

```js
const { PrayerTimes , getPrayerTime, getPrayerTimeByCity} = require('prayer-first');
```

### Get Prayer Times by Latitude and Longitude

 ```js
const { getPrayerTime } = require('prayer-first');

const latitude = 36.191196; // geographical latitude of the location in decimal Ex: Erbil latitude 
const longitude = 44.009962; // geographical longitude of the location in decimal Ex: Erbil longitude
const day = 15;
const month = 8;
const year = 2025;
const MidNightAndLastThird = true;  // optional calculation for midnight and last third of the night

const result = getPrayerTime(latitude, longitude, day, month, year, MidNightAndLastThird);

if (result.status) {
  console.log('Prayer times for:', result.city, result.country);
  console.log(result.times);
} else {
  console.error('Error:', result.error);
}

 ```

 <details>
 <summary>result</summary>

 ```json
{
    "status": true,
    "date": "08-15",
    "times": {
      "fajr": "03:51",
      "sunrise": "05:30",
      "dhuhr": "12:19",
      "asr": "15:58",
      "maghrib": "18:58",
      "isha": "20:13",
      "midNight": "23:24",
      "lastThirdStart": "00:53"
    },
    "city": "Erbil",
    "country": "Iraq"
  }
```

 </details>
 

 ### Get Prayer Times by Country and City Name

 ```js
 const { getPrayerTimeByCity } = require('prayer-first');

const countryName = 'IQ'; // Can be country Name or country Short code Ex: IQ for Iraq
const cityName = 'Erbil'; // city Name Ex: Erbil
const day = 15;
const month = 8;
const year = 2025;
const MidNightAndLastThird = true; // optional calculation for midnight and last third of the night

const result = getPrayerTimeByCity(countryName, cityName, day, month, year, MidNightAndLastThird);

if (result.status) {
  console.log('Prayer times for:', result.city, result.country);
  console.log(result.times);
} else {
  console.error('Error:', result.error);
}
 ```
 <details>
 <summary>result</summary>

 ```json
{
     "status": true,
     "day": 15,
     "month": 8,
     "date": "8-15",
     "times": {
          "month": 8,
          "day": 15,
          "fajr": "03:51",
          "sunrise": "05:30",
          "dhuhr": "12:19",
          "asr": "15:58",
          "maghrib": "18:58",
          "isha": "20:13"
     },
     "city": "Erbil",
     "country": "Iraq",
     "code": "IQ"
}
```

 </details>

 ### Get Prayer Times by Astronomical Calculation 📐

 ```js
const { PrayerTimes } = require('prayer-first');

const latitude = 24.7136;  // geographical latitude of the location in decimal Ex: Erbil latitude
const longitude = 46.6753; // geographical longitude of the location in decimal Ex: Erbil longitude
const timeZone = 3; // local time zone offset from UTC Example: UTC+3

const methodParams = [18, 1, 0, 0, 17]; // Optional methodParams: by defult is useing MWL - Muslim World League method 
const asrMethod = 1; // 1 for Shafi'i, 2 for Hanafi - Optional asrMethod: by defult is Shafi
const highLatitudeRule = 'NONE'; // 'MID_NIGHT', 'ONE_SEVEN', 'ANGLE_BASED' - Optional defult is 'NONE'

const today = new Date();

const calculator = new PrayerTimes(latitude, longitude, timeZone, methodParams, asrMethod, highLatitudeRule);
const result = calculator.getPrayerTimes(today);

console.log("Astronomical Prayer Times:");
console.log(result.times);

 ```
  <details>
 <summary>result</summary>

 ```json
{
     "status": true,
     "city": "Based on Astronomical Calculation",
     "day": 4,
     "month": 8,
     "times": {
          "fajr": "04:00",
          "sunrise": "05:23",
          "dhuhr": "11:59",
          "asr": "15:26",
          "maghrib": "18:36",
          "isha": "19:54"
     }
}
```

 </details>


 ### Flexible Day Parameter 📆
 

 Works With getPrayerTimeByCity & getPrayerTime Function

 ```js
const { getPrayerTimeByCity } = require('prayer-first');

// Get prayer times for full month Ex: August
const fullMonth = getPrayerTimeByCity('IQ', 'Erbil', 8);

// Get prayer times for full year 2025
const fullYear = getPrayerTimeByCity('IQ', 'Erbil', 2025);

// Get prayer times for specific day
const oneDay = getPrayerTimeByCity('IQ', 'Erbil', 15, 8, 2025);

 ```

   <details>
    <summary>fullMonth</summary>

```json
    {
        "status": true,
        "month": 8,
        "times": [
            {
                "month": 8,        
                "day": 1,
                "fajr": "03:41",   
                "sunrise": "05:19",
                "dhuhr": "12:20",
                "asr": "16:05",
                "maghrib": "19:13",
                "isha": "20:28"
            },
            {
                "month": 8,
                "day": 2,
                "fajr": "03:41",
                "sunrise": "05:20",
                "dhuhr": "12:20",
                "asr": "16:05",
                "maghrib": "19:12",
                "isha": "20:27"
            },
            ...
        ],
        "city": "Erbil",
        "country": "Iraq",
        "code": "IQ"
    }
```

 </details>

   <details>
    <summary>fullYear</summary>

```json
    {
        "status": true,
        "times": [
            {
                "month": 1,
                "day": 1,
                "fajr": "06:02",
                "sunrise": "07:21",
                "dhuhr": "12:16",
                "asr": "14:45",
                "maghrib": "17:06",
                "isha": "18:21"
            },
            {
                "month": 1,
                "day": 2,
                "fajr": "06:03",
                "sunrise": "07:21",
                "dhuhr": "12:16",
                "asr": "14:45",
                "maghrib": "17:06",
                "isha": "18:21"
            },
            ...

        ],
        "city": "Erbil",
        "country": "Iraq",
        "code": "IQ"
    }
```

 </details>


<details>
    <summary>specific day</summary>

```json
    {
        "status": true,
        "day": 15,
        "month": 8,
        "date": "8-15",
        "times": {
            "month": 8,        
            "day": 15,
            "fajr": "03:51",   
            "sunrise": "05:30",
            "dhuhr": "12:19",  
            "asr": "15:58",    
            "maghrib": "18:58",
            "isha": "20:13"
        },
        "city": "Erbil",
        "country": "Iraq",
        "code": "IQ"
    }
```

</details>

See examples in the [`examples`](./examples) folder.

## LICENSE

This project is licensed under the **GNU General Public License v3.0**.

It also utilizes data from the **Muslim DB project** by Kosrat D. Ahmad originally licensed under the **Apache License 2.0**.  
We acknowledge and appreciate the foundational work provided by the original author

All modifications, enhancements, or additional functionality introduced in this project have been independently developed by **Atta** and are **not affiliated with or endorsed by the original Muslim DB project or its creator**.

- [GPLv3 License](https://www.gnu.org/licenses/gpl-3.0.txt)
- [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)