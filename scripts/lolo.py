#!/usr/bin/env python
import sys
import os
import git
import shutil
from git import Repo

repoPath = "https://github.com/Funtronik/Ui5.git"
ui5folder = '/var/www/html/Ui5'

def deleteFirst():
    path = '/var/www/html'
    os.system("sudo chmod o+w /var/www")
    shutil.rmtree(path)
    os.makedirs(path)
            
def unpackFiles():
    dest = '/var/www/html'
    files = os.listdir(ui5folder)
    for f in files:
        shutil.move(ui5folder+"/"+f, dest)
    shutil.rmtree(ui5folder)

if os.path.isdir(ui5folder):
    deleteFirst()
    
    git.Git("/var/www/html").clone(repoPath)
    unpackFiles()
    print("Deleted and Imported")
else:
    deleteFirst()
    git.Git("/var/www/html").clone(repoPath)
    unpackFiles()
    print("Just Imported")


# //////////////////////////////////////////////////////////////////////

import mysql.connector
import paho.mqtt.client as mqtt
import json
import datetime

now = datetime.datetime.now()
 
MQTT_SERVER = "localhost"
MQTT_PATH = "MyHome/RoomTemperatureA"

mydb = mysql.connector.connect(
  host="localhost",
  user="luigi",
  passwd="raspberry",
  database="MyHome"
)
 
def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))

    client.subscribe(MQTT_PATH)
    client.publish("MyHome/RoomTemperatureQ")
 
def on_message(client, userdata, msg):
    print(msg.topic+" "+str(msg.payload))    
    j = json.loads(msg.payload)

    date = now.strftime("%Y.%m.%d")
    if len(str(now.minute)) == 1:
        time = str(now.hour) + ":0" + str(now.minute) + ":00"
    else:
        time = str(now.hour) + ":" + str(now.minute) + ":00"
    
    mycursor = mydb.cursor()

    sql = "INSERT INTO roomtemperatures (date, time, temp, hum) VALUES (%s, %s, %s, %s)"
    val = (date, time, j['Temp'], j['Hum'])
    mycursor.execute(sql, val)

    mydb.commit()
    print(mycursor.rowcount, "record inserted.")
    quit()
 
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
 
client.connect(MQTT_SERVER, 1883, 60)
client.loop_forever()
