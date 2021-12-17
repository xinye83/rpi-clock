#!/bin/bash

if [[ -f ~/.bashrc ]]; then
    source ~/.bashrc
fi

if [[ -z $DISPLAY && $(tty) = /dev/tty1 ]]; then
    startx -- -nocursor
fi
