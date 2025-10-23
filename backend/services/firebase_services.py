import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
# load_dotenv()  # Loads .env file
# firebase_credential_path  =os.getenv("FIREBASE_CREDENTIAL_PATH ")

# if not firebase_credential_path :
#   raise Exception("firebase_credential_path  is not set in environment variables")
creds = {
#   add your creds



}


# THIS ADD YOUR OWN CREDS AND TEST IT OUT in creds
#CREATE A VARIABLE NAMED creds and paste credentials.json here
cred = credentials.Certificate(creds)
firebase_admin.initialize_app(cred)
db = firestore.client()