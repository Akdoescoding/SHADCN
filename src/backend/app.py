import os
import json
from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)

# Set base directory to avoid file path issues
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ✅ Use absolute path for products.json
PRODUCTS_FILE = os.path.join(BASE_DIR, "products.json")
USERS_FILE = os.path.join(BASE_DIR, "users.json")


# Secret key for JWT authentication
app.config["JWT_SECRET_KEY"] = "supersecretkey"
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Path to JSON files
PRODUCTS_FILE = "products.json"
USERS_FILE = "users.json"

# --- HELPER FUNCTIONS ---
def load_products():
    """Load product data from JSON file."""
    try:
        with open(PRODUCTS_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []  # Return empty list if file doesn't exist or is empty

def save_products(products):
    """Save product data to JSON file."""
    with open(PRODUCTS_FILE, "w") as f:
        json.dump(products, f, indent=4)


def load_users():
    """Load user data from JSON file."""
    try:
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_users(users):
    """Save user data to JSON file."""
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)


# --- PRODUCT ROUTES ---
@app.route("/products", methods=["GET"])
def get_products():
    """Fetch all products."""
    print(" GET /products called")  # Debugging print
    products = load_products()
    return jsonify(products), 200


# --- AUTH ROUTES ---
@app.route("/register", methods=["POST"])
def register():
    """Register a new user (default role: user)."""
    data = request.get_json()
    users = load_users()

    # Check if username exists
    if any(user["username"] == data["username"] for user in users):
        return jsonify({"message": "Username already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    new_user = {
        "username": data["username"],
        "password": hashed_pw,
        "role": data.get("role", "user")  # Default role: user
    }
    
    users.append(new_user)
    save_users(users)
    
    return jsonify({"message": "User registered successfully!"}), 201

@app.route("/login", methods=["POST"])
def login():
    """User login route."""
    data = request.get_json()
    users = load_users()

    # Find user
    user = next((u for u in users if u["username"] == data["username"]), None)
    if user and bcrypt.check_password_hash(user["password"], data["password"]):
        access_token = create_access_token(identity={"username": user["username"], "role": user["role"]})
        return jsonify({"token": access_token, "role": user["role"]})
    
    return jsonify({"message": "Invalid credentials"}), 401


@app.route("/products", methods=["POST"])
@jwt_required()
def add_product():
    """Add a new product (Admin only)."""
    user = get_jwt_identity()
    if user["role"] != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()
    products = load_products()

    if not all(key in data for key in ["name", "supplier", "price", "stock"]):
        return jsonify({"message": "Missing product data"}), 400

    new_product = {
        "id": max((p["id"] for p in products), default=0) + 1,
        "name": data["name"],
        "supplier": data["supplier"], 
        "price": data["price"],
        "stock": data["stock"]
    }

    products.append(new_product)
    save_products(products)
    
    return jsonify({"message": "Product added!"}), 201


@app.route("/products/<int:product_id>", methods=["PUT"])
@jwt_required()
def update_stock(product_id):
    """Update product stock (Admin only)."""
    user = get_jwt_identity()
    if user["role"] != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()
    products = load_products()

    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        return jsonify({"message": "Product not found"}), 404

    try:
        product["stock"] = int(data["stock"])
        save_products(products)
        return jsonify({"message": "Stock updated successfully"}), 200
    except ValueError:
        return jsonify({"message": "Invalid stock value"}), 400


@app.route("/products/<int:product_id>/edit", methods=["PUT"])
@jwt_required()
def edit_product(product_id):
    """Edit product details (Admin only)."""
    user = get_jwt_identity()
    if user["role"] != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()
    products = load_products()

    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        return jsonify({"message": "Product not found"}), 404

    # Update only provided fields
    product["name"] = data.get("name", product["name"])
    product["supplier"] = data.get("supplier", product["supplier"])
    product["price"] = float(data.get("price", product["price"]))
    product["stock"] = int(data.get("stock", product["stock"]))

    save_products(products)
    return jsonify({"message": "Product updated successfully"}), 200


@app.route("/products/<int:product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    """Delete a product (Admin only)."""
    user = get_jwt_identity()
    if user["role"] != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    products = load_products()
    updated_products = [p for p in products if p["id"] != product_id]

    if len(updated_products) == len(products):
        return jsonify({"message": "Product not found"}), 404

    save_products(updated_products)
    return jsonify({"message": "Product deleted"}), 200


# Root endpoint for debugging
@app.route("/", methods=["GET"])
def home():
    return "Flask Backend is Running!"


if __name__ == "__main__":
    print("Available routes:")
    print(app.url_map)  # Debugging: Print all routes
    app.run(debug=True, port=5001)

