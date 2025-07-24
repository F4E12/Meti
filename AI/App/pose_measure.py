import cv2
import mediapipe as mp
from mediapipe import solutions
from mediapipe.framework.formats import landmark_pb2
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import math
import matplotlib.pyplot as plt

def process_pose_measurements(image_path, coin_logo_path, coin_real_diameter_cm=2.4):
    image_bgr = cv2.imread(image_path)
    if image_bgr is None:
        raise Exception("Failed to load image.")

    pixel_per_cm, updated_bgr = detect_coin_scale(image_bgr, coin_logo_path, coin_real_diameter_cm)
    if pixel_per_cm is None:
        raise Exception("Coin not found for scaling.")

    base_options = python.BaseOptions(model_asset_path='pose_landmarker.task')
    options = vision.PoseLandmarkerOptions(base_options=base_options, output_segmentation_masks=True)
    detector = vision.PoseLandmarker.create_from_options(options)

    image_rgb = cv2.cvtColor(updated_bgr, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)
    detection_result = detector.detect(mp_image)

    image_width, image_height = mp_image.width, mp_image.height
    landmarks = detection_result.pose_landmarks[0]

    def calc_cm(lm1, lm2):
        return calc_pixel_distance(lm1, lm2, image_width, image_height) / pixel_per_cm

    lm11, lm12, lm13, lm14, lm23, lm24 = landmarks[11], landmarks[12], landmarks[13], landmarks[14], landmarks[23], landmarks[24]
    results = {
        "right_arm": round(calc_cm(lm14, lm12), 2),
        "shoulder": round(calc_cm(lm11, lm12), 2),
        "left_arm": round(calc_cm(lm11, lm13), 2),
        "upper_body_height": round(calc_cm(lm12, lm24), 2),
        "hip": round(calc_cm(lm24, lm23), 2),
    }

    return results, mp_image.numpy_view()

def detect_coin_scale(frame_bgr, reference_logo_path, coin_real_diameter_cm=2.4):
    _offset = 50
    reference_logo = cv2.imread(reference_logo_path, 0)
    reference_logo = cv2.resize(reference_logo, (int(reference_logo.shape[1] * 0.3), int(reference_logo.shape[0] * 0.3)))
    reference_logo = cv2.Canny(reference_logo, 100, 200)
    tH, tW = reference_logo.shape[:2]

    scales = np.linspace(0.02, 1.0, 20)[::-1]
    found = None
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)

    for scale in scales:
        resized = cv2.resize(gray, (int(gray.shape[1] * scale), int(gray.shape[0] * scale)))
        if resized.shape[0] < tH or resized.shape[1] < tW:
            break
        rH = gray.shape[0] / float(resized.shape[0])
        rW = gray.shape[1] / float(resized.shape[1])
        edged = cv2.Canny(resized, 100, 200)
        result = cv2.matchTemplate(edged, reference_logo, cv2.TM_CCOEFF)
        (_, maxVal, _, maxLoc) = cv2.minMaxLoc(result)
        if found is None or maxVal > found[0]:
            found = (maxVal, maxLoc, rH, rW)

def calc_pixel_distance(lm1, lm2, image_width, image_height):
    x1, y1 = lm1.x * image_width, lm1.y * image_height
    x2, y2 = lm2.x * image_width, lm2.y * image_height
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)