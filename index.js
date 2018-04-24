// Get Library
var mqtt = require('mqtt')
var fs = require('fs');
var express = require('express')
var app = express()
var twilio = require('twilio')('ACc9bfbf4b54d76f023ef9eea3e59b850b','135d85204d462c6314281db43c8e9e2b')
// Use my cloudMQTT credentials
var client = mqtt.connect('mqtt://m10.cloudmqtt.com:14665', {
  username: "dkambmyb",
  password: "RT32-M2D4Yqn"
})

//set variables for waterbowl status
var previousStatus = 'DRY'
var currentStatus = 'DRY'
var currentLevel = 10

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/gaugePage.html', {level: currentLevel})
})
// When I connected, do something
client.on('connect', function () {
  console.log("Connected to MQTT.")

  client.subscribe('waterbowl9001/statusOut')
})

//Log the status and send sms if status changes
client.on('message', function (topic, message) {
  if (topic === 'waterbowl9001/statusOut') {
    currentStatus = message.toString()
    console.log("I have  a message: " + currentStatus)

    client.publish('waterbowl9001/statusIn', 'Status Received')
    // send sms message
    if(previousStatus != currentStatus){
      previousStatus = currentStatus
      twilio.messages
        .create({
          body: 'Waterbowl Status: '+currentStatus,
          to: '+15132567474',
          from: '+18127479763',
        })
        .then(message => process.stdout.write(message.sid));
    }

  } else {
    console.log("IDK what to do")
  }
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
