from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
import cv2
import numpy as np
from sklearn.cluster import KMeans
import tempfile
import os
from flask import Flask, request, jsonify, url_for
from flask_cors import CORS # Import CORS
from werkzeug.utils import secure_filename
import mediapipe as mp
from mediapipe import solutions
from mediapipe.framework.formats import landmark_pb2
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import math
import matplotlib.pyplot as plt
from PIL import Image
import base64
import io

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
RECOLORED_FOLDER = 'recolored'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RECOLORED_FOLDER, exist_ok=True)
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

# In-memory session storage
session_data = {}

# Function to get dominant colors using KMeans
def get_dominant_colors(image, k=5):
    img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    pixels = img_rgb.reshape(-1, 3)
    kmeans = KMeans(n_clusters=k, random_state=42).fit(pixels)
    return kmeans.cluster_centers_.astype(int), kmeans.labels_

# Function to replace original colors with user-defined ones
def replace_colors(image, colors, labels, color_map):
    img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    pixels = img_rgb.reshape(-1, 3)
    output_pixels = pixels.copy()

    for i, _ in enumerate(colors):
        mask = (labels == i)
        output_pixels[mask] = color_map[i]

    recolored_img = output_pixels.reshape(image.shape)
    return cv2.cvtColor(recolored_img, cv2.COLOR_RGB2BGR)

# ----------- ROUTES -----------

@app.route("/upload", methods=["POST"])
def upload_image():
    image_file = request.files.get('image')
    if not image_file:
        return jsonify({"error": "No image uploaded"}), 400

    filename = f"{uuid.uuid4()}.jpg"
    path = os.path.join(UPLOAD_FOLDER, filename)
    image_file.save(path)

    image = cv2.imread(path)
    colors, labels = get_dominant_colors(image, k=5)

    # Save data to memory
    session_data[filename] = {
        "path": path,
        "colors": colors.tolist(),
        "labels": labels.tolist(),
        "shape": image.shape
    }

    return jsonify({
        "image_id": filename,
        "colors": colors.tolist()
    })

@app.route("/recolor", methods=["POST"])
def recolor_image():
    data = request.get_json()
    image_id = data.get("image_id")
    color_map = data.get("color_map")

    if not image_id or image_id not in session_data:
        return jsonify({"error": "Invalid or missing image_id"}), 400

    meta = session_data[image_id]
    image = cv2.imread(meta["path"])
    original_colors = np.array(meta["colors"])
    labels = np.array(meta["labels"])
    new_colors = np.array(color_map)

    recolored_img = replace_colors(image, original_colors, labels, new_colors)

    output_path = os.path.join(RECOLORED_FOLDER, image_id)
    cv2.imwrite(output_path, recolored_img)

    return send_file(output_path, mimetype='image/jpeg')

app.config['UPLOAD_FOLDER'] = 'static/uploads/'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

# Ensure the upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# --- Keep all your helper functions the same ---
# draw_landmarks_on_image(rgb_image, detection_result)
# calc_pixel_distance(lm1, lm2, image_width, image_height)
# detect_coin_scale(frame_bgr, reference_logo_path, coin_real_diameter_cm)
# allowed_file(filename)
# ... (paste your original helper functions here without changes) ...

# <--- Paste your helper functions here --->
def draw_landmarks_on_image(rgb_image, detection_result):
    pose_landmarks_list = detection_result.pose_landmarks
    annotated_image = np.copy(rgb_image)
    for pose_landmarks in pose_landmarks_list:
        pose_landmarks_proto = landmark_pb2.NormalizedLandmarkList()
        pose_landmarks_proto.landmark.extend([landmark_pb2.NormalizedLandmark(x=lm.x, y=lm.y, z=lm.z) for lm in pose_landmarks])
        solutions.drawing_utils.draw_landmarks(annotated_image,pose_landmarks_proto,solutions.pose.POSE_CONNECTIONS,landmark_drawing_spec=solutions.drawing_utils.DrawingSpec(color=(0, 255, 0), thickness=5, circle_radius=3),connection_drawing_spec=solutions.drawing_utils.DrawingSpec(color=(0, 0, 255), thickness=5))
    return annotated_image

def calc_pixel_distance(lm1, lm2, image_width, image_height):
    x1, y1 = lm1.x * image_width, lm1.y * image_height
    x2, y2 = lm2.x * image_width, lm2.y * image_height
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

