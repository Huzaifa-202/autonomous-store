from collections import defaultdict
import cv2
import numpy as np
from ultralytics import YOLO
import csv
import time
import os
from ultralytics import solutions
from pymongo import MongoClient
import math
import firebase_admin
from firebase_admin import credentials, db, storage
from datetime import datetime

model = YOLO("yolov8n.pt")
heatmap = solutions.Heatmap(show=False, save=True, model="yolov8n.pt",classes=[0])  # Use the same model and focus on person class (0)
cap = cv2.VideoCapture("/Users/huraira/Desktop/project/module3/853889-hd_1920_1080_25fps.mp4")
fps = cap.get(cv2.CAP_PROP_FPS)
frame_duration = 1

track_history = defaultdict(list)
person_id_mapping = {}
index_counter = 0
time_spent = defaultdict(lambda: [None, None])
position_time_spent = defaultdict(lambda: defaultdict(int))
last_read_time = time.time()
manual_ids = []
unknown_counter = 1
tracked_people = {}
firebase_initialized = False


frame_number = 0
font = cv2.FONT_HERSHEY_SIMPLEX
font_scale = 1
font_thickness = 2
colors = [
    (0, 255, 0),
    (255, 0, 0),
    (0, 0, 255),
    (0, 255, 255),
    (255, 0, 255),
    (255, 255, 0),
    (255, 255, 255)
]

def calculate_path_angle(pt1, pt2):
    """Calculate the angle between two points"""
    return math.atan2(pt2[1] - pt1[1], pt2[0] - pt1[0])


def draw_directional_flow_canvas(tracking_canvas, path_popularity, path_directions):
    overlay = tracking_canvas.copy()
    total_paths = sum(path_popularity.values())
    if total_paths == 0:
        return tracking_canvas
    sorted_paths = sorted(path_popularity.items(), key=lambda x: x[1], reverse=True)
    def get_color_by_percentage(percentage):
        if percentage > 40:
            return (0, 0, 255)
        elif percentage > 30:
            return (0, 128, 255)
        elif percentage > 20:
            return (0, 255, 255)
        else:
            return (0, 255, 0)
    for (path_key, count) in sorted_paths:
        percentage = (count / total_paths) * 100
        if percentage < 5:
            continue
        directions = path_directions[path_key]
        if not directions:
            continue
        avg_angle = sum(directions) / len(directions)
        start_point = tuple(map(int, path_key[0]))
        end_point = tuple(map(int, path_key[1]))
        dx = end_point[0] - start_point[0]
        dy = end_point[1] - start_point[1]
        path_length = int(math.sqrt(dx * dx + dy * dy))
        if path_length < 20:
            continue
        color = get_color_by_percentage(percentage)
        arrow_length = min(path_length, 100)
        arrow_width = int(max(3, arrow_length * 0.2))
        tip_x = int(start_point[0] + arrow_length * math.cos(avg_angle))
        tip_y = int(start_point[1] + arrow_length * math.sin(avg_angle))
        thickness = int(max(2, min(8, percentage / 5)))
        cv2.line(overlay, start_point, (tip_x, tip_y), color, thickness)
        arrow_head_length = min(20, arrow_length * 0.3)
        angle = math.atan2(tip_y - start_point[1], tip_x - start_point[0])
        arrow_angle = math.pi / 6  # 30 degrees
        p1_x = int(tip_x - arrow_head_length * math.cos(angle + arrow_angle))
        p1_y = int(tip_y - arrow_head_length * math.sin(angle + arrow_angle))
        p2_x = int(tip_x - arrow_head_length * math.cos(angle - arrow_angle))
        p2_y = int(tip_y - arrow_head_length * math.sin(angle - arrow_angle))
        cv2.fillPoly(overlay, [np.array([[tip_x, tip_y], [p1_x, p1_y], [p2_x, p2_y]])], color)
        text = f"{percentage:.1f}%"
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.6
        text_thickness = 2
        (text_width, text_height), _ = cv2.getTextSize(text, font, font_scale, text_thickness)
        text_x = int((start_point[0] + tip_x) / 2) - text_width // 2
        text_y = int((start_point[1] + tip_y) / 2) + text_height // 2
        padding = 4
        cv2.rectangle(overlay,
                      (text_x - padding, text_y - text_height - padding),
                      (text_x + text_width + padding, text_y + padding),
                      (0, 0, 0),
                      -1)
        cv2.putText(overlay, text, (text_x, text_y), font, font_scale, (255, 255, 255), text_thickness)
    alpha = 0.7
    cv2.addWeighted(overlay, alpha, tracking_canvas, 1 - alpha, 0, tracking_canvas)

    return tracking_canvas


