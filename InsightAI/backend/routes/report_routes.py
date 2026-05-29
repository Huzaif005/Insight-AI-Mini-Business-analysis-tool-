from flask import Blueprint, jsonify, send_from_directory
from services.report_service import list_reports, REPORTS_DIR

report_bp = Blueprint('report', __name__)

@report_bp.route('/', methods=['GET'])
def reports():
    reports = list_reports()
    return jsonify({'reports': reports})

@report_bp.route('/<filename>', methods=['GET'])
def download_report(filename):
    return send_from_directory(REPORTS_DIR, filename, as_attachment=True)

