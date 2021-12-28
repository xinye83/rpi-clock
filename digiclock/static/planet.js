const maxPathHeight = setting['maxPathHeight']
const indexURL = setting['indexURL']

async function updateSun() {
    const now = new Date()

    /* update sun path data */
    const url =
        indexURL +
        'path' +
        '?planet=sun' +
        '&latitude=' +
        setting['latitude'].toString() +
        '&longitude=' +
        setting['longitude'].toString() +
        '&timestamp=' +
        Math.floor(now.getTime() / 1000).toString() +
        '&interval=11'

    $.getJSON(url, function (sunPath) {
        /* update sun position */
        const left = Math.round(
            ((now.getHours() * 3600 +
                now.getMinutes() * 60 +
                now.getSeconds()) /
                86400) *
                1280
        )
        const top = Math.round(
            200 -
                (sunPath[Math.floor(sunPath.length / 2)][1] / 90) *
                    maxPathHeight
        )

        document.getElementById('sun-angle').style.left = left.toString() + 'px'
        document.getElementById('sun-angle').style.top = top.toString() + 'px'

        /* draw sun path */
        drawPath(
            document.getElementById('sun-path'),
            sunPath,
            now,
            window
                .getComputedStyle(document.getElementById('sun'))
                .getPropertyValue('color')
        )
    })
}

const moonPhaseWeatherIconNames = [
    'wi-moon-new' /* 0 degree */,
    'wi-moon-waxing-crescent-1',
    'wi-moon-waxing-crescent-2',
    'wi-moon-waxing-crescent-3',
    'wi-moon-waxing-crescent-4',
    'wi-moon-waxing-crescent-5',
    'wi-moon-waxing-crescent-6',
    'wi-moon-first-quarter' /* 90 degree */,
    'wi-moon-waxing-gibbous-1',
    'wi-moon-waxing-gibbous-2',
    'wi-moon-waxing-gibbous-3',
    'wi-moon-waxing-gibbous-4',
    'wi-moon-waxing-gibbous-5',
    'wi-moon-waxing-gibbous-6',
    'wi-moon-full' /* 180 degree */,
    'wi-moon-waning-gibbous-1',
    'wi-moon-waning-gibbous-2',
    'wi-moon-waning-gibbous-3',
    'wi-moon-waning-gibbous-4',
    'wi-moon-waning-gibbous-5',
    'wi-moon-waning-gibbous-6',
    'wi-moon-third-quarter' /* 270 degree */,
    'wi-moon-waning-crescent-1',
    'wi-moon-waning-crescent-2',
    'wi-moon-waning-crescent-3',
    'wi-moon-waning-crescent-4',
    'wi-moon-waning-crescent-5',
    'wi-moon-waning-crescent-6',
]

async function updateMoon() {
    const now = new Date()

    var url

    /* update moon path data */
    url =
        indexURL +
        'path' +
        '?planet=moon' +
        '&latitude=' +
        setting['latitude'].toString() +
        '&longitude=' +
        setting['longitude'].toString() +
        '&timestamp=' +
        Math.floor(now.getTime() / 1000).toString() +
        '&interval=11'

    $.getJSON(url, function (moonPath) {
        /* update moon position */
        const left = Math.round(
            ((now.getHours() * 3600 +
                now.getMinutes() * 60 +
                now.getSeconds()) /
                86400) *
                1280
        )
        const top = Math.round(
            200 -
                (moonPath[Math.floor(moonPath.length / 2)][1] / 90) *
                    maxPathHeight
        )

        document.getElementById('moon-angle').style.left =
            left.toString() + 'px'
        document.getElementById('moon-angle').style.top = top.toString() + 'px'

        /* draw moon path */
        drawPath(
            document.getElementById('moon-path'),
            moonPath,
            now,
            window
                .getComputedStyle(document.getElementById('moon'))
                .getPropertyValue('color')
        )
    })

    url =
        indexURL +
        'moon-phase' +
        '?timestamp=' +
        Math.floor(now.getTime() / 1000).toString()

    $.ajax({
        type: 'GET',
        url: url,
    }).done(function (moonPhase) {
        // The return value moonPhase is an angle between 0 and 360 in degrees.
        var index = Math.round((moonPhase / 360) * 28)

        if (index == 28) {
            index = 0
        }

        document.getElementById('moon-angle').className =
            'moon-angle wi ' + moonPhaseWeatherIconNames[index]
    })
}

function drawPath(canvas, path, now, color) {
    const context = canvas.getContext('2d')

    const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    )
    const endOfToday = new Date(startOfToday.getTime() + 86400000)

    var segments

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.beginPath()

    drawSegment(
        context,
        path.filter((item) => item[0] < startOfToday.getTime() / 1000),
        startOfToday.getTime() / 1000 - 86400
    )
    drawSegment(
        context,
        path.filter(
            (item) =>
                item[0] >= startOfToday.getTime() / 1000 &&
                item[0] < endOfToday.getTime() / 1000
        ),
        startOfToday.getTime() / 1000
    )
    drawSegment(
        context,
        path.filter((item) => item[0] >= endOfToday.getTime() / 1000),
        endOfToday.getTime() / 1000
    )

    context.strokeStyle = color
    context.lineWidth = 2
    context.setLineDash([10, 6])
    context.stroke()
}

function drawSegment(context, segment, start) {
    segment.forEach(function (item, index) {
        var left = Math.round(((item[0] - start) / 86400) * 1280)
        var top = 200 - Math.round((item[1] / 90) * maxPathHeight)

        if (index == 0) {
            context.moveTo(left, top)
        } else {
            context.lineTo(left, top)
        }
    })
}

/**
 * Draw sun path of today on the screen
 */
async function drawSunPath() {
    const canvas = document.getElementById('sun-path')
    const context = canvas.getContext('2d')

    context.clearRect(0, 0, canvas.width, canvas.height)

    context.strokeStyle = window
        .getComputedStyle(document.getElementById('sun'))
        .getPropertyValue('color')
    context.lineWidth = 1

    const url =
        'http://127.0.0.1:5000/get-path?planet=sun&latitude=' +
        data['local']['latitude'].toString() +
        '&longitude=' +
        data['local']['longitude'].toString()

    $.getJSON(url, function (sunPath) {
        context.beginPath()
        context.setLineDash([10, 6])

        for (var i = 0; i < sunPath.length; i++) {
            var x = Math.floor((i / (sunPath.length - 1)) * 1280)
            var y = 200 - Math.floor((sunPath[i] / 90) * maxPathHeight)

            if (i == 0) {
                context.moveTo(x, y)
            } else {
                context.lineTo(x, y)
            }
        }

        context.stroke()
    })
}

async function showMoonAngleAndPhase() {
    setTimeout(showMoonAngleAndPhase, 120000)

    var now = new Date()

    const url1 =
        'http://127.0.0.1:5000/get-altitude?planet=moon&year=' +
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
        url: url1,
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
    })
}
