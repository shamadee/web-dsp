#include <math.h>
#include <stdlib.h>
#include <stdio.h>

extern "C" {
//start filters below

  void grayScale(unsigned char* data, int len) {
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
  
  void brighten(unsigned char* data, int len, int brightness) {
    for (int i = 0; i < len; i += 4) {
      data[i] + data[i] + brightness > 255 ? 255 : data[i] += brightness;
      data[i+1] + data[i+1] + brightness > 255 ? 255 : data[i+1] += brightness;
      data[i+2] + data[i+2] + brightness > 255 ? 255 : data[i+2] += brightness;
    }
  }

  void invert(unsigned char* data, int len) {
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

  void edgeManip (unsigned char* data, int len, int filt, int c2Width) {
    for (int i = 0; i < len; i += filt) {
      if (i % 4 != 3) {
        data[i] = 127 + 2 * data[i] - data[i + 4] - data[i + c2Width * 4];
      }
    }
  }

  int getPixel(int x, int y, int* arr, int width, int height) {
    if (x < 0 || y < 0) return 0;
    if (x >= (width) || y >= (height)) return 0;
    return (arr[((width * y) + x)]);
  }

  void sobelFilter(unsigned char* data, int width, int height, bool invert=false) {
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

  void convFilter(float* data, int width, int height, float* kern, int Ks, double divisor, double bias, int count) {
    for (int i = 0; i < count; i++) {
      for (int y = 1; y < height - 1; y++) {
        for (int x = 1; x < width - 1; x++) {
          int offsetTL = ((width * (y - 1)) + (x - 1)) * 4;
          int offsetT  = ((width * (y - 1)) + (  x  )) * 4;
          int offsetTR = ((width * (y - 1)) + (x + 1)) * 4;
          int offsetL  = ((width * (  y  )) + (x - 1)) * 4;
          int offsetC  = ((width * (  y  )) + (  x  )) * 4;
          int offsetR  = ((width * (  y  )) + (x + 1)) * 4;
          int offsetBL = ((width * (y + 1)) + (x - 1)) * 4;
          int offsetB  = ((width * (y + 1)) + (  x  )) * 4;
          int offsetBR = ((width * (y + 1)) + (x + 1)) * 4;

          int r00 = data[offsetTL + 0] * kern[0];
          int g00 = data[offsetTL + 1] * kern[0];
          int b00 = data[offsetTL + 2] * kern[0];
          // int a00 = data[offsetTL + 3] * kern[0];
          int r10 = data[offsetT  + 0] * kern[1];
          int g10 = data[offsetT  + 1] * kern[1];
          int b10 = data[offsetT  + 2] * kern[1];
          // int a10 = data[offsetT  + 3] * kern[1];
          int r20 = data[offsetTR + 0] * kern[2];
          int g20 = data[offsetTR + 1] * kern[2];
          int b20 = data[offsetTR + 2] * kern[2];
          // int a20 = data[offsetTR + 3] * kern[2];
          int r01 = data[offsetL  + 0] * kern[3];
          int g01 = data[offsetL  + 1] * kern[3];
          int b01 = data[offsetL  + 2] * kern[3];
          // int a01 = data[offsetL  + 3] * kern[3];
          int r11 = data[offsetC  + 0] * kern[4];
          int g11 = data[offsetC  + 1] * kern[4];
          int b11 = data[offsetC  + 2] * kern[4];
          // int a11 = data[offsetC  + 3] * kern[4];
          int r21 = data[offsetR  + 0] * kern[5];
          int g21 = data[offsetR  + 1] * kern[5];
          int b21 = data[offsetR  + 2] * kern[5];
          // int a21 = data[offsetR  + 3] * kern[5];
          int r02 = data[offsetBL + 0] * kern[6];
          int g02 = data[offsetBL + 1] * kern[6];
          int b02 = data[offsetBL + 2] * kern[6];
          // int a02 = data[offsetBL + 3] * kern[6];
          int r12 = data[offsetB  + 0] * kern[7];
          int g12 = data[offsetB  + 1] * kern[7];
          int b12 = data[offsetB  + 2] * kern[7];
          // int a12 = data[offsetB  + 3] * kern[7];
          int r22 = data[offsetBR + 0] * kern[8];
          int g22 = data[offsetBR + 1] * kern[8];
          int b22 = data[offsetBR + 2] * kern[8];
          // int a22 = data[offsetBR + 3] * kern[8];

          data[offsetC + 0] = (r00 + r10 + r20 + r01 + r11 + r21 + r02 + r12 + r22) / divisor;
          data[offsetC + 1] = (g00 + g10 + g20 + g01 + g11 + g21 + g02 + g12 + g22) / divisor;
          data[offsetC + 2] = (b00 + b10 + b20 + b01 + b11 + b21 + b02 + b12 + b22) / divisor;

          data[offsetC + 0] = (data[offsetC + 0]>255.0) ? 255.0 : ((data[offsetC + 0]<0.0) ? 0.0 : data[offsetC + 0]);
          data[offsetC + 1] = (data[offsetC + 1]>255.0) ? 255.0 : ((data[offsetC + 1]<0.0) ? 0.0 : data[offsetC + 1]);
          data[offsetC + 2] = (data[offsetC + 2]>255.0) ? 255.0 : ((data[offsetC + 2]<0.0) ? 0.0 : data[offsetC + 2]);
  // unsigned int ix, iy, il;
  // int kx, ky;
  // float cp[3];

  // for (ix = 1; ix < width - 1; ix += 1) {
  //   for (iy = 1; iy < height - 1; iy += 1) {
  //     cp[0] = cp[1] = cp[2] = 0.0;
  //     for (kx = -Ks; kx <= Ks; kx++) {
  //       for (ky = -Ks; ky <= Ks; ky++) {
  //         for (il = 0; il < 3; il++) {
  //           // cp[il] += ( kern[(kx + Ks) + (ky + Ks) * (2 * Ks + 1)] / divisor )
  //           //           * ( data[((WIDTH * (iy + ky) + (ix + kx))) + il] );

  //           cp[il] += ( kern[(kx + Ks) + (2 * Ks + 1) * (ky + Ks)] / divisor ) * 
  //                     ( data[((WIDTH * (iy + ky)) + (ix+kx)) * 4 + il]);

  //         }
  //       }

  //       data[((WIDTH * iy + ix) << 2) + 0] = cp[0];
  //       data[((WIDTH * iy + ix) << 2) + 1] = cp[1];
  //       data[((WIDTH * iy + ix) << 2) + 2] = cp[2];
      
  //     // for (il = 0; il < 3; il++) {
  //     //   cp[il] = (cp[il]>255.0) ? 255.0 : ((cp[il]<0.0) ? 0.0 : cp[il]);
  //     //   data[(WIDTH * iy + ix) + il] = cp[il];
  //       // data[((WIDTH * (iy + ky) + (ix + kx)) << 2) + il] = 5;
  //     }
  //   }
  // }
  // for (int i = 0; i < dataLen; i++) {
  //   data[i] = data[i] * kern[i % 9];
  // }
        }
      }
    }
  }
}