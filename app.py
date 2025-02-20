import os
import pymysql
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt, get_jwt_identity
)

app = Flask(__name__)

# MySQL config
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:Waves1234_@localhost/inventory_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "supersecretkey"

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Allow frontend on localhost:5173 to call this API
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# ---------------------------
#       DATABASE MODELS
# ---------------------------
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(50), nullable=False)

class Product(db.Model):
    __tablename__ = 'product'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(150), unique=True, nullable=False)
    supplier = db.Column(db.String(150), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    image = db.Column(db.String(255), nullable=True, default="default.png")

# Create tables on startup
with app.app_context():
    try:
        db.create_all()
        print("✅ MySQL Database Tables Created Successfully!")
    except Exception as e:
        print("❌ Database Connection Failed:", str(e))

# Immediately after creating tables, print all products from Flask’s perspective
with app.app_context():
    products = Product.query.all()
    print("DEBUG: All products in DB from Flask's perspective:")
    for prod in products:
        print(f" -> ID={prod.id}, name={prod.name}, stock={prod.stock}")

# ---------------------------
#        ROUTES
# ---------------------------

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    """
    Serves static image files from public/assets folder.
    """
    try:
        return send_from_directory('public/assets', filename)
    except Exception:
        return jsonify({"error": "Image not found"}), 404

@app.route("/product", methods=["GET"])
@jwt_required()
def get_products():
    """
    Returns a list of all products in the database. (Requires JWT)
    """
    try:
        products = Product.query.all()
        if not products:
            return jsonify({"message": "No products found."}), 404

        products_list = [{
            "id": p.id,
            "name": p.name,
            "supplier": p.supplier,
            "price": p.price,
            "stock": p.stock,
            "image": p.image or "default.png"
        } for p in products]

        print("✅ Products fetched successfully:", products_list)
        return jsonify(products_list), 200
    except Exception as e:
        print("❌ Error fetching products:", str(e))
        return jsonify({"message": "Error fetching products", "error": str(e)}), 500

@app.route("/product/<int:product_id>", methods=["PUT"])
@jwt_required()
def update_stock(product_id):
    """
    Updates the stock for a product (admin only).
    Expects JSON with key: 'stock'.
    """
    try:
        claims = get_jwt()
        role = claims.get("role")
        if role != "admin":
            print("❌ Unauthorized access attempt by user:", get_jwt_identity())
            return jsonify({"message": "Unauthorized"}), 403

        data = request.get_json()
        if not data or "stock" not in data:
            return jsonify({"message": "Missing 'stock' value in request"}), 400

        print(f"🔧 Updating stock for product_id={product_id} with data={data}")

        product = Product.query.get(product_id)
        if not product:
            print(f"❌ Product with ID {product_id} not found in DB.")
            return jsonify({"message": "Product not found"}), 404

        product.stock = int(data["stock"])
        db.session.commit()

        print(f"✅ Stock updated successfully! New stock={product.stock}")
        return jsonify({"message": "Stock updated successfully!", "new_stock": product.stock}), 200
    except Exception as e:
        print("❌ Error updating stock:", str(e))
        return jsonify({"message": "Error updating stock", "error": str(e)}), 500

@app.route("/register", methods=["POST"])
def register():
    """
    Registers a new user. Expects JSON with keys: [username, password, role (optional)].
    """
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        role = data.get("role", "user")

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

@app.route("/login", methods=["POST"])
def login():
    """
    Logs in a user. Expects JSON with keys: [username, password].
    Then returns a JWT token and the user's role if successful.
    """
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        user = User.query.filter_by(username=username).first()
        if user and bcrypt.check_password_hash(user.password, password):
            access_token = create_access_token(
                identity=user.username,
                additional_claims={"role": user.role}
            )
            return jsonify({"token": access_token, "role": user.role}), 200
        else:
            return jsonify({"message": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"message": "Error logging in", "error": str(e)}), 500

@app.route("/logout", methods=["POST"])
def logout():
    """
    Simple logout route. If you're using token-based auth, you just remove the token on the frontend.
    """
    return jsonify({"message": "Logged out"}), 200

@app.route("/")
def home():
    """
    A simple welcome route.
    """
    return jsonify({"message": "Welcome to the Inventory API. Use /product to fetch data."}), 200

@app.after_request
def add_cors_headers(response):
    """
    Ensure correct CORS headers for cross-origin requests from localhost:5173.
    """
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

if __name__ == "__main__":
    print("Available Routes:", app.url_map)
    app.run(debug=True, port=5001)