#include <Audio.h>
#include <Wire.h>
#include <SPI.h>
#include <SD.h>
#include <Bounce.h>

// WAV files converted to code by wav2sketch
#include "AudioSampleArp.h"        // http://www.freesound.org/people/KEVOY/sounds/82583/
#include "AudioSamplePerc.h"       // http://www.freesound.org/people/zgump/sounds/86334/
#include "AudioSamplePulse.h"        // http://www.freesound.org/people/mhc/sounds/102790/
#include "AudioSampleKick.h"         // http://www.freesound.org/people/DWSD/sounds/171104/
#include "AudioSampleGong.h"         // http://www.freesound.org/people/juskiddink/sounds/86773/
#include "AudioSampleCashregister.h" // http://www.freesound.org/people/kiddpark/sounds/201159/

// Create the Audio components.  These should be created in the
// order data flows, inputs/sources -> processing -> outputs
//
AudioPlayMemory    sound0;
AudioPlayMemory    sound1;  // six memory players, so we can play
AudioPlayMemory    sound2;  // all six sounds simultaneously
AudioPlayMemory    sound3;
AudioPlayMemory    sound4;
AudioPlayMemory    sound5;
AudioMixer4        mix1;    // two 4-channel mixers are needed in
AudioMixer4        mix2;    // tandem to combine 6 audio sources
//AudioOutputI2S     headphones;
AudioOutputAnalog  dac;     // play to both I2S audio board and on-chip DAC

// Create Audio connections between the components
//
AudioConnection c1(sound0, 0, mix1, 0);
AudioConnection c2(sound1, 0, mix1, 1);
AudioConnection c3(sound2, 0, mix1, 2);
AudioConnection c4(sound3, 0, mix1, 3);
AudioConnection c5(mix1, 0, mix2, 0);   // output of mix1 into 1st input on mix2
AudioConnection c6(sound4, 0, mix2, 1);
AudioConnection c7(sound5, 0, mix2, 2);
//AudioConnection c8(mix2, 0, headphones, 0);
//AudioConnection c9(mix2, 0, headphones, 1);
AudioConnection c10(mix2, 0, dac, 0);

// Create an object to control the audio shield.
// 
AudioControlSGTL5000 audioShield;

// Bounce objects to read six pushbuttons (pins 0-5)
//
Bounce button0 = Bounce(12, 5);

int led1 = 10;
int led2 = 9;
int led3 = 5;
int led4 = 4;
int Coconut = A1;
int Banana = A2;
int Sausage = A3;
int Cheese = A4;
int capValue1 = 0;
int capRef1 = 0;
int capValue2 = 0;
int capRef2 = 0;
int capValue3 = 0;
int capRef3 = 0;
int capValue4 = 0;
int capRef4 = 0;

int samples = 20;

boolean played1 = false;
boolean played2 = false;
boolean played3 = false;
boolean played4 = false;

void setup() {
  // Configure the pushbutton pins for pullups.
  // Each button should connect from the pin to GND.
  pinMode(12, INPUT_PULLUP);
  
  pinMode(led1, OUTPUT); 
  pinMode(led2, OUTPUT); 
  pinMode(led3, OUTPUT); 
  pinMode(led4, OUTPUT); 
  
  capRef1 = touchRead(Coconut);
  capRef2 = touchRead(Banana);
  capRef3 = touchRead(Sausage);
  capRef4 = touchRead(Cheese);

  // Audio connections require memory to work.  For more
  // detailed information, see the MemoryAndCpuUsage example
  AudioMemory(10);

  // turn on the output


  // by default the Teensy 3.1 DAC uses 3.3Vp-p output
  // if your 3.3V power has noise, switching to the
  // internal 1.2V reference can give you a clean signal
  //dac.analogReference(INTERNAL);

  // reduce the gain on mixer channels, so more than 1
  // sound can play simultaneously without clipping
  mix1.gain(0, 0.4);
  mix1.gain(1, 0.4);
  mix1.gain(2, 0.4);
  mix1.gain(3, 0.4);
  mix2.gain(1, 0.4);
  mix2.gain(2, 0.4);
}

void loop() {
  // Update all the button objects
  button0.update();
  
  for(int counter = 0; counter < samples; counter ++)
    {
    capValue1 += touchRead(Coconut) - capRef1;
    }
  capValue1 /= samples;
  if (capValue1 >= 100 && !played1) {
    played1 = true;
    sound0.play(AudioSampleKick);
    digitalWrite(led1, HIGH);
  } else if (capValue1 <= 50) {
    played1 = false;
    digitalWrite(led1, LOW);
  }
  capValue1 = 0;
  
  for(int counter = 0; counter < samples; counter ++)
    {
    capValue2 += touchRead(Banana) - capRef2;
    }
  capValue2 /= samples;
  if (capValue2 >= 100 && !played2) {
    played2 = true;
    sound1.play(AudioSamplePulse);
    digitalWrite(led2, HIGH);  
  } else if (capValue2 <= 50) {
    played2 = false;
    digitalWrite(led2, LOW);
  }
  capValue2 = 0;
  
  for(int counter = 0; counter < samples; counter ++)
    {
    capValue3 += touchRead(Sausage) - capRef3;
    }
  capValue3 /= samples;
  if (capValue3 >= 100 && !played3) {
    played3 = true;
    sound2.play(AudioSamplePerc);
    digitalWrite(led3, HIGH); 
  } else if (capValue3 <= 50) {
    played3 = false;
    digitalWrite(led3, LOW);
  }
  capValue3 = 0;
  
  for(int counter = 0; counter < samples; counter ++)
    {
    capValue4 += touchRead(Cheese) - capRef4;
    }
  capValue4 /= samples; 
  if (capValue4 >= 100 && !played4) {
    played4 = true;
    sound3.play(AudioSampleArp);
    digitalWrite(led4, HIGH);  
  } else if (capValue4 <= 50) {
    played4 = false;
    digitalWrite(led4, LOW);
  }
  capValue4 = 0;

  if (button0.fallingEdge()) {
    // comment this line to work with Teensy 3.0.
    // the Gong sound is very long, too much for 3.0's memory
    sound4.play(AudioSampleGong);
  }

}

