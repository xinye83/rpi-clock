function showTime() {
    var date = new Date()
    var h = date.getHours() // 0 - 23
    var m = date.getMinutes() // 0 - 59
    var s = date.getSeconds() // 0 - 59

    h = h < 10 ? '0' + h : h
    m = m < 10 ? '0' + m : m
    s = s < 10 ? '0' + s : s

    var text = h + ':' + m + ':' + s
    document.getElementById('clock').innerText = text
    document.getElementById('clock').textContent = text

    setTimeout(showTime, 1000)
}

function showDate() {
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

    var date = new Date()

    var month = monthNames[date.getMonth()]
    var dayOfWeek = dayNames[date.getDay()]
    var dayOfMonth = date.getDate()

    var text = dayOfWeek + ', ' + month + ' ' + dayOfMonth
    document.getElementById('date').innerText = text
    document.getElementById('date').textContent = text

    setTimeout(showDate, 1000)
}

function showWeather() {
    const cityID = '5019767' /* Burnsville, MN */
    const key = apikey['OpenWeather']

    var openWeatherAPI = `https://api.openweathermap.org/data/2.5/weather?id=${cityID}&&units=imperial&appid=${key}`

    $.getJSON(openWeatherAPI, function (data) {
        /* temperature */

        var temp = Math.floor(data['main']['temp'])

        document.getElementById('temperature').innerText =
            temp.toString() + '\u00B0F'
        document.getElementById('temperature').textContent =
            temp.toString() + '\u00B0F'

        /* weather icon */

        var weatherID = data['weather'][0]['id']
        var sunrise = data['sys']['sunrise']
        var sunset = data['sys']['sunset']

        var iconClass = 'wi-owm-'

        if (Date.now() >= sunrise * 1000 && Date.now() <= sunset * 1000) {
            console.log('day')
            iconClass += 'day'
        } else {
            console.log('night')
            iconClass += 'night'
        }

        iconClass += '-' + weatherID.toString()

        document.getElementById('weather-icon').className =
            'weather-icon wi ' + iconClass
    })

    setTimeout(showWeather, 120000)
}
