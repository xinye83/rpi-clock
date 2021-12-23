/* Information of the current position */
const kCityID = '5019767' // kCityID in OpenWeatherMap
const kLatitude = 44.76401874152714 // kLatitude (in degrees)
const kLongitude = -93.26549544983986 // kLongitude (in degrees)
const kTimeZone = -6 // time zone relative to UTC (in hours)

// maximum height of the sun on the screen (in pixels)
const kMaxSunAnglePixel = 200

var openWeatherData

function updateData() {
    // pull data from OpenWeather API every 120 seconds
    setTimeout(updateData, 120000)

    const key = apikey['OpenWeather']
    var openWeatherAPI = `https://api.openweathermap.org/data/2.5/weather?id=${kCityID}&&units=imperial&appid=${key}`

    $.getJSON(openWeatherAPI, function (data) {
        openWeatherData = data
    })
}

function showTime() {
    setTimeout(showTime, 1000)

    var today = new Date()
    var hour = today.getHours() // 0 - 23
    var minute = today.getMinutes() // 0 - 59
    var second = today.getSeconds() // 0 - 59

    hour = hour < 10 ? '0' + hour : hour
    minute = minute < 10 ? '0' + minute : minute
    second = second < 10 ? '0' + second : second

    var text = hour + ':' + minute + ':' + second
    document.getElementById('clock').innerText = text
    document.getElementById('clock').textContent = text
}

function showDate() {
    setTimeout(showDate, 1000)

    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ]

    const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ]
    var today = new Date()

    var month = monthNames[today.getMonth()]
    var dayOfWeek = dayNames[today.getDay()]
    var dayOfMonth = today.getDate()

    var text = dayOfWeek + ', ' + month + ' ' + dayOfMonth
    document.getElementById('date').innerText = text
    document.getElementById('date').textContent = text
}

function showWeather() {
    if (!openWeatherData) {
        setTimeout(showWeather, 1000)
        return
    } else {
        setTimeout(showWeather, 120000)
    }

    var temp = Math.floor(openWeatherData['main']['temp'])

    document.getElementById('temperature').innerText =
        temp.toString() + '\u00B0F'
    document.getElementById('temperature').textContent =
        temp.toString() + '\u00B0F'

    /* weather icon */

    var weatherID = openWeatherData['weather'][0]['id']
    var sunrise = openWeatherData['sys']['sunrise']
    var sunset = openWeatherData['sys']['sunset']

    var iconClass = 'wi-owm-'

    if (Date.now() >= sunrise * 1000 && Date.now() <= sunset * 1000) {
        iconClass += 'day'
    } else {
        iconClass += 'night'
    }

    iconClass += '-' + weatherID.toString()

    document.getElementById('weather-icon').className =
        'weather-icon wi ' + iconClass
}

/**
 * Show sun arc between sunrise and sunset
 * TODO: extend to night
 */
function showSunArc() {}

function showSunAngle() {
    if (!openWeatherData) {
        setTimeout(showSunAngle, 1000)
        return
    } else {
        setTimeout(showSunAngle, 120000)
    }

    var today = new Date()
    var sunAngle = calculateSunAngle(
        today.getHours(),
        today.getMinutes(),
        today.getSeconds()
    )

    var x = Math.floor(
        ((today.getHours() * 3600 +
            today.getMinutes() * 60 +
            today.getSeconds()) /
            86400) *
            1280
    )
    var y = Math.floor(200 - (kMaxSunAnglePixel * sunAngle) / 90)

    document.getElementById('sun-angle').style.left = x.toString() + 'px'
    document.getElementById('sun-angle').style.top = y.toString() + 'px'
    document.getElementById('sun-angle').style.color = 'yellow'
}

/**
 * Calculate solar altitude angle for the current day at a given time and
 * return the angle in degrees
 */
function calculateSunAngle(hour, minute, second) {
    var today = new Date()
    var sunrise = openWeatherData['sys']['sunrise']
    var sunset = openWeatherData['sys']['sunset']

    // solar hour angle in degrees
    var hourAngle =
        (new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            hour,
            minute,
            second
        ) -
            new Date((sunrise + sunset) * 500)) /
        240000

    // day number in this year
    var dayNumber = Math.ceil(
        (today - new Date(today.getFullYear(), 0, 1)) / 86400000
    )

    // fraction year (in radians)
    var fractionYear =
        2 * Math.PI * (dayNumber - 1 + (today.getHours() - 12) / 24)
    if (
        (today.getFullYear() % 100 == 0 && today.getFullYear() % 400 == 0) ||
        today.getFullYear() % 4 == 0
    ) {
        fractionYear /= 366
    } else {
        fractionYear /= 365
    }

    // solar declination angle (in radians)
    var declinationAngle =
        0.006918 -
        0.399912 * Math.cos(fractionYear) +
        0.070257 * Math.sin(fractionYear) -
        0.006758 * Math.cos(2 * fractionYear) +
        0.000907 * Math.sin(2 * fractionYear) -
        0.002697 * Math.cos(3 * fractionYear) +
        0.00148 * Math.sin(3 * fractionYear)

    // solar altitude angle
    var solarAltitudeAngleRadians = Math.asin(
        Math.sin((kLatitude * Math.PI) / 180) * Math.sin(declinationAngle) +
            Math.cos((kLatitude * Math.PI) / 180) *
                Math.cos(declinationAngle) *
                Math.cos((hourAngle * Math.PI) / 180)
    )

    var solarAltitudeAngleDegrees = (solarAltitudeAngleRadians * 180) / Math.PI

    return solarAltitudeAngleDegrees
}
