from PIL import Image

def fix_corners(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()
    
    # We want to find the dark background color.
    # Looking at a pixel near the top edge center should give us the background color
    w, h = img.size
    bg_color = img.getpixel((w//2, 5))
    
    # If the pixel is transparent, default to the dark color #121a2c
    if bg_color[3] < 255:
        bg_color = (18, 26, 44, 255) 
    
    new_data = []
    for item in data:
        # If the pixel is transparent or semi-transparent, fill it with the background color
        if item[3] < 255:
            # Simple alpha blending
            alpha = item[3] / 255.0
            r = int(item[0] * alpha + bg_color[0] * (1 - alpha))
            g = int(item[1] * alpha + bg_color[1] * (1 - alpha))
            b = int(item[2] * alpha + bg_color[2] * (1 - alpha))
            new_data.append((r, g, b, 255))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(out_path, "PNG")
    print(f"Fixed {img_path} -> {out_path}")

try:
    fix_corners("frontend/public/logo-icon.png", "frontend/public/logo-icon-sharp.png")
except Exception as e:
    print(e)
