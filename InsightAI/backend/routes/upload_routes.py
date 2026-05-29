from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from utils.file_handler import save_uploaded_file

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'no file provided'}), 400
    file = request.files['file']
    filename = secure_filename(file.filename)
    path = save_uploaded_file(file, filename)
    return jsonify({'filename': filename, 'path': path}), 201
