from PIL import Image
import os

img_path = "/Users/shrey/.gemini/antigravity-ide/brain/1ef0ddb8-90b1-4c1d-b433-7a2c54743475/.user_uploaded/media_1788935683996.png"
img = Image.open(img_path)

# Crop the clean logo (just the M and Mednivo text) from the white section
# Looking at the image, the top left section has the logo with text.
# Let's crop just the "M" icon from the white section to use as a standalone logo icon.
# The image is 1200x800 roughly.
# Top left logo icon (M): ~ x: 150-350, y: 100-380
icon_box = (150, 110, 360, 370)
icon_img = img.crop(icon_box)

# Make background transparent if it's white
icon_img = icon_img.convert("RGBA")
datas = icon_img.getdata()
new_data = []
for item in datas:
    # Change all white (also shades of whites)
    if item[0] > 240 and item[1] > 240 and item[2] > 240:
        new_data.append((255, 255, 255, 0))
    else:
        new_data.append(item)
icon_img.putdata(new_data)

out_dir = "/Users/shrey/Desktop/Doctor prescription help software/frontend/public"
os.makedirs(out_dir, exist_ok=True)
icon_img.save(os.path.join(out_dir, "logo-icon.png"))
print("Saved logo-icon.png")

# Also crop the full logo with text (M + Mednivo)
full_box = (150, 110, 900, 370)
full_img = img.crop(full_box)
full_img = full_img.convert("RGBA")
datas2 = full_img.getdata()
new_data2 = []
for item in datas2:
    if item[0] > 240 and item[1] > 240 and item[2] > 240:
        new_data2.append((255, 255, 255, 0))
    else:
        new_data2.append(item)
full_img.putdata(new_data2)
full_img.save(os.path.join(out_dir, "logo-full.png"))
print("Saved logo-full.png")