def setup_firebase_connection():
    global firebase_initialized
    try:
        if not firebase_initialized:  # Only initialize if not already done
            cred = credentials.Certificate(r'/Users/huraira/Desktop/project/fbis-19de1-firebase-adminsdk-idgon-e51fea33fe.json')
            firebase_admin.initialize_app(cred, {
                'databaseURL': 'https://fbis-19de1-default-rtdb.firebaseio.com/',
                'storageBucket': 'fbis-19de1.appspot.com'
            })
            firebase_initialized = True
            print("Firebase successfully initialized")
        return True
    except Exception as e:
        print(f"Firebase connection error: {e}")
        return False


def upload_heatmap_to_firebase(heatmap_path):
    """Upload heatmap image to Firebase Storage"""
    try:
        bucket = storage.bucket()
        blob = bucket.blob(f'heatmaps/heatmap_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png')
        blob.upload_from_filename(heatmap_path)
        print(f"Heatmap uploaded to Firebase Storage: {blob.name}")
        return True
    except Exception as e:
        print(f"Error uploading heatmap to Firebase Storage: {e}")
        return False

def send_unknown_person_to_firebase(frame_number, unknown_id, box):
    global firebase_initialized
    if not firebase_initialized:
        return False

    try:
        ref = db.reference('unknown_detections')
        unknown_person_data = {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'frame_number': frame_number,
            'unknown_id': unknown_id,
            'isvisible': False,
            'detection_type': 'unknown_person',
            'location': {
                'x': float(box[0]),
                'y': float(box[1]),
                'width': float(box[2]),
                'height': float(box[3])
            }
        }
        new_detection_ref = ref.push(unknown_person_data)
        print(f"Unknown person detected and logged to Firebase: {unknown_id}")
        return True
    except Exception as e:
        print(f"Error logging unknown person to Firebase: {e}")
        return False


def setup_mongodb_connection():
    try:
        mongo_client = MongoClient(
            'mongodb+srv://maqbooldot786:Alikhan9029@nodeexpressproject.wriwa87.mongodb.net/NodeExpressProject?retryWrites=true&w=majority')
        mongo_db = mongo_client['NodeExpressProject']
        mongo_collection = mongo_db['person_counts']
        return mongo_collection
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        return None
mongo_collection = setup_mongodb_connection()


def send_time_spent_to_mongodb(data, mongo_collection_name, mongo_client):
    try:
        db = mongo_client['NodeExpressProject']
        collection = db[mongo_collection_name]
        collection.insert_one(data)
        print(f"Data successfully sent to MongoDB collection '{mongo_collection_name}': {data}")

    except Exception as e:
        print(f"Error sending time spent data to MongoDB: {e}")


def read_and_clear_ids(file_path):
    global manual_ids
    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        with open(file_path, 'r') as f:
            manual_ids = [line.strip() for line in f.readlines()]
        open(file_path, 'w').close()

def draw_dotted_line(img, pt1, pt2, color, base_size, time_spent, max_time=100, dot_spacing=10):
    line_length = np.linalg.norm(np.array(pt2) - np.array(pt1))
    num_dots = int(line_length / dot_spacing)
    direction = np.array(pt2) - np.array(pt1)
    direction = direction / np.linalg.norm(direction)

    for i in range(num_dots):
        dot_center = np.array(pt1) + i * dot_spacing * direction
        size = base_size + int((time_spent / max_time) * base_size * 50)  # Reduced multiplier
        size = max(size, 2)
        cv2.circle(img, tuple(dot_center.astype(int)), size, color, -1)

def upload_tracking_lines_to_firebase(tracking_lines_path):
    """Upload tracking lines image to Firebase Storage"""
    try:
        bucket = storage.bucket()
        blob = bucket.blob(f'tracking_lines/tracking_lines_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png')
        blob.upload_from_filename(tracking_lines_path)
        print(f"Tracking lines uploaded to Firebase Storage: {blob.name}")
        return True
    except Exception as e:
        print(f"Error uploading tracking lines to Firebase Storage: {e}")
        return False

def get_foot_position(box):
    x, y, w, h = box
    foot_x = x
    foot_y = y + h / 2
    return foot_x, foot_y

def draw_tracking_lines(annotated_frame, track_history, position_time_spent, boxes, track_ids, tracking_canvas,
                        path_popularity, path_directions):
    for unique_id, track in track_history.items():
        if len(track) > 1:
            color = colors[hash(unique_id) % len(colors)]
            for i in range(1, len(track)):
                pt1 = (int(track[i - 1][0]), int(track[i - 1][1]))
                pt2 = (int(track[i][0]), int(track[i][1]))

                box_index = track_ids.index(unique_id) if unique_id in track_ids else -1
                if box_index != -1:
                    box = boxes[box_index]
                    pt1 = get_foot_position(box)
                path_angle = calculate_path_angle(pt1, pt2)
                path_key = (pt1, pt2)
                path_popularity[path_key] += 1
                path_directions[path_key].append(path_angle)

                time_spent_at_point = position_time_spent[unique_id][pt1]
                time_spent_at_point = time_spent_at_point if time_spent_at_point is not None else 0
                draw_dotted_line(annotated_frame, pt1, pt2, color, 3, time_spent_at_point)
                cv2.line(tracking_canvas, pt1, pt2, color, 2)


