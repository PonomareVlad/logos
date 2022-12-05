mkdir stickers && cd logos && for file in *.svg; do lottie_convert.py "$file" "../stickers/${file/.svg/.tgs}"; done && cd ../stickers && zip -r stickers.zip *
