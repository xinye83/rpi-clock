function showTime() {
    var date = new Date()
    var h = date.getHours() // 0 - 23
    var m = date.getMinutes() // 0 - 59
    var s = date.getSeconds() // 0 - 59

    h = h < 10 ? '0' + h : h
    m = m < 10 ? '0' + m : m
    s = s < 10 ? '0' + s : s

    var time = h + ':' + m + ':' + s
    document.getElementById('clock').innerText = time
    document.getElementById('clock').textContent = time

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
