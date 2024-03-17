from PIL import Image
import cv2
import numpy as np
import os
import sys

# def processedimg():

# Load the image from the file system
image_path = './uploads/furniture.jpeg'  # Replace with your image path
image = cv2.imread(image_path)

# Convert the image to grayscale for thresholding
gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Threshold the image to create a mask, setting the threshold close to white (240 out of 255)
# We invert the mask so the furniture is white and the background is black
_, mask = cv2.threshold(gray_image, 240, 255, cv2.THRESH_BINARY)
mask_inv = cv2.bitwise_not(mask)

# Convert the original image to RGBA format (which includes an alpha channel for transparency)
image_rgba = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)

# Use the inverted mask to change the alpha channel of the original image
new_alpha_channel = cv2.bitwise_and(image_rgba[:, :, 3], mask_inv)

# Merge the original RGB channels with the new alpha channel
final_rgba = cv2.merge((image_rgba[:, :, 0], image_rgba[:, :, 1], image_rgba[:, :, 2], new_alpha_channel))

# Save the image with a transparent background
output_path = './uploads/extracted_furniture_transparent.png'  # Output file path
cv2.imwrite(output_path, final_rgba)

# The image is now saved with the furniture on a transparent background

# Load the base image, the furniture image, and the mask image
base_img = Image.open('./uploads/base.jpeg')
furniture_img = Image.open(output_path).convert("RGBA")
# furniture_img = output_path.convert("RGBA")
# furniture_img = final_rgba.convert("RGBA")
mask_img = Image.open('./uploads/mask.jpeg')

# Get the bounding box of the white space in the mask
white_space_bbox = mask_img.getbbox()

# Calculate the center of the white space
center_of_white_space = ((white_space_bbox[0] + white_space_bbox[2]) // 2,
                        (white_space_bbox[1] + white_space_bbox[3]) // 2)

# Get the size of the furniture image
furniture_width, furniture_height = furniture_img.size

# Calculate the top left position to paste the furniture image
top_left_position_to_paste = (center_of_white_space[0] - furniture_width // 2,
                            center_of_white_space[1] - furniture_height // 2)

# Create a new image for the composite
composite_img = base_img.copy()

# Paste the furniture image into the base image using the calculated position
composite_img.paste(furniture_img, top_left_position_to_paste, furniture_img)

# Save the result
composite_img.save('./uploads/final.png')

os.remove(output_path)
# return Image.open("./uploads/final.png")

# Output the path to the composite image
print('Composite image saved as path_to_save_your_composite_image.png')

    