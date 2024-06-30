#include <Wire.h>

//Keypad
const int AD_PIN = A0; 
int lastButton = 0;

void setup() {
  Serial.begin(9600);

}

void loop() {
  int adValue = analogRead(AD_PIN);
  delay(100);
  int button = buttonFromValue(adValue);

  if (button != lastButton && button != 0) {
    lastButton = button;
    Serial.println(lastButton);
  }


}


byte buttonFromValue(int adValue) {
  if (adValue > 300 && adValue < 500){
    return 1;    
  }

  if (adValue > 500 && adValue < 700){
    return 2;    
  }

  if (adValue > 700 && adValue < 900){
    return 3;   
  }

  if (adValue > 900){
    return 4;
  }

  return 0;
}
