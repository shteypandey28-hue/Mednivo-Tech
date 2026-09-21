import sys
import subprocess

try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

# Open the white background image
img = Image.open('/Users/shrey/.gemini/antigravity-ide/brain/1ef0ddb8-90b1-4c1d-b433-7a2c54743475/.user_uploaded/media_1788953835930.png')
width, height = img.size

# The taglines are at the bottom. We only want the top part containing 'M Mednivo'
# Let's crop the top 55% of the image (or dynamically trim based on whitespace, but a fixed crop is safer).
# Looking at the original image, the taglines start below the middle. 
crop_box = (0, 0, width, int(height * 0.58))
cropped_img = img.crop(crop_box)

cropped_img.save('/Users/shrey/Desktop/Doctor prescription help software/frontend/public/logo.png')
print("Cropped logo saved successfully!")
