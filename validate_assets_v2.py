
from PIL import Image
import os
import sys

def check_transparency(image_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        width, height = img.size
        
        # Check corners
        corners = [
            (0, 0), (width-1, 0),
            (0, height-1), (width-1, height-1)
        ]
        
        dirty_pixels = []
        for x, y in corners:
            r, g, b, a = img.getpixel((x, y))
            if a > 0:
                dirty_pixels.append(f"Corner({x},{y}): Alpha={a}")
        
        # Check edges (sample every 10px)
        # Top & Bottom
        for x in range(0, width, 10):
            # Top
            _, _, _, a = img.getpixel((x, 0))
            if a > 0: dirty_pixels.append(f"Top({x},0)")
            # Bottom
            _, _, _, a = img.getpixel((x, height-1))
            if a > 0: dirty_pixels.append(f"Bottom({x},{height-1})")
            
        # Left & Right
        for y in range(0, height, 10):
            # Left
            _, _, _, a = img.getpixel((0, y))
            if a > 0: dirty_pixels.append(f"Left(0,{y})")
            # Right
            _, _, _, a = img.getpixel((width-1, y))
            if a > 0: dirty_pixels.append(f"Right({width-1},{y})")

        if dirty_pixels:
            print(f"❌ DIRTY: {os.path.basename(image_path)}")
            # print(f"   Issues: {', '.join(dirty_pixels[:5])}...")
            return False
        else:
            print(f"✅ CLEAN: {os.path.basename(image_path)}")
            return True

    except Exception as e:
        print(f"⚠️ ERROR reading {os.path.basename(image_path)}: {e}")
        return False

def main():
    assets_dir = "./assets"
    print(f"🔍 Validating assets in {assets_dir} for background cleanliness...")
    
    clean_count = 0
    dirty_count = 0
    
    for filename in os.listdir(assets_dir):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            path = os.path.join(assets_dir, filename)
            is_clean = check_transparency(path)
            if is_clean:
                clean_count += 1
            else:
                dirty_count += 1
                
    print("-" * 30)
    print(f"Summary: {clean_count} Clean, {dirty_count} Dirty")
    
    if dirty_count > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
