# rpi-clock

A playground for my own Raspberry Pi project.

## My Setup

Raspberry Pi 4 Model B - 4GB RAM

-   Raspberry Pi OS Lite (Bullseye)

[7.9" LCD Display](https://www.waveshare.com/7.9inch-hdmi-lcd.htm)

## Setting Up the Screen

### Make the Screen Work

Go to `/boot/config.txt` and add at the end the following code.

```
max_usb_current=1
hdmi_group=2
hdmi_mode=87
hdmi_timings=400 0 100 10 140 1280 10 20 20 2 0 0 0 60 0 43000000 3
```

Also comment out this line (for RPi 4 or 4B).

```
#dtoverlay=vc4-kms-v3d
```

### Display and Touch Orientation

I want to rotate the screen by 270 degrees clockwise, both the display and touch control should be rotated. Add `display_rotate=3` to `/boot/config.txt` to rotate the display.

Now, to also rotate the touch control, install and setup `libinput`.

```bash
sudo apt install xserver-xorg-input-libinput
sudo cp /usr/share/X11/xorg.conf.d/40-libinput.conf /etc/X11/xorg.conf.d/
```

Add the following line to the section of touchscreen in `/etc/X11/xorg.conf.d/40-libinput.conf`.

```
Option "CalibrationMatrix" "0 -1 1 1 0 0 0 0 1"
```

_This guide is a simplified version of the official guide from [here](https://www.waveshare.com/wiki/7.9inch_HDMI_LCD)._

## Boot to Kiosk Mode

Start with RPi OS Lite, install the following packages.

```bash
sudo apt install --no-install-recommends xserver-xorg-video-all \
    xserver-xorg-input-all xserver-xorg-core xinit x11-xserver-utils \
    chromium-browser unclutter
```

Config RPi to boot directly into console.

```bash
sudo raspi-config
# 1 System Options > S5 Boot / Auto Login > B2 Console Autologin
```

Automatically start the GUI without mouse pointer on startup. Create or open
`/home/pi/.bash_profile` and add the following code to it.

```bash
#!/bin/bash

if [[ -z $DISPLAY && $(tty) = /dev/tty1 ]]; then
    cd ~/rpi-clock/digiclock
    cd ~/rpi-clock/digiclock
    nohup flask --app main.py run &
    startx -- -nocursor
fi
```

Lastly, setup `/home/pi/.xinitrc` to run Chromium when you run `startx`.

```bash
#!/bin/bash

xset -dpms
xset s off
xset s noblank

unclutter &
chromium-browser http://127.0.0.1:5000 \
    --window-size=1280,400 \
    --window-position=0,0 \
    --start-fullscreen \
    --kiosk \
    --incognito \
    --noerrdialogs \
    --disable-translate \
    --no-first-run \
    --fast \
    --fast-start \
    --disable-infobars \
    --disable-features=TranslateUI \
    --disk-cache-dir=/dev/null \
    --overscroll-history-navigation=0 \
    --disable-pinch \
    --enable-features=OverlayScrollbar # smaller than default scrollbar
```

_Most of the instructions are from [this](https://blog.r0b.io/post/minimal-rpi-kiosk/) blog post._

## Digital Clock

Reference

-   [https://codepen.io/afarrar/pen/JRaEjP](https://codepen.io/afarrar/pen/JRaEjP)
-   [https://www.makeuseof.com/create-a-digital-clock-html-css-javascript/](https://www.makeuseof.com/create-a-digital-clock-html-css-javascript/)

## Weather

Reference

-   [OpenWeather](https://openweathermap.org/)
-   [erikflowers/weather-icons](https://github.com/erikflowers/weather-icons)

## Sun/Moon Positions

I want to show some kind of position of the Sun and Moon at any given time of the day on my clock. Such information can be found at

-   [suncalc.org](https://www.suncalc.org/)
-   [mooncalc.org](https://www.mooncalc.org/)
-   [timeanddate.com](https://www.timeanddate.com/)

For the Sun, I found [solar zenith angle](https://en.wikipedia.org/wiki/Solar_zenith_angle) which is the angle between the sun’s rays and the vertical direction. Also solar altitude angle, the angle between the sun’s rays and a horizontal plane.

The basic equation to compute the solar altitude angle (alpha) is

<p align="center">
    <img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/34a7c9c9d284efb5d263adcff2518505924b1727" />
</p>

-   The local latitude (capital phi) is about 44.76 in degrees for me.
-   The current declination of the Sun (delta) can be approximated by an equation given [here](https://www.esrl.noaa.gov/gmd/grad/solcalc/solareqns.PDF).
-   For the local hour angle (h), I decided to not compute it from scratch. Instead, I can get a very accurate solar noon time from the sunrise and sunset time from OpenWeatherMap and then compute the hour angle with it.

For the Moon, there are similar terms like zenith/altitude angles but looks like they are much harder to compute accurately. The following is a quote from [this](https://airmass.org/notes) page:

> A really precise calculation of the Moon's position requires the calculation of hundreds of periodic terms to account for all the myriad gravitational forces acting on the Moon. Meeus gives a simplified set of calculations in chapter 45 of _Astronomical Algorithms_, with 59 periodic terms in longitude and 30 in latitude.

## Skyfield and Flask

It turns out that there exists a Python library called [Skyfield](https://rhodesmill.org/skyfield/) that computes positions of stars or planets to a very high accuracy. For example, the following code computes the Sun altitude at the U.S. Bank Stadium (44.97425047849998, -93.25732030666656) at noon on 2021 Christmas Day (18:00:00 UTC).

```python
from skyfield.api import wgs84, load

planets = load("de421.bsp")
ts = load.timescale()

earth = planets["earth"]
sun = planets["sun"]

local = earth + wgs84.latlon(44.97425047849998, -93.25732030666656)
altitude, _, _ = (
    local.at(ts.utc(2021, 12, 25, 18, 0, 0))
    .observe(sun)
    .apparent()
    .altaz()
)

print(altitude.degrees)
```

I decided to replace my own algorithm to compute the Sun altitude mentioned in previous section (RIP) by using Skyfield and also do the same for Moon position. This means I have to run Python code to update certain elements on the webpage. Since html or the javascript code on the client side cannot access the local file system directly, there must be a local http server that hosts the digiclock webpage and also execute the Python code on request. This leads me to [Flask](https://flask.palletsprojects.com/en/2.0.x/).
