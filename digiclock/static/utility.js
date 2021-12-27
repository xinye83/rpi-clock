function initClock() {
    const now = new Date()

    /* Update time every second */
    setInterval(updateTime, 1000)

    /* Update date immediately and at every midnight */
    updateDate()

    const timeToNextDay =
        new Date(now.getFullYear(), now.getMonth(), now.getDate()) -
        now +
        86400000

    setTimeout(function () {
        updateDate()
        setInterval(updateDate(), 86400000)
    }, timeToNextDay)

    /**
     * Pull weather data from OpenWeatherMap and update weather
     * every 120 seconds
     */
    updateWeather()
    setInterval(updateWeather, 120000)

    /* Update sun position and path every 120 seconds */
    updateSun()
    setInterval(updateSun, 120000)

    /* Update moon position, phase and path every 120 seconds */
    updateMoon()
    setInterval(updateMoon, 120000)
}
