from flask import Flask
import os

import clock
import home


app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), "static"))

app.register_blueprint(clock.Clock, url_prefix="/clock")
app.register_blueprint(home.Home, url_prefix="/home")


@app.route("/", methods=["GET"])
@app.route("/index", methods=["GET"])
def index():
    return clock.index()


if __name__ == "__main__":
    app.run()
