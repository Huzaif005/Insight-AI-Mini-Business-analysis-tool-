from flask import Blueprint, request, jsonify
from services.chatbot_service import chat_response

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/', methods=['POST'])
def chat():
    data = request.json or {}
    message = data.get('message', '')
    if not message:
        return jsonify({'error': 'No message provided'}), 400
        
    response = chat_response(message)
    return jsonify({'response': response})
