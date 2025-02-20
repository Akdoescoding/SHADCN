import unittest
import json
from app import app, db, User, Product, bcrypt

class FlaskTestCase(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

        # Create a test database
        with app.app_context():
            db.create_all()

            # Add a test user
            hashed_password = bcrypt.generate_password_hash("testpassword").decode("utf-8")
            test_user = User(username="testuser", password=hashed_password, role="user")
            db.session.add(test_user)
            db.session.commit()

            # Add a test product
            test_product = Product(name="Test Product", supplier="Test Supplier", price=10.0, stock=100)
            db.session.add(test_product)
            db.session.commit()

    def tearDown(self):
        # Remove the test database
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_register_user(self):
        response = self.app.post('/register', data=json.dumps({
            "username": "newuser",
            "password": "newpassword",
            "role": "user"
        }), content_type='application/json')

        self.assertEqual(response.status_code, 201)
        self.assertIn(b'User registered successfully!', response.data)

    def test_view_products(self):
        # First, log in to get a JWT token
        login_response = self.app.post('/login', data=json.dumps({
            "username": "testuser",
            "password": "testpassword"
        }), content_type='application/json')

        self.assertEqual(login_response.status_code, 200)
        token = json.loads(login_response.data)['token']

        # Use the token to fetch products
        response = self.app.get('/product', headers={
            'Authorization': f'Bearer {token}'
        })

        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Test Product', response.data)
        self.assertIn(b'Test Supplier', response.data)
        self.assertIn(b'10.0', response.data)
        self.assertIn(b'100', response.data)

if __name__ == '__main__':
    unittest.main()