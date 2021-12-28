async function updateWeather() {
    const apiKey = secret['openWeatherAPIKey']
    const cityID = setting['cityID'].toString()
    const url =
        'https://api.openweathermap.org/data/2.5/weather' +
        '?id=' +
        cityID +
        '&appid=' +
        apiKey +
        '&units=imperial'

    $.getJSON(url, function (openWeatherData) {
        /* temperature */
        const temp = Math.floor(openWeatherData['main']['temp'])

        document.getElementById('temperature').textContent =
            temp.toString() + '\u00B0F'

        /* weather icon */
        const weatherID = openWeatherData['weather'][0]['id']
        const sunrise = openWeatherData['sys']['sunrise']
        const sunset = openWeatherData['sys']['sunset']

        var iconClass = 'weather-icon wi wi-owm-'

        if (Date.now() >= sunrise * 1000 && Date.now() <= sunset * 1000) {
            iconClass += 'day'
        } else {
            iconClass += 'night'
        }

        iconClass += '-' + weatherID.toString()

        document.getElementById('weather-icon').className = iconClass
    })
}
