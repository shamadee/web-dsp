#define CATCH_CONFIG_MAIN
#include <iostream>
#include "./lib/catch.hpp"
#include "../cpp/webdsp.cpp"

TEST_CASE("Testing simple doubler function", "[doubler]") {

  SECTION("Doubling simple positive and negative integers") {
    REQUIRE( 2 == 2 );
    REQUIRE( 200 == 200);
  }
  SECTION("Testing edge cases") {
    // REQUIRE( doubler(0) == 0 );
    // REQUIRE( doubler(-1) == -2);
    // REQUIRE( doubler(12.75) == 24);
  }
}