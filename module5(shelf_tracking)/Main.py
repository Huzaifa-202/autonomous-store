import os
import cv2
import uuid
import firebase_admin
from firebase_admin import credentials, db, storage
from datetime import datetime
from ultralytics import YOLO


class FirebaseDetectionNotifier:
    def __init__(self, credentials_path, storage_bucket):
        # Initialize Firebase Admin
        cred = credentials.Certificate(credentials_path)
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://fbis-19de1-default-rtdb.firebaseio.com/',
            'storageBucket': storage_bucket
        })

        self.storage_bucket = storage.bucket()
        self.rtdb = db

    def process_video_for_detection(self, video_path, model_path, confidence_threshold=0.2):
        # Create output directory
        output_folder = "detected_frames"
        os.makedirs(output_folder, exist_ok=True)

        # Load YOLO model
        model = YOLO(model_path)
        cap = cv2.VideoCapture(video_path)

        max_bbox_frame = None
        max_bbox_count = 0
        max_bbox_image = None

        frame_count = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Perform detection
            results = model(frame, conf=confidence_threshold)

            # Count bounding boxes for specific labels
            current_bbox_count = sum(
                1 for detection in results[0].boxes.data
                if results[0].names[int(detection[5])] in ['Empty-Space', 'Reduced']
            )

            # Track frame with max bounding boxes
            if current_bbox_count > max_bbox_count:
                max_bbox_count = current_bbox_count
                max_bbox_frame = frame_count

                # Create annotated frame
                max_bbox_image = frame.copy()
                for detection in results[0].boxes.data:
                    label = results[0].names[int(detection[5])]
                    if label in ['Empty-Space', 'Reduced']:
                        x1, y1, x2, y2 = map(int, detection[:4])
                        conf = detection[4]
                        cv2.rectangle(max_bbox_image, (x1, y1), (x2, y2), (0, 255, 0), 2)
                        cv2.putText(max_bbox_image, f'{label} {conf:.2f}', (x1, y1 - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            frame_count += 1

        cap.release()

        # Process and upload frame with max bounding boxes
        if max_bbox_image is not None:
            self.upload_detection(max_bbox_image, max_bbox_frame, max_bbox_count)

    def upload_detection(self, frame, frame_number, bbox_count):
        # Generate unique identifiers
        unique_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Create initial notification in Realtime Database
        notification_ref = self.rtdb.reference('detections')
        new_detection_ref = notification_ref.push({
            'id': unique_id,
            'timestamp': timestamp,
            'frame_number': frame_number,
            'bbox_count': bbox_count,
            'status': 'detecting',
            'image_url': None,
            'is_viewed': False
        })

        # Save image locally
        local_filename = f"detection_{timestamp}_{unique_id}.jpg"
        local_path = os.path.join("detected_frames", local_filename)
        cv2.imwrite(local_path, frame)

        # Upload image to Firebase Storage
        blob = self.storage_bucket.blob(f"detections/{local_filename}")
        blob.upload_from_filename(local_path)
        blob.make_public()

        # Update notification with image URL
        new_detection_ref.update({
            'image_url': blob.public_url,
            'status': 'processed'
        })

        print(f"Uploaded detection: {new_detection_ref.key}")
        print(f"Image URL: {blob.public_url}")


def main():
    notifier = FirebaseDetectionNotifier(
        credentials_path= r'/Users/huraira/Desktop/project/fbis-19de1-firebase-adminsdk-idgon-e51fea33fe.json',
        storage_bucket= 'fbis-19de1.appspot.com'
    )

    notifier.process_video_for_detection(
        video_path=r"/Users/huraira/Desktop/project/out_of_stock/1087143401-preview.mp4",
        model_path= r"/Users/huraira/Desktop/project/out_of_stock/train5/weights/best.pt"
    )


if __name__ == "__main__":
    main()