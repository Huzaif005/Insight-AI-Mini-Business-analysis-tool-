import os
from sqlalchemy import create_engine

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database.sqlite')
ENGINE = create_engine(f'sqlite:///{DB_PATH}', echo=False)
