#include "FastLED.h"

// FastLED "100-lines-of-code" demo reel, showing just a few
// of the kinds of animation patterns you can quickly and easily
// compose using FastLED.
//
// This example also shows one easy way to define multiple
// animations patterns and have them automatically rotate.
//
// -Mark Kriegsman, December 2014

#if FASTLED_VERSION < 3001000
#error "Requires FastLED 3.1 or later; check github for latest code."
#endif

#define DATA_PIN_LINES    5
#define DATA_PIN_ZONES    6
#define DATA_PIN_WIFI1    3
#define DATA_PIN_WIFI2    9
//#define CLK_PIN   4
#define LED_TYPE    NEOPIXEL

#define ZONE1 0
#define ZONE2 1
#define NUM_LEDS_ARROSAGES 6
CRGB zones[NUM_LEDS_ARROSAGES];

#define NUM_LEDS_ZONE1    4
#define NUM_LEDS_ZONE2    10
CRGB leds[NUM_LEDS_ZONE2];

#define NUM_LEDS_WIFI   1
CRGB wifi1[NUM_LEDS_WIFI];
CRGB wifi2[NUM_LEDS_WIFI];

#define BRIGHTNESS         100
#define FRAMES_PER_SECOND  120

void setup() {
  pinMode(4, OUTPUT);
  digitalWrite(4, HIGH);
  Serial.begin(9600);
  // tell FastLED about the LED strip configuration
  FastLED.addLeds<LED_TYPE, DATA_PIN_LINES>(leds, NUM_LEDS_ZONE2).setCorrection(TypicalLEDStrip);
  FastLED.addLeds<LED_TYPE, DATA_PIN_ZONES>(zones, NUM_LEDS_ARROSAGES).setCorrection(TypicalLEDStrip);
  FastLED.addLeds<LED_TYPE, DATA_PIN_WIFI1>(wifi1, NUM_LEDS_WIFI).setCorrection(TypicalLEDStrip);
  FastLED.addLeds<LED_TYPE, DATA_PIN_WIFI2>(wifi2, NUM_LEDS_WIFI).setCorrection(TypicalLEDStrip);

  // set master brightness control
  FastLED.setBrightness(BRIGHTNESS);
  // All leds black
  leds[0] = CRGB::Black;
  zones[0] = CRGB::Black;
  wifi1[0] = CRGB::Black;
  wifi2[0] = CRGB::Black;
  FastLED.show();
}

uint8_t gHue = 0; // rotating "base color" used by many of the patterns
int pos = 0;
int posCount = 0;

void loop()
{
  // Line
  //ligne(NUM_LEDS_ZONE1);
  ligne(NUM_LEDS_ZONE2);
  arrosage(ZONE1);
  arrosage(ZONE2);
  wifi(1);
  wifi(2);
  // send the 'leds' array out to the actual LED strip
  FastLED.show();
  // insert a delay to keep the framerate modest
  FastLED.delay(1000 / FRAMES_PER_SECOND);

  // do some periodic updates
  EVERY_N_MILLISECONDS( 20 ) {
    gHue++;  // slowly cycle the "base color" through the rainbow
  }

}


void wifi(int num)
{
  // a colored dot sweeping back and forth, with fading trails
  CRGBPalette16 palette = LavaColors_p;
  //int pos = beatsin16(13, 0, NUM_LEDS_WIFI);
  if ( num == 1) {
    fadeToBlackBy( wifi1, NUM_LEDS_WIFI, 20);
    wifi1[0] += ColorFromPalette(palette, gHue + 2, gHue + 10);
  } else {
    fadeToBlackBy( wifi2, NUM_LEDS_WIFI, 20);
    wifi2[0] += ColorFromPalette(palette, gHue + 2, gHue + 10);
  }
}

void arrosage(int z) {
  CRGBPalette16 palette = OceanColors_p;
  int offset = 0;
  int pos = beatsin16(13, 0, NUM_LEDS_ARROSAGES);
  if ( z == ZONE2 ) {
    offset = 3;
  }
  for ( int i = offset ; i < 3 + offset ; i ++) {
    zones[i] = ColorFromPalette(palette, gHue + (pos * 2), gHue + (pos * 10));
  }
}

void ligne(int total_leds)
{
  CRGBPalette16 palette = ForestColors_p;
  // a colored dot sweeping back and forth, with fading trails
  fadeToBlackBy( leds, total_leds, 20);
  //beatsin16(13, 0, total_leds)
  if (posCount < 13 ) {
    posCount++;
  } else {
    pos++;
    posCount = 0;
  }
  if ( pos == total_leds ) {
    pos = 0;
  }
  Serial.println(pos);
  leds[pos] += ColorFromPalette(palette, gHue + (pos * 2), gHue + (pos * 10)); // CRGB::Blue; //CHSV( gHue, 255, 192);

}

