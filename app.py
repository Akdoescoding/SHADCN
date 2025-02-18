import os
import pymysql
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

# Initialize Flask App
app = Flask(__name__)

# MySQL Configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:Waves1234_@localhost/inventory_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "supersecretkey"

# Initialize Extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Fix CORS Issues (Allow Frontend to Access API)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# User Model (Using `user` Table)
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(50), nullable=False)

# Product Model (Using `product` Table)
class Product(db.Model):
    __tablename__ = 'product'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(150), unique=True, nullable=False)
    supplier = db.Column(db.String(150), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    image = db.Column(db.String(255), nullable=True, default="default.png")

# Create Tables (Ensure Table Exists)
with app.app_context():
    try:
        db.create_all()
        print("✅ MySQL Database Tables Created Successfully!")
    except Exception as e:
        print("❌ Database Connection Failed:", str(e))

# Serve Static Images
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    try:
        return send_from_directory('public/assets', filename)
    except Exception:
        return jsonify({"error": "Image not found"}), 404

# Fetch All Products
@app.route("/product", methods=["GET"])
def get_products():
    """ Fetch all products from the database. """
    try:
        products = Product.query.all()
        if not products:
            return jsonify({"message": "No products found."}), 404  # Handle empty database

        products_list = [{
            "id": p.id,
            "name": p.name,
            "supplier": p.supplier,
            "price": p.price,
            "stock": p.stock,
            "image": p.image or "default.png"
        } for p in products]
        print("✅ Products fetched successfully:", products_list)  # Debugging
        return jsonify(products_list), 200
    except Exception as e:
        print("❌ Error fetching products:", str(e))  # Debugging
        return jsonify({"message": "Error fetching products", "error": str(e)}), 500

# Add a New Product (Admin Only)
@app.route("/product", methods=["POST"])
@jwt_required()
def add_product():
    user = get_jwt_identity()
    if user.get("role") != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    try:
        data = request.get_json()
        if not all(k in data for k in ["name", "supplier", "price", "stock"]):
            return jsonify({"error": "Missing required fields"}), 400

        new_product = Product(
            name=data["name"],
            supplier=data["supplier"],
            price=float(data["price"]),
            stock=int(data["stock"]),
            image=data.get("image", "default.png")
        )

        db.session.add(new_product)
        db.session.commit()
        return jsonify({"message": "Product added successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error adding product", "error": str(e)}), 500

# Update Product Stock
@app.route("/product/<int:product_id>", methods=["PUT"])
@jwt_required()
def update_stock(product_id):
    try:
        data = request.get_json()
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"message": "Product not found"}), 404

        product.stock = int(data["stock"])
        db.session.commit()
        return jsonify({"message": "Stock updated successfully!", "new_stock": product.stock}), 200
    except Exception as e:
        return jsonify({"message": "Error updating stock", "error": str(e)}), 500

# Delete a Product (Admin Only)
@app.route("/product/<int:product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    user = get_jwt_identity()
    if user.get("role") != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"message": "Product not found"}), 404

        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": "Product deleted successfully!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting product", "error": str(e)}), 500

# User Registration
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        role = data.get("role", "user")  # Default role is "user"

        if not username or not password:
            return jsonify({"message": "Username and password are required"}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
        new_user = User(username=username, password=hashed_password, role=role)

        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error registering user", "error": str(e)}), 500

# User Login
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        user = User.query.filter_by(username=username).first()
        if user and bcrypt.check_password_hash(user.password, password):
            access_token = create_access_token(identity={"username": user.username, "role": user.role})
            return jsonify({"token": access_token}), 200
        else:
            return jsonify({"message": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"message": "Error logging in", "error": str(e)}), 500

# Home Route
@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Inventory API. Use /product to fetch data."}), 200

# Fix CORS Headers (Final Fix)
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

# Run Flask App
if __name__ == "__main__":
    print("Available Routes:", app.url_map)
    app.run(debug=True, port=5001)