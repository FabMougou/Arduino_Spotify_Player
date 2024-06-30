#include <Wire.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

//Display
#define OLED_RESET 4
Adafruit_SSD1306 display(OLED_RESET);

//Keypad
const int AD_PIN = A0; 
int lastButton = 0;

void setup() {
  Serial.begin(9600);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
    for (;;);
  }
  display.clearDisplay();
}

void loop() {


  handleKeypad();
  handleDisplay();
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

void handleKeypad(){
  int adValue = analogRead(AD_PIN);
  delay(100);
  int button = buttonFromValue(adValue);

  if (button != lastButton && button != 0) {
    lastButton = button;
    Serial.println(lastButton);
  }
}

void handleDisplay(){
  display.clearDisplay();

  // Example: Display playback status
  display.setCursor(0, 0);
  display.println("Now Playing:");
  display.setTextSize(1);
  display.setCursor(0, 16);
  display.println("Song Title");
  display.display();
  delay(1000); // Update display every second
}

