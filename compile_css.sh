#!/bin/sh
CSS_HOME='django_angularjs/static/tetris/css/'
cd $CSS_HOME
sass main.scss > main.css
