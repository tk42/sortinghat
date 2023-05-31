from sqlalchemy.ext.declarative import declarative_base

"""
    Registering Tables in the database
"""

Base = declarative_base()

from .user_model import User
from .stickynotes_model import StickyNotes
