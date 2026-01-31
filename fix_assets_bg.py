from PIL import Image
import os
import math

def remove_white_bg(input_path, output_path, threshold=200):
    try:
        print(f"Processing {input_path}...")
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()
        
        new_data = []
        for item in datas:
            # item is (R, G, B, A)
            r, g, b, a = item
            # Check if close to white
            if r > threshold and g > threshold and b > threshold:
                # Be aggressive with white background
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
        
        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Saved transparent image to {output_path}")
    except Exception as e:
        print(f"Failed to process {input_path}: {e}")

assets_dir = "/Users/minhhieuchau/Desktop/GameTieuYeuQuaiNuiLangLang/assets"
pig_path = os.path.join(assets_dir, "pig_sprite_sheet.png")
wolf_path = os.path.join(assets_dir, "wolf_boss_sprite_sheet.png")

# Process Pig
if os.path.exists(pig_path):
    remove_white_bg(pig_path, pig_path, threshold=220)

# Process Wolf
if os.path.exists(wolf_path):
    remove_white_bg(wolf_path, wolf_path, threshold=220)
