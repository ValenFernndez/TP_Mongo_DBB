import os

class Config:
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://mongo:27017")
    DB_NAME = os.environ.get("DB_NAME", "clientes_db")