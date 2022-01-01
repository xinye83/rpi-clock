from flask import Blueprint, render_template

Home = Blueprint("home", __name__)


@Home.route("/", methods=["GET"])
@Home.route("/index", methods=["GET"])
def index():
    return render_template("home.html")
