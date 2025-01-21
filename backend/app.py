from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from database import Database
from ai_handler import AIHandler
import os
from functools import wraps

app = Flask(__name__, 
    static_folder='../frontend/static',
    template_folder='../frontend/templates')
app.secret_key = os.urandom(24)

db = Database()
ai_handler = AIHandler(os.getenv('OPENAI_API_KEY'))

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
@login_required
def index():
    return render_template('index.html', username=session.get('username'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.json
        user = db.get_user_by_username(data['username'])
        if user and user.check_password(data['password']):
            session['user_id'] = user.id
            session['username'] = user.username
            return jsonify({'success': True})
        return jsonify({'success': False, 'message': 'Invalid credentials'})
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.json
        try:
            user = db.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password']
            )
            return jsonify({'success': True})
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)})
    return render_template('register.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/api/chat', methods=['POST'])
@login_required
def chat():
    try:
        data = request.json
        user_message = data['message']
        ai_response = ai_handler.get_response(user_message)
        
        db.save_conversation(session['user_id'], user_message, ai_response)
        
        return jsonify({'response': ai_response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)