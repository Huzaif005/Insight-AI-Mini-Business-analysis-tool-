from flask import Blueprint, jsonify
from services.visualization_service import generate_charts

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/charts', methods=['GET'])
def charts():
    charts_info = generate_charts()
    return jsonify({'charts': charts_info})
