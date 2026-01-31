import os
from PIL import Image

def is_transparent_corners(image_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        width, height = img.size
        
        # Check 4 corners
        corners = [
            (0, 0),
            (width - 1, 0),
            (0, height - 1),
            (width - 1, height - 1)
        ]
        
        for x, y in corners:
            pixel = img.getpixel((x, y))
            if pixel[3] != 0: # Alpha channel is not 0
                return False
        return True
    except Exception as e:
        print(f"Error reading {image_path}: {e}")
        return False

def scan_assets(directory):
    print(f"Scanning assets in: {directory}")
    print("-" * 40)
    issues_found = False
    
    for filename in os.listdir(directory):
        if filename.lower().endswith(('.png', '.webp')):
            path = os.path.join(directory, filename)
            if not is_transparent_corners(path):
                print(f"[WARNING] Possible background detected in: {filename}")
                issues_found = True
            else:
                print(f"[OK] {filename}")
                
    if not issues_found:
        print("-" * 40)
        print("All assets look clean! (Transparent corners check passed)")
    else:
        print("-" * 40)
        print("Some assets might need manual background removal.")

if __name__ == "__main__":
    assets_dir = os.path.join(os.getcwd(), "assets")
    if os.path.exists(assets_dir):
        scan_assets(assets_dir)
    else:
        print("Assets directory not found!")
