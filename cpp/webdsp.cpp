#include <math.h>
#include <stdlib.h>
#include <stdio.h>
#include <iostream>

extern "C" {
  int getPixel (int x, int y, int* arr, int width, int height) {
    if (x < 0 || y < 0) return 0;
    if (x >= (width) || y >= (height)) return 0;
    return (arr[((width * y) + x)]);
  }

//start filters below
  void grayScale (unsigned char* data, int len) {
    for (int i = 0; i < len; i += 4) {
      int r = data[i];
      int g = data[i+1];
      int b = data[i+2];
      int a = data[i+3];
      // int brightness = (r*.21+g*.72+b*.07);

      data[i] = r;
      data[i+1] = r;
      data[i+2] = r;
      data[i+3] = a;
    }
  }
  void brighten (unsigned char* data, int len, int brightness) {
    for (int i = 0; i < len; i += 4) {
      data[i]   + brightness > 255 ? 255 : data[i]   += brightness;
      data[i+1] + brightness > 255 ? 255 : data[i+1] += brightness;
      data[i+2] + brightness > 255 ? 255 : data[i+2] += brightness;
    }
  }
  void invert (unsigned char* data, int len) {
    for (int i = 0; i < len; i += 4) {
      data[i] = 255 - data[i]; //r
      data[i+1] = 255 - data[i+1]; //g
      data[i+2] = 255 - data[i+2]; //b
    }
  }
  void noise (float* data, int len) {
    int random; 
    for (int i = 0; i < len; i += 4) {
      random = (rand() % 70) - 35;
      data[i] = data[i] + random; //r
      data[i+1] = data[i+1] + random; //g
      data[i+2] = data[i+2] + random; //b
    }
  }
  void multiFilter (unsigned char* data, int len, int width, int filterType, int mag, int mult, int adj) {
    for (int i = 0; i < len; i += filterType) {
      if (i % 4 != 3) {
        data[i] = mag + mult * data[i] - data[i + adj] - data[i + width * 4];
      }
    }
  }
  void sobelFilter (unsigned char* data, int width, int height, bool invert) {
    int grayData[width * height];
    for (int y = 0; y < height; y++) {
      for (int x = 0; x < width; x++) {
        int goffset = ((width * y) + x) << 2; //multiply by 4
        int r = data[goffset];
        int g = data[goffset + 1];
        int b = data[goffset + 2];

        int avg = (r >> 2) + (g >> 1) + (b >> 3);
        grayData[((width * y) + x)] = avg;

        int doffset = ((width * y) + x) << 2;
        data[doffset] = avg;
        data[doffset + 1] = avg;
        data[doffset + 2] = avg;
        data[doffset + 3] = 255;

      }
    }

    for (int y = 0; y < height; y++) {
      for (int x = 0; x < width; x++) {
        int newX;
        int newY;
        if ((x <= 0 || x >= width - 1) || (y <= 0 || y >= height - 1)) {
          newX = 0;
          newY = 0;
        } else {
          newX = (
            (-1 * getPixel(x - 1, y - 1, grayData, width, height)) +
            (getPixel(x + 1, y - 1, grayData, width, height)) +
            (-1 * (getPixel(x - 1, y, grayData, width, height) << 1)) +
            (getPixel(x + 1, y, grayData, width, height) << 1) +
            (-1 * getPixel(x - 1, y + 1, grayData, width, height)) +
            (getPixel(x + 1, y + 1, grayData, width, height))
          );
          newY = (
            (-1 * getPixel(x - 1, y - 1, grayData, width, height)) +
            (-1 * (getPixel(x, y - 1, grayData, width, height) << 1)) +
            (-1 * getPixel(x + 1, y - 1, grayData, width, height)) +
            (getPixel(x - 1, y + 1, grayData, width, height)) +
            (getPixel(x, y + 1, grayData, width, height) << 1) +
            (getPixel(x + 1, y + 1, grayData, width, height))
          );
        }
        int mag = sqrt((newX * newX) + (newY * newY));
        if (mag > 255) mag = 255;
        int offset = ((width * y) + x) << 2; //multiply by 
        if (invert == true) mag = 255 - mag;
        data[offset] = mag;
        data[offset + 1] = mag;
        data[offset + 2] = mag;
        data[offset + 3] = 255;
      }
    }
  }
  void convFilter (float* data, int width, int height, float* kern, int kWidth, int kHeight, float divisor, float bias, int count) {
    float r, g, b;
    int yy, xx, imageOffset, kernelOffset, pix; 
    int kCenterY = floor(kHeight / 2);
    int kCenterX = floor(kWidth / 2);
    for (int i = 0; i < count; ++i) {
      for (int y = kCenterY; y < height - kCenterY; ++y) {
        for (int x = kCenterX; x < width - kCenterX; ++x) {
          r = 0;
          g = 0;
          b = 0;
          for (int ky = 0; ky < kHeight; ++ky) {
            // yy = kHeight - 1 - ky;
            for (int kx = 0; kx < kWidth; ++kx) {
              // xx = kWidth - 1 - kx;
              imageOffset = (width * (y - kCenterY + ky) + (x - kCenterX + kx)) * 4;
              kernelOffset = kWidth * ky + kx;
              // access correct index by offsetting x and y by the current kernel index
              r += data[imageOffset + 0] * kern[kernelOffset];
              g += data[imageOffset + 1] * kern[kernelOffset];
              b += data[imageOffset + 2] * kern[kernelOffset];
            }
          }
          pix = (width * y + x) * 4;
          data[pix + 0] =  ((r / divisor)>255.0) ? 255.0 : ((r / divisor)<0.0) ? 0.0 : r / divisor;
          data[pix + 1] =  ((g / divisor)>255.0) ? 255.0 : ((g / divisor)<0.0) ? 0.0 : g / divisor;
          data[pix + 2] =  ((b / divisor)>255.0) ? 255.0 : ((b / divisor)<0.0) ? 0.0 : b / divisor;
        }
      }
    }
  }
  
  //   int Ks = 1;
  //   for (int i = 0; i < count; ++i) {
  //     for (int y = Ks; y < height - Ks; y++) {
  //       for (int x = Ks; x < width - Ks; x++) {
  //         int px = (y * width + x) << 2;

  //         int r = 0, g = 0, b = 0;

  //         int offsetTL = ((width * (y - 1)) + (x - 1)) * 4;
  //         int offsetT  = ((width * (y - 1)) + (  x  )) * 4;
  //         int offsetTR = ((width * (y - 1)) + (x + 1)) * 4;
  //         int offsetL  = ((width * (  y  )) + (x - 1)) * 4;
  //         int offsetC  = ((width * (  y  )) + (  x  )) * 4;
  //         int offsetR  = ((width * (  y  )) + (x + 1)) * 4;
  //         int offsetBL = ((width * (y + 1)) + (x - 1)) * 4;
  //         int offsetB  = ((width * (y + 1)) + (  x  )) * 4;
  //         int offsetBR = ((width * (y + 1)) + (x + 1)) * 4;

  //         int r00 = data[offsetTL + 0] * kern[0];
  //         int g00 = data[offsetTL + 1] * kern[0];
  //         int b00 = data[offsetTL + 2] * kern[0];
  //         // int a00 = data[offsetTL + 3] * kern[0];
  //         int r10 = data[offsetT  + 0] * kern[1];
  //         int g10 = data[offsetT  + 1] * kern[1];
  //         int b10 = data[offsetT  + 2] * kern[1];
  //         // int a10 = data[offsetT  + 3] * kern[1];
  //         int r20 = data[offsetTR + 0] * kern[2];
  //         int g20 = data[offsetTR + 1] * kern[2];
  //         int b20 = data[offsetTR + 2] * kern[2];
  //         // int a20 = data[offsetTR + 3] * kern[2];
  //         int r01 = data[offsetL  + 0] * kern[3];
  //         int g01 = data[offsetL  + 1] * kern[3];
  //         int b01 = data[offsetL  + 2] * kern[3];
  //         // int a01 = data[offsetL  + 3] * kern[3];
  //         int r11 = data[offsetC  + 0] * kern[4];
  //         int g11 = data[offsetC  + 1] * kern[4];
  //         int b11 = data[offsetC  + 2] * kern[4];
  //         // int a11 = data[offsetC  + 3] * kern[4];
  //         int r21 = data[offsetR  + 0] * kern[5];
  //         int g21 = data[offsetR  + 1] * kern[5];
  //         int b21 = data[offsetR  + 2] * kern[5];
  //         // int a21 = data[offsetR  + 3] * kern[5];
  //         int r02 = data[offsetBL + 0] * kern[6];
  //         int g02 = data[offsetBL + 1] * kern[6];
  //         int b02 = data[offsetBL + 2] * kern[6];
  //         // int a02 = data[offsetBL + 3] * kern[6];
  //         int r12 = data[offsetB  + 0] * kern[7];
  //         int g12 = data[offsetB  + 1] * kern[7];
  //         int b12 = data[offsetB  + 2] * kern[7];
  //         // int a12 = data[offsetB  + 3] * kern[7];
  //         int r22 = data[offsetBR + 0] * kern[8];
  //         int g22 = data[offsetBR + 1] * kern[8];
  //         int b22 = data[offsetBR + 2] * kern[8];
  //         // int a22 = data[offsetBR + 3] * kern[8];

  //         data[offsetC + 0] = (r00 + r10 + r20 + r01 + r11 + r21 + r02 + r12 + r22) / divisor;
  //         data[offsetC + 1] = (g00 + g10 + g20 + g01 + g11 + g21 + g02 + g12 + g22) / divisor;
  //         data[offsetC + 2] = (b00 + b10 + b20 + b01 + b11 + b21 + b02 + b12 + b22) / divisor;

  //         data[offsetC + 0] = (data[offsetC + 0]>255.0) ? 255.0 : ((data[offsetC + 0]<0.0) ? 0.0 : data[offsetC + 0]);
  //         data[offsetC + 1] = (data[offsetC + 1]>255.0) ? 255.0 : ((data[offsetC + 1]<0.0) ? 0.0 : data[offsetC + 1]);
  //         data[offsetC + 2] = (data[offsetC + 2]>255.0) ? 255.0 : ((data[offsetC + 2]<0.0) ? 0.0 : data[offsetC + 2]);

  //       }
  //     }
  //   }
  // }
}