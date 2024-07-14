### See https://github.com/douglascrockford/JSMin/
mkdir -p min
(echo "// LDRX (MIT LICENSE) Antoine LANDRIEUX <https://github.com/AntoineLandrieux/LDRX/>" ; cat src/ldrx.js | jsmin) > min/ldrx.min.js