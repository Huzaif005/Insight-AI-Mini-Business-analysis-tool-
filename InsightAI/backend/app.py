from flask import Flask, jsonify
from flask_cors import CORS

# Import blueprints
from routes.upload_routes import upload_bp
from routes.analysis_routes import analysis_bp
from routes.prediction_routes import prediction_bp
from routes.insight_routes import insight_bp
from routes.report_routes import report_bp
from routes.chatbot_routes import chat_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    # Register blueprints
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    app.register_blueprint(analysis_bp, url_prefix='/api/analysis')
    app.register_blueprint(prediction_bp, url_prefix='/api/predictions')
    app.register_blueprint(insight_bp, url_prefix='/api/insights')
    app.register_blueprint(report_bp, url_prefix='/api/reports')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')

    @app.route('/health')
    def health():
        return jsonify({'status': 'ok'})

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=8000, debug=True)
