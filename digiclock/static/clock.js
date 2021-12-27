async function updateTime() {
    const now = new Date()

    var hour = now.getHours()
    var minute = now.getMinutes()
    var second = now.getSeconds()

    hour = hour < 10 ? '0' + hour : hour
    minute = minute < 10 ? '0' + minute : minute
    second = second < 10 ? '0' + second : second

    document.getElementById('clock').textContent = textTime =
        hour + ':' + minute + ':' + second
}

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

async function updateDate() {
    const now = new Date()

    var month = monthNames[now.getMonth()]
    var dayOfWeek = dayNames[now.getDay()]
    var dayOfMonth = now.getDate()

    document.getElementById('date').textContent =
        dayOfWeek + ', ' + month + ' ' + dayOfMonth
}
