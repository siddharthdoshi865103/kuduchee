"""
WSGI configuration for PythonAnywhere hosting.
Copy and paste this content into your PythonAnywhere WSGI configuration file:
/var/www/siddharth200306_pythonanywhere_com_wsgi.py
"""

import os
import sys

# 1. Path to your backend directory on PythonAnywhere
path = '/home/siddharth200306/kuduchee/backend'
if path not in sys.path:
    sys.path.append(path)

# 2. Set environment variables
os.environ['DJANGO_SETTINGS_MODULE'] = 'kuduchee_backend.settings'
os.environ['DEBUG'] = 'False'
os.environ['ALLOWED_HOSTS'] = 'siddharth200306.pythonanywhere.com,kuduchee.in,www.kuduchee.in,localhost,127.0.0.1'

# 3. Serve application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
