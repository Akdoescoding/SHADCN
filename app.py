from flask import Flask, request, jsonify, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# Configure database and secret key
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_TYPE'] = 'filesystem'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# -------------------------------
#        USER MODEL
# -------------------------------
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# -------------------------------
#        PRODUCT MODEL
# -------------------------------
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    supplier = db.Column(db.String(150), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    image = db.Column(db.String(255), nullable=True)  # Store image filename

# -------------------------------
#        CREATE TABLES
# -------------------------------
def create_tables():
    """Create database tables inside an application context."""
    with app.app_context():
        db.create_all()
        print("Database tables created successfully.")

create_tables()

# -------------------------------
#        AUTHENTICATION ROUTES
# -------------------------------
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    existing_user = User.query.filter_by(username=data['username']).first()

    if existing_user:
        return jsonify({"message": "Username already exists."}), 400

    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()

    if user and bcrypt.check_password_hash(user.password, data['password']):
        login_user(user)
        session['user_id'] = user.id
        return jsonify({"message": "Login successful"}), 200

    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    session.pop('user_id', None)
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/current-user', methods=['GET'])
@login_required
def get_current_user():
    return jsonify({"username": current_user.username}), 200

# -------------------------------
#        PRODUCT ROUTES
# -------------------------------
@app.route('/products', methods=['GET'])
def get_products():
    """Fetch all products"""
    products = Product.query.all()
    products_list = [{
        "id": p.id,
        "name": p.name,
        "supplier": p.supplier,
        "price": p.price,
        "stock": p.stock,
        "image": f"/static/{p.image}" if p.image else None  # Return full path for frontend
    } for p in products]
    
    return jsonify(products_list), 200

@app.route('/products', methods=['POST'])
@login_required
def add_product():
    if current_user.is_authenticated:
        data = request.json
        new_product = Product(
            name=data['name'],
            supplier=data['supplier'],
            price=data['price'],
            stock=data['stock'],
            image=data['image']  # Expect frontend to send image filename
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify({"message": "Product added successfully!"}), 201
    return jsonify({"message": "Unauthorized"}), 403

@app.route('/products/<int:product_id>', methods=['PUT'])
@login_required
def update_product(product_id):
    product = Product.query.get(product_id)
    if product:
        data = request.json
        product.name = data.get('name', product.name)
        product.supplier = data.get('supplier', product.supplier)
        product.price = data.get('price', product.price)
        product.stock = data.get('stock', product.stock)
        product.image = data.get('image', product.image)
        db.session.commit()
        return jsonify({"message": "Product updated successfully!"}), 200
    return jsonify({"message": "Product not found"}), 404

@app.route('/products/<int:product_id>', methods=['DELETE'])
@login_required
def delete_product(product_id):
    product = Product.query.get(product_id)
    if product:
        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": "Product deleted successfully!"}), 200
    return jsonify({"message": "Product not found"}), 404

@app.route('/add-sample-products', methods=['POST'])
def add_sample_products():
    """Adds some sample products for testing."""
    with app.app_context():
        sample_products = [
            Product(name="T-Shirt", supplier="Nike", price=19.99, stock=50, image="tshirt.jpg"),
            Product(name="Laptop", supplier="Dell", price=599.99, stock=10, image="laptop.jpg"),
            Product(name="Watch", supplier="Casio", price=49.99, stock=30, image="watch.jpg")
        ]
        db.session.add_all(sample_products)
        db.session.commit()
        return jsonify({"message": "Sample products added!"}), 201

# -------------------------------
#        SERVE STATIC IMAGES
# -------------------------------
@app.route('/static/<path:filename>')
def serve_image(filename):
    """Serve static images from the backend."""
    return send_from_directory(os.path.join(app.root_path, "static"), filename)

@app.route('/')
def home():
    return "Flask Backend is Running!"

# -------------------------------
#        RUN THE APP
# -------------------------------
if __name__ == '__main__':
    app.run(debug=True, port=5001)
