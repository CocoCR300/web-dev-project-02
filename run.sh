#!/bin/sh

parallel -j0 --lb --ctag ::: 'npm --prefix api run dev' 'npm --prefix pwa run dev'

