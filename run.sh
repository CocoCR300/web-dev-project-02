#!/bin/sh

parallel -j0 --lb ::: 'npm --prefix api run dev' 'npm --prefix pwa run dev'

