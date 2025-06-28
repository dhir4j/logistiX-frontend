import os
from dotenv import load_dotenv

# This will load the .env file from the root of your project directory
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=dotenv_path)

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY")

    # Get individual components
    db_user = os.environ.get('DB_USER')
    db_password = os.environ.get('DB_PASSWORD')
    db_host = os.environ.get('DB_HOST')
    db_port = os.environ.get('DB_PORT', '5432') # Add default port to prevent crash
    db_name = os.environ.get('DB_NAME')

    # Check if all required DB variables are present to give a clearer error
    if not all([db_user, db_password, db_host, db_name, SECRET_KEY]):
        raise ValueError("One or more critical environment variables (DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, SECRET_KEY) are not set. Please check your .env file or server configuration.")

    SQLALCHEMY_DATABASE_URI = (
        f"postgresql://{db_user}:{db_password}"
        f"@{db_host}:{db_port}/{db_name}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS_ENV = os.environ.get("CORS_ORIGINS")
    CORS_ORIGINS = CORS_ORIGINS_ENV.split(',') if CORS_ORIGINS_ENV else "*"

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
