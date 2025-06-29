import pandas as pd
from collections import Counter
from prophet import Prophet
from sklearn.metrics import mean_squared_error
import matplotlib.pyplot as plt
import pickle

# Function to save the trained model
def save_model(model, product_column):
    model_path = f'combined_prophet_model.pkl'
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f'Model for {product_column} saved to {model_path}')

# Function to load the trained model
def load_model(product_column):
    model_apath = f'combined_prophet_model.pkl'
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    return model

# Function to preprocess data
def preprocess_data(file_path):
    # Read the dataset
    df = pd.read_csv(file_path)

    # Convert 'Date' column to datetime and remove the time part
    df['Date'] = pd.to_datetime(df['Date']).dt.date

    # Ensure 'Product' column is a list
    df['Product'] = df['Product'].apply(eval)  # Convert string representation of list to actual list

    # Group by 'Date' and concatenate product lists for each day
    df_grouped = df.groupby('Date')['Product'].apply(lambda x: [item for sublist in x for item in sublist]).reset_index()

    # Flatten product lists and count occurrences per day
    df_grouped['Product_Counts'] = df_grouped['Product'].apply(Counter)

    # Expand each dictionary (Counter) into individual columns for each product
    df_products = pd.DataFrame(df_grouped['Product_Counts'].to_list(), index=df_grouped['Date']).fillna(0).astype(int)

    # Reset the index to have Date as a column again
    df_final = df_products.reset_index()

    return df_final

# Function to forecast sales for multiple products with Prophet
def forecast_multiple_products_prophet(df, product_columns, forecast_period='1 month'):
    if not all(col in df.columns for col in product_columns):
        print("One or more products not found in dataset.")
        return

    all_forecasts = []

    for product_column in product_columns:
        ts_data = df[product_column].dropna()  # Drop any NaN values
        if len(ts_data) < 2:
            print(f"Not enough data to forecast {product_column}.")
            continue

        # Prepare data for Prophet
        df_prophet = ts_data.reset_index()
        df_prophet.columns = ['ds', 'y']

        # Initialize and fit Prophet model
        model = Prophet(daily_seasonality=True)
        model.fit(df_prophet)
        save_model(model, product_column)

        # Create future dates for forecasting
        forecast_days = {'1 month': 30, '3 months': 90, '6 months': 180, '1 year': 365, '2 years': 730}.get(forecast_period, 30)
        last_date = df_prophet['ds'].max()
        future = model.make_future_dataframe(periods=forecast_days, freq='D')
        future = future[future['ds'] > last_date]

        # Forecast future values
        forecast = model.predict(future)
        forecast_df = forecast[['ds', 'yhat']].set_index('ds')
        forecast_df = forecast_df[forecast_df.index > last_date]  # Filter to start after last date
        forecast_df.rename(columns={'yhat': product_column}, inplace=True)
        all_forecasts.append(forecast_df)

        # Plotting
        plt.figure(figsize=(14, 7))
        fig = model.plot(forecast)
        plt.axvline(x=last_date, color='gray', linestyle='--', label='Training End')
        plt.title(f'Forecast vs Actuals for {product_column} ({forecast_period})')
        plt.legend()
        plt.show()

        # Mean Squared Error calculation
        test = df_prophet[df_prophet['ds'] > last_date]
        if not test.empty:
            test_forecast = model.predict(test[['ds']])
            mse = mean_squared_error(test['y'], test_forecast['yhat'])
            print(f'Mean Squared Error for {product_column}: {mse}')

    # Concatenate forecasts
    combined_forecasts = pd.concat(all_forecasts, axis=1).ffill()
    product_totals = combined_forecasts.sum().to_frame(name='Total').T
    combined_forecasts.reset_index(inplace=True)
    combined_forecasts = pd.concat([combined_forecasts, product_totals], ignore_index=True)

    # Save the combined forecast to a CSV file
    combined_forecast_path = f'Future_Forecasts_Prophet_{forecast_period}.csv'
    combined_forecasts.to_csv(combined_forecast_path, index=False)
    print(f'Future forecasts for all products ({forecast_period}) saved to {combined_forecast_path}')

# Main workflow
file_path = 'Retail_Transactions_Dataset.csv'
df_preprocessed = preprocess_data(file_path)

# User input for product forecasting
products_to_forecast = ['Milk', 'Chips', 'Toothpaste']  # Replace with the desired product names
forecast_horizon = '2 years'  # Options: '1 month', '3 months', '6 months', '1 year', '2 years'

# Forecasting
forecast_multiple_products_prophet(df_preprocessed, products_to_forecast, forecast_period=forecast_horizon)