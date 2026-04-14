import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv, find_dotenv

# 1. Load environment variables
load_dotenv(find_dotenv())

# 2. Build SQLite connection string (only supported database)
db_path = os.getenv('SQLITE_DB_PATH', 'weather_app.db')
DATABASE_URL = f"sqlite:///{os.path.abspath(db_path)}"

print(f"[DATABASE] Using SQLITE database at: {os.path.abspath(db_path)}")

# 3. Create the Engine
# echo=True is useful for debugging SQL queries, set to False in production
engine = create_engine(
    DATABASE_URL,
    echo=False,
    # Allow connections across threads for Flask request handling.
    connect_args={"check_same_thread": False}
)

# 4. Create the SessionLocal (The factory that creates sessions)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. Create Base for model declarations
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