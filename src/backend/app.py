import os
import json
from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import pymysql

app = Flask(__name__)

# ✅ MySQL Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Waves1234_@localhost/inventory_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = "supersecretkey"

bcrypt = Bcrypt(app)
jwt = JWTManager(app)
db = SQLAlchemy(app)

# ✅ FIXED: Proper CORS Configuration (Allow frontend access with credentials)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

@app.after_request
def add_cors_headers(response):
    """Ensures every response has the correct CORS headers"""
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

# ✅ Product Model (MySQL)
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(150), nullable=False)
    supplier = db.Column(db.String(150), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    image = db.Column(db.String(255), nullable=True)

# ✅ User Model (Using JSON for Authentication)
USERS_FILE = "users.json"

def load_users():
    try:
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)

# ✅ Create MySQL Tables
with app.app_context():
    db.create_all()
    print("✅ Database tables created successfully.")

# --- AUTH ROUTES ---
@app.route("/register", methods=["POST"])
def register():
    """Register a new user."""
    data = request.get_json()
    users = load_users()

    if any(user["username"] == data["username"] for user in users):
        return jsonify({"message": "Username already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    new_user = {
        "username": data["username"],
        "password": hashed_pw,
        "role": data.get("role", "user")
    }

    users.append(new_user)
    save_users(users)
    return jsonify({"message": "User registered successfully!"}), 201

@app.route("/login", methods=["POST"])
def login():
    """User login route."""
    data = request.get_json()
    users = load_users()

    user = next((u for u in users if u["username"] == data["username"]), None)
    if user and bcrypt.check_password_hash(user["password"], data["password"]):
        access_token = create_access_token(identity={"username": user["username"], "role": user["role"]})
        return jsonify({"token": access_token, "role": user["role"]})

    return jsonify({"message": "Invalid credentials"}), 401

# --- PRODUCT ROUTES USING MYSQL ---
@app.route("/product", methods=["GET", "OPTIONS"])
def get_product():
    """Fetch all products from MySQL."""
    if request.method == "OPTIONS":
        return jsonify(), 200  # ✅ Handles CORS preflight request

    try:
        product = Product.query.all()
        product_list = [{
            "id": p.id,
            "name": p.name,
            "supplier": p.supplier,
            "price": p.price,
            "stock": p.stock,
            "image": p.image
        } for p in product]

        print("✅ Fetching product:", product_list)  # Debugging fetch response
        return jsonify(product_list), 200
    except Exception as e:
        return jsonify({"message": "Error fetching product", "error": str(e)}), 500

@app.route("/product", methods=["POST", "OPTIONS"])
@jwt_required()
def add_product():
    """Add a new product (Admin only)."""
    if request.method == "OPTIONS":
        return jsonify(), 200

    user = get_jwt_identity()
    if user["role"] != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    try:
        data = request.get_json()
        new_product = Product(
            name=data["name"],
            supplier=data["supplier"],
            price=data["price"],
            stock=data["stock"],
            image=data.get("image", "")
        )

        db.session.add(new_product)
        db.session.commit()
        return jsonify({"message": "Product added successfully!"}), 201
    except Exception as e:
        return jsonify({"message": "Error adding product", "error": str(e)}), 500

@app.route("/product/<int:product_id>", methods=["PUT", "OPTIONS"])
@jwt_required()
def update_stock(product_id):
    """Update product stock (Admin only)."""
    if request.method == "OPTIONS":
        return jsonify(), 200

    user = get_jwt_identity()
    if user["role"] != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    try:
        data = request.get_json()
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"message": "Product not found"}), 404

        product.stock = int(data["stock"])
        db.session.commit()
        return jsonify({"message": "Stock updated successfully!"}), 200
    except Exception as e:
        return jsonify({"message": "Error updating stock", "error": str(e)}), 500

@app.route("/product/<int:product_id>", methods=["DELETE", "OPTIONS"])
@jwt_required()
def delete_product(product_id):
    """Delete a product (Admin only)."""
    if request.method == "OPTIONS":
        return jsonify(), 200

    user = get_jwt_identity()
    if user["role"] != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"message": "Product not found"}), 404

        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": "Product deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"message": "Error deleting product", "error": str(e)}), 500

@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Inventory API. Use /product to fetch data."}), 200

if __name__ == "__main__":
    print("Available routes:")
    print(app.url_map)
    app.run(debug=True, port=5001)
