var openWeatherData = null

/**
 * Initialize all elements of the digital clock when the page is loaded
 */
function initClock() {
    updateData()
    showTime()
    showWeather()
    showSunAngle()
    drawSunPath()
    showMoonAngle()
    drawMoonPath()
}

async function updateData() {
    // pull data from OpenWeather API every 120 seconds
    setTimeout(updateData, 120000)

    const apikey = data['api_key']['open_weather'].toString()
    const cityid = data['local']['city_id'].toString()
    const openWeatherAPI = `https://api.openweathermap.org/data/2.5/weather?id=${cityid}&&units=imperial&appid=${apikey}`

    $.getJSON(openWeatherAPI, function (result) {
        openWeatherData = result
    })

    // re-draw sun & moon path at the beginning of a new day
    var today = new Date()
    if (today.getHours() == 0 && today.getMinutes() < 2) {
        drawSunPath()
        drawMoonPath()
    }
}

async function showTime() {
    setTimeout(showTime, 1000)

    var today = new Date()

    var hour = today.getHours() // 0 - 23
    var minute = today.getMinutes() // 0 - 59
    var second = today.getSeconds() // 0 - 59

    hour = hour < 10 ? '0' + hour : hour
    minute = minute < 10 ? '0' + minute : minute
    second = second < 10 ? '0' + second : second

    var textTime = hour + ':' + minute + ':' + second
    document.getElementById('clock').innerText = textTime
    document.getElementById('clock').textContent = textTime

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

    var month = monthNames[today.getMonth()]
    var dayOfWeek = dayNames[today.getDay()]
    var dayOfMonth = today.getDate()

    var textDate = dayOfWeek + ', ' + month + ' ' + dayOfMonth
    document.getElementById('date').innerText = textDate
    document.getElementById('date').textContent = textDate
}

async function showWeather() {
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
    const maxPathHeight = data['setting']['max_path_height']

    const ctx = document.getElementById('sun-path').getContext('2d')
    ctx.strokeStyle = window
        .getComputedStyle(document.getElementById('sun'))
        .getPropertyValue('color')
    ctx.lineWidth = 1

    const url =
        'http://127.0.0.1:5000/get-path?' +
        'planet=sun&latitude=' +
        data['local']['latitude'].toString() +
        '&longitude=' +
        data['local']['longitude'].toString()

    $.getJSON(url, function (sunPath) {
        ctx.beginPath()

        for (var i = 0; i < sunPath.length; i++) {
            var x = Math.floor((i / (sunPath.length - 1)) * 1280)
            var y = 200 - Math.floor((sunPath[i] / 90) * maxPathHeight)

            if (i == 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        }

        ctx.stroke()
    })
}

async function showSunAngle() {
    setTimeout(showSunAngle, 120000)

    var now = new Date()

    const url =
        'http://127.0.0.1:5000/get-altitude?' +
        'planet=sun&year=' +
        now.getUTCFullYear().toString() +
        '&month=' +
        (now.getUTCMonth() + 1).toString() +
        '&day=' +
        now.getUTCDate().toString() +
        '&hour=' +
        now.getUTCHours().toString() +
        '&minute=' +
        now.getUTCMinutes().toString() +
        '&second=' +
        now.getUTCSeconds().toString() +
        '&latitude=' +
        data['local']['latitude'].toString() +
        '&longitude=' +
        data['local']['longitude'].toString()

    $.ajax({
        type: 'GET',
        url: url,
    }).done(function (angle) {
        var left = Math.floor(
            (now.getHours() * 7200 +
                now.getMinutes() * 120 +
                now.getSeconds() * 2) /
                135
        )
        var top = Math.floor(
            200 - (data['setting']['max_path_height'] * angle) / 90
        )

        document.getElementById('sun-angle').style.left = left.toString() + 'px'
        document.getElementById('sun-angle').style.top = top.toString() + 'px'

        document.getElementById('sun-angle-background').style.left =
            left.toString() + 'px'
        document.getElementById('sun-angle-background').style.top =
            top.toString() + 'px'
    })
}

async function drawMoonPath() {
    const maxPathHeight = data['setting']['max_path_height']

    const ctx = document.getElementById('moon-path').getContext('2d')
    ctx.strokeStyle = window
        .getComputedStyle(document.getElementById('moon'))
        .getPropertyValue('color')
    ctx.lineWidth = 1

    const url =
        'http://127.0.0.1:5000/get-path?' +
        'planet=moon&latitude=' +
        data['local']['latitude'].toString() +
        '&longitude=' +
        data['local']['longitude'].toString()

    $.getJSON(url, function (moonPath) {
        ctx.beginPath()

        for (var i = 0; i < moonPath.length; i++) {
            var x = Math.floor((i / (moonPath.length - 1)) * 1280)
            var y = 200 - Math.floor((moonPath[i] / 90) * maxPathHeight)

            if (i == 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        }

        ctx.stroke()
    })
}

async function showMoonAngle() {
    setTimeout(showMoonAngle, 120000)

    var now = new Date()

    const url =
        'http://127.0.0.1:5000/get-altitude?' +
        'planet=moon&year=' +
        now.getUTCFullYear().toString() +
        '&month=' +
        (now.getUTCMonth() + 1).toString() +
        '&day=' +
        now.getUTCDate().toString() +
        '&hour=' +
        now.getUTCHours().toString() +
        '&minute=' +
        now.getUTCMinutes().toString() +
        '&second=' +
        now.getUTCSeconds().toString() +
        '&latitude=' +
        data['local']['latitude'].toString() +
        '&longitude=' +
        data['local']['longitude'].toString()

    $.ajax({
        type: 'GET',
        url: url,
    }).done(function (angle) {
        var left = Math.floor(
            (now.getHours() * 7200 +
                now.getMinutes() * 120 +
                now.getSeconds() * 2) /
                135
        )
        var top = Math.floor(
            200 - (data['setting']['max_path_height'] * angle) / 90
        )

        document.getElementById('moon-angle').style.left =
            left.toString() + 'px'
        document.getElementById('moon-angle').style.top = top.toString() + 'px'

        document.getElementById('moon-angle-background').style.left =
            left.toString() + 'px'
        document.getElementById('moon-angle-background').style.top =
            top.toString() + 'px'
    })
}
