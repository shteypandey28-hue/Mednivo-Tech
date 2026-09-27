from PIL import Image

def crop_favicon(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    
    # Get the bounding box of non-transparent pixels
    bbox = img.getbbox()
    
    if bbox:
        # bbox is (left, upper, right, lower)
        cropped_img = img.crop(bbox)
        
        # We want it to remain square for the favicon so it doesn't squish.
        # Find the max dimension
        w, h = cropped_img.size
        size = max(w, h)
        
        # Create a new transparent square image
        new_img = Image.new("RGBA", (size, size), (255, 255, 255, 0))
        
        # Paste the cropped image into the center
        offset_x = (size - w) // 2
        offset_y = (size - h) // 2
        new_img.paste(cropped_img, (offset_x, offset_y))
        
        # Save as favicon.png
        new_img.save(output_path, "PNG")
        print(f"Successfully cropped and created {output_path}!")
    else:
        print("Image is entirely transparent.")

if __name__ == "__main__":
    crop_favicon("frontend/public/logo-icon.png", "frontend/public/favicon.png")
