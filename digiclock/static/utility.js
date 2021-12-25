var openWeatherData = null

/**
 * Initialize all elements of the digital clock when the page is loaded
 */
function initClock() {
    updateData()
    showTime()
    showDate()
    showWeather()
    showSunAngle()
    drawSunPath()
    showMoonAngle()
    drawMoonPath()
}

function updateData() {
    // pull data from OpenWeather API every 120 seconds
    setTimeout(updateData, 120000)

    const apikey = data['api_key']['open_weather'].toString()
    const cityid = data['local']['city_id'].toString()
    const openWeatherAPI = `https://api.openweathermap.org/data/2.5/weather?id=${cityid}&&units=imperial&appid=${apikey}`

    $.getJSON(openWeatherAPI, function (result) {
        openWeatherData = result
    })

    // re-draw sun path when the data has been updated for the first time
    // in a day
    var today = new Date()
    if (today.getHours() == 0 && today.getMinutes() < 2) {
        drawSunPath()
        drawMoonPath()
    }
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
 * Draw sun path of today on the screen
 */
async function drawSunPath() {
    const kMaxSunAnglePixel = data['setting']['max_path_height']

    const ctx = document.getElementById('sun-path').getContext('2d')

    ctx.strokeStyle = 'yellow'
    ctx.lineWidth = 1

    ctx.beginPath()

    var angle, x, y

    // interpolate the sun path every 10 minutes
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 10) {
            angle = await calculateAltitude('sun', hour, minute, 0)

            x = Math.floor(((hour * 60 + minute) / 9) * 8)
            y = 200 - Math.floor((angle / 90) * kMaxSunAnglePixel)

            if (hour == 0 && minute == 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        }
    }

    angle = await calculateAltitude('sun', 23, 59, 59)
    x = 1280
    y = 200 - Math.floor((angle / 90) * kMaxSunAnglePixel)

    ctx.lineTo(x, y)
    ctx.stroke()
}

async function showSunAngle() {
    setTimeout(showSunAngle, 120000)

    var today = new Date()

    var angle = await calculateAltitude(
        'sun',
        today.getHours(),
        today.getMinutes(),
        today.getSeconds()
    )

    var left = Math.floor(
        ((today.getHours() * 3600 +
            today.getMinutes() * 60 +
            today.getSeconds()) /
            86400) *
            1280
    )
    var top = Math.floor(
        200 - (data['setting']['max_path_height'] * angle) / 90
    )

    document.getElementById('sun-angle').style.left = left.toString() + 'px'
    document.getElementById('sun-angle').style.top = top.toString() + 'px'
}

async function drawMoonPath() {
    const kMaxMoonAnglePixel = data['setting']['max_path_height']

    const ctx = document.getElementById('moon-path').getContext('2d')

    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 1

    ctx.beginPath()

    var angle, x, y

    // interpolate the sun path every 10 minutes
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 10) {
            angle = await calculateAltitude('moon', hour, minute, 0)

            x = Math.floor(((hour * 60 + minute) / 9) * 8)
            y = 200 - Math.floor((angle / 90) * kMaxMoonAnglePixel)

            if (hour == 0 && minute == 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        }
    }

    angle = await calculateAltitude('moon', 23, 59, 59)
    x = 1280
    y = 200 - Math.floor((angle / 90) * kMaxMoonAnglePixel)

    ctx.lineTo(x, y)
    ctx.stroke()
}

async function showMoonAngle() {
    setTimeout(showMoonAngle, 120000)

    var today = new Date()

    var angle = await calculateAltitude(
        'moon',
        today.getHours(),
        today.getMinutes(),
        today.getSeconds()
    )

    var left = Math.floor(
        ((today.getHours() * 3600 +
            today.getMinutes() * 60 +
            today.getSeconds()) /
            86400) *
            1280
    )
    var top = Math.floor(
        200 - (data['setting']['max_path_height'] * angle) / 90
    )

    document.getElementById('moon-angle').style.left = left.toString() + 'px'
    document.getElementById('moon-angle').style.top = top.toString() + 'px'
}

/**
 * Calculate altitude angle of a planet for the current day at a given time
 * and return the angle in degrees
 *
 * hour, minute and second should be in local time zone
 */
async function calculateAltitude(planet, hour, minute, second) {
    var now = new Date()
    var time = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour,
        minute,
        second
    )

    const url =
        'http://127.0.0.1:5000/calculate-altitude?' +
        'planet=' +
        planet +
        '&year=' +
        time.getUTCFullYear().toString() +
        '&month=' +
        (time.getUTCMonth() + 1).toString() +
        '&day=' +
        time.getUTCDate().toString() +
        '&hour=' +
        time.getUTCHours().toString() +
        '&minute=' +
        time.getUTCMinutes().toString() +
        '&second=' +
        time.getUTCSeconds().toString() +
        '&latitude=' +
        data['local']['latitude'].toString() +
        '&longitude=' +
        data['local']['longitude'].toString()

    return $.ajax({
        type: 'GET',
        url: url,
    })
}
