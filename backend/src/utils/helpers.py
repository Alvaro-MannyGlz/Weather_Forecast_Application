"""
Utility functions and decorators for common operations across the application.

This module provides:
1. Database session management helpers
2. Error handling decorators for route handlers
3. Standardized response formatters
4. Input validation functions

Goals:
- Reduce code duplication in route handlers
- Provide consistent error handling
- Sanitize user input to prevent injection attacks
- Standardize API response formats
"""

from functools import wraps
from flask import jsonify
from src.config.database import SessionLocal
from src.config.constants import STATUS_INTERNAL_ERROR


def get_db_session():
    """
    Get a new database session from the session factory.
    
    Creates a new SQLAlchemy session bound to the configured SQLite database.
    
    IMPORTANT: Always call session.close() in a finally block to ensure
    the connection is returned to the pool.
    
    Returns:
        sqlalchemy.orm.Session: A new database session
    
    Usage Example:
        session = get_db_session()
        try:
            location = session.query(SavedLocation).first()
            return jsonify(location.to_dict())
        finally:
            session.close()
    """
    return SessionLocal()


def handle_db_errors(func):
    """
    Decorator for Flask route handlers to provide automatic database session
    management and standardized error handling.
    
    This decorator:
    1. Creates a fresh database session before route execution
    2. Passes the session as the first argument to the route handler
    3. Automatically closes the session in a finally block
    4. Catches exceptions and returns standardized error responses
    5. Distinguishes between validation errors (400) and server errors (500)
    
    Error Handling:
    - ValueError: Input validation error → 400 Bad Request
    - RuntimeError: Logic error → 400 Bad Request
    - Other exceptions: Unexpected error → 500 Internal Server Error
    
    Usage Example:
        @app.route('/api/locations', methods=['POST'])
        @handle_db_errors
        def create_location(session):
            data = request.get_json()
            city = data.get('city')
            if not city:
                raise ValueError("City is required")
            
            location = SavedLocation(city=city)
            session.add(location)
            session.commit()
            return jsonify({'id': location.id}), 201
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        session = None
        try:
            session = SessionLocal()
            return func(session, *args, **kwargs)
        except ValueError as e:
            # Input validation errors
            return jsonify({"error": str(e)}), 400
        except RuntimeError as e:
            # Logic errors
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            # Unexpected errors
            return jsonify({"error": f"Server error: {str(e)}"}), STATUS_INTERNAL_ERROR
        finally:
            if session:
                session.close()
    return wrapper


def make_error_response(message, status_code=STATUS_INTERNAL_ERROR):
    """
    Create standardized error response format.
    
    Args:
        message (str): Error message to return
        status_code (int): HTTP status code
    
    Returns:
        tuple: (JSON response, status code)
    """
    return jsonify({"error": message}), status_code


def make_success_response(data, status_code=200, meta=None):
    """
    Create standardized success response format.
    
    Args:
        data: Main response data
        status_code (int): HTTP status code
        meta (dict): Optional metadata (pagination, counts, etc.)
    
    Returns:
        tuple: (JSON response, status code)
    """
    response = {"data": data}
    if meta:
        response["meta"] = meta
    return jsonify(response), status_code


def validate_city_input(city_name):
    """
    Validate and sanitize city name input.
    
    Args:
        city_name (str): City name to validate
    
    Raises:
        ValueError: If city_name is invalid
    
    Returns:
        str: Cleaned city name
    """
    if not city_name or not isinstance(city_name, str):
        raise ValueError("City name must be a non-empty string")
    
    cleaned = city_name.strip()
    if not cleaned:
        raise ValueError("City name cannot be empty or whitespace only")
    
    if len(cleaned) > 100:
        raise ValueError("City name is too long (max 100 characters)")
    
    # Prevent SQL injection and XSS
    if any(char in cleaned for char in [';', '--', '/*', '*/', 'xp_', 'sp_']):
        raise ValueError("City name contains invalid characters")
    
    return cleaned
