/* Thingspace.io client for TI LaunchPad CC3200-LAUNCHXL
/** Instructions:
/***  Update WiFi settings and thingspace device ID (e.g. thing-name) in Settings.h
/***  Compile and upload to board
/***  Sign-up / Log-In to Verizon Thingspace Develop https://thingspace.verizon.com/developer/
/***  Once logged-in, visit the CC3200-LAUNCHXL demo dashboard at https://freeboard.thingspace.io/board/CwbCJf 
*/

// Core library for code-sense - IDE-based
#if defined(ENERGIA) // LaunchPad specific
#   include "Energia.h"
#else // error
#   error Platform not defined
#endif // end IDE

// Include application, user and local libraries
#ifndef __CC3200R1M1RGC__
// Do not include SPI for CC3200 LaunchPad
#include <SPI.h>
#endif
#include <WiFi.h>

/// Set network name (SSID), network password, 
/// and thingspace.io Thing Name in Settings.h
#include "Settings.h"

#include <Wire.h>
#include "Adafruit_TMP006.h"
#include <BMA222.h>

/* Wifi client library */
WiFiClient client;

/* last time a get request is sent to the server, in milliseconds */
unsigned long lastReceivedTime = 0;        
unsigned long lastSentTime = 0;        

/* string to store data retrieved from server */
String received_data_string;

/* Thingspace.io receive channel suffix (Default: '-send') */
String thing_name_receive = thing_name + "-send";

// Sensor objects
BMA222 mySensor;
float x = 0;
float y = 0;
float z = 0;
float pitch = 0;
float roll = 0;
float maxTilt = 0;

Adafruit_TMP006 tmp006(0x41);
float tempc = 0;

// Signal strength
long rssi = 0;

// LaunchPad user buttons
const int button1Pin = PUSH1;
int button1State = 0;
const int button2Pin = PUSH2;
int button2State = 0;

// WiFi library uses Green and Yellow LEDS, so we have
// only red available for user interaction
String red_led_state;

void setup()
{
  
  pinMode(RED_LED, OUTPUT); 
  pinMode(YELLOW_LED, OUTPUT); 
  pinMode(GREEN_LED, OUTPUT); 
  digitalWrite(RED_LED, LOW);   
  digitalWrite(YELLOW_LED, LOW);   
  digitalWrite(GREEN_LED, LOW); 
  
  pinMode(button1Pin, INPUT_PULLUP); 
  pinMode(button2Pin, INPUT_PULLUP); 
  
  //Open a serial terminal with the PC for debugging
  Serial.begin(115200);
  /* attempt to connect to Wifi network */
  Serial.print("Attempting to connect to Network named: ");
  /* print the network name (SSID) */
  Serial.println(ssid); 
  /* connect to WPA/WPA2 network. Change this line if using open or WEP network */
  WiFi.begin(ssid, password);
  while ( WiFi.status() != WL_CONNECTED) {
    /* print dots while we wait to connect */
    Serial.print(".");
    delay(300);
  }
  
  Serial.println("\nYou're connected to the network");
  Serial.println("Waiting for an ip address");
  
  /* wait for an IP address */
  while (WiFi.localIP() == INADDR_NONE) {
    /* print dots while we wait for an ip address */
    Serial.print(".");
    delay(300);
  }

  Serial.println("\nIP Address obtained");
  /* connected and IP address obtained. Print the WiFi status */
  printWifiStatus();
  
  // Signal strenght
    rssi = WiFi.RSSI();
    Serial.print("Signal (RSSI) ");
    Serial.print(rssi);
    Serial.println(" dBm");
    
    Serial.print("Thing Name: ");
    Serial.println(thing_name);
  
  /* request a permanent connection to the server */
  connection_request();
  
  //Accel. setup
  mySensor.begin();
  
  //TMP006 setup
  tmp006.begin();
  
}

void loop()
{
if (true == read_received_data()) {
    /* check received data */
    check_received_data();
  }
  else
  {
    /* no data. Do nothing */
  }

  /* if REQUEST_INTERVAL milliseconds have passed since your last connection,
     then connect again and send data */
  if (millis() - lastReceivedTime > REQUEST_INTERVAL) {
    /* send a get request */
    get_request();
  }
  else if (millis() - lastSentTime > REQUEST_INTERVAL) {
    send_dweet();
  }
  else {
    /* do nothing and wait */
  }  
}


/* function to connect to the server */
void connection_request() {
  /* close any connection before send a new request.
     This will free the socket on the WiFi shield */
  client.stop();

  Serial.println("connecting...");
  /* if there's a successful connection */
  if (client.connect(TARGET_SERVER, HTTP_PORT)) {
    /* connection request succeed */
    Serial.println("connected!");
  }
  else {
    /* connection request failed */
    Serial.println("connection failed");
  }
}

/* function to send data to the server */
void send_dweet() {
  
  checkSensors();
  /* send get request */
  client.print("GET /dweet/for/");
  client.print(thing_name);
  client.print("?accel_x=");
  client.print(x);
  client.print("&accel_y=");
  client.print(y);
  client.print("&accel_z=");
  client.print(z);
  client.print("&pitch=");
  client.print(pitch);
  client.print("&roll=");
  client.print(roll);
  client.print("&max_tilt=");
  client.print(maxTilt);
  client.print("&temp_c=");
  client.print(tempc);  
  client.print("&signal_strength=");
  client.print(rssi);
  client.print("&button_1=");
  client.print(button1State);  
  client.print("&button_2=");
  client.print(button2State);  
  client.print("&red_led_state=");
  client.print(red_led_state);  
  client.println(" HTTP/1.1");
  client.println("Host: thingspace.io");
  client.println("Connection: Keep-Alive");
  client.println();

  /* note the time that the connection was made */
  lastSentTime = millis();
}

/* function to check for commands sent from server / dashboard
  to the board.  */
void get_request() {
  /* send get request */
  client.print("GET /get/latest/dweet/for/");
  client.print(thing_name_receive);
  client.println(" HTTP/1.1");
  client.println("Host: thingspace.io");
  client.println("Connection: Keep-Alive");
  client.println();

  /* note the time that the connection was made */
  lastReceivedTime = millis();
}


/* function to read eventual received data */
boolean read_received_data() {
  boolean valid_data = false;
  /* if there is incoming data from the connection
     then read it */
  if( client.available() > 0 ) {
    Serial.println("Received data:");
    Serial.println("______________");

    do {
      char c = client.read();
      received_data_string += c;
    } while (client.available());
    /* print data for debugging */
    Serial.println(received_data_string);
    /* print 2 blank lines */
    Serial.println("______________");
    Serial.println("\n\n");
    /* valid data received */
    valid_data = true;
  }
  else {
    /* do nothing */
  }
  
  return valid_data;
}


/* function to parse commands from received data */
void check_received_data()
{
  int string_index;
  int data_length;
  
  /* get data length */
  data_length = received_data_string.length();
  /* check if the message starts as expected */
  if (received_data_string.startsWith("HTTP/1.1 200 OK")) {
    string_index = received_data_string.indexOf("this");
    if (string_index < data_length) {
      /* check if get request has succeeded */
      if (received_data_string.startsWith("succeeded", string_index + 7)) {
        string_index = received_data_string.indexOf("thing");
        if (string_index < data_length) {
          if (received_data_string.startsWith(thing_name_receive, string_index + 8)) {
            string_index = received_data_string.indexOf("set_led");
            if (string_index < data_length) {
              /* check the set_led field */
              if (received_data_string.startsWith("on", string_index + 10)) {
                /* turn the led on */
                Serial.println("INFO: Successfully received and parsed set_led command");
                Serial.println("Turning on RED_LED");
                digitalWrite(RED_LED, HIGH);
                Serial.println("\n\n");

              }
              else if (received_data_string.startsWith("off", string_index + 10)) {
                /* turn the led off */
                Serial.println("INFO: Successfully received and parsed set_led command");
                Serial.println("Turning off RED_LED");
                digitalWrite(RED_LED, LOW);
                Serial.println("\n\n");
              }
              else {
                /* invalid "set_led" field value. Do nothing */
                Serial.println("ERROR: set_led value invalid");
              }
            } 
            else {
              /* unable lo find the "set_led" field. Do nothing */
              Serial.println("ERROR: set_led field not found");
            }
            
          }
          else {
            /* the "thing" field is not as expected. Do nothing */
          }
        }
        else {
          /* unable lo find the "thing" field. Do nothing */
        }
        
      }
      else {
        /* nothing has been sent to receive-channel yet, or request has failed or an invalid field has been received. Do nothing */
        string_index = received_data_string.indexOf("because");
        if (string_index < data_length)
        {
          if (received_data_string.startsWith("we couldn't find this",string_index + 10))
          {
            Serial.print("INFO: Nothing has been sent to receive channel: ");
            Serial.println(thing_name_receive);
          }
          else {
            Serial.println("ERROR: Thingspace.io: 'this->failed' for some other reason ");
          }
        }
      }
    } 
    else {
      /* unable lo find the "this:" field. Do nothing */
    }
    
  }
  else {
    /* invalid response. Do nothing */
    Serial.println("ERROR: invalid response from server");
  }
  
  /* clean received data string */
  received_data_string.remove(0);
}

void checkSensors() {
  Serial.println("Sending sensor data:");
  Serial.println("______________");
  x = mySensor.readXData()/65.0;
  Serial.print("Accel X: ");
  Serial.print(x);

  y = mySensor.readYData()/65.0;
  Serial.print(", Y: ");
  Serial.print(y);

  z = mySensor.readZData()/65.0;
  Serial.print(", Z: ");
  Serial.println(z);

  // Calculate pitch and roll. Find the maximum tilt angle.
  pitch = atan(x / sqrt(y * y + z * z))*180;
  roll = atan(y / sqrt(x * x + z * z))*180;
  maxTilt =
    max(abs(roll), abs(pitch)) / 3.14159;
  Serial.print("Pitch: ");
  Serial.print(pitch);
  Serial.print(" Roll: ");
  Serial.print(roll);
  Serial.print(" MaxTilt: ");
  Serial.println(maxTilt); 
  
  tempc = tmp006.readObjTempC();
  Serial.print("Object Temperature: "); 
  Serial.print(tempc); 
  Serial.println("*C");
  
  rssi = WiFi.RSSI();
  Serial.print("Signal Strength (RSSI): ");
  Serial.print(rssi);
  Serial.println(" dBm");
  
  button1State = digitalRead(button1Pin);
  Serial.print("Push Button 1: ") ;
  Serial.println(button1State);
  button2State = digitalRead(button2Pin);
  Serial.print("Push Button 2: ") ;
  Serial.println(button2State);
    
  if (digitalRead(RED_LED)){
     red_led_state = "on"; 
  } 
  else {
     red_led_state = "off"; 
  }
  Serial.print("RED_LED State: ");
  Serial.println(red_led_state);
  Serial.println("______________");
  Serial.println("\n\n");

}

/* function to print WiFi status */
void printWifiStatus() {
  /* print the SSID of the network you're attached to */
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  /* print your WiFi IP address */
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
}

