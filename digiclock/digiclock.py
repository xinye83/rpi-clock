from flask import Flask, render_template, request
from markupsafe import escape
import skyfield.api
from skyfield.framelib import ecliptic_frame
from datetime import datetime, timezone, timedelta
import json

app = Flask(__name__)


@app.route("/", methods=["GET"])
@app.route("/index", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/home", methods=["GET"])
def home():
    return render_template("home.html")


targets = ["sun", "moon"]


@app.route("/path", methods=["GET"])
def get_path():
    planet = request.args.get("planet", default=None, type=str)

    if planet not in targets:
        return json.dumps([])

    latitude = request.args.get("latitude", default=None, type=float)
    longitude = request.args.get("longitude", default=None, type=float)

    if not latitude or not longitude:
        return json.dumps([])

    # in seconds
    timestamp = request.args.get("timestamp", default=None, type=int)

    if not timestamp:
        return json.dumps([])

    # return information for a series of timestamps from {interval} hours
    # before timestamp to {interval} hours after timestamp will be returned
    interval = request.args.get("interval", default=None, type=int)

    # 5 minutes increment for timestamps
    increment = 5 * 60

    timestamps = list(
        range(
            timestamp - interval * 3600,
            timestamp + interval * 3600 + increment,
            increment,
        )
    )

    return json.dumps(get_path(planet, latitude, longitude, timestamps))


planets = skyfield.api.load("de421.bsp")
sun, moon, earth = planets["sun"], planets["moon"], planets["earth"]

timescale = skyfield.api.load.timescale()


def get_path(planet, latitude, longitude, timestamps):
    path = []
    earth = planets["earth"]
    target = sun if planet == "sun" else moon

    for timestamp in timestamps:
        time = datetime.fromtimestamp(timestamp, tz=timezone.utc)
        local = earth + skyfield.api.wgs84.latlon(latitude, longitude)
        altitude, _, _ = (
            local.at(
                timescale.utc(
                    time.year, time.month, time.day, time.hour, time.minute, time.second
                )
            )
            .observe(target)
            .apparent()
            .altaz()
        )

        path.append([timestamp, altitude.degrees])

    return path


@app.route("/moon-phase", methods=["GET"])
def get_moon_phase():
    # in seconds
    timestamp = request.args.get("timestamp", default=None, type=int)

    if not timestamp:
        return json.dumps([])

    time = datetime.fromtimestamp(timestamp, tz=timezone.utc)

    local = earth.at(
        timescale.utc(
            time.year, time.month, time.day, time.hour, time.minute, time.second
        )
    )

    _, sun_longitude, _ = local.observe(sun).apparent().frame_latlon(ecliptic_frame)
    _, moon_longitude, _ = local.observe(moon).apparent().frame_latlon(ecliptic_frame)

    moon_phase = (moon_longitude.degrees - sun_longitude.degrees) % 360

    return str(moon_phase)
