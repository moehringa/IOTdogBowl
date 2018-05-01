/**
 * Waterbowl Sensor
 */
 
 #include <ESP8266WiFi.h>
 #include <PubSubClient.h>
 using namespace std;

 // WiFi credentials.
//const char* WIFI_SSID = "ZyXEL45800";
//const char* WIFI_PASS = "47231A5C86";
//const char* device_id = "waterbowl9001";

const char* WIFI_SSID = "xavierguest";
const char* WIFI_PASS = "";
const char* device_id = "";

// MQTT credentials.
const char* mqtt_server = "m10.cloudmqtt.com";
const int mqtt_port = 14665;
const char* mqtt_user = "dkambmyb";
const char* mqtt_password = "RT32-M2D4Yqn";

#define in_topic "waterbowl9001/statusIn"
#define out_topic "waterbowl9001/statusOut"
#define waterLevel "waterbowl9001/waterLevel"

int digitalPin;

WiFiClient espClient;
PubSubClient client(espClient);

void callback(char* topic, byte* payload, unsigned int length){
  Serial.print("Message arrived in topic: ");
  Serial.print(topic);
  Serial.println();
  Serial.print("Message: ");
  for(int i=0; i<length; i++){
    Serial.print((char)payload[i]);
    }
    Serial.println();
    Serial.println("---------------------");
  }

void connect() {

  // Connect to Wifi.
  Serial.println();
  Serial.println();
  Serial.println("Connecting to ");
  Serial.println(WIFI_SSID);

   // WiFi fix: https://github.com/esp8266/Arduino/issues/2186
  WiFi.persistent(false);
  WiFi.mode(WIFI_OFF);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.print(WiFi.localIP());

  // Connect to MQTT.
  client.setServer(mqtt_server, mqtt_port); 
  client.setCallback(callback);
  
  Serial.println();
  Serial.println("Connecting to CloudMQTT...");

  while(!client.connected()) {
    delay(500);
    
    if(client.connect(device_id, mqtt_user, mqtt_password)){
      Serial.println("Connected to CloudMQTT");
      Serial.println();
      Serial.println("Currently reading waterbowl Status.");
      }
      else{
        Serial.println("failed with state ");
        Serial.println(client.state());
        }
      
      Serial.print(".");   
  }
  
}

void setup() {
  Serial.begin(115200);
  pinMode(digitalPin, INPUT);
  Serial.println("Waterbowl Moisture Sensor");
  Serial.println("--------------------------------------");
  delay(2000);

  connect();

}

void loop() {

  
  bool toReconnect = false;

  if(WiFi.status() != WL_CONNECTED) {
    Serial.println("Disconnected from WiFi");
    toReconnect = true;
  }

  if(!client.connected()) {
    Serial.println("Disconnected from CloutMQTT");
    toReconnect = true;
  }

  if(toReconnect) {
    connect();
  }
  
  String stat = "";
  int level = analogRead(A0)/10;

   if(level >= 90){
    stat = "DRY";
    
    }
   else{
    stat = "Filled";
    
    }
   
   Serial.print("Waterbowl Status: ");
   Serial.print(stat);
   Serial.println();
   Serial.print("Waterbowl Level: ");
   Serial.print(level);
   Serial.println();

   delay(1000);

  client.loop();

  string lev = convertInt(level);
  
  client.publish(out_topic, stat.c_str());
  client.publish(waterLevel, lev.c_str());
  delay(1000);
  client.subscribe(out_topic);
  client.subscribe(waterLevel);
  delay(1000);
}

string convertInt(int number)
{
    if (number == 0)
        return "0";
    string temp="";
    string returnvalue="";
    while (number>0)
    {
        temp+=number%10+48;
        number/=10;
    }
    for (int i=0;i<temp.length();i++)
        returnvalue+=temp[temp.length()-i-1];
    return returnvalue;
}



