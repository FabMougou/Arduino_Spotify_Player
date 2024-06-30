#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h>
#include <ArduinoHttpClient.h>
#include "secrets.h"

//Display
#define OLED_RESET 4
Adafruit_SSD1306 display(OLED_RESET);

//Wifi
SoftwareSerial ESP01(2, 3);
bool found = false;
int timeTaken = 0;


//Keypad
const int AD_PIN = A0; 
int lastButton = 0;


void setup() {
  Serial.begin(9600);
  ESP01.begin(115200);
  connectToWifi();
  initialiseDisplay();

}

void loop() {
  // put your main code here, to run repeatedly:

}

void connectToWifi(){
  sendCommand("AT+RST", 5, "OK");
  sendCommand("AT+CWMODE=1", 5, "OK");
  sendCommand("AT+CWJAP=\""+ ssid +"\",\""+ password +"\"",20,"OK");

}

void initialiseDisplay(){
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);

}

void sendCommand(String command, int maxTime, char readReplay[]){
  Serial.println("At command =>" + command);

  while(timeTaken < maxTime){
    ESP01.println(command);
    if (ESP01.find(readReplay)){
      found = true;
      break;
    }
    timeTaken++;
  }

  if(found == true){
    Serial.println("Command accepted");
    timeTaken = 0;
  }

  if(found == false){
    Serial.println("Command failed");
    timeTaken = 0;
  }

  found = false;

}
