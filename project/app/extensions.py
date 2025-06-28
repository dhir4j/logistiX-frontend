from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from marshmallow import ValidationError

db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
