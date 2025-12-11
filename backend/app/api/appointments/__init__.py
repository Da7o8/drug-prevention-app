from flask import Blueprint

appointment_bp = Blueprint('appointments', __name__, url_prefix='/appointments')

from . import routes