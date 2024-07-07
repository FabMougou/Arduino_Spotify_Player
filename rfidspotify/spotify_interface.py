#!/usr/bin/env python
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from time import sleep, time
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
from mfrc522 import MFRC522
from datetime import datetime


DEVICE_ID="98bb0735e28656bac098d927d410c3138a4b5bca"
CLIENT_ID="f12e30f3795c4bbe9592050d8c2c8f04"
CLIENT_SECRET="d2d57cdd7fc04f25b435dab68be9ff77"
print('running spotify interface')

    
def spotifyAction(id):
    print('spotify performing action...')
    
    try:
        playback = sp.current_playback()
        
        if id == 'pause':
            if playback and playback['is_playing']:
                sp.pause_playback()
                print('playback paused, card removed')
            return
        
        elif id == 'play':
            if playback and not playback['is_playing']:
                sp.start_playback()
                print('playback resumed, card reinserted')
            return
    
        else:
            uri, albumName = cardDetails[id]
            sp.start_playback(device_id=DEVICE_ID, context_uri=uri)
            print("now playing:", albumName)
        
    except:
        print('invalid card')
        
        
    
    
scan_timeout = 4  # Timeout in seconds to ignore the same card

# Dictionary to store the last scan time for each card
last_scan_times = {}
last_scanned = ""
current_time = time()

cardDetails = {
    '5721142575324548176657394664551235072': ['spotify:album:7j6h4vC8tacAYvReQMHuR8', 'hugo: reimagined'],
    '5489506448031106719201091565248331264': ['spotify:album:7GYzQIMfdDWo2XC4BDLHPk', 'Fuzzybrain'],
    '6643361639059068272110762544130440704': ['spotify:album:2xOawu4iq9fwcdFNvGBTdl', "life's a beach"],
    '6552324914134410377072726411656052224': ['spotify:album:5kDmlA2g9Y1YCbNo2Ufxlz', "emails i can't send"],
    '6467083255476120881490069831319305728': ['spotify:playlist:5wZAfBSotlMHA6tfuh6MgT', "Jarv's 19th"],
    '6538483754762138416793709232906059264': ['spotify:playlist:7vL98ZMSvW5gHcpiVDTHKP', "hazel says listen"],
    '6526098963140413523043086667311234560': ['spotify:album:7eed9MBclFPjjjvotfR2e9', 'Nothing Happens'],
    '5455605683507080450067941653834907136': ['spotify:album:2r8yXie5ySfYgRuxmceSmf', 'How Beautiful Life Can Be'],
    '6329923774039741406028089430994075136': ['spotify:album:6wjryxtrKxzTZID9kyZUV5', "Yesterday's Gone"]
    
    }
    
while True:
    
    try:
        
        # Spotify Authentication
        sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=CLIENT_ID,
                                                        client_secret=CLIENT_SECRET,
                                                        redirect_uri="http://localhost:8080",
                                                        scope="user-read-playback-state,user-modify-playback-state"))
        #rfid reader
        reader = MFRC522()
        print("Waiting for scan")
        
        while True:
            
            # Transfer playback to the Raspberry Pi if music is playing on a different device
            #sp.transfer_playback(device_id=DEVICE_ID, force_play=False)
            
            status, _ = reader.MFRC522_Request(reader.PICC_REQIDL)
            if status != reader.MI_OK:
                
                current_time = time()
                try:
                    if current_time > last_scan_times[last_scanned] + scan_timeout:
                        spotifyAction('pause')
                        
                except:
                    print('ran exception')
                sleep(2)
                continue

            status, backData = reader.MFRC522_Anticoll()
            buf = reader.MFRC522_Read(0)
            reader.MFRC522_Request(reader.PICC_HALT)
        
            if buf:
                # Convert the list of bytes to a single integer
                serial_number = str(int.from_bytes(buf, byteorder='big'))
                print("id:", serial_number)
                
                current_time = time()
                #To prevent it from scanning again if in vicinity
                if serial_number in last_scan_times:
                    last_scan_time = last_scan_times[serial_number]
                    if current_time - last_scan_time < scan_timeout:
                        last_scan_times[serial_number] = current_time
                        continue
                
                if last_scanned == serial_number:
                    spotifyAction('play')
                    
                else:
                    last_scanned = serial_number 
                    last_scan_times[serial_number] = current_time
                    
                    
                        
                    spotifyAction(serial_number)
                
            
                
                
                        

    except Exception as e:
        print(e)
        pass

    finally:
        print("Cleaning  up...")
        GPIO.cleanup()
