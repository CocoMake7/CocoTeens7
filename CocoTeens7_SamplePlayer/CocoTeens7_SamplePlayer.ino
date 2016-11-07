// todo:
// 2. Effekte einbinden versuchen. Werte laufend Kallibrieren und so auch bloss die Distanz messen.
// >> Referenz relativ und nicht absolut > Veränderung messen. 

#include <Audio.h>
#include <Wire.h>
#include <SPI.h>
#include <SD.h>
#include <Bounce.h>
#include <SerialFlash.h>

// WAV files converted to code by wav2sketch
#include "AudioSampleTig.h"
#include "AudioSampleSch.h"
#include "AudioSampleHo.h"
#include "AudioSampleBumm.h"

// Create the Audio components.  These should be created in the
// order data flows, inputs/sources -> processing -> outputs
#include <Audio.h>
#include <Wire.h>
#include <SPI.h>
#include <SD.h>
#include <SerialFlash.h>

AudioPlayMemory player[6]; // six memory players, so we can play all six sounds simultaneously
AudioMixer4        mix1;    // two 4-channel mixers are needed in
AudioMixer4        mix2;    // tandem to combine 6 audio sources
AudioFilterBiquad        biquad;        //xy=210,201
AudioEffectEnvelope      envelope;      //xy=541,113
//AudioOutputI2S     headphones;
AudioOutputAnalog  dac;     // play to both I2S audio board and on-chip DAC

// Create Audio connections between the components
AudioConnection c1(player[0], 0, mix1, 0);
AudioConnection c2(player[1], 0, mix1, 1);
AudioConnection c3(player[2], 0, mix1, 2);
AudioConnection c4(player[3], 0, mix1, 3);
AudioConnection c5(mix1, 0, mix2, 0);   // output of mix1 into 1st input on mix2
AudioConnection c6(player[4], 0, mix2, 1);
AudioConnection c7(player[5], 0, mix2, 2);
//AudioConnection c8(mix2, 0, headphones, 0);
//AudioConnection c9(mix2, 0, headphones, 1);

// direct out
//AudioConnection c10(mix2, 0, dac, 0);

// biquad filter
AudioConnection          patchCord4(mix2, 0, biquad, 0);
AudioConnection          patchCord5(biquad, 0, dac, 0);

// envelope
//AudioConnection          patchCord4(mix2, 0, envelope, 0);
//AudioConnection          patchCord5(envelope, 0, dac, 0);

// Create an object to control the audio shield.
AudioControlSGTL5000 audioShield;

// Bounce objects to read six pushbuttons (pins 0-5)
Bounce button0 = Bounce(12, 5);

int led[4] = {3, 4, 5, 6};
int touchPin[4] = {A9, A8, A5, A4};

boolean isPlayingNow[4] = {false, false, false, false};
int samples = 20;

const int Coconut = 0;
const int Banana = 1;
const int Sausage = 2;
const int Cheese = 3;

// constant calibration
int sensitivity = 200; // the lower the faster sensors are adapting
int minInterval[4];
int sensorValue[4];
int calibratedValue[4];
int maxValue[4];


void setup() {
  
  for(int i = 0; i<4; i++) {
    // set the Interval that is used to trigger a sound
    minInterval[i] = 20;
    // calibrate inputs
    calibratedValue[i] = touchRead(touchPin[i]);
    // turn on the output
    pinMode(led[i], OUTPUT);
  }
   
  // Configure the pushbutton pins for pullups.
  // Each button should connect from the pin to GND.
  pinMode(12, INPUT_PULLUP);

  // Audio connections require memory to work.  For more
  // detailed information, see the MemoryAndCpuUsage example
  AudioMemory(10);


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

  // se envelope defaults here, if you use the envelope follower
  //envelope.delay(0);
  //envelope.attack(1);
  //envelope.hold(1000);
  //envelope.decay(5);
  // noteOff is not used currently: sustain is on Audio-Level 0
  //envelope.sustain(0);
  //envelope.release(1);

  // check the input values on the serial monitor of Arduino IDE
  Serial.begin(9600);
}

// function to play a file, select player and audio data
void playTune(int tuneNr, const unsigned int* data) {
  sensorValue[tuneNr] = 0;
  for(int counter = 0; counter < samples; counter ++) {
    sensorValue[tuneNr] += touchRead(touchPin[tuneNr]);
  }
  sensorValue[tuneNr] /= samples;

  // slowly calibrate sensors to context
  calibratedValue[tuneNr] = ((sensitivity * calibratedValue[tuneNr]) + sensorValue[tuneNr])/(sensitivity + 1);
  
  sensorValue[tuneNr] -= calibratedValue[tuneNr];

    if((sensorValue[tuneNr] >= minInterval[tuneNr]) && !isPlayingNow[tuneNr]) {
      Serial.println(isPlayingNow[tuneNr]);
      isPlayingNow[tuneNr] = true;
      player[tuneNr].play(data);

      // use only if you patched the envelope
      //envelope.noteOn();

      digitalWrite(led[tuneNr], HIGH);

    } else if (sensorValue[tuneNr] < minInterval[tuneNr]) {
      isPlayingNow[tuneNr] = false;

      // use only if you patched the envelope
      //envelope.noteOff();

      digitalWrite(led[tuneNr], LOW);
    }
}

// select data for effects and filters, chose sensor
float getSensorValue(int tuneNr){
  sensorValue[tuneNr] = 0;
  for(int counter = 0; counter < samples; counter ++) {
    sensorValue[tuneNr] += touchRead(touchPin[tuneNr]);
  }
  sensorValue[tuneNr] /= samples;
  calibratedValue[tuneNr] = ((sensitivity * calibratedValue[tuneNr]) + sensorValue[tuneNr])/(sensitivity + 1);

  if(sensorValue[tuneNr] > calibratedValue[tuneNr]){
    sensorValue[tuneNr] -= calibratedValue[tuneNr];
  } else {
    sensorValue[tuneNr] = 0;
  }

  if(sensorValue[tuneNr] > maxValue[tuneNr]) {
    maxValue[tuneNr] = sensorValue[tuneNr];
  }
  float value = ((float) sensorValue[tuneNr])/ ((float) maxValue[tuneNr]);
  analogWrite(led[tuneNr], pow(value, 2.3) * 1024);
  Serial.print("Pin Nr ");
  Serial.print(tuneNr);
  Serial.print(": ");
  Serial.println(value);
  return value;
}

void loop() {
  if ( millis() % 10 == 0) {
    playTune(Coconut, AudioSampleTig);
    playTune(Banana, AudioSampleSch);
    playTune(Sausage, AudioSampleHo);
//    playTune(Cheese, AudioSampleBumm);
//    getSensorValue(Coconut);
//    getSensorValue(Banana);
//    getSensorValue(Sausage);

// use Cheese for filter effect
    float setFrequency = getSensorValue(Cheese) * 8000 + 30;
    biquad.setHighpass(0, setFrequency, 0.5);
    biquad.setLowpass(1, setFrequency + 200, 0.5);

// use Cheese for envelope
//      float setHold = 300 - (getSensorValue(Cheese) * 300);
//      envelope.hold(setHold);
  }

  // Update all the button objects
  button0.update();

  if (button0.fallingEdge()) {
    player[4].play(AudioSampleBumm);
  }

}