def process_detections(boxes, track_ids, classes, annotated_frame, frame_number, track_history, person_id_mapping,
                       index_counter, manual_ids, position_time_spent, time_spent, unknown_counter, mongo_client):
    person_count = 0
    detected_ids = set()

    for box, track_id, class_id in zip(boxes, track_ids, classes):
        if class_id == 0:
            person_count += 1
            detected_ids.add(track_id)

            if track_id not in person_id_mapping:
                if index_counter < len(manual_ids):
                    person_id_mapping[track_id] = manual_ids[index_counter]
                    index_counter += 1
                else:
                    person_id_mapping[track_id] = f"unknown_{unknown_counter}"

                    # Push unknown person detection to MongoDB
                    send_unknown_person_to_firebase(frame_number, f"unknown_{unknown_counter}", box)
                    unknown_counter += 1 # Increment the unknown counter

            unique_id = person_id_mapping[track_id]

            if unique_id is not None:
                foot_x, foot_y = get_foot_position(box)

                # Update tracking history
                track = track_history[unique_id]
                if len(track) == 0 or not (np.abs(track[-1][0] - foot_x) < 10 and np.abs(track[-1][1] - foot_y) < 10):
                    track.append((foot_x, foot_y))

                current_position = (int(foot_x), int(foot_y))
                position_time_spent[unique_id][current_position] += 1

                box_color = (0, 255, 0)
                if 'unknown' in unique_id:
                    box_color = (0, 0, 255)

                cv2.rectangle(annotated_frame, (int(box[0] - box[2] / 2), int(box[1] - box[3] / 2)),
                              (int(box[0] + box[2] / 2), int(box[1] + box[3] / 2)), box_color, 2)

                if time_spent[unique_id][0] is None:
                    time_spent[unique_id][0] = frame_number * frame_duration

                current_time_spent = (frame_number * frame_duration) - time_spent[unique_id][0]

                text_position = (int(box[0] - box[2] / 2), int(box[1] - box[3] / 2) - 10)
                cv2.putText(annotated_frame, f'ID: {unique_id}', text_position, font, font_scale, (0, 0, 0),
                            font_thickness + 2, cv2.LINE_AA)
                cv2.putText(annotated_frame, f'ID: {unique_id}', text_position, font, font_scale, (255, 255, 255),
                            font_thickness, cv2.LINE_AA)

                time_position = (int(box[0] - box[2] / 2), int(box[1] - box[3] / 2) - 50)
                time_text = f'Time: {current_time_spent:.2f}s'
                (text_width, text_height), _ = cv2.getTextSize(time_text, font, font_scale, font_thickness)
                cv2.rectangle(annotated_frame, (time_position[0] - 5, time_position[1] - text_height - 5),
                              (time_position[0] + text_width + 5, time_position[1] + 5), (0, 0, 0), -1)
                cv2.putText(annotated_frame, time_text, time_position, font, font_scale, (0, 255, 255), font_thickness,
                            cv2.LINE_AA)

    return person_count, index_counter, detected_ids, unknown_counter


# Create or open the CSV file for appending
csv_file_path = "tracking_data.csv"
with open(csv_file_path, mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(["ID", "Entry Time", "Exit Time", "Total Time Spent"])  # Header
success, frame = cap.read()
tracking_canvas = np.zeros((frame.shape[0], frame.shape[1], 3), dtype=np.uint8)
path_popularity = defaultdict(int)
path_directions = defaultdict(list)

if not setup_firebase_connection():
    print("Warning: Firebase initialization failed. Unknown person detection will not be logged.")
while cap.isOpened():
    current_time = time.time()
    if current_time - last_read_time >= 2:
        read_and_clear_ids(r'C:\Users\user.DESKTOP-OMQ89VA\PycharmProjects\pythonProject8\recognized_ids.txt')
        last_read_time = current_time

    success, frame = cap.read()
    if not success:
        break

    results = model.track(frame, persist=True, classes=0, device = 'mps')

    if len(results) == 0 or results[0].boxes is None:
        # For tracking window
        cv2.imshow("YOLOv8 Tracking", frame)

        # For heatmap window
        heatmap_frame = heatmap.generate_heatmap(frame.copy())
        cv2.imshow("Heatmap", heatmap_frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
        frame_number += 1
        continue

    boxes = results[0].boxes.xywh.cpu().numpy() if results[0].boxes is not None else []
    track_ids = results[0].boxes.id.int().cpu().tolist() if results[0].boxes.id is not None else []
    classes = results[0].boxes.cls.int().cpu().tolist() if results[0].boxes.cls is not None else []

    # Tracking window preparation
    annotated_frame = frame.copy()
    draw_tracking_lines(annotated_frame, track_history, position_time_spent, boxes, track_ids, tracking_canvas, path_popularity, path_directions)

    person_count, index_counter, detected_ids, unknown_counter = process_detections(
        boxes, track_ids, classes, annotated_frame, frame_number,
        track_history, person_id_mapping, index_counter,
        manual_ids, position_time_spent, time_spent, unknown_counter,
        MongoClient('mongodb+srv://maqbooldot786:Alikhan9029@nodeexpressproject.wriwa87.mongodb.net/NodeExpressProject?retryWrites=true&w=majority')  # Pass the MongoClient
    )

    if mongo_collection is not None:
        try:
            # Update the existing document or insert if it doesn't exist
            mongo_collection.update_one(
                {'frame_number': frame_number},  # Match on the frame number
                {
                    '$set': {  # Update these fields
                        'timestamp': datetime.now(),
                        'total_persons': len(detected_ids)
                    }
                },
                upsert=True  # Create a new document if no match is found
            )
        except Exception as e:
            print(f"Error updating person count: {e}")

    for unique_id in detected_ids:
        if unique_id not in tracked_people:  # If ID is new
            entry_time = frame_number * frame_duration
            tracked_people[unique_id] = [entry_time, None]  # Store entry time and exit time

    for unique_id in list(tracked_people.keys()):
        if unique_id not in detected_ids:
            exit_time = frame_number * frame_duration
            entry_time = tracked_people[unique_id][0]
            total_time = exit_time - entry_time

            manual_id = person_id_mapping.get(unique_id, f"unknown_{unknown_counter}")

            # Write to CSV
            with open(csv_file_path, mode='a', newline='') as file:
                writer = csv.writer(file)
                writer.writerow([manual_id, entry_time, exit_time, total_time])

            time_spent_data = {
                "ID": manual_id,
                "Entry Time": entry_time,
                "Exit Time": exit_time,
                "Total Time Spent": total_time,
                "Timestamp": datetime.now()
            }
            send_time_spent_to_mongodb(time_spent_data, "time_spent", MongoClient(
                'mongodb+srv://maqbooldot786:Alikhan9029@nodeexpressproject.wriwa87.mongodb.net/NodeExpressProject?retryWrites=true&w=majority'))

            del tracked_people[unique_id]

    person_count_text = f'Total Detected Persons: {len(detected_ids)}'
    cv2.putText(annotated_frame, person_count_text, (10, 30), font, 1, (255, 0, 0), 2, cv2.LINE_AA)

    cv2.imshow("YOLOv8 Tracking", annotated_frame)
    heatmap_frame = heatmap.generate_heatmap(frame.copy())
    cv2.imshow("Heatmap", heatmap_frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

    frame_number += 1

    final_heatmap = heatmap.generate_heatmap(frame.copy())
    heatmap_save_path = "final_heatmap.png"
    cv2.imwrite(heatmap_save_path, final_heatmap)
    print(f"Final heatmap has been saved to {heatmap_save_path}")

draw_directional_flow_canvas(tracking_canvas, path_popularity, path_directions)
tracking_canvas_path = "tracking_paths_canvas.png"
cv2.imwrite(tracking_canvas_path, tracking_canvas)
print(f"Tracking paths canvas has been saved to {tracking_canvas_path}")


cap.release()
cv2.destroyAllWindows()

if setup_firebase_connection():
    # Upload heatmap
    final_heatmap_path = "final_heatmap.png"
    cv2.imwrite(final_heatmap_path, final_heatmap)
    upload_heatmap_to_firebase(final_heatmap_path)

    # Upload tracking lines
    upload_tracking_lines_to_firebase(tracking_canvas_path)

for unique_id, (entry_time, exit_time) in tracked_people.items():
    if exit_time is None:
        exit_time = frame_number * frame_duration
    total_time_spent = exit_time - entry_time

    # Write to CSV
    with open(csv_file_path, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([unique_id, entry_time, exit_time, total_time_spent])

    time_spent_data = {
        "ID": unique_id,
        "Entry Time": entry_time,
        "Exit Time": exit_time,
        "Total Time Spent": total_time_spent,
        "Timestamp": datetime.now()
    }
    send_time_spent_to_mongodb(time_spent_data, "time_spent", MongoClient(
        'mongodb+srv://maqbooldot786:Alikhan9029@nodeexpressproject.wriwa87.mongodb.net/NodeExpressProject?retryWrites=true&w=majority'))

print(f"Tracking data has been written to {csv_file_path}.")