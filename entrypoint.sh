#!/bin/bash
set -e

echo "================================================================"
echo "  MFT — Mobile Forensics Toolkit (Web UI)"
echo "================================================================"
echo ""

if [ -d /dev/bus/usb ]; then
    USB_COUNT=$(find /dev/bus/usb -type c 2>/dev/null | wc -l)
    echo "  [OK] /dev/bus/usb visible — $USB_COUNT device node(s)"
else
    echo "  [!] /dev/bus/usb NOT mounted. Phone will NOT be detected."
fi

if command -v adb >/dev/null 2>&1; then
    adb start-server >/dev/null 2>&1 || true
    echo "  [OK] ADB server started"
fi

if command -v usbmuxd >/dev/null 2>&1; then
    pgrep -x usbmuxd >/dev/null 2>&1 || usbmuxd -f -v >/dev/null 2>&1 &
    echo "  [OK] usbmuxd ready"
fi

echo ""
echo "  Web UI: http://localhost:5000"
echo "  Starting..."
echo ""

exec "$@"