def detect_coin_scale(frame_bgr, reference_logo_path, coin_real_diameter_cm=2.4):
    reference_logo = cv2.imread(reference_logo_path, 0)
    if reference_logo is None:
        raise FileNotFoundError(f"Reference logo not found at {reference_logo_path}")
    reference_logo = cv2.resize(reference_logo, (int(reference_logo.shape[1] * 0.3), int(reference_logo.shape[0] * 0.3)))
    reference_logo = cv2.Canny(reference_logo, 100, 200)
    tH, tW = reference_logo.shape[:2]
    scales = np.linspace(0.02, 1.0, 20)[::-1]
    found = None
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
    for scale in scales:
        resized = cv2.resize(gray, (int(gray.shape[1] * scale), int(gray.shape[0] * scale)))
        if resized.shape[0] < tH or resized.shape[1] < tW: break
        rH = gray.shape[0] / float(resized.shape[0])
        rW = gray.shape[1] / float(resized.shape[1])
        edged = cv2.Canny(resized, 100, 200)
        result = cv2.matchTemplate(edged, reference_logo, cv2.TM_CCOEFF)
        (_, maxVal, _, maxLoc) = cv2.minMaxLoc(result)
        if found is None or maxVal > found[0]:
            found = (maxVal, maxLoc, rH, rW)
    if found is not None and found[0] > 5500000.0:
        (_, maxLoc, rH, rW) = found
        (startX, startY) = (int(maxLoc[0] * rW), int(maxLoc[1] * rH))
        (endX, endY) = (int((maxLoc[0] + tW) * rW), int((maxLoc[1] + tH) * rH))
        cv2.rectangle(frame_bgr, (startX, startY), (endX, endY), (0, 255, 0), 3)
        coin_diameter_px = (endX - startX + endY - startY) / 2
        pixel_per_cm = coin_diameter_px / coin_real_diameter_cm
        return pixel_per_cm, frame_bgr
    else:
        return None, frame_bgr

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']
# <---------------------------------------->


# --- New API Endpoint ---
@app.route('/api/process-image', methods=['POST'])
def process_image_api():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(input_path)

        # --- Image Processing Logic (same as before) ---
        try:
            coin_logo_path = "coin_reference.png"
            image_bgr = cv2.imread(input_path)
            
            pixel_per_cm, image_with_coin_box = detect_coin_scale(image_bgr, coin_logo_path)
            if pixel_per_cm is None:
                return jsonify({'error': 'Reference coin not found. Cannot calculate measurements.'}), 400

            base_options = python.BaseOptions(model_asset_path='pose_landmarker.task')
            options = vision.PoseLandmarkerOptions(base_options=base_options, output_segmentation_masks=True)
            detector = vision.PoseLandmarker.create_from_options(options)
            image_rgb = cv2.cvtColor(image_with_coin_box, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)
            detection_result = detector.detect(mp_image)

            if not detection_result.pose_landmarks:
                return jsonify({'error': 'No pose detected in the image.'}), 400

            annotated_image_rgb = draw_landmarks_on_image(mp_image.numpy_view(), detection_result)
            
            landmarks = detection_result.pose_landmarks[0]
            lm11, lm12, lm13, lm14, lm23, lm24 = landmarks[11], landmarks[12], landmarks[13], landmarks[14], landmarks[23], landmarks[24]
            image_width, image_height = mp_image.width, mp_image.height

            def to_cm(dist_px): return dist_px / pixel_per_cm

            measurements = {
                "Right arm length": f"{to_cm(calc_pixel_distance(lm14, lm12, image_width, image_height)):.2f}",
                "Shoulder width": f"{to_cm(calc_pixel_distance(lm11, lm12, image_width, image_height)):.2f}",
                "Left arm length": f"{to_cm(calc_pixel_distance(lm11, lm13, image_width, image_height)):.2f}",
                "Upper body height": f"{to_cm(calc_pixel_distance(lm12, lm24, image_width, image_height)):.2f}",
                "Hip width": f"{to_cm(calc_pixel_distance(lm24, lm23, image_width, image_height)):.2f}"
            }
            
            output_filename = 'processed_' + filename
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            annotated_image_bgr = cv2.cvtColor(annotated_image_rgb, cv2.COLOR_RGB2BGR)
            cv2.imwrite(output_path, annotated_image_bgr)
            
            # Return the full URL for the processed image
            image_url = url_for('static', filename=f'uploads/{output_filename}', _external=True)

            # Success response
            return jsonify({
                'measurements': measurements,
                'image_url': image_url
            })

        except Exception as e:
            print(f"Error processing image: {e}")
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'Invalid file type'}), 400

def extract_shirt_patch_from_image(image):
    """
    Processes an image array to extract a shirt patch and create a debug image.
    Returns (patch_image, debug_image) or (None, None) on failure.
    """
    height, width, _ = image.shape
    with mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5) as pose:
        results = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

        if not results.pose_landmarks:
            return None, None

        # Create the debug image with landmarks
        annotated_image = np.copy(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        mp_drawing.draw_landmarks(
            annotated_image,
            results.pose_landmarks,
            mp_pose.POSE_CONNECTIONS,
            landmark_drawing_spec=mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
            connection_drawing_spec=mp_drawing.DrawingSpec(color=(255, 0, 0), thickness=2)
        )
        debug_image = cv2.cvtColor(annotated_image, cv2.COLOR_RGB2BGR)

        # Extract patch coordinates
        landmarks = results.pose_landmarks.landmark
        left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
        right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
        right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP]

        # Calculate patch center and size
        shoulder_width_px = abs(left_shoulder.x * width - right_shoulder.x * width)
        body_height_px = abs(right_shoulder.y * height - right_hip.y * height)
        patch_size = round(shoulder_width_px // 5)

        x1 = int(left_shoulder.x * width)
        y1 = int(left_shoulder.y * height)
        x2 = int(right_shoulder.x * width)
        y2 = int(right_shoulder.y * height)
        
        # Center point calculation adjusted for better placement on the chest
        shoulder = (left_shoulder.x * width - right_shoulder.x * width)
        body = (right_shoulder.y * height - right_hip.y * height)
        patch_size = round(shoulder // 5)
        cx, cy = round((x1 + x2) // 2 + shoulder//4), round((y1 + y2) // 2 - body//5)

        # Define patch boundaries
        x_start = max(cx - patch_size, 0)
        y_start = max(cy - patch_size, 0)
        x_end = min(cx + patch_size, width)
        y_end = min(cy + patch_size, height)
        
        # Crop the patch
        patch = image[y_start:y_end, x_start:x_end]
        if patch.size == 0:
             return None, debug_image # Return debug image even if patch is empty
             
        patch_resized = cv2.resize(patch, (500, 500))

        return patch_resized, debug_image

@app.route('/extract-shirt-patch', methods=['POST'])
def handle_extract_shirt_patch():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid or no file selected'}), 400

    filename = secure_filename(file.filename)
    
    # Read image from filestorage object in memory
    filestr = file.read()
    npimg = np.frombuffer(filestr, np.uint8)
    image_bgr = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    patch_image, debug_image = extract_shirt_patch_from_image(image_bgr)

    if patch_image is None and debug_image is None:
        return jsonify({'error': 'No pose detected in the image.'}), 400

    # Save patch image
    patch_filename = f"patch_{filename}"
    patch_path = os.path.join(app.config['UPLOAD_FOLDER'], patch_filename)
    cv2.imwrite(patch_path, patch_image)
    patch_url = url_for('static', filename=f'uploads/{patch_filename}', _external=True)

    # Save debug image
    debug_filename = f"debug_{filename}"
    debug_path = os.path.join(app.config['UPLOAD_FOLDER'], debug_filename)
    cv2.imwrite(debug_path, debug_image)
    debug_url = url_for('static', filename=f'uploads/{debug_filename}', _external=True)

    return jsonify({
        'patch_image_url': patch_url,
        'debug_image_url': debug_url
    })

@app.route('/composite_images', methods=['POST'])
def composite_images():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data received"}), 400

    images_data = data.get('images')
    final_width = data.get('final_width', 1024)
    final_height = data.get('final_height', 1024)

    if not images_data:
        return jsonify({"error": "No 'images' array found in data"}), 400

    try:
        final_image = Image.new('RGBA', (int(final_width), int(final_height)), (255, 255, 255, 255))

        for img_info in images_data:
            base64_img = img_info.get('imageData')
            x = int(img_info.get('x', 0))
            y = int(img_info.get('y', 0))

            if not base64_img:
                print(f"Warning: Missing imageData for an entry at x={x}, y={y}")
                continue

            img_bytes = base64.b64decode(base64_img)
            img_part = Image.open(io.BytesIO(img_bytes))

            if img_part.mode != 'RGBA':
                img_part = img_part.convert('RGBA')

            final_image.paste(img_part, (x, y), img_part)

        buffer = io.BytesIO()
        final_image.save(buffer, format="PNG")
        final_image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

        return jsonify({
            "message": "Images composited successfully!",
            "final_image_base64": final_image_base64
        }), 200

    except Exception as e:
        print(f"Error processing images: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/tile-pattern", methods=["POST"])
def tile_pattern():
    data = request.get_json()
    if not data or "image" not in data:
        return jsonify({"error": "No image provided"}), 400

    try:
        base64_str = data["image"].split(",")[-1]  # remove data:image/png;base64,
        image_bytes = base64.b64decode(base64_str)
        tile = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        tile_count_x = int(data.get("x", 5))
        tile_count_y = int(data.get("y", 5))

    except:
        return jsonify({"error": "Invalid image data"}), 400

    tile_width, tile_height = tile.size
    canvas_width = tile_width * tile_count_x
    canvas_height = tile_height * tile_count_y

    tiled = Image.new("RGB", (canvas_width, canvas_height), color=(255, 255, 255))
    
    for ix in range(tile_count_x):
        for iy in range(tile_count_y):
            x_pos = ix * tile_width
            y_pos = iy * tile_height
            tiled.paste(tile, (x_pos, y_pos))

    buffer = io.BytesIO()
    tiled.save(buffer, format="PNG")
    buffer.seek(0)
    base64_result = base64.b64encode(buffer.read()).decode("utf-8")
    return jsonify({"final_image_base64": base64_result})

@app.route('/api/extract-patch', methods=['POST'])
def extract_patch():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file uploaded'}), 400

    image_file = request.files['image']

    temp_img_path = None
    output_patch = None
    debug_image = None

    try:
        # Save uploaded image to a temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_img:
            temp_img_path = temp_img.name
            image_file.save(temp_img_path)

        # Temp output files
        output_patch = tempfile.NamedTemporaryFile(delete=False, suffix=".png").name
        debug_image = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg").name

        # Run extraction logic
        extract_shirt_patch(temp_img_path, output_patch_path=output_patch, output_debug_path=debug_image)

        # ✅ Return the image directly
        return send_file(output_patch, mimetype='image/png')

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        # Clean up input image
        if temp_img_path and os.path.exists(temp_img_path):
            try:
                os.remove(temp_img_path)
            except Exception as e:
                print(f"Warning: could not delete temp image - {e}")

@app.route('/api/image')
def serve_image():
    path = request.args.get('path')
    if path and os.path.exists(path):
        return send_file(path, mimetype='image/png')
    return jsonify({'error': 'File not found'}), 404

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.framework.formats import landmark_pb2

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils


def draw_landmarks_on_image(rgb_image, pose_landmarks):
    annotated_image = np.copy(rgb_image)

    pose_landmarks_proto = landmark_pb2.NormalizedLandmarkList()
    pose_landmarks_proto.landmark.extend([
        landmark_pb2.NormalizedLandmark(x=lm.x, y=lm.y, z=lm.z) for lm in pose_landmarks.landmark
    ])

    mp_drawing.draw_landmarks(
        annotated_image,
        pose_landmarks_proto,
        mp_pose.POSE_CONNECTIONS,
        landmark_drawing_spec=mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=5, circle_radius=3),
        connection_drawing_spec=mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=5)
    )

    return annotated_image


def extract_shirt_patch(image_path, output_patch_path="patch.png", output_debug_path="debug_landmarks.jpg"):
    image = cv2.imread(image_path)
    height, width, _ = image.shape

    with mp_pose.Pose(static_image_mode=True) as pose:
        results = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

        if not results.pose_landmarks:
            print("No pose detected.")
            return

        # ✅ DEBUG IMAGE: draw pose landmarks
        debug_image = draw_landmarks_on_image(image, results.pose_landmarks)

        cv2.imwrite(output_debug_path, debug_image)
        print(f"Debug image saved to {output_debug_path}")

        landmarks = results.pose_landmarks.landmark
        left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
        right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
        right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP]

        print(f"Left Shoulder: ({left_shoulder.x:.2f}, {left_shoulder.y:.2f})")
        print(f"Right Shoulder: ({right_shoulder.x:.2f}, {right_shoulder.y:.2f})")
        print(landmarks)
        print(width, height)

        x1 = int(left_shoulder.x * width)
        y1 = int(left_shoulder.y * height)
        x2 = int(right_shoulder.x * width)
        y2 = int(right_shoulder.y * height)

        shoulder = (left_shoulder.x * width - right_shoulder.x * width)
        body = (right_shoulder.y * height - right_hip.y * height)
        patch_size = round(shoulder // 5)
        cx, cy = round((x1 + x2) // 2 + shoulder//4), round((y1 + y2) // 2 - body//5)
        print(f"Center of shoulders: ({cx}, {cy})")

        print(f"Patch size: {patch_size}")
        x_start = max(cx - patch_size, 0)
        y_start = max(cy - patch_size, 0)
        x_end = min(cx + patch_size, width)
        y_end = min(cy + patch_size, height)

        print(f"Patch coordinates: ({x_start}, {y_start}) to ({x_end}, {y_end})")

        patch = image[y_start:y_end, x_start:x_end]
        patch = cv2.resize(patch, (500, 500))

        cv2.imwrite(output_patch_path, patch)
        print(f"Patch saved to {output_patch_path}")

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)
