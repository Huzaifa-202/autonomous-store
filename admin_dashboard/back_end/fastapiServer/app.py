import pandas as pd
import matplotlib.pyplot as plt
from prophet import Prophet
from sklearn.metrics import mean_squared_error
import pickle

# Read the dataset from Google Drive
file_path = '/content/drive/MyDrive/Grocery Sales Dataset/Retail_Transactions_Dataset.csv'
df = pd.read_csv(file_path)

# Convert 'Date' column to datetime format and set it as index
df['Date'] = pd.to_datetime(df['Date'])
df.set_index('Date', inplace=True)

# Function to save the trained model
def save_model(model, product_column):
    model_path = f'/content/drive/MyDrive/Grocery Sales Dataset/{product_column}_prophet_model.pkl'
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f'Model for {product_column} saved to {model_path}')

# Function to load the trained model
def load_model(product_column):
    model_path = f'/content/drive/MyDrive/Grocery Sales Dataset/{product_column}_prophet_model.pkl'
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    return model

# Function to forecast sales for multiple products with Prophet
def forecast_multiple_products_prophet(product_columns, forecast_period='1 month'):
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

        # Initialize and fit Prophet model with daily seasonality enabled
        try:
            model = Prophet(daily_seasonality=True)
            model.fit(df_prophet)
            # Save the model
            save_model(model, product_column)
        except Exception as e:
            print(f"Error fitting Prophet model for {product_column}: {e}")
            continue

        # Create future dates for forecasting
        forecast_days = {'1 month': 30, '3 months': 90, '6 months': 180, '1 year': 365, '2 years': 730}.get(forecast_period, 30)

        # Future dataframe should start from the last date of the original data
        last_date = df_prophet['ds'].max()
        future = model.make_future_dataframe(periods=forecast_days, freq='D')
        future = future[future['ds'] > last_date]  # Ensure forecast starts after the last date

        # Forecast future values
        try:
            forecast = model.predict(future)
        except Exception as e:
            print(f"Error making forecast with Prophet for {product_column}: {e}")
            continue

        # Extract forecast results
        forecast_df = forecast[['ds', 'yhat']].set_index('ds')
        forecast_df = forecast_df[forecast_df.index > last_date]  # Filter forecast to start after the last date

        # Rename the forecast column to include the product name
        forecast_df.rename(columns={'yhat': product_column}, inplace=True)

        # Append the product's forecast DataFrame to the list
        all_forecasts.append(forecast_df)

        # Plotting with Prophet's built-in function
        plt.figure(figsize=(14, 7))
        fig = model.plot(forecast)
        plt.title(f'Forecast vs Actuals for {product_column} ({forecast_period})')

        # Add a vertical line for the end of the training period
        plt.axvline(x=last_date, color='gray', linestyle='--', label='Training End')
        plt.legend()
        plt.show()

        # Calculate Mean Squared Error for the available test data if present
        try:
            test = df_prophet[df_prophet['ds'] > last_date]
            if not test.empty:
                test_forecast = model.predict(test[['ds']])
                mse = mean_squared_error(test['y'], test_forecast['yhat'])
                print(f'Mean Squared Error for {product_column}: {mse}')
            else:
                print(f'No test data available for MSE calculation for {product_column}.')
        except Exception as e:
            print(f'Error calculating MSE with Prophet for {product_column}: {e}')

    # Check if we have any forecasts to concatenate
    if not all_forecasts:
        print("No forecasts were generated. Exiting.")
        return

    # Concatenate all forecasts into a single DataFrame
    combined_forecasts = pd.concat(all_forecasts, axis=1)

    # Fill any missing values with forward fill
    combined_forecasts = combined_forecasts.ffill()

    # Calculate the total forecasted amount for each product
    product_totals = combined_forecasts.sum().to_frame(name='Total').T
    product_totals.index = ['Total']

    # Reset index to include dates as a column
    combined_forecasts = combined_forecasts.reset_index()

    # Append totals to the DataFrame
    combined_forecasts = pd.concat([combined_forecasts, product_totals], ignore_index=True)

    # Define the path for the combined CSV file
    combined_forecast_path = f'/content/drive/MyDrive/Grocery Sales Dataset/Future_Forecasts_Prophet_{forecast_period}.csv'

    # Save the combined forecast to a CSV file
    combined_forecasts.to_csv(combined_forecast_path, index=False)

    print(f'Future forecasts for all products ({forecast_period}) saved to {combined_forecast_path}')

    # Plot the bar chart for the total forecasted amounts
    plt.figure(figsize=(10, 6))
    if not product_totals.empty:
        product_totals_row = product_totals.iloc[0]  # Get the totals row
        plt.bar(product_totals_row.index, product_totals_row.values)
        plt.xlabel('Product')
        plt.ylabel('Total Forecasted Quantity')
        plt.title('Total Forecasted Quantity for Each Product')
        plt.xticks(rotation=45)
        plt.tight_layout()

        # Save the bar chart as an image
        bar_chart_path = f'/content/drive/MyDrive/Grocery Sales Dataset/Forecast_Bar_Chart_{forecast_period}.png'
        plt.savefig(bar_chart_path)
        plt.show()

        print(f'Bar chart saved to {bar_chart_path}')
    else:
        print("No total forecast data available for bar chart.")

# User input for product forecasting
products_to_forecast = ['Milk', 'Chips', 'Toothpaste']  # Replace with the desired product names
forecast_horizon = '2 years'  # Options: '1 month', '3 months', '6 months', '1 year', '2 years'

forecast_multiple_products_prophet(products_to_forecast, forecast_period=forecast_horizon)

# Function to make predictions using the saved model
def predict_sales(product_column, future_periods):
    model = load_model(product_column)

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