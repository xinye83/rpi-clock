async function updateWeather() {
    const cityID = setting['cityID'].toString()
    const url = setting['indexURL'] + 'clock/weather' + '?id=' + cityID

    $.getJSON(url, function (weatherData) {
        if (!weatherData) {
            return
        }

        /* temperature */
        const temp = Math.floor(weatherData['main']['temp'])

        document.getElementById('temperature').textContent =
            temp.toString() + '\u00B0F'

        /* weather icon */
        const weatherID = weatherData['weather'][0]['id']
        const sunrise = weatherData['sys']['sunrise']
        const sunset = weatherData['sys']['sunset']

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
