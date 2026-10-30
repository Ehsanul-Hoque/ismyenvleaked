#!/bin/sh
# Renders og/og.html → site/og.png (1200×630) with headless Chrome.
set -e
cd "$(dirname "$0")"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --virtual-time-budget=2000 \
  --screenshot="$PWD/../site/og.png" "file://$PWD/og.html"
