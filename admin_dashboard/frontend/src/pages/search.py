import csv
from collections import defaultdict

def find_duplicates(csv_file):
    # Dictionary to store occurrences of values from the second column
    value_count = defaultdict(list)
    
    # Open and read the CSV file
    with open(csv_file, mode='r', newline='', encoding='utf-8') as file:
        reader = csv.reader(file)
        headers = next(reader)  # Skip the header row
        for idx, row in enumerate(reader, start=2):  # start=2 to account for the header row
            second_column_value = row[2]
            value_count[second_column_value].append(idx)
    
    # Find duplicates and print first 100
    duplicates_found = 0
    for value, indices in value_count.items():
        if len(indices) > 1:
            for i in indices:
                print(f"Duplicate value: '{value}' found at row index: {i}")
                duplicates_found += 1
                if duplicates_found >= 1000:
                    return

# Provide the path to your CSV file here
csv_file = 'Retail_Transactions_Dataset.csv'
find_duplicates(csv_file)
