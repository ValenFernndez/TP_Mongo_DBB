# imagen base
FROM python:3.11-slim

# variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# trabajar en /app
WORKDIR /app

# instalar dependencias del sistema
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# copiar archivos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# puerto en el que correrá Flask
EXPOSE 5000

ENV FLASK_APP=app.app
ENV FLASK_RUN_PORT=5000

CMD ["python", "-u", "app/app.py"]
