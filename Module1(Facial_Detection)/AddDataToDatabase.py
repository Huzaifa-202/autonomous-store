import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred,{
    'databaseURL' : "https://fbis-19de1-default-rtdb.firebaseio.com/"
})

ref = db.reference('Customers')

data = {
    "321654":
        {
            "name": "Huzaifa Asad",
            "Contact No": "03220832996",
            "starting_year": 2024,
            "total_visit": 0,
            "standing": "M",
            "year": 0,
        },
    "852741":
        {
            "name": "Muhammad Ahmed",
            "Contact No": "03120432566",
            "starting_year": 2024,
            "total_visit": 0,
            "standing": "M",
            "year": 1
        },
    "963852":
        {
            "name": "Elon Musk",
            "Contact No": "03330432566",
            "starting_year": 2024,
            "total_visit": 0,
            "standing": "M",
            "year": 1,
        }


}

for key, value in data.items():
    ref.child(key).set(value)