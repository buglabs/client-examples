#ifndef Settings_h
#define Settings_h

#define TARGET_SERVER        "thingspace.io"
#define HTTP_PORT            80
/* Frequency of sending data */
#define REQUEST_INTERVAL    (1500L)


/*** 
 *** UPDATE VALUES IN THE FOLLOWING SECTION BEFORE UPLOADING SKETCH TO BOARD 
 ***/

/* Thingspace.io Thing Name */
String thing_name = "";

/* WiFi Network Name (SSID) */
char ssid[] = "";

/* WiFi Network Password */
char password[] = "";

#endif
