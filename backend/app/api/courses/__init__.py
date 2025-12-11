from flask import Blueprint

course_bp = Blueprint('courses', __name__, url_prefix='/api/courses')

from . import routes