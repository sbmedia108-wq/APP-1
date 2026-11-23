#!/usr/bin/env bash
# One-time setup for photo-studio: Python packages + AI models (~250 MB, cached).
# Safe to re-run; skips anything already present.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
CACHE="${PHOTO_STUDIO_HOME:-$HOME/.cache/photo-studio}"
mkdir -p "$CACHE/u2net"

python3 - <<'EOF' 2>/dev/null || pip install -q opencv-contrib-python-headless onnxruntime onnx "rembg[cpu]" pillow numpy
import cv2, onnxruntime, onnx, rembg, PIL, numpy
EOF

# Real-ESRGAN x4plus, official weights (BSD-3, github.com/xinntao/Real-ESRGAN),
# converted to ONNX locally so no PyTorch is needed.
if [ ! -s "$CACHE/realesrgan_x4plus.onnx" ]; then
  PTH="$CACHE/RealESRGAN_x4plus.pth"
  [ -s "$PTH" ] || curl -fsSL -o "$PTH" https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth
  echo "4fa0d38905f75ac06eb49a7951b426670021be3018265fd191d2125df9d682f1  $PTH" | sha256sum -c --quiet
  python3 "$HERE/pth_to_onnx.py" "$PTH" "$CACHE/realesrgan_x4plus.onnx"
  rm -f "$PTH"
fi

# U2-Net background-removal model (MIT/Apache, github.com/danielgatis/rembg).
if [ ! -s "$CACHE/u2net/u2net.onnx" ]; then
  curl -fsSL -o "$CACHE/u2net/u2net.onnx" https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx
fi
echo "photo-studio ready ($CACHE)"
