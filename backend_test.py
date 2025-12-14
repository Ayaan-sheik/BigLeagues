#!/usr/bin/env python3
"""
Backend Testing Script for InsureInfra Admin Product Creation
Tests the admin authentication and product creation functionality
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://omniguard.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Test credentials
ADMIN_CREDENTIALS = {
    "email": "admin1@insureinfra.com",
    "password": "Admin123!@#"
}

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'InsureInfra-Backend-Tester/1.0'
        })
        self.admin_session_token = None
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def test_admin_authentication(self):
        """Test admin login and session management"""
        self.log("=== TESTING ADMIN AUTHENTICATION ===")
        
        try:
            # Test admin login via NextAuth
            login_data = {
                "email": ADMIN_CREDENTIALS["email"],
                "password": ADMIN_CREDENTIALS["password"],
                "redirect": "false"
            }
            
            # First get CSRF token
            csrf_response = self.session.get(f"{API_BASE}/auth/csrf")
            if csrf_response.status_code == 200:
                csrf_token = csrf_response.json().get('csrfToken')
                self.log(f"✅ CSRF token obtained: {csrf_token[:20]}...")
            else:
                self.log(f"❌ Failed to get CSRF token: {csrf_response.status_code}", "ERROR")
                return False
                
            # Attempt login via NextAuth callback
            login_response = self.session.post(
                f"{API_BASE}/auth/callback/credentials",
                data={
                    "email": ADMIN_CREDENTIALS["email"],
                    "password": ADMIN_CREDENTIALS["password"],
                    "csrfToken": csrf_token,
                    "callbackUrl": f"{BASE_URL}/admin",
                    "json": "true"
                },
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            self.log(f"Login response status: {login_response.status_code}")
            self.log(f"Login response headers: {dict(login_response.headers)}")
            
            # Check for session cookie
            session_cookies = [cookie for cookie in self.session.cookies if 'next-auth' in cookie.name.lower()]
            if session_cookies:
                self.log(f"✅ Session cookies found: {[c.name for c in session_cookies]}")
                return True
            else:
                self.log("❌ No session cookies found after login", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Admin authentication failed: {str(e)}", "ERROR")
            return False
    
    def test_admin_session_verification(self):
        """Verify admin session and role"""
        self.log("=== TESTING ADMIN SESSION VERIFICATION ===")
        
        try:
            # Test session endpoint
            session_response = self.session.get(f"{API_BASE}/auth/session")
            
            if session_response.status_code == 200:
                session_data = session_response.json()
                self.log(f"✅ Session data retrieved: {json.dumps(session_data, indent=2)}")
                
                if session_data.get('user', {}).get('role') == 'admin':
                    self.log("✅ Admin role verified in session")
                    return True
                else:
                    self.log(f"❌ Expected admin role, got: {session_data.get('user', {}).get('role')}", "ERROR")
                    return False
            else:
                self.log(f"❌ Session verification failed: {session_response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Session verification error: {str(e)}", "ERROR")
            return False
    
    def test_admin_products_api_access(self):
        """Test access to admin products API endpoints"""
        self.log("=== TESTING ADMIN PRODUCTS API ACCESS ===")
        
        try:
            # Test GET /api/admin/products
            get_response = self.session.get(f"{API_BASE}/admin/products")
            
            self.log(f"GET /api/admin/products status: {get_response.status_code}")
            
            if get_response.status_code == 200:
                products = get_response.json()
                self.log(f"✅ Successfully retrieved products list: {len(products)} products")
                self.log(f"Products: {json.dumps(products[:2], indent=2) if products else 'No products found'}")
                return True
            elif get_response.status_code == 401:
                self.log("❌ Unauthorized access to admin products API", "ERROR")
                return False
            elif get_response.status_code == 403:
                self.log("❌ Forbidden access to admin products API (role issue)", "ERROR")
                return False
            else:
                self.log(f"❌ Unexpected response: {get_response.status_code} - {get_response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Admin products API access error: {str(e)}", "ERROR")
            return False
    
    def test_product_creation(self):
        """Test product creation via API"""
        self.log("=== TESTING PRODUCT CREATION ===")
        
        try:
            # Test product data
            test_product = {
                "name": "Professional Indemnity Insurance",
                "description": "Coverage for professional negligence and errors in services",
                "basePrice": 30000,
                "coverageMin": 1000000,
                "coverageMax": 15000000,
                "status": "active"
            }
            
            # Create product
            create_response = self.session.post(
                f"{API_BASE}/admin/products",
                json=test_product
            )
            
            self.log(f"Product creation status: {create_response.status_code}")
            
            if create_response.status_code == 201:
                created_product = create_response.json()
                self.log(f"✅ Product created successfully: {json.dumps(created_product, indent=2)}")
                
                # Verify UUID is generated
                if 'id' in created_product and created_product['id']:
                    self.log(f"✅ Product UUID generated: {created_product['id']}")
                else:
                    self.log("❌ Product UUID not generated", "ERROR")
                    return False
                
                # Verify all fields are saved
                for key, value in test_product.items():
                    if created_product.get(key) == value:
                        self.log(f"✅ Field '{key}' saved correctly: {value}")
                    else:
                        self.log(f"❌ Field '{key}' mismatch. Expected: {value}, Got: {created_product.get(key)}", "ERROR")
                        return False
                
                # Store product ID for verification
                self.created_product_id = created_product['id']
                return True
                
            elif create_response.status_code == 401:
                self.log("❌ Unauthorized to create product", "ERROR")
                return False
            elif create_response.status_code == 403:
                self.log("❌ Forbidden to create product (role issue)", "ERROR")
                return False
            else:
                self.log(f"❌ Product creation failed: {create_response.status_code} - {create_response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Product creation error: {str(e)}", "ERROR")
            return False
    
    def test_product_validation(self):
        """Test product validation rules"""
        self.log("=== TESTING PRODUCT VALIDATION ===")
        
        try:
            # Test invalid product (coverageMin > coverageMax)
            invalid_product = {
                "name": "Invalid Product",
                "description": "Test validation",
                "basePrice": 10000,
                "coverageMin": 15000000,  # Higher than max
                "coverageMax": 1000000,   # Lower than min
                "status": "active"
            }
            
            validation_response = self.session.post(
                f"{API_BASE}/admin/products",
                json=invalid_product
            )
            
            self.log(f"Validation test status: {validation_response.status_code}")
            
            if validation_response.status_code == 400:
                self.log("✅ Validation correctly rejected invalid product")
                return True
            elif validation_response.status_code == 201:
                self.log("❌ Validation failed - invalid product was accepted", "ERROR")
                return False
            else:
                self.log(f"❌ Unexpected validation response: {validation_response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Product validation test error: {str(e)}", "ERROR")
            return False
    
    def test_product_retrieval_verification(self):
        """Verify created product appears in products list"""
        self.log("=== TESTING PRODUCT RETRIEVAL VERIFICATION ===")
        
        try:
            if not hasattr(self, 'created_product_id'):
                self.log("❌ No product ID to verify", "ERROR")
                return False
            
            # Get products list
            get_response = self.session.get(f"{API_BASE}/admin/products")
            
            if get_response.status_code == 200:
                products = get_response.json()
                
                # Find our created product
                created_product = next((p for p in products if p.get('id') == self.created_product_id), None)
                
                if created_product:
                    self.log(f"✅ Created product found in list: {created_product['name']}")
                    self.log(f"Product details: {json.dumps(created_product, indent=2)}")
                    return True
                else:
                    self.log(f"❌ Created product not found in list (ID: {self.created_product_id})", "ERROR")
                    return False
            else:
                self.log(f"❌ Failed to retrieve products for verification: {get_response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Product retrieval verification error: {str(e)}", "ERROR")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        self.log("🚀 STARTING BACKEND TESTING FOR ADMIN PRODUCT CREATION")
        self.log(f"Base URL: {BASE_URL}")
        self.log(f"API Base: {API_BASE}")
        
        test_results = {}
        
        # Test 1: Admin Authentication
        test_results['admin_auth'] = self.test_admin_authentication()
        
        # Test 2: Admin Session Verification
        test_results['session_verification'] = self.test_admin_session_verification()
        
        # Test 3: Admin Products API Access
        test_results['api_access'] = self.test_admin_products_api_access()
        
        # Test 4: Product Creation
        test_results['product_creation'] = self.test_product_creation()
        
        # Test 5: Product Validation
        test_results['product_validation'] = self.test_product_validation()
        
        # Test 6: Product Retrieval Verification
        test_results['product_verification'] = self.test_product_retrieval_verification()
        
        # Summary
        self.log("=" * 60)
        self.log("🏁 BACKEND TESTING SUMMARY")
        self.log("=" * 60)
        
        passed = 0
        total = len(test_results)
        
        for test_name, result in test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{test_name.replace('_', ' ').title()}: {status}")
            if result:
                passed += 1
        
        self.log("=" * 60)
        self.log(f"OVERALL RESULT: {passed}/{total} tests passed")
        
        if passed == total:
            self.log("🎉 ALL TESTS PASSED - Admin product creation functionality working correctly!")
            return True
        else:
            self.log("⚠️  SOME TESTS FAILED - Admin product creation needs attention")
            return False

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)