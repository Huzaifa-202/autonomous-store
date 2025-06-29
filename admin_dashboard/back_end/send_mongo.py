from pymongo import MongoClient
from datetime import datetime

# MongoDB connection using your Atlas URI
def get_db_connection():
    client = MongoClient(
        "mongodb+srv://maqbooldot786:Alikhan9029@nodeexpressproject.wriwa87.mongodb.net/NodeExpressProject?retryWrites=true&w=majority",
        tls=True  # Ensures secure connection
    )
    db = client["NodeExpressProject"]  # Replace with your database name if different
    return db["users"]  # Replace with your collection name if different

# Insert a staff user
def insert_staff(username, password, email):
    users_collection = get_db_connection()

    # Check if username or email already exists
    if users_collection.find_one({"$or": [{"username": username}, {"email": email}]}):
        print("Error: Username or email already exists.")
        return

    user_data = {
        "username": username,
        "password": password,  # Store as plain text here; consider hashing for production
        "email": email,
        "userType": "staff",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }

    # Insert into MongoDB
    result = users_collection.insert_one(user_data)
    print(f"Staff user created with ID: {result.inserted_id}")

# Insert an admin user
def insert_admin(username, password, email):
    users_collection = get_db_connection()

    # Check if username or email already exists
    if users_collection.find_one({"$or": [{"username": username}, {"email": email}]}):
        print("Error: Username or email already exists.")
        return

    user_data = {
        "username": username,
        "password": password,  # Store as plain text here; consider hashing for production
        "email": email,
        "userType": "admin",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }

    # Insert into MongoDB
    result = users_collection.insert_one(user_data)
    print(f"Admin user created with ID: {result.inserted_id}")

# Main menu
def main():
    print("User Management System")
    print("1. Create Staff User")
    print("2. Create Admin User")
    choice = input("Enter your choice (1/2): ").strip()

    username = input("Enter username: ").strip()
    email = input("Enter email: ").strip()
    password = input("Enter password: ").strip()  # User sets their own password

    if choice == "1":
        insert_staff(username, password, email)
    elif choice == "2":
        insert_admin(username, password, email)
    else:
        print("Invalid choice. Please run the script again.")

# Run the script
if __name__ == "__main__":
    main()
