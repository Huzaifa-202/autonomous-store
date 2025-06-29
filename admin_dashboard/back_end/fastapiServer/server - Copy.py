import os
import pandas as pd
from prophet import Prophet
import matplotlib.pyplot as plt
from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
import joblib
import cloudinary
import cloudinary.uploader
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

# FastAPI instance
app = FastAPI()

# CORS settings
origins = [
    "http://localhost:5173",  # Add your frontend URL here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# MongoDB configuration
MONGO_URL = "mongodb+srv://maqbooldot786:Alikhan9029@nodeexpressproject.wriwa87.mongodb.net/NodeExpressProject?retryWrites=true&w=majority"
client = MongoClient(MONGO_URL)
db = client["NodeExpressProject"]
collection = db["predictions"]

# Cloudinary configuration
cloudinary.config(
    cloud_name="defqjgykg",
    api_key="995857291595671",
    api_secret="AXDB36aPNm0QmqCUCYdeL1Jm6XE"
)

# Helper function to fetch data from MongoDB and prepare DataFrame
def fetch_data_from_mongo():
    data = list(collection.find({}, {"_id": 0, "y": 1, "ds": 1}))
    if not data:
        raise HTTPException(status_code=404, detail="No data found in MongoDB.")
    df = pd.DataFrame(data)
    df['ds'] = pd.to_datetime(df['ds'])  # Ensure date is properly formatted
    return df

# Forecasting function using Prophet with total sales calculation
def forecast_total_sales_prophet(forecast_period='1 year'):
    # Fetch data from MongoDB
    df_prophet = fetch_data_from_mongo()

    # Initialize the Prophet model
    model = Prophet()

    # Fit the model
    model.fit(df_prophet)

    # Save the fitted model to a .pkl file
    model_file_path = 'prophet_model_Sales.pkl'
    joblib.dump(model, model_file_path)

    # Create future dates for forecasting
    forecast_days = {'1 month': 30, '3 months': 90, '6 months': 180, '1 year': 365, '2 years': 730}.get(forecast_period, 365)
    future = model.make_future_dataframe(periods=forecast_days, freq='D')

    # Forecast future values
    forecast = model.predict(future)

    # Extract forecast results
    forecast_df = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]

    # Calculate total forecast sales
    last_actual_date = df_prophet['ds'].max()
    forecasted_sales_df = forecast[forecast['ds'] > last_actual_date]
    total_forecast_sales = forecasted_sales_df['yhat'].sum()

    # Create a new row for the total sales
    total_row = pd.DataFrame({
        'ds': ['Total Forecasted Sales'],
        'yhat': [total_forecast_sales],
        'yhat_lower': [None],
        'yhat_upper': [None]
    })

    # Append the total row to the forecast DataFrame
    forecast_df = pd.concat([forecast_df, total_row], ignore_index=True)

    # Save the forecast to a CSV file
    forecast_file_path = f'Forecasted_Sales_{forecast_period}.csv'
    forecast_df.to_csv(forecast_file_path, index=False)

    # Upload the CSV to Cloudinary as a raw file
    csv_upload_response = cloudinary.uploader.upload(forecast_file_path, resource_type="raw", folder="sales_forecasts")

    # Get the URL of the uploaded CSV file
    csv_file_url = csv_upload_response.get("secure_url")

    # Plot the forecast
    plt.figure(figsize=(14, 7))
    fig = model.plot(forecast)
    plt.title(f'Sales Forecast with Prophet ({forecast_period})')
    plt.xlabel('Date')
    plt.ylabel('Total Cost')

    # Save the plot as a file
    plot_file_path = f'Forecasted_Sales_{forecast_period}.png'
    fig.savefig(plot_file_path)
    plt.close(fig)

    # Upload the plot image to Cloudinary
    image_upload_response = cloudinary.uploader.upload(plot_file_path, folder="sales_forecasts")

    # Get the URL of the uploaded image
    plot_image_url = image_upload_response.get("secure_url")

    # Return both the CSV and image URLs, along with the total forecasted sales
    return {
        "csv_file_url": csv_file_url,
        "plot_image_url": plot_image_url,
        "total_forecast_sales": total_forecast_sales
    }

# API route to return forecast CSV, image URL, and total forecast sales
@app.get("/forecast/{forecast_period}")
async def get_forecast(forecast_period: str):
    try:
        # Get the forecast file URLs (CSV, image URL, and total forecast sales)
        forecast_data = forecast_total_sales_prophet(forecast_period)

        # Return the forecast details including the total forecast sales
        return forecast_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to download the forecast CSV from Cloudinary
@app.get("/download/csv/{forecast_period}")
async def download_csv(forecast_period: str):
    try:
        forecast_data = forecast_total_sales_prophet(forecast_period)
        return {"csv_file_url": forecast_data["csv_file_url"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to download the forecast image (plot) from Cloudinary
@app.get("/download/plot/{forecast_period}")
async def download_plot(forecast_period: str):
    try:
        forecast_data = forecast_total_sales_prophet(forecast_period)
        return {"plot_image_url": forecast_data["plot_image_url"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
