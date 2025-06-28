
class Config:
    # Hardcoded configuration variables
    SECRET_KEY = "thisisahighsecret"
    DEBUG_MODE = True  # Corresponds to FLASK_DEBUG=1

    # Database connection details
    db_user = "dhir4j"
    db_password = "m4dc0d3r"
    db_host = "hard4j-4630.postgres.pythonanywhere-services.com"
    db_port = "14630"
    db_name = "shedload"

    # SQLAlchemy Configuration
    SQLALCHEMY_DATABASE_URI = (
        f"postgresql://{db_user}:{db_password}"
        f"@{db_host}:{db_port}/{db_name}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # CORS Configuration
    CORS_ORIGINS_ENV = "https://www.shedloadoverseas.com,https://logisti-x-frontend.vercel.app,https://server.shedloadoverseas.com,https://6000-firebase-studio-1749958562544.cluster-fdkw7vjj7bgguspe3fbbc25tra.cloudworkstations.dev"
    CORS_ORIGINS = CORS_ORIGINS_ENV.split(',')


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    # Set to True based on user request (FLASK_DEBUG=1) for debugging in production
    DEBUG = True


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
