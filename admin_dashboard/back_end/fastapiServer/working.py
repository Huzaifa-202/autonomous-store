import pandas as pd
import matplotlib.pyplot as plt
from prophet import Prophet
import pickle
from collections import Counter

# Function to preprocess the dataset
def preprocess_data(file_path):
    # Read the dataset
    df = pd.read_csv(file_path)
    
    # Convert 'Date' column to datetime and remove the time part
    df['Date'] = pd.to_datetime(df['Date']).dt.date
    
    # Group by 'Date' and concatenate product lists
    df['Product'] = df['Product'].apply(eval)  # Ensure 'Product' column is a list
    df_grouped = df.groupby('Date')['Product'].apply(lambda x: [item for sublist in x for item in sublist]).reset_index()
    
    # Flatten product lists and count occurrences per day
    df_grouped['Product_Counts'] = df_grouped['Product'].apply(Counter)
    
    # Expand the product counts into individual columns
    df_products = pd.DataFrame(df_grouped['Product_Counts'].to_list(), index=df_grouped['Date']).fillna(0).astype(int)
    
    # Reset the index to have Date as a column again
    df_final = df_products.reset_index()
    df_final['Date'] = pd.to_datetime(df_final['Date'])
    df_final.set_index('Date', inplace=True)
    
    return df_final

# Function to save the trained model
def save_model(models):
    model_path = 'combined_prophet_model.pkl'
    with open(model_path, 'wb') as f:
        pickle.dump(models, f)
    print(f'Combined model saved to {model_path}')

# Function to load the trained model
def load_model():
    model_path = 'combined_prophet_model.pkl'
    with open(model_path, 'rb') as f:
        models = pickle.load(f)
    return models

# Function to forecast sales for multiple products with Prophet
def forecast_multiple_products_prophet(df, product_columns, forecast_period='1 month'):
    if not all(col in df.columns for col in product_columns):
        print("One or more products not found in dataset.")
        return

    all_forecasts = {}
    models = {}

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

        # Save the model in the dictionary
        models[product_column] = model

        # Create future dates for forecasting
        forecast_days = {'1 month': 30, '3 months': 90, '6 months': 180, '1 year': 365, '2 years': 730}.get(forecast_period, 30)
        future = model.make_future_dataframe(periods=forecast_days, freq='D')

        # Forecast future values
        forecast = model.predict(future)

        # Extract forecast results
        forecast_df = forecast[['ds', 'yhat']].set_index('ds')
        forecast_df.rename(columns={'yhat': product_column}, inplace=True)

        # Store the forecast in the dictionary
        all_forecasts[product_column] = forecast_df

    # Save the combined model
    save_model(models)

    # Combine forecasts into a single DataFrame
    combined_forecasts = pd.concat(all_forecasts.values(), axis=1)

    # Fill any missing values with forward fill
    combined_forecasts = combined_forecasts.ffill()

    # Save combined forecasts to CSV
    combined_forecast_path = f'Future_Forecasts_Prophet_{forecast_period}.csv'
    combined_forecasts.to_csv(combined_forecast_path)

    # Save actual sales data to CSV
    actual_sales_path = 'saved.csv'
    df.to_csv(actual_sales_path)
    print(f'Actual sales data saved to {actual_sales_path}')

    # Plotting
    plt.figure(figsize=(14, 7))
    plt.plot(df.index, df[product_columns], label='Actual Sales', alpha=0.5)

    # Plot forecasted data
    for product_column in product_columns:
        plt.plot(combined_forecasts.index, combined_forecasts[product_column], label=f'Forecasted {product_column}')

    plt.title(f'Sales Forecast with Prophet ({forecast_period})')
    plt.xlabel('Date')
    plt.ylabel('Sales')
    plt.legend()
    plt.show()

# Main execution
file_path = 'Retail_Transactions_Dataset.csv'
df = preprocess_data(file_path)

# Example user input for product forecasting
products_to_forecast = ['Milk', 'Chips', 'Toothpaste', 'Honey']  # Replace with the desired product names
forecast_horizon = '1 month'  # Options: '1 month', '3 months', '6 months', '1 year', '2 years'

forecast_multiple_products_prophet(df, products_to_forecast, forecast_period=forecast_horizon)

# Function to make predictions using the saved model
def predict_sales(product_column, future_periods):
    models = load_model()
    model = models.get(product_column)
    if model is None:
        print(f"No model found for {product_column}.")
        return None

    # Create future dataframe
    future = model.make_future_dataframe(periods=future_periods, freq='D')

    # Make predictions
    forecast = model.predict(future)

    # Extract relevant columns
    forecast_result = forecast[['ds', 'yhat']]

    return forecast_result

# Example usage
# future_forecast = predict_sales('Milk', 30)  # Predict next 30 days for Milk
# print(future_forecast)