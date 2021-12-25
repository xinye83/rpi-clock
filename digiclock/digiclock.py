from flask import Flask, render_template, request
from skyfield.api import wgs84, load

app = Flask(__name__)


@app.route("/index")
def index():
    return render_template("index.html")


targets = ["sun", "moon"]


@app.route("/calculate-altitude")
def calculate_altitude():
    planet = request.args.get("planet", default="sun", type=str)

    if planet not in targets:
        return ""

    # the next 6 arguments should all be in UTC time
    year = request.args.get("year", default=None, type=int)
    month = request.args.get("month", default=None, type=int)
    day = request.args.get("day", default=None, type=int)
    hour = request.args.get("hour", default=None, type=int)
    minute = request.args.get("minute", default=None, type=int)
    second = request.args.get("second", default=None, type=int)

    latitude = request.args.get("latitude", default=None, type=float)
    longitude = request.args.get("longitude", default=None, type=float)

    planets = load("de421.bsp")
    ts = load.timescale()

    earth = planets["earth"]
    target = planets[planet]

    local = earth + wgs84.latlon(latitude, longitude)
    altitude, _, _ = (
        local.at(ts.utc(year, month, day, hour, minute, second))
        .observe(target)
        .apparent()
        .altaz()
    )

    return str(altitude.degrees)
