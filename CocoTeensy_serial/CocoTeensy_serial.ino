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
int led1 = 3;
int led2 = 4;
int led3 = 5;
int led4 = 6;
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
  
  if(capValue1<=0) capValue1 = 0;
  if(capValue2<=0) capValue2 = 0;
  if(capValue3<=0) capValue3 = 0;
  if(capValue4<=0) capValue4 = 0;
  
  if (capValue1>=1023) capValue1 = 1023;
  if (capValue2>=1023) capValue2 = 1023;
  if (capValue3>=1023) capValue3 = 1023;
  if (capValue4>=1023) capValue4 = 1023;
  
  if(capValue1>=1023) capValue1 = 1023;
  Serial.print("V1 ");
  Serial.print(capValue1/4);
  Serial.print(" V2 ");
  Serial.print(capValue2/4);
  Serial.print(" V3 ");
  Serial.print(capValue3/4);
  Serial.print(" V4 ");
  Serial.print(capValue4/4);
  Serial.println();
  //delay(2); 
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
}
