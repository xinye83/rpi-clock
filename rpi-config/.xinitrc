#!/bin/bash

xset -dpms
xset s off
xset s noblank

unclutter &
chromium-browser http://127.0.0.1:5000/ \
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
