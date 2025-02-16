import os
import pymysql
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

# ✅ Initialize Flask App
app = Flask(__name__)

# ✅ MySQL Configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:Waves1234_@localhost/inventory_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "supersecretkey"

# ✅ Initialize Extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app, resources={r"/*": {"origins": "*"}})  # 🔥 Allow Frontend Access

# ✅ Product Model (Using `product` Table)
class Product(db.Model):
    __tablename__ = 'product'  # ✅ Matches MySQL
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(150), unique=True, nullable=False)  # 🔥 Unique product names
    supplier = db.Column(db.String(150), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    image = db.Column(db.String(255), nullable=True, default="default.png")  # ✅ Default image

# ✅ Create Tables (Ensure Table Exists)
with app.app_context():
    try:
        db.create_all()
        print("✅ MySQL Database Tables Created Successfully!")
    except Exception as e:
        print("❌ Database Connection Failed:", str(e))

# ✅ Serve Static Images
@app.route('/static/<path:filename>')
def serve_static(filename):
    """ Serve product images from the static folder. """
    try:
        return send_from_directory('static', filename)
    except Exception:
        return jsonify({"error": "Image not found"}), 404

# ✅ Fetch All Products (Public API)
@app.route("/product", methods=["GET"])
def get_products():
    """ Fetch all products from the database. """
    try:
        products = Product.query.all()
        products_list = [{
            "id": p.id,
            "name": p.name,
            "supplier": p.supplier,
            "price": p.price,
            "stock": p.stock,
            "image": p.image or "default.png"
        } for p in products]
        return jsonify(products_list), 200
    except Exception as e:
        return jsonify({"message": "Error fetching products", "error": str(e)}), 500

# ✅ Add a New Product (Admin Only)
@app.route("/product", methods=["POST"])
@jwt_required()
def add_product():
    """ Admins can add new products. """
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

# ✅ Update Product Stock (Any Logged-In User Can Update Stock)
@app.route("/product/<int:product_id>", methods=["PUT"])
@jwt_required()
def update_stock(product_id):
    """ Allow users to update stock. """
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

# ✅ Delete a Product (Admin Only)
@app.route("/product/<int:product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    """ Only admins can delete products. """
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

# ✅ Home Route (API Root)
@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Inventory API. Use /product to fetch data."}), 200

# ✅ Run Flask App
if __name__ == "__main__":
    print("Available Routes:", app.url_map)  # ✅ Print available routes
    app.run(debug=True, port=5001)
