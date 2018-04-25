// Get Library
var mqtt = require('mqtt')

// Use my cloudMQTT credentials
var client = mqtt.connect('mqtt://m10.cloudmqtt.com:17959', {
  username: "vbrreqip",
  password: "eSSF24dYzeCD"
})

// When I connected, do something
client.on('connect', function () {
  console.log("Connected to MQTT.")

  client.subscribe('web')

  setInterval(function(){
    client.publish('device', 'hey im the device')
  }, 1000)
})


client.on('message', function (topic, message) {
  if (topic === 'web') {
    console.log("I have a message: " + message.toString())
    // save message DB
  } else {
    console.log("IDK what to do")
  }
})
