#include <SoftwareSerial.h>
#include <ArduinoJson.h>
#include "secrets.h"


//Wifi
SoftwareSerial espSerial(2, 3); //RX, TX

const String server = "192.168.1.215";
String path = "/test";

int resetPin = 2; // Connect ESP-01 RST to pin 2


void setup() {
  pinMode(resetPin, OUTPUT);
  digitalWrite(resetPin, HIGH); // Start high to not reset

  resetESP();

  Serial.begin(115200);
  espSerial.begin(115200);
  delay(2000);

  connectToWifi();
  Serial.println("Connected to WIFI");

}

void loop() {
  if ( espSerial.available() )   {  Serial.write( espSerial.read() );  }

  sendGET();
  delay(50000);

}

void resetESP(){
  digitalWrite(resetPin, LOW);  // Pull low to reset
  delay(100);                   // Wait for 100ms
  digitalWrite(resetPin, HIGH); // Release reset

}

void connectToWifi(){
  sendCommand("AT+RST", 1000);
  sendCommand("AT+CWMODE=1", 1000);
  sendCommand("AT+CWJAP=\""+ ssid + "\",\"" + password + "\"", 10000);
  espSerial.print("AT+CIFSR");
}

void sendCommand(String command, int timeout) {
  String response = "";
  espSerial.print(command);
  long int time = millis();
  while ((time + timeout) > millis()) {
    while (espSerial.available()) {
      char c = espSerial.read();
      response += c;
    }
  }
  Serial.println("Command: ");
  Serial.print(command);
  Serial.print(" -> Response: ");
  Serial.print(response);

}

void sendGET() {
  // Send HTTP GET request
  sendCommand("AT+CIFSR", 1000);
  sendCommand("AT+CIPSTART=\"TCP\",\"192.168.1.215\",3000", 2000);
  delay(1000);
  sendCommand("AT+CIPSEND=46", 2000); // 18 is the length of the GET request below
  delay(1000);
  Serial.println("Next is the get request...");
  sendCommand("GET /test HTTP/1.1\r\nHost: 192.168.1.215\r\n\r\n", 10000);
}
