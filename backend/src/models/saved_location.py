from sqlalchemy import Column, Integer, String
# Import Base from your database config
from src.config.database import Base

class SavedLocation(Base):
    # 1. The name of the table in PostgreSQL
    __tablename__ = "saved_locations"

    # 2. The Columns
    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, unique=True, nullable=False)

    # Optional: A helper to print the object nicely for debugging
    def __repr__(self):
        return f"<SavedLocation(id={self.id}, city='{self.city}')>"