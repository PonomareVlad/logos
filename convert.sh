mkdir public && cd logos && for file in *.svg; do lottie_convert.py "$file" "../public/${file/.svg/.tgs}"; done && cd ../public && zip -r logos.zip *
