from PIL import Image
import numpy as np

img = Image.open("branding/Logo/v2/Stackbase_Brand.png")
if img.mode != 'RGBA':
    img = img.convert('RGBA')

bg_color = (19, 21, 45) # Dark blue background color
tol = 35

# Crop margins
arr = np.array(img)
diff = np.abs(arr[:, :, :3] - bg_color).sum(axis=2)
non_bg_indices = np.argwhere(diff > tol)

if len(non_bg_indices) > 0:
    top, left = non_bg_indices.min(axis=0)
    bottom, right = non_bg_indices.max(axis=0)
    
    # Add a small padding of 40px
    padding = 40
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(img.width, right + padding)
    bottom = min(img.height, bottom + padding)
    
    cropped = img.crop((left, top, right, bottom))
    cropped_arr = np.array(cropped)
    
    # Make background pixels transparent
    c_diff = np.abs(cropped_arr[:, :, :3] - bg_color).sum(axis=2)
    cropped_arr[c_diff <= tol, 3] = 0
    
    final_img = Image.fromarray(cropped_arr)
    final_img.save("logos/stackbase-logo.png")
    print("Saved transparent cropped logo to logos/stackbase-logo.png")
