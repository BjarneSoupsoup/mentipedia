import cv2
import numpy as np

input_image_path = "./test.webp"

image = cv2.imread(input_image_path)

if image is None:
    print(f"Error: Could not load image from {input_image_path}. Please check the path.")
    exit()

cv2.imshow("Original Picture", image)
cv2.waitKey(0)

nose_origin_x = 206
nose_origin_y = 301
nose_origin = np.array([nose_origin_x, nose_origin_y])
effect_radius = 20
max_stretch_amount = 100

img_rows, img_cols, _ = image.shape

map_x = np.zeros((img_rows, img_cols), dtype=np.float32)
map_y = np.zeros((img_rows, img_cols), dtype=np.float32)

# Compute transform

for y in range(img_rows):
    for x in range(img_cols):
        distance_to_origin = np.linalg.norm(np.array([x, y]) - nose_origin)
        if distance_to_origin < effect_radius:
            map_x[y, x] = x + np.exp(-(distance_to_origin ** 2) / (2 * effect_radius)) * effect_radius
            map_y[y, x] = y # Y-coordinate remains unchanged for purely horizontal stretch
            if distance_to_origin < 5:
                print(F"""
                    distance_to_origin = {distance_to_origin}
                    old coords = ({x}, {y})
                    new coords = ({map_x[y, x]}, {map_y[y, x]})
                """)
        else:
            # Pixels outside the effect radius map directly to themselves
            map_x[y, x] = x
            map_y[y, x] = y

# Apply the transformation using cv2.remap
warped_image = cv2.remap(image, map_x, map_y,
                          interpolation=cv2.INTER_LINEAR,
                          borderMode=cv2.BORDER_REFLECT_101)

cv2.imshow("Warped Image (Nose Stretched Corrected)", warped_image)
cv2.waitKey(0)
cv2.destroyAllWindows()