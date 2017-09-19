/*--------------------------------------------------------------------
  Maquette Biotope - Pierre-Gilles Levallois - pgl@erasme.org
----------------------------------------------------------------------
  Septembre 2017
----------------------------------------------------------------------

Fonctionnement : 
~~~~~~~~~~~~~~~~
    - 2 zones d'arrosage avec chacune un arbre connecte
    - Une ligne de transmission de donnees separees en 2  paries (zone 1 et zone 2)

  La simulation est pilotable par la console Serial de l'IDE Arduino et aussi
  por une liaison I2C.
  Dans le cadre de la liaison par I2C, le code pour le master I2C est le suivant :

  --8<------8<------8<------8<------8<------8<------8<------8<------

// Include the required Wire library for I2C
#include <Wire.h>
  void setup() {
    // Start the I2C Bus as Master
    Wire.begin(); 
  }
  
  void loop() {
    Wire.beginTransmission(9); // transmit to device #9
    Wire.write("...");              // sends something 
    Wire.endTransmission();    // stop transmitting
  }

  --8<------8<------8<------8<------8<------8<------8<------8<------

Commandes disponibles : 
~~~~~~~~~~~~~~~~~~~~~~~

  - '1' : // Allumage ligne data vers zone 1
  - '2' : // Extinction ligne data zone 1
  - '3' : // Allumage ligne data vers zone 2
  - '4' : // Extinction ligne data zone 2
  - '5' : // Arrosage zone 1
  - '6' : // Extinction Arrosage zone 1
  - '7' : // Arrosage zone 2
  - '8' : // Extinction Arrosage zone 2
 
--------------------------------------------------------------------*/
#include "FastLED.h"
#include <Wire.h>

#if FASTLED_VERSION < 3001000
#error "Requires FastLED 3.1 or later; check github for latest code."
#endif

// Slave I2C address to receive commands
#define SLAVE_I2C_ADDRESS 9

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
#define NUM_LEDS_ZONE2    9 //10
CRGB leds[NUM_LEDS_ZONE2];

#define NUM_LEDS_WIFI   1
CRGB wifi1[NUM_LEDS_WIFI];
CRGB wifi2[NUM_LEDS_WIFI];

#define BRIGHTNESS         255
#define FRAMES_PER_SECOND  120
#define LIGHTING_PERIOD    13

uint8_t gHue = 0; // rotating "base color" used by many of the patterns
int pos = 0;
int posCount = 0;
int commande = 1; // Valeur de la commande reçue via I2C depuis le master
String debugMsg, previousMsg = "";
boolean b_ligne1, b_ligne2, b_zone1, b_zone2, b_wifi1, b_wifi2 = false;

void setup() {
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

  // I 2 C communication
  // Start the I2C Bus as Slave on address 9
  Wire.begin(SLAVE_I2C_ADDRESS);
  // Attach a function to trigger when something is received.
  Wire.onReceive(receiveEvent);

  // Le wifi est toujours allumé
  b_wifi1 = true;
  b_wifi2 = true;
}

void loop()
{ 
  if (Serial.available()) {
    commande = Serial.read();
    choice();
  }

  // Les arbres wifi sont toujours allumés
  if (b_wifi1) {
    wifi(1);
  }
  if (b_wifi2) {
    wifi(2);
  }
  if (b_ligne1) {
    ligne(NUM_LEDS_ZONE1);
  }
  if (b_ligne2) {
    ligne(NUM_LEDS_ZONE2);
  }
  if (b_zone1) {
    arrosage(ZONE1);
  } else {
    stoparrosage(ZONE1);
  }
  if (b_zone2) {
    arrosage(ZONE2);
  } else {
    stoparrosage(ZONE2);
  }

  if (!b_ligne1 && !b_ligne2) {
    stopligne();
  }
  // Showing LEDS
  // send the 'leds' array out to the actual LED strip
  FastLED.show();
  // insert a delay to keep the framerate modest
  FastLED.delay(1000 / FRAMES_PER_SECOND);

  // do some periodic updates
  EVERY_N_MILLISECONDS( 20 ) {
    gHue++;  // slowly cycle the "base color" through the rainbow
  }

  // Displays debugMsg
  dislayMsg();
}

void dislayMsg() {
  if ( previousMsg != debugMsg ) {
    Serial.println( debugMsg );
    previousMsg = debugMsg;
  }
}

// read one character from the I2C
void receiveEvent(int bytes) {
  commande = Wire.read();
  debugMsg = "Read command : " + String(commande);
  choice();
}

void choice() {
  // Getting the command
  switch (char(commande)) {
    case '1' : // Allumage ligne data vers zone 1
      debugMsg = "Transmission data vers zone 1";
      b_ligne1 = true;
      b_ligne2 = false;
      break;

    case '2' : // Extinction ligne data zone 1
      debugMsg = "Extinction zone 1";
      b_ligne1 = false;
      break;

    case '3' : // Allumage ligne data vers zone 2
      debugMsg = "Transmission data vers zone 2";
      b_ligne1 = false;
      b_ligne2 = true;
      break;

    case '4' : // Extinction ligne data zone 2
      debugMsg = "Extinction zone 2";
      b_ligne2 = false;
      break;

    case '5' : // Arrosage zone 1
      debugMsg = "Arrosage zone 1";
      b_zone1 = true;
      break;

    case '6' : // Extinction Arrosage zone 1
      debugMsg = "Extinction Arrosage zone 1";
      b_zone1 = false;
      break;

    case '7' : // Arrosage zone 2
      debugMsg = "Arrosage zone 2";
      b_zone2 = true;
      break;

    case '8' : // Extinction Arrosage zone 2
      debugMsg = "Extinction Arrosage zone 2";
      b_zone2 = false;
      break;

    default :
      debugMsg = "Waiting for commands...";
  }
}


void wifi(int num)
{
  // a colored dot sweeping back and forth, with fading trails
  CRGBPalette16 palette = LavaColors_p;
  //int pos = beatsin16(LIGHTING_PERIOD, 0, NUM_LEDS_WIFI);
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
  int pos = beatsin16(LIGHTING_PERIOD, 0, NUM_LEDS_ARROSAGES);
  if ( z == ZONE2 ) {
    offset = 3;
  }
  for ( int i = offset ; i < 3 + offset ; i ++) {
    zones[i] = ColorFromPalette(palette, gHue + (pos * 2), gHue + (pos * 10));
  }
}


void stoparrosage(int z) {
  // All leds black
  int offset = 0;
  if ( z == ZONE2 ) {
    offset = 3;
  }
  for ( int i = offset ; i < 3 + offset ; i ++) {
    zones[i] = CRGB::Black;
  }
}

void ligne(int total_leds)
{
  CRGBPalette16 palette = ForestColors_p;
  // a colored dot sweeping back and forth, with fading trails
  fadeToBlackBy( leds, total_leds, 20);
  //beatsin16(LIGHTING_PERIOD, 0, total_leds)
  if (posCount < LIGHTING_PERIOD ) {
    posCount++;
  } else {
    pos++;
    posCount = 0;
  }
  if ( pos == total_leds ) {
    pos = 0;
  }
  leds[pos] += ColorFromPalette(palette, gHue + (pos * 2), gHue + (pos * 10)); // CRGB::Blue; //CHSV( gHue, 255, 192);
}

void stopligne() {
  // All leds black
  for ( int i = 0 ; i < NUM_LEDS_ZONE2 ; i ++) {
    leds[i] = CRGB::Black;
  }
}

