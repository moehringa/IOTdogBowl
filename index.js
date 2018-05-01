// Get Library
var mqtt = require('mqtt')
var fs = require('fs');
var express = require('express')
var app = express()

//////////////////////////////////////////
//Put your twilio information here
var twilio = require('twilio')('key','key')
///////////////////////////////////////////
///////////////////////////////////////////

app.set('view engine', 'ejs')

// Use my cloudMQTT credentials
var client = mqtt.connect('YOUR_SERVER:YOUR_PORT', {
  ////////////////////////////////////////////
  //////////////////////////////////////////
  /////////COMPLETE THESE MQTT FIELDS/////////
  ////////////////////////////////////////////
  //////////////////////////////////////////
  username: "YOUR USERNAME FOR MQTT",
  password: "YOUR PASSWORD FOR MQTT"
})

//set variables for waterbowl status
var previousStatus = 'DRY'
var currentStatus = 'DRY'
var currentLevel

//render the guage on the index page
app.get('/', function (req, res) {

  res.render('gauge', {
      level: currentLevel
  });
})

// When I connect, do something
client.on('connect', function () {
  console.log("Connected to MQTT.")

  //subscribe to the mqtt topics
  client.subscribe('waterbowl9001/statusOut')
  client.subscribe('waterbowl9001/waterLevel')
})

//Log the status and send sms if status changes
client.on('message', function (topic, message) {
  if(topic === 'waterbowl9001/waterLevel'){
    currentLevel = (100 - message.toString())
    console.log("Current Level: " +currentLevel)
    client.publish('waterbowl9001/statusIn', 'Status Received')
  }
  if (topic === 'waterbowl9001/statusOut') {
    currentStatus = message.toString()
    console.log("I have  a message: " + currentStatus)

    client.publish('waterbowl9001/statusIn', 'Status Received')
    // send sms message
    if(previousStatus != currentStatus){
      previousStatus = currentStatus
      twilio.messages
        .create({
          //////////////////////////////////////////
          //////////////////////////////////////////
          //////// COMPLETE THESE PHONE FIELDS ////
          //////////////////////////////////////////
          body: 'Waterbowl Status: '+currentStatus,
          to: 'YOUR PHONE NUMBER',
          from: 'YOUR TWILIO PHONE NUMBER',
          ////////////////////////////////////////////
        })
        .then(message => process.stdout.write('\n'+message.sid));
    }
  }
  else {
    console.log("IDK what to do")
  }
})

//port 3000 on localhost
app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
