import cv2
import numpy as np

def linear_nose_lengthening(image_path, start_point, end_point, new_end_point, stretch_width=30, feather_amount=10):
    """
    Applies a linear nose lengthening effect to an image, like Pinocchio's nose.

    Args:
        image_path (str): Path to the input image.
        start_point (tuple): (x, y) coordinates of the nose base (e.g., top of nostrils).
        end_point (tuple): (x, y) coordinates of the original nose tip.
        new_end_point (tuple): (x, y) coordinates for the desired new nose tip.
        stretch_width (int): The horizontal width of the area affected by the stretch.
                             Larger values affect more of the surrounding face.
        feather_amount (int): The amount of feathering/blending at the edges of the stretch.
                              Prevents sharp lines.
    Returns:
        numpy.ndarray: The image with the nose lengthened.
    """
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error: Could not load image from {image_path}")
        return None

    height, width, _ = img.shape
    output_img = np.zeros_like(img, dtype=np.uint8) # Ensure dtype is uint8 for image data

    # Define the vector for the stretch
    stretch_vec_x = new_end_point[0] - end_point[0]
    stretch_vec_y = new_end_point[1] - end_point[1]

    # Calculate the vector from start_point to end_point
    nose_segment_vec_x = end_point[0] - start_point[0]
    nose_segment_vec_y = end_point[1] - start_point[1]
    nose_segment_length_sq = nose_segment_vec_x**2 + nose_segment_vec_y**2
    
    # Handle the case where the nose segment is a single point
    if nose_segment_length_sq == 0:
        nose_segment_length_sq = 1 # Avoid division by zero, effectively treating it as a point stretch

    for y_out in range(height):
        for x_out in range(width):
            # Default: no displacement, copy from original
            source_x = x_out
            source_y = y_out

            # Calculate relative position of output pixel to the start_point
            px = x_out - start_point[0]
            py = y_out - start_point[1]

            # Calculate projection of (px, py) onto the nose segment vector
            # This helps determine how "far along the nose" the current pixel is
            dot_product = px * nose_segment_vec_x + py * nose_segment_vec_y
            
            # Parametric position 't' along the nose segment (0 at start_point, 1 at end_point)
            t = dot_product / nose_segment_length_sq
            
            # Clamp t to be within the segment [0, 1] for interpolation purposes
            # We extend slightly beyond 1 to account for the new nose tip
            t = np.clip(t, 0, 1.5) # Extend slightly beyond 1 for the new tip area

            # Calculate perpendicular distance from the pixel to the nose segment line
            # This tells us how "far sideways" from the nose centerline the pixel is
            dist_to_line = abs(nose_segment_vec_y * px - nose_segment_vec_x * py) / np.sqrt(nose_segment_length_sq)

            # Determine displacement based on position along the nose and perpendicular distance
            displacement_factor = 0.0

            # Only apply distortion if within the stretch_width + feather_amount
            if dist_to_line < (stretch_width + feather_amount):
                # Calculate the strength of the stretch along the nose
                # Strongest at the tip (t=1), less at the base (t=0)
                # This ensures the base doesn't move much, but the tip moves a lot
                
                # Use a smoothstep-like function for falloff along the length
                length_falloff = 0.5 * (1 - np.cos(np.pi * np.clip(t, 0, 1))) # 0 at t=0, 1 at t=1, then holds 1

                # If the point is beyond the original tip, ensure full stretch is applied
                if t > 1.0:
                    length_falloff = 1.0
                
                # Apply feathering for the width
                width_falloff = 1.0
                if dist_to_line > stretch_width:
                    # Feathering for the width
                    width_falloff = 1.0 - (dist_to_line - stretch_width) / feather_amount
                    width_falloff = np.clip(width_falloff, 0, 1)

                displacement_factor = length_falloff * width_falloff

            if displacement_factor > 0:
                # Calculate the source pixel in the original image
                # We "pull back" the output pixel by the displacement to find its origin
                source_x = x_out - int(stretch_vec_x * displacement_factor)
                source_y = y_out - int(stretch_vec_y * displacement_factor)

            # Ensure source coordinates are within image bounds
            source_x = np.clip(source_x, 0, width - 1)
            source_y = np.clip(source_y, 0, height - 1)

            # Assign pixel color (using direct sampling for simplicity; interpolation would be better)
            output_img[y_out, x_out] = img[source_y, source_x]

    return output_img

if __name__ == "__main__":
    input_image_path = "path/to/your/face_image.jpg" # <<< IMPORTANT: Change this to your image path

    # --- Define your points for the nose ---
    # You'll need to open your image in an editor (like Paint, GIMP, etc.)
    # and find the pixel coordinates for these points.
    
    # Example coordinates (adjust these for your specific image and desired effect):
    # Imagine a line from the top of the nostrils (start_point) to the tip of the nose (end_point).
    # new_end_point is where you want the new, lengthened nose tip to be.
    
    # For a nose that points downwards:
    start_x = 300 # Base of the nose (e.g., between nostrils)
    start_y = 250

    end_x = 305   # Original tip of the nose
    end_y = 280

    new_end_x = 315 # Desired new tip of the nose (further out/down)
    new_end_y = 350 # Increase y to make it longer downwards

    # Or for a nose that points more horizontally (e.g., from a profile view):
    # start_x = 250
    # start_y = 300
    # end_x = 300
    # end_y = 305
    # new_end_x = 380 # Increase x to make it longer horizontally
    # new_end_y = 310

    # --- Adjust these parameters ---
    stretch_width = 40  # How wide the stretched part of the nose is
    feather_amount = 20 # Blending zone at the edges of the stretch

    modified_image = linear_nose_lengthening(
        input_image_path,
        (start_x, start_y),
        (end_x, end_y),
        (new_end_x, new_end_y),
        stretch_width,
        feather_amount
    )

    if modified_image is not None:
        cv2.imwrite("pinocchio_nose_picture.jpg", modified_image)
        print("Pinocchio nose picture saved as pinocchio_nose_picture.jpg")
        cv2.imshow("Original", cv2.imread(input_image_path))
        cv2.imshow("Pinocchio Nose", modified_image)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
