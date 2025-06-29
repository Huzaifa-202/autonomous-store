import os
import time
import pandas as pd
from prophet import Prophet
import pickle
from collections import Counter
from pymongo import MongoClient
import certifi  # Add this import
from typing import List
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import cloudinary
import cloudinary.uploader

# FastAPI instance
app = FastAPI()

# CORS settings (keep your existing CORS configuration)
origins = [
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:8800",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Updated MongoDB connection with SSL certificate verification
client = MongoClient(
    "mongodb+srv://maqbooldot786:Alikhan9029@nodeexpressproject.wriwa87.mongodb.net/NodeExpressProject?retryWrites=true&w=majority",
    tlsCAFile=certifi.where()  # Add this line
)
db = client['NodeExpressProject']
collection = db['transactions']

# Cloudinary configuration
cloudinary.config(
    cloud_name="defqjgykg",
    api_key="995857291595671",
    api_secret="AXDB36aPNm0QmqCUCYdeL1Jm6XE"
)

# Load the model
def load_model():
    with open('combined_prophet_model.pkl', 'rb') as f:
        models = pickle.load(f)
    return models

# Preprocess data
def preprocess_data(data):
    df = pd.DataFrame(data)
    df['Date'] = pd.to_datetime(df['Date']).dt.date
    df['Product'] = df['Product'].apply(eval)
    df_grouped = df.groupby('Date')['Product'].apply(lambda x: [item for sublist in x for item in sublist]).reset_index()
    df_grouped['Product_Counts'] = df_grouped['Product'].apply(Counter)
    df_products = pd.DataFrame(df_grouped['Product_Counts'].to_list(), index=df_grouped['Date']).fillna(0).astype(int)
    df_final = df_products.reset_index()
    df_final['Date'] = pd.to_datetime(df_final['Date'])
    df_final.set_index('Date', inplace=True)
    return df_final

# Define request model
class PredictRequest(BaseModel):
    forecast_period: str
    products: List[str] = []

# Prediction endpoint
@app.post('/predict')
async def predict(request: PredictRequest):
    start_time = time.time()  # Initialize start time for timing the request

    # Fetch data from MongoDB
    data = list(collection.find().limit(50000))
    fetch_time = time.time()
    print(f"Time to fetch data: {fetch_time - start_time:.2f} seconds")
    
    df = preprocess_data(data)
    models = load_model()
    all_forecasts = {}

    # Use specified products if provided, otherwise use all product columns
    product_columns = request.products if request.products else df.columns.tolist()

    for product_column in product_columns:
        if product_column not in df.columns:
            continue
        
        ts_data = df[product_column].dropna()
        if len(ts_data) < 2:
            continue

        df_prophet = ts_data.reset_index()
        df_prophet.columns = ['ds', 'y']
        model = models.get(product_column)
        if model is None:
            continue

        future_days = {'1 month': 30, '3 months': 90, '6 months': 180, '1 year': 365, '2 years': 730}.get(request.forecast_period, 30)
        future = model.make_future_dataframe(periods=future_days, freq='D')
        forecast = model.predict(future)

        # *New Code: Filtering the forecasted data to only include the relevant date range*
        start_date = df_prophet['ds'].max() + pd.Timedelta(days=1)  # Start after the last actual date
        end_date = start_date + pd.Timedelta(days=future_days)
        forecast_df = forecast[(forecast['ds'] >= start_date) & (forecast['ds'] < end_date)][['ds', 'yhat']]
        
        forecast_df.rename(columns={'yhat': product_column}, inplace=True)
        forecast_df.set_index('ds', inplace=True)
        all_forecasts[product_column] = forecast_df

    # Combine all forecasts
    combined_forecasts = pd.concat(all_forecasts.values(), axis=1).ffill()

    # Save the forecast CSV locally
    combined_forecast_path = 'Future_Forecasts_Prophet.csv'
    combined_forecasts.to_csv(combined_forecast_path)

    # Upload CSV to Cloudinary
    csv_upload_response = cloudinary.uploader.upload(combined_forecast_path, resource_type="raw", folder="product_forecasts")

    # Get the URL of the uploaded CSV file
    csv_file_url = csv_upload_response.get("secure_url")

    # Return the Cloudinary URL and success message
    return JSONResponse(content={'message': 'Predictions made successfully.', 'csv_file_url': csv_file_url})

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8080)
