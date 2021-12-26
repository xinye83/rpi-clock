from flask import Flask, render_template, request
import skyfield.api
from skyfield.framelib import ecliptic_frame
from datetime import datetime, timezone, timedelta
import json

app = Flask(__name__)

planets = skyfield.api.load("de421.bsp")
timescale = skyfield.api.load.timescale()

targets = ["sun", "moon"]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/get-path", methods=["GET"])
def get_path():
    planet = request.args.get("planet", default=None, type=str)

    if planet not in targets:
        return ""

    latitude = request.args.get("latitude", default=None, type=float)
    longitude = request.args.get("longitude", default=None, type=float)

    now = datetime.now()

    start = datetime.fromtimestamp(
        datetime(now.year, now.month, now.day).timestamp(), tz=timezone.utc
    )
    end = datetime.fromtimestamp(
        (datetime(now.year, now.month, now.day) + timedelta(days=1)).timestamp(),
        tz=timezone.utc,
    )

    curr = start
    path = []

    while curr <= end:
        path.append(
            calculate_altitude(
                planet,
                latitude,
                longitude,
                curr.year,
                curr.month,
                curr.day,
                curr.hour,
                curr.minute,
                curr.second,
            )
        )
        curr += timedelta(minutes=10)

    return json.dumps(path)


@app.route("/get-altitude", methods=["GET"])
def get_altitude():
    planet = request.args.get("planet", default=None, type=str)

    if planet not in targets:
        return ""

    year = request.args.get("year", default=None, type=int)
    month = request.args.get("month", default=None, type=int)
    day = request.args.get("day", default=None, type=int)
    hour = request.args.get("hour", default=None, type=int)
    minute = request.args.get("minute", default=None, type=int)
    second = request.args.get("second", default=None, type=int)

    latitude = request.args.get("latitude", default=None, type=float)
    longitude = request.args.get("longitude", default=None, type=float)

    return str(
        calculate_altitude(
            planet, latitude, longitude, year, month, day, hour, minute, second
        )
    )


@app.route("/get-moon-phase", methods=["GET"])
def get_moon_phase():
    year = request.args.get("year", default=None, type=int)
    month = request.args.get("month", default=None, type=int)
    day = request.args.get("day", default=None, type=int)
    hour = request.args.get("hour", default=None, type=int)
    minute = request.args.get("minute", default=None, type=int)
    second = request.args.get("second", default=None, type=int)

    sun, moon, earth = planets["sun"], planets["moon"], planets["earth"]

    local = earth.at(timescale.utc(year, month, day, hour, minute, second))

    _, sun_longitude, _ = local.observe(sun).apparent().frame_latlon(ecliptic_frame)
    _, moon_longitude, _ = local.observe(moon).apparent().frame_latlon(ecliptic_frame)

    moon_phase = (moon_longitude.degrees - sun_longitude.degrees) % 360

    return str(moon_phase)


# planet: target
# latitude, longitude: observer location on the Earth
# year, month, day, hour, minute, second: UTC time
def calculate_altitude(
    planet, latitude, longitude, year, month, day, hour, minute, second
):
    earth = planets["earth"]
    target = planets[planet]

    local = earth + skyfield.api.wgs84.latlon(latitude, longitude)
    altitude, _, _ = (
        local.at(timescale.utc(year, month, day, hour, minute, second))
        .observe(target)
        .apparent()
        .altaz()
    )

    return altitude.degrees
