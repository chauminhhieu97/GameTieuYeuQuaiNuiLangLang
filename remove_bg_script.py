import sys
try:
    from PIL import Image
    img = Image.open("assets/pig_grinder.png")
    img = img.convert("RGBA")
    datas = img.getdata()
    new_data = []
    for item in datas:
        # Check if white (or close to white)
        # Assuming the background is purely white or very light gray
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    img.save("assets/pig_grinder_fixed.png", "PNG")
    with open("python_log.txt", "w") as f:
        f.write("Success")
except Exception as e:
    with open("python_log.txt", "w") as f:
        f.write(f"Error: {e}")
