import board
import digitalio
import adafruit_ssd1306
from PIL import Image, ImageDraw, ImageFont
from time import sleep, time

oled_reset = digitalio.DigitalInOut(board.D4)

i2c = board.I2C()

oled = adafruit_ssd1306.SSD1306_I2C(128, 64, i2c, addr=0x3C, reset=oled_reset)


width = oled.width
height = oled.height
fontXL = ImageFont.truetype("/home/fabmougou/Documents/rfidspotify/fonts/Circular-Black.ttf", 25)
fontL = ImageFont.truetype("/home/fabmougou/Documents/rfidspotify/fonts/Circular-Black.ttf", 18)
fontS = ImageFont.truetype("/home/fabmougou/Documents/rfidspotify/fonts/Circular-Black.ttf", 13)
fontTriangle = ImageFont.truetype("/home/fabmougou/Documents/rfidspotify/fonts/Circular-Black.ttf", 34)

def DisplayTrack(track, artist):
    image = Image.new("1", (width, height))
    draw = ImageDraw.Draw(image)
    
    oled.fill(0)
    oled.show()
    
    draw.text(
        (0, -8),
        '__________________________',
        font=fontL,
        fill=255,
    )

    draw.text(
        (0, 15),
        track,
        font=fontL,
        fill=255,
    )
    
    draw.text(
        (0,35),
        artist,
        font=fontS,
        fill=255,
    )
    
    draw.text(
        (0, 43),
        '__________________________',
        font=fontL,
        fill=255,
    )

    oled.image(image)
    oled.show()
    

def DisplayPause():
    image = Image.new("1", (width, height))
    draw = ImageDraw.Draw(image)
    
    oled.fill(0)
    oled.show()
    
    draw.text(
        (0, -8),
        '__________________________',
        font=fontL,
        fill=255,
    )

    draw.text(
        (0, 25),
        'PAUSED I',
        font=fontXL,
        fill=255,
    )
    
    draw.text(
        (99, 22),
        ' >',
        font=fontTriangle,
        fill=255,
    )
    
    draw.text(
        (0, 43),
        '__________________________',
        font=fontL,
        fill=255,
    )

    oled.image(image)
    oled.show()

    


