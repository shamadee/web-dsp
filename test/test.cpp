#define CATCH_CONFIG_MAIN
#include <iostream>
#include "./lib/catch.hpp"
#include "../cpp/webdsp.cpp"

// TEST_CASE("Testing simple doubler function", "[doubler]") {

//   SECTION("Doubling simple positive and negative integers") {
//     REQUIRE( doubler(1) == 2 );
//     REQUIRE( doubler(100) == 200);
//   }
//   SECTION("Testing edge cases") {
//     REQUIRE( doubler(0) == 0 );
//     REQUIRE( doubler(-1) == -2);
//     REQUIRE( doubler(12.75) == 24);
//   }
// }

TEST_CASE("Testing grayScale function", "[grayScale]") {
  int len = 4;
  unsigned char data[] = { 12, 15, 199, 124 };
  unsigned char out[]  = { 12, 12, 12, 124 };
  grayScale(data, len);
  SECTION("R G and B should be equal") {
    for (int i = 0; i < len; i++) {
      REQUIRE( data[i] == out[i] );
    }
  }
}

TEST_CASE("Testing brighten function", "[brighten]") {
  int len = 4;
  int brightness = 15;
  unsigned char data[] = { 12, 15, 255, 255 };
  unsigned char out[]  = { 12 + brightness, 15 + brightness, 255, 255 };
  brighten(data, len, brightness);
  SECTION("R and G should be increased by brightness") {
    for (int i = 0; i < len; i++) {
      REQUIRE( data[i] == out[i] );
    }
  }

  unsigned char data2[] = { 255, 234, 121, 255 };
  brighten(data2, len, 100);
  SECTION("No value should be greater than 255") {
    for (int i = 0; i < len; i++) {
      REQUIRE( data2[i] <= 255 );
    }
  }
}

