#include <Wire.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <MFRC522.h>

//Display
#define OLED_RESET 4
Adafruit_SSD1306 display(OLED_RESET);
String songTitle = "Song Title";
String artists = "Artists";

//Keypad
const int AD_PIN = A0; 
int lastButton = 0;

//RFID
#define RST_PIN 9  
#define SS_PIN 10  
MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  SPI.begin();      // Init SPI bus
  mfrc522.PCD_Init();   // Init MFRC522

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
    for (;;);
  }
  display.clearDisplay();
}

void loop() {

  // reply only when you receive data:
  if (Serial.available() > 0) {
    String data = Serial.readString(); // Read until newline or your chosen delimiter
    int delimiterIndex = data.indexOf('#'); // Replace ',' with your delimiter
    songTitle = data.substring(0, delimiterIndex);
    artists = data.substring(delimiterIndex + 1);
  }

  handleKeypad();
  handleDisplay();
  handleRFID();
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
  int button = buttonFromValue(adValue);

  if (button != lastButton && button != 0) {
    lastButton = button;
    Serial.print(lastButton);
    delay(10);
    Serial.println("#");

  }
}

void handleDisplay() {
  display.clearDisplay();

  display.setTextSize(1);
  display.setTextColor(WHITE);

  display.setCursor(0, 0);
  display.println(songTitle);

  display.setCursor(0, 16);
  display.println(artists);

  display.display();

  delay(100);  // Optional delay for stability
}

void handleRFID(){
  if (mfrc522.PICC_IsNewCardPresent()){

    if (!mfrc522.PICC_ReadCardSerial()) return;
    for (byte i = 0; i < mfrc522.uid.size; i++){
      Serial.print(mfrc522.uid.uidByte[i], HEX);
      mfrc522.PICC_HaltA();
    }
    Serial.print("#");
  }
}

