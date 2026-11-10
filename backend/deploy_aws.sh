#!/usr/bin/env bash
# ==============================================================================
# Kuduchee 2.0 - AWS EC2 Automated Deployment Script (Ubuntu 24.04 LTS)
# ==============================================================================
set -e

DOMAIN="api.kuduchee.in"
PROJECT_DIR="/home/ubuntu/kuduchee"
BACKEND_DIR="${PROJECT_DIR}/backend"
VENV_DIR="${BACKEND_DIR}/venv"
SERVICE_NAME="kuduchee"

echo "===================================================================="
echo "🚀 Starting Kuduchee Backend Setup on AWS EC2..."
echo "===================================================================="

# 1. Update OS and install prerequisites
sudo apt-get update -y
sudo apt-get install -y python3-pip python3-venv python3-dev libpq-dev nginx curl git certbot python3-certbot-nginx

# 2. Setup Virtual Environment
echo "📦 Setting up Python Virtual Environment..."
if [ ! -d "${VENV_DIR}" ]; then
    python3 -m venv "${VENV_DIR}"
fi

source "${VENV_DIR}/bin/activate"
pip install --upgrade pip
pip install -r "${BACKEND_DIR}/requirements.txt"

# 3. Environment file check
if [ ! -f "${BACKEND_DIR}/.env" ]; then
    echo "⚠️ Creating default .env file in ${BACKEND_DIR}..."
    cat <<EOT > "${BACKEND_DIR}/.env"
DEBUG=False
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
ALLOWED_HOSTS=api.kuduchee.in,kuduchee.in,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://kuduchee.in,https://www.kuduchee.in,http://localhost:5173
CSRF_TRUSTED_ORIGINS=https://api.kuduchee.in,https://kuduchee.in
EOT
fi

# 4. Database Migrations, Cache Table, and Static Collection
echo "⚙️ Running Django Migrations & Cache Setup..."
cd "${BACKEND_DIR}"
python manage.py migrate --noinput
python manage.py createcachetable || true
python manage.py collectstatic --noinput

# Ensure media directory exists and has correct permissions
mkdir -p "${BACKEND_DIR}/media"
sudo chown -R ubuntu:www-data "${BACKEND_DIR}/media"
sudo chmod -R 775 "${BACKEND_DIR}/media"

# 5. Setup Gunicorn Systemd Service
echo "🔧 Configuring Systemd Service (${SERVICE_NAME})..."
sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null <<EOT
[Unit]
Description=Kuduchee Django Gunicorn Daemon
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=${BACKEND_DIR}
Environment="PATH=${VENV_DIR}/bin"
ExecStart=${VENV_DIR}/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 kuduchee_backend.wsgi:application

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOT

sudo systemctl daemon-reload
sudo systemctl enable ${SERVICE_NAME}
sudo systemctl restart ${SERVICE_NAME}

# 6. Setup Nginx Reverse Proxy
echo "🌐 Configuring Nginx Configuration..."
sudo tee /etc/nginx/sites-available/kuduchee > /dev/null <<EOT
server {
    server_name ${DOMAIN};

    client_max_body_size 50M;

    location /static/ {
        alias ${BACKEND_DIR}/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location /media/ {
        alias ${BACKEND_DIR}/media/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location / {
        include proxy_params;
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOT

sudo ln -sf /etc/nginx/sites-available/kuduchee /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "===================================================================="
echo "✅ Kuduchee Backend is running and proxied via Nginx!"
echo "➡️ Next, obtain your Free SSL Certificate with Let's Encrypt by running:"
echo "   sudo certbot --nginx -d ${DOMAIN}"
echo "===================================================================="

