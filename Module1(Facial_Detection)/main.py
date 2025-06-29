import cv2
import os
import pickle
import face_recognition
import numpy as np
import cvzone
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from firebase_admin import storage
from datetime import datetime
import requests

# Initialize Firebase
cred = credentials.Certificate("/Users/huraira/Desktop/project/fbis-19de1-firebase-adminsdk-idgon-e51fea33fe.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': "fbis-19de1.appspot.com"
})

# Initialize Firestore
db = firestore.client()
bucket = storage.bucket()

# Open video capture
cap = cv2.VideoCapture(0)
cap.set(3, 640)
cap.set(4, 480)

imgBackground = cv2.imread('Resources/background.png')

# Importing the mode images into a list
folderModePath = 'Resources/Modes'
modePathList = os.listdir(folderModePath)
imgModeList = []

for path in modePathList:
    imgModeList.append(cv2.imread(os.path.join(folderModePath, path)))

# Load the encoding file
print("Loading Encode File ...")
file = open('EncodeFile.p', 'rb')
encodeListKnownWithIds = pickle.load(file)
file.close()
encodeListKnown, customerIds = encodeListKnownWithIds
print("Encode File Loaded")

modeType = 0
counter = 0
id = -1
imgCustomer = []

# Set threshold for face recognition
THRESHOLD = 0.6  # Adjust this value as needed

while True:
    success, img = cap.read()

    # Resize the image for faster processing
    imgS = cv2.resize(img, (0, 0), None, 0.25, 0.25)
    imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)

    faceCurFrame = face_recognition.face_locations(imgS)
    encodeCurFrame = face_recognition.face_encodings(imgS, faceCurFrame)

    # Overlay the webcam feed and mode images
    imgBackground[162:162 + 480, 55:55 + 640] = img
    imgBackground[44:44 + 633, 808:808 + 414] = imgModeList[modeType]

    if faceCurFrame:
        for encodeFace, faceLoc in zip(encodeCurFrame, faceCurFrame):
            matches = face_recognition.compare_faces(encodeListKnown, encodeFace)
            faceDis = face_recognition.face_distance(encodeListKnown, encodeFace)
            print("matches", matches)
            print("faceDis", faceDis)

            # Find the closest match and check if the distance is below the threshold
            matchIndex = np.argmin(faceDis)
            print("Match Index", matchIndex)

            if matches[matchIndex] and faceDis[matchIndex] < THRESHOLD:
                # Known face detected
                y1, x2, y2, x1 = faceLoc
                y1, x2, y2, x1 = y1 * 4, x2 * 4, y2 * 4, x1 * 4
                bbox = 55 + x1, 162 + y1, x2 - x1, y2 - y1
                imgBackground = cvzone.cornerRect(imgBackground, bbox, rt=0)
                id = customerIds[matchIndex]

                if counter == 0:
                    cvzone.putTextRect(imgBackground, "Loading", (275, 400))
                    cv2.imshow("Facial Detection", imgBackground)
                    cv2.waitKey(1)
                    counter = 1
                    modeType = 1

        if counter != 0:

            if counter == 1:
                # Get customer data from Firestore
                customer_ref = db.collection('users').document(id)
                customerInfo = customer_ref.get().to_dict()
                print(customerInfo)

                # Write person ID to a text file
                # Write person ID to a text file
                # Write person ID to a text file
                with open('person_id.txt', 'a') as f:  # Open file in append mode
                    # Check if the ID is already in the file to avoid duplicates
                    with open('person_id.txt', 'r') as f_read:
                        existing_ids = f_read.readlines()
                        existing_ids = [line.strip() for line in existing_ids]

                    # Append the new ID only if it's not already in the file
                    if id not in existing_ids:
                        f.write(id + '\n')  # Each ID will be written on a new line

                # Download image from URL
                img_response = requests.get(customerInfo['imageUrl'])
                img_array = np.frombuffer(img_response.content, np.uint8)
                imgCustomer = cv2.imdecode(img_array, cv2.COLOR_BGRA2BGR)

                # Resize the image to 216x216
                imgCustomer = cv2.resize(imgCustomer, (216, 216))

                # Update the customer's visit data
                customer_ref.update({
                    'numberOfVisits': firestore.Increment(1),
                    'lastVisitedTime': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })

            if modeType != 3:
                if 10 < counter < 20:
                    modeType = 2
                imgBackground[44:44 + 633, 808:808 + 414] = imgModeList[modeType]

                if counter <= 10:
                    # Calculate text offset based on name length
                    name = f"{customerInfo['firstname']} {customerInfo['lastname']}"
                    offset = 10  # Base offset

                    # Display customer info on the background image
                    cv2.putText(imgBackground, str(customerInfo['numberOfVisits']), (861, 125),
                                cv2.FONT_HERSHEY_COMPLEX, 1, (255, 255, 255), 1)
                    cv2.putText(imgBackground, str(customerInfo['phoneNumber']), (1006, 550),
                                cv2.FONT_HERSHEY_COMPLEX, 0.5, (255, 255, 255), 1)
                    cv2.putText(imgBackground, str(id), (1006, 493),
                                cv2.FONT_HERSHEY_COMPLEX, 0.5, (255, 255, 255), 1)

                    # Display name with calculated offset
                    cv2.putText(imgBackground, name, (808 + offset, 445),
                                cv2.FONT_HERSHEY_COMPLEX, 1, (50, 50, 50), 1)

                    imgBackground[175:175 + 216, 909:909 + 216] = imgCustomer

                counter += 1

                if counter >= 20:
                    counter = 0
                    modeType = 0
                    customerInfo = []
                    imgCustomer = []
                    imgBackground[44:44 + 633, 808:808 + 414] = imgModeList[modeType]

    else:
        modeType = 0
        counter = 0

    # Display the final image
    cv2.imshow("Facial Detection", imgBackground)

    # Exit on key press
    cv2.waitKey(1)