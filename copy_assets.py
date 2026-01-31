
import shutil
import os

src_dir = "/Users/minhhieuchau/.gemini/antigravity/brain/ace45c0f-4c1b-4dcd-88d1-6433bc1c0f11/"
dst_dir = "/Users/minhhieuchau/.gemini/antigravity/scratch/little-imp-clicker/assets/"

files = {
    "frog_sprite_1769825830930.png": "frog_sprite.png",
    "bear_sprite_1769825850599.png": "bear_sprite.png",
    "frog_imp_1769825869498.png": "frog_imp.png",
    "bear_imp_1769825888615.png": "bear_imp.png"
}

if not os.path.exists(dst_dir):
    print(f"Dest dir does not exist: {dst_dir}")
else:
    print(f"Dest dir exists: {dst_dir}")

for src, dst in files.items():
    s = os.path.join(src_dir, src)
    d = os.path.join(dst_dir, dst)
    try:
        if os.path.exists(s):
            shutil.copy2(s, d)
            print(f"Copied {s} to {d}")
        else:
            print(f"Source file missing: {s}")
    except Exception as e:
        print(f"Error copying {s}: {e}")
