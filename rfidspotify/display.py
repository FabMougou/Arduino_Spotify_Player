import board
import digitalio
import adafruit_ssd1306
from PIL import Image, ImageDraw, ImageFont

oled_reset = digitalio.DigitalInOut(board.D4)

i2c = board.I2C()

oled = adafruit_ssd1306.SSD1306_I2C(128, 64, i2c, addr=0x3C, reset=oled_reset)


width = oled.width
height = oled.height
image = Image.new("1", (width, height))


draw = ImageDraw.Draw(image)
font = ImageFont.truetype("/home/fabmougou/Documents/rfidspotify/fonts/Circular-Black.ttf", 15)

def DisplayText(text):
    oled.fill(0)
    oled.show()


    (draw_width, draw_height) = draw.textsize(text, font=font)
    draw.text(
        (0, 0),
        text,
        font=font,
        fill=255,
    )

    oled.image(image)
    oled.show()
    


