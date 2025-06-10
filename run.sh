#!/bin/sh

parallel -j0 --lb --ctag 'npm --prefix' ::: api pwa ::: run ::: dev

