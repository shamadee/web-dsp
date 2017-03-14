#!/bin/bash

# use path to emsdk folder, relative to this directory
BASEDIR="./../emsdk"
BASEDIRSHA="./../../../Documents/emsdk"
EMSDK_ENV=$(find "$BASEDIR" -type f -name "emsdk_env.sh")
source "$EMSDK_ENV"

# add exported C/C++ functions here
CPP_FUNCS="[ 
 '_sobelFilter', 
 '_convFilter', 
 '_doubler', 
 '_grayScale', 
 '_brighten', 
 '_invert', 
 '_noise', 
 '_edgeManip' 
]" 

echo "compiling C++ to WASM ..."
emcc -o ./lib/webdsp_c.js ./cpp/webdsp.cpp -lm -O3 -s WASM=1 \
-s BINARYEN_IMPRECISE=1 \
-s EXPORTED_FUNCTIONS="$CPP_FUNCS" \
-s ALLOW_MEMORY_GROWTH=1 \