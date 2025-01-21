from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(128))
    conversations = relationship('Conversation', back_populates='user')
    created_at = Column(DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Conversation(Base):
    __tablename__ = 'conversations'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    user_message = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user = relationship('User', back_populates='conversations')

class Database:
    def __init__(self):
        DATABASE_URL = "postgresql://user:password@db:5432/chatdb"
        self.engine = create_engine(DATABASE_URL)
        
        Base.metadata.create_all(self.engine)
        
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
    
    def create_user(self, username, email, password):
        user = User(username=username, email=email)
        user.set_password(password)
        self.session.add(user)
        try:
            self.session.commit()
            return user
        except:
            self.session.rollback()
            raise
    
    def get_user_by_username(self, username):
        return self.session.query(User).filter_by(username=username).first()
    
    def save_conversation(self, user_id, user_message, ai_response):
        conversation = Conversation(
            user_id=user_id,
            user_message=user_message,
            ai_response=ai_response
        )
        self.session.add(conversation)
        self.session.commit()
    
    def get_user_conversations(self, user_id):
        return self.session.query(Conversation).filter_by(user_id=user_id).all()