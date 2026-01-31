
import os
import shutil

src_dir = "/Users/minhhieuchau/.gemini/antigravity/brain/ace45c0f-4c1b-4dcd-88d1-6433bc1c0f11/"
dst_dir = "/Users/minhhieuchau/.gemini/antigravity/scratch/little-imp-clicker/assets/"
cwd = os.getcwd()

print(f"Current Dir: {cwd}")
if os.path.exists(dst_dir):
    print(f"Assets dir exists: {dst_dir}")
    print(f"Contents of assets: {os.listdir(dst_dir)}")
else:
    print(f"Assets dir MISSING: {dst_dir}")
    os.makedirs(dst_dir, exist_ok=True)
    print("Created assets dir.")

# Source check
print(f"Checking source: {src_dir}")
if os.path.exists(src_dir):
    src_files = os.listdir(src_dir)
    print(f"Source files: {src_files}")
    
    # Copy Map
    copy_map = {
        "frog_sprite_1769825830930.png": "frog_sprite.png",
        "bear_sprite_1769825850599.png": "bear_sprite.png",
        "frog_imp_1769825869498.png": "frog_imp.png",
        "bear_imp_1769825888615.png": "bear_imp.png"
    }
    
    for s_name, d_name in copy_map.items():
        s_path = os.path.join(src_dir, s_name)
        d_path = os.path.join(dst_dir, d_name)
        if s_name in src_files:
            try:
                shutil.copy2(s_path, d_path)
                print(f"SUCCESS: Copied {s_name} -> {d_name}")
                # Verify
                if os.path.exists(d_path) and os.path.getsize(d_path) > 0:
                     print(f"   Verified: {d_name} size {os.path.getsize(d_path)}")
                else:
                     print(f"   FAILED VERIFY: {d_name} is empty or missing")
            except Exception as e:
                print(f"ERROR: {e}")
        else:
            print(f"MISSING SRC: {s_name}")

else:
    print("Source dir MISSING!")
