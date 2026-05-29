from flask import Blueprint, jsonify
from services.insight_generator import generate_insights

insight_bp = Blueprint('insight', __name__)

@insight_bp.route('/', methods=['GET'])
def insights():
    insights = generate_insights()
    return jsonify({'insights': insights})
