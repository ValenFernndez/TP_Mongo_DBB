from flask import Flask, jsonify, request, render_template
from pymongo import MongoClient
from bson.objectid import ObjectId
from bson.json_util import dumps
from datetime import datetime
from config import Config
import os

app = Flask(__name__, template_folder="templates", static_folder="static")
app.config.from_object(Config)

# Conexión a MongoDB
mongo_uri = app.config['MONGO_URI']
client = MongoClient(mongo_uri)
db = client[app.config['DB_NAME']]
clients_col = db['clientes']

# --------- RUTAS FRONTEND -----------
@app.route("/")
def index():
    # la página usará fetch para consumir la API
    return render_template("index.html")

# --------- API REST CRUD ------------
# Crear cliente
@app.route("/api/clients", methods=["POST"])
def create_client():
    data = request.json
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    # campos elementales: nombre, email, telefono, direccion
    cliente = {
        "nombre": data.get("nombre", ""),
        "email": data.get("email", ""),
        "telefono": data.get("telefono", ""),
        "direccion": data.get("direccion", ""),
        "created_at": datetime.utcnow()
    }
    res = clients_col.insert_one(cliente)
    cliente["_id"] = str(res.inserted_id)
    cliente["created_at"] = cliente["created_at"].isoformat() + "Z"
    return jsonify(cliente), 201

# Leer todos los clientes
@app.route("/api/clients", methods=["GET"])
def get_clients():
    cursor = clients_col.find().sort("created_at", -1)
    clients = []
    for c in cursor:
        c["_id"] = str(c["_id"])
        if isinstance(c.get("created_at"), datetime):
            c["created_at"] = c["created_at"].isoformat() + "Z"
        clients.append(c)
    return jsonify(clients), 200

# Leer cliente por id
@app.route("/api/clients/<client_id>", methods=["GET"])
def get_client(client_id):
    try:
        c = clients_col.find_one({"_id": ObjectId(client_id)})
        if not c:
            return jsonify({"error": "Cliente no encontrado"}), 404
        c["_id"] = str(c["_id"])
        if isinstance(c.get("created_at"), datetime):
            c["created_at"] = c["created_at"].isoformat() + "Z"
        return jsonify(c), 200
    except Exception:
        return jsonify({"error": "ID inválido"}), 400

# Actualizar cliente
@app.route("/api/clients/<client_id>", methods=["PUT"])
def update_client(client_id):
    data = request.json
    if not data:
        return jsonify({"error": "JSON body required"}), 400
    update = {}
    for field in ("nombre","email","telefono","direccion"):
        if field in data:
            update[field] = data[field]
    if not update:
        return jsonify({"error":"Nada para actualizar"}), 400
    try:
        res = clients_col.update_one({"_id": ObjectId(client_id)}, {"$set": update})
        if res.matched_count == 0:
            return jsonify({"error":"Cliente no encontrado"}), 404
        c = clients_col.find_one({"_id": ObjectId(client_id)})
        c["_id"] = str(c["_id"])
        if isinstance(c.get("created_at"), datetime):
            c["created_at"] = c["created_at"].isoformat() + "Z"
        return jsonify(c), 200
    except Exception:
        return jsonify({"error": "ID inválido"}), 400

# Eliminar cliente
@app.route("/api/clients/<client_id>", methods=["DELETE"])
def delete_client(client_id):
    try:
        res = clients_col.delete_one({"_id": ObjectId(client_id)})
        if res.deleted_count == 0:
            return jsonify({"error":"Cliente no encontrado"}), 404
        return jsonify({"message":"Cliente eliminado"}), 200
    except Exception:
        return jsonify({"error": "ID inválido"}), 400

# Debug / health
@app.route("/health")
def health():
    return jsonify({"status":"ok"}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
