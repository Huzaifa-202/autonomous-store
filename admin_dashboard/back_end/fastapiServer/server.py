import os
import pandas as pd
from prophet import Prophet
from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
import certifi  # Add this import
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np

# FastAPI instance
app = FastAPI()

# CORS settings
origins = [
    "http://localhost:5173",  # Frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB configuration with SSL certificate verification
MONGO_URL = "mongodb+srv://maqbooldot786:Alikhan9029@nodeexpressproject.wriwa87.mongodb.net/NodeExpressProject?retryWrites=true&w=majority"
client = MongoClient(MONGO_URL, tlsCAFile=certifi.where())  # Add tlsCAFile parameter
db = client["NodeExpressProject"]
collection = db["predictions"]

def fetch_data_from_mongo():
    """Fetch and prepare data from MongoDB."""
    data = list(collection.find({}, {"_id": 0, "y": 1, "ds": 1}))
    if not data:
        raise HTTPException(status_code=404, detail="No data found in MongoDB.")
    df = pd.DataFrame(data)
    df['ds'] = pd.to_datetime(df['ds'])
    return df

# Rest of your code remains the same
def forecast_sales(forecast_period: str = '1 year'):
    """Generate sales forecast using Prophet."""
    period_mapping = {
        '6 months': 180,
        '1 year': 365,
        '2 years': 730
    }
    forecast_days = period_mapping.get(forecast_period, 365)
    
    # Fetch and prepare data
    df_prophet = fetch_data_from_mongo()
    
    # Initialize and fit Prophet model
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        seasonality_mode='multiplicative'
    )
    model.fit(df_prophet)
    
    # Create future dates dataframe
    future = model.make_future_dataframe(periods=forecast_days, freq='D')
    
    # Generate forecast
    forecast = model.predict(future)
    
    # Prepare plot data matching frontend expectations
    plot_data = []
    last_actual_date = df_prophet['ds'].max()
    for index, row in forecast.iterrows():
        current_date = row['ds']
        is_actual = current_date <= last_actual_date
        plot_data.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'actual': float(df_prophet.loc[df_prophet['ds'] == current_date, 'y'].iloc[0]) if is_actual else None,
            'predicted': float(row['yhat']),
            'upper': float(row['yhat_upper']),
            'lower': float(row['yhat_lower'])
        })
    
    # Prepare CSV data matching frontend expectations
    csv_data = []
    for _, row in forecast.iterrows():
        csv_data.append({
            'ds': row['ds'].strftime('%Y-%m-%d'),
            'yhat': float(row['yhat']),
            'yhat_lower': float(row['yhat_lower']),
            'yhat_upper': float(row['yhat_upper'])
        })
    
    # Calculate total forecasted sales (only for future dates)
    future_forecast = forecast[forecast['ds'] > last_actual_date]
    total_forecast_sales = float(future_forecast['yhat'].sum())
    
    return {
        "plot_data": plot_data,
        "csv_data": csv_data,
        "total_forecast_sales": total_forecast_sales
    }

@app.get("/forecast/{forecast_period}")
async def get_forecast(forecast_period: str):
    """Endpoint to get sales forecast data."""
    try:
        if forecast_period not in ['6 months', '1 year', '2 years']:
            raise HTTPException(
                status_code=400,
                detail="Invalid forecast period. Must be '6 months', '1 year', or '2 years'"
            )
        forecast_data = forecast_sales(forecast_period)
        return JSONResponse(content=forecast_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)