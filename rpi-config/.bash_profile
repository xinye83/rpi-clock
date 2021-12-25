#!/bin/bash

if [[ -f ~/.bashrc ]]; then
    source ~/.bashrc
fi

export FLASK_APP=digiclock

if [[ -z $DISPLAY && $(tty) = /dev/tty1 ]]; then
    cd /home/pi/rpi-playground/digiclock
    nohup flask run &
    startx -- -nocursor
fi
