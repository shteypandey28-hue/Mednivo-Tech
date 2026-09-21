import sys
from PIL import Image

def convert_black_to_white(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        r, g, b, a = item
        # If the pixel is dark (text is black/dark blue) and opaque
        # The blue/green M icon has high values in B and G. 
        # Let's say if R, G, B are all below 80, it's dark text.
        # Actually, let's check the lightness.
        # Mednivo text in the image is probably #1E232E or something dark.
        if a > 0 and r < 100 and g < 100 and b < 100:
            new_data.append((255, 255, 255, a))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print("Logo processed successfully!")

if __name__ == "__main__":
    convert_black_to_white(sys.argv[1], sys.argv[2])
