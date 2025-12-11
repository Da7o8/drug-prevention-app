FROM python:3.11-slim

# Thiết lập biến môi trường
ENV PYTHONUNBUFFERED 1
ENV FLASK_APP run.py

# Thiết lập thư mục làm việc bên trong container
WORKDIR /usr/src/app

# Cài đặt các dependencies hệ thống cần thiết cho psycopg2 (kết nối PostgreSQL)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy file requirements và cài đặt các thư viện Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn ứng dụng vào container
COPY . .

# Lệnh mặc định khi container khởi động
CMD ["python", "run.py"]