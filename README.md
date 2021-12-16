# rpi-playground

A playground for my own Raspberry Pi project.

## My Setup

Raspberry Pi 4 Model B - 4GB RAM

[7.9" LCD Display](https://www.waveshare.com/7.9inch-hdmi-lcd.htm)

## Boot to Kiosk Mode

Start with RPi OS Lite, install the following packages.

```bash
sudo apt-get install --no-install-recommends xserver-xorg-video-all \
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
if [ -z $DISPLAY ] && [ $(tty) = /dev/tty1 ]
then
    startx -- -nocursor
fi
```

Lastly, setup `/home/pi/.xinitrc` to run Chromium when you run `startx`.

```bash
#!/usr/bin/env sh
xset -dpms
xset s off
xset s noblank

unclutter &
chromium-browser https://yourfancywebsite.com \
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
    --disable-pinch
```

*Most of the instructions are from
[this](https://blog.r0b.io/post/minimal-rpi-kiosk/) blog post.*
