import cv2
import face_recognition
import pickle
import os
import imghdr  # To detect image types
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from firebase_admin import storage

# Initialize Firebase
cred = credentials.Certificate("/Users/huraira/Desktop/project/fbis-19de1-firebase-adminsdk-idgon-e51fea33fe.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': "https://fbis-19de1-default-rtdb.firebaseio.com/",
    'storageBucket': "fbis-19de1.appspot.com"
})

# Specify the image folder name in Firebase Storage
image_folder_name = 'images'  # Adjust this to match your Firebase Storage folder name

# Create local Images folder if it doesn't exist
os.makedirs('images', exist_ok=True)

# Supported image formats
SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg', '.webp']

# Download images from Firebase Storage
bucket = storage.bucket()
blobs = bucket.list_blobs(prefix=image_folder_name + '/')
pathList = []

for blob in blobs:
    # Skip directories
    if blob.name.endswith('/'):
        continue

    # Extract filename
    original_filename = os.path.basename(blob.name)

    # Download the file
    local_file_path = os.path.join('Images', original_filename)
    blob.download_to_filename(local_file_path)

    # Determine the actual image type
    try:
        img_type = imghdr.what(local_file_path)

        if img_type:
            # Create a new filename with the correct extension
            base_name = os.path.splitext(original_filename)[0]
            new_filename = f"{base_name}.{img_type}"
            new_file_path = os.path.join('Images', new_filename)

            # Rename the file if the extension is different
            if new_filename != original_filename:
                os.rename(local_file_path, new_file_path)
                print(f"Renamed: {original_filename} -> {new_filename}")

            pathList.append(new_filename)
            print(f"Downloaded and verified: {new_filename}")
        else:
            print(f"Unrecognized image format: {original_filename}")
            os.remove(local_file_path)
    except Exception as e:
        print(f"Error processing {original_filename}: {e}")
        if os.path.exists(local_file_path):
            os.remove(local_file_path)

# Importing student Images
imgList = []
customerIds = []
for path in pathList:
    # Check if it's a supported image format
    if any(path.lower().endswith(fmt) for fmt in ['.png', '.jpg', '.jpeg', '.webp']):
        img_path = os.path.join('Images', path)

        try:
            # Read image
            img = cv2.imread(img_path)

            # Convert to RGB
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

            # Find face encodings
            face_encodings = face_recognition.face_encodings(img_rgb)

            # Only add image and ID if a face is detected
            if face_encodings:
                imgList.append(img)
                # Use the filename without extension as customer ID
                customerIds.append(os.path.splitext(path)[0])
            else:
                print(f"No face detected in {path}. Skipping...")
        except Exception as e:
            print(f"Error processing image {path}: {e}")

print("Images with faces:", customerIds)


def findEncodings(imagesList):
    encodeList = []
    for img in imagesList:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encode = face_recognition.face_encodings(img)[0]
        encodeList.append(encode)

    return encodeList


print("Encoding Started ...")
encodeListKnown = findEncodings(imgList)
encodeListKnownWithIds = [encodeListKnown, customerIds]
print("Encoding Complete")

file = open("EncodeFile.p", 'wb')
pickle.dump(encodeListKnownWithIds, file)
file.close()
print("File Saved")