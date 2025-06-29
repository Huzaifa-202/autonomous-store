from ultralytics import YOLO

# Load a model

model = YOLO("/Users/huraira/Desktop/project/out_of_stock/train5/weights/best.pt")  # load a custom model

# Predict with the model
results = model("/Users/huraira/Desktop/project/out_of_stock/IMG_3382.MOV", save =True, conf = 0.1, device ='mps')  # predict on an image