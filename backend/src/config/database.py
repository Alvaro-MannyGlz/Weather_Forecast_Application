import os
import psycopg2 
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv, find_dotenv

# 1. Load environment variables
load_dotenv(find_dotenv())

# Retrieve individual connection details
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'weather_app')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'password123')

# Priority: Use explicit DATABASE_URL from .env if it exists, otherwise build it.
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def get_db_connection():
    """
    Establishes a raw connection to the PostgreSQL database using environment variables.
    Returns: A psycopg2 connection object or None if the connection fails.
    """
    try:
        # Establish the connection using psycopg2
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        return conn
    
    except psycopg2.Error as e:
        # Print a descriptive error message if the connection fails
        print(f"--- DATABASE CONNECTION ERROR ---")
        print(f"Failed to connect to PostgreSQL. Check .env variables and ensure the server is running.")
        print(f"Details: {e}")
        return None

# 3. Create the Engine (The connection to Postgres for ORM)
# echo=True is useful for debugging SQL queries, set to False in production
engine = create_engine(DATABASE_URL, echo=False)

# 4. Create the SessionLocal (The factory that creates sessions)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. Create the Base (Used by your models)
Base = declarative_base()

# Optional: Self-test block 
# if __name__ == '__main__':
#     print("Attempting to connect to the database...")
#     conn = get_db_connection()
#     if conn:
#         print("SUCCESS: Raw Database connection established!")
#         conn.close()
#     else:
#         print("FAILURE: Could not connect to the database.")