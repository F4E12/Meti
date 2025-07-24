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


# Example
extract_shirt_patch("c.png")

