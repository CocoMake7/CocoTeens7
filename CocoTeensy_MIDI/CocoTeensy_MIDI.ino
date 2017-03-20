/*
  Blink
  Turns on an LED on for one second, then off for one second, repeatedly.
 
  This example code is in the public domain.
 */
 
// Pin 13 has an LED connected on most Arduino boards.
// Pin 11 has the LED on Teensy 2.0
// Pin 6  has the LED on Teensy++ 2.0
// Pin 13 has the LED on Teensy 3.0
// give it a name:
int led1 = 6;
int led2 = 5;
int led3 = 4;
int led4 = 3;
int pushButton = 12;
int Coconut = A4;
int Banana = A5;
int Sausage = A8;
int Cheese = A9;
int capValue1 = 0;
int capRef1 = 0;
int capValue2 = 0;
int capRef2 = 0;
int capValue3 = 0;
int capRef3 = 0;
int capValue4 = 0;
int capRef4 = 0;
int samples = 20;

int channel = 1;

bool note1_on, note2_on, note3_on, note4_on = false;

// the setup routine runs once when you press reset:
void setup() {                
  // initialize the digital pin as an output.
  pinMode(led1, OUTPUT); 
  pinMode(led2, OUTPUT); 
  pinMode(led3, OUTPUT); 
  pinMode(led4, OUTPUT); 
  capRef1 = touchRead(Coconut);
  capRef2 = touchRead(Banana);
  capRef3 = touchRead(Sausage);
  capRef4 = touchRead(Cheese);
  pinMode(pushButton, INPUT);
}

// the loop routine runs over and over again forever:
void loop() {

  for(int counter = 0; counter < samples; counter ++)
  {
  capValue1 += touchRead(Coconut) - capRef1;
  capValue2 += touchRead(Banana) - capRef2;
  capValue3 += touchRead(Sausage) - capRef3;
  capValue4 += touchRead(Cheese) - capRef4;
  }
  
  capValue1 /= samples;
  capValue2 /= samples;
  capValue3 /= samples;
  capValue4 /= samples;
  
  if (capValue1>=1023) capValue1 = 1023;
  if (capValue2>=1023) capValue2 = 1023;
  if (capValue3>=1023) capValue3 = 1023;
  if (capValue4>=1023) capValue4 = 1023;
 
  if(capValue1<=100) {
    capValue1 = 0;
    usbMIDI.sendNoteOff(60, 0, channel);
    note1_on = !note1_on;
  }
  else {
    usbMIDI.sendControlChange(66, capValue1/8, channel);
    if (!note1_on) {
      note1_on = !note1_on;
      usbMIDI.sendNoteOn(60, capValue1/8, channel);  // 60 = C4
      delay(2);
    }
  }
  
  if(capValue2<=100) {
    capValue2 = 0;
    usbMIDI.sendNoteOff(67, capValue2, channel);  // 67 = G4
    note2_on = !note2_on;
  }
  else{
    usbMIDI.sendControlChange(77, capValue2/8, channel);
    if (!note2_on) {
      note2_on = !note2_on;
      usbMIDI.sendNoteOn(67, capValue2/8, channel);  // 67 = G4
      delay(2);
    }
  }
 
  if(capValue3<=100) {
    capValue3 = 0;
    usbMIDI.sendNoteOff(74, capValue3, channel);  // 74 = D5
    note3_on = !note3_on;
  }
  else {
    usbMIDI.sendControlChange(88, capValue3/8, channel);
    if (!note3_on) {
      note3_on = !note3_on;
      usbMIDI.sendNoteOn(74, capValue3/8, channel);  // 74 = D5
      delay(2);
    } 
  }
  
  if(capValue4<=100) {
    capValue4 = 0;
    usbMIDI.sendNoteOff(81, capValue4, channel);  // 81 = A5
     note4_on = !note4_on;
  }
  else{
    usbMIDI.sendControlChange(99, capValue4/8, channel);
    if (!note4_on) {
       note4_on = !note4_on;
       usbMIDI.sendNoteOn(81, capValue4/8, channel);  // 81 = A5
       delay(2);
    }
  }
  
  // wait for a second
  analogWrite(led1, capValue1/4);    // turn the LED off by making the voltage LOW
  analogWrite(led2, capValue2/4);    // turn the LED off by making the voltage LOW
  analogWrite(led3, capValue3/4);    // turn the LED off by making the voltage LOW
  analogWrite(led4, capValue4/4);    // turn the LED off by making the voltage LOW
  //delay(20);               // wait for a second
  capValue1 = 0;
  capValue2 = 0;
  capValue3 = 0;
  capValue4 = 0;

  // if push button is pressed, send noteOff for all notes -> panic button ;)
  if (digitalRead(pushButton) == HIGH) {
    usbMIDI.sendNoteOff(60, 0, channel); 
    usbMIDI.sendNoteOff(67, 0, channel); 
    usbMIDI.sendNoteOff(74, 0, channel);
    usbMIDI.sendNoteOff(81, 0, channel);
    
  }
}
