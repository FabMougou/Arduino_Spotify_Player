#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN 9  // Arduino pin connected to RC522's RST pin
#define SS_PIN 10  // Arduino pin connected to RC522's SDA pin (used by SPI library)

MFRC522 mfrc522(SS_PIN, RST_PIN);  // Create MFRC522 instance

void setup() {
  Serial.begin(9600);
  SPI.begin();      // Init SPI bus
  mfrc522.PCD_Init();   // Init MFRC522
}

void loop() {
  if (mfrc522.PICC_IsNewCardPresent()){

    if (!mfrc522.PICC_ReadCardSerial()) return;
    for (byte i = 0; i < mfrc522.uid.size; i++){
      Serial.print(mfrc522.uid.uidByte[i], HEX);
      mfrc522.PICC_HaltA();
    }
    Serial.print("#");
  }
  delay(1000);
}