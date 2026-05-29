from flask import Blueprint, request, jsonify
from services.prediction_service import predict

prediction_bp = Blueprint('prediction', __name__)

@prediction_bp.route('/', methods=['POST'])
def predict_route():
    data = request.get_json() or {}
    result = predict(data)
    return jsonify({'prediction': result})
