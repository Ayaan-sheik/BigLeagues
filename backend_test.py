#!/usr/bin/env python3
"""
Comprehensive Backend Testing for InsureInfra Application
Tests authentication, authorization, role-based access control, and admin product creation
"""

import requests
import json
import time
import sys
import uuid
from typing import Dict, Optional, Tuple

# Test configuration
BASE_URL = "https://omniguard.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Test credentials from ACCOUNTS.md
ADMIN_CREDENTIALS = {
    "email": "admin1@insureinfra.com",
    "password": "Admin123!@#"
}

CUSTOMER_CREDENTIALS = {
    "email": "customer1@techstart.com", 
    "password": "Customer123!@#"
}

class RouteProtectionTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'RouteProtectionTester/1.0'
        })
        
    def login(self, credentials: Dict[str, str]) -> Tuple[bool, str]:
        """Login with credentials and return success status and session info"""
        try:
            # First get CSRF token
            csrf_response = self.session.get(f"{API_BASE}/auth/csrf")
            if csrf_response.status_code != 200:
                return False, f"Failed to get CSRF token: {csrf_response.status_code}"
            
            csrf_token = csrf_response.json().get('csrfToken')
            
            # Login with credentials
            login_data = {
                "email": credentials["email"],
                "password": credentials["password"],
                "csrfToken": csrf_token,
                "callbackUrl": f"{BASE_URL}/dashboard"
            }
            
            login_response = self.session.post(
                f"{API_BASE}/auth/callback/credentials",
                data=login_data,
                allow_redirects=False
            )
            
            # Check if login was successful (should redirect)
            if login_response.status_code in [302, 200]:
                return True, f"Login successful for {credentials['email']}"
            else:
                return False, f"Login failed: {login_response.status_code} - {login_response.text}"
                
        except Exception as e:
            return False, f"Login error: {str(e)}"
    
    def logout(self) -> bool:
        """Logout current session"""
        try:
            logout_response = self.session.post(f"{API_BASE}/auth/signout")
            return logout_response.status_code in [200, 302]
        except:
            return False
    
    def test_unauthenticated_access(self) -> Dict[str, bool]:
        """Test 1: Unauthenticated Access Tests"""
        print("\n=== TEST 1: UNAUTHENTICATED ACCESS ===")
        results = {}
        
        # Ensure we're logged out
        self.logout()
        
        # Test protected route access without authentication
        test_cases = [
            ("/admin", "Should redirect to /auth/login"),
            ("/customer", "Should redirect to /auth/login"),
            ("/api/admin/products", "Should return 401/403"),
            ("/api/customer/policies", "Should return 401/403")
        ]
        
        for route, expected in test_cases:
            try:
                url = f"{BASE_URL}{route}" if not route.startswith('/api') else f"{BASE_URL}{route}"
                response = self.session.get(url, allow_redirects=False)
                
                if route.startswith('/api'):
                    # API endpoints should return 401/403
                    success = response.status_code in [401, 403]
                    print(f"✅ {route}: {response.status_code} (Expected 401/403)" if success 
                          else f"❌ {route}: {response.status_code} (Expected 401/403)")
                else:
                    # Frontend routes should redirect to login
                    success = response.status_code == 302 and '/auth/login' in response.headers.get('Location', '')
                    print(f"✅ {route}: Redirects to login" if success 
                          else f"❌ {route}: {response.status_code}, Location: {response.headers.get('Location', 'None')}")
                
                results[route] = success
                
            except Exception as e:
                print(f"❌ {route}: Error - {str(e)}")
                results[route] = False
        
        return results
    
    def test_admin_role_access(self) -> Dict[str, bool]:
        """Test 2: Admin Role Tests"""
        print("\n=== TEST 2: ADMIN ROLE ACCESS ===")
        results = {}
        
        # Login as admin
        login_success, login_msg = self.login(ADMIN_CREDENTIALS)
        print(f"Admin login: {login_msg}")
        
        if not login_success:
            print("❌ Cannot proceed with admin tests - login failed")
            return {"admin_login": False}
        
        # Test admin access to admin routes
        test_cases = [
            ("/admin", "Should succeed", True),
            ("/customer", "Should redirect to /admin", False),
            ("/api/admin/products", "Should succeed (GET)", True),
            ("/api/customer/policies", "Should return 403", False)
        ]
        
        for route, expected, should_succeed in test_cases:
            try:
                url = f"{BASE_URL}{route}" if not route.startswith('/api') else f"{BASE_URL}{route}"
                response = self.session.get(url, allow_redirects=False)
                
                if route.startswith('/api'):
                    if should_succeed:
                        success = response.status_code == 200
                        print(f"✅ {route}: {response.status_code} (Expected 200)" if success 
                              else f"❌ {route}: {response.status_code} (Expected 200)")
                    else:
                        success = response.status_code == 403
                        print(f"✅ {route}: {response.status_code} (Expected 403)" if success 
                              else f"❌ {route}: {response.status_code} (Expected 403)")
                else:
                    if should_succeed:
                        success = response.status_code == 200
                        print(f"✅ {route}: {response.status_code} (Expected 200)" if success 
                              else f"❌ {route}: {response.status_code} (Expected 200)")
                    else:
                        success = response.status_code == 302 and '/admin' in response.headers.get('Location', '')
                        print(f"✅ {route}: Redirects to /admin" if success 
                              else f"❌ {route}: {response.status_code}, Location: {response.headers.get('Location', 'None')}")
                
                results[route] = success
                
            except Exception as e:
                print(f"❌ {route}: Error - {str(e)}")
                results[route] = False
        
        return results
    
    def test_customer_role_access(self) -> Dict[str, bool]:
        """Test 3: Customer Role Tests"""
        print("\n=== TEST 3: CUSTOMER ROLE ACCESS ===")
        results = {}
        
        # Logout first, then login as customer
        self.logout()
        login_success, login_msg = self.login(CUSTOMER_CREDENTIALS)
        print(f"Customer login: {login_msg}")
        
        if not login_success:
            print("❌ Cannot proceed with customer tests - login failed")
            return {"customer_login": False}
        
        # Test customer access to customer routes
        test_cases = [
            ("/customer", "Should succeed", True),
            ("/admin", "Should redirect to /customer", False),
            ("/api/customer/policies", "Should succeed (GET)", True),
            ("/api/admin/products", "Should return 403", False)
        ]
        
        for route, expected, should_succeed in test_cases:
            try:
                url = f"{BASE_URL}{route}" if not route.startswith('/api') else f"{BASE_URL}{route}"
                response = self.session.get(url, allow_redirects=False)
                
                if route.startswith('/api'):
                    if should_succeed:
                        success = response.status_code == 200
                        print(f"✅ {route}: {response.status_code} (Expected 200)" if success 
                              else f"❌ {route}: {response.status_code} (Expected 200)")
                    else:
                        success = response.status_code == 403
                        print(f"✅ {route}: {response.status_code} (Expected 403)" if success 
                              else f"❌ {route}: {response.status_code} (Expected 403)")
                else:
                    if should_succeed:
                        success = response.status_code == 200
                        print(f"✅ {route}: {response.status_code} (Expected 200)" if success 
                              else f"❌ {route}: {response.status_code} (Expected 200)")
                    else:
                        success = response.status_code == 302 and '/customer' in response.headers.get('Location', '')
                        print(f"✅ {route}: Redirects to /customer" if success 
                              else f"❌ {route}: {response.status_code}, Location: {response.headers.get('Location', 'None')}")
                
                results[route] = success
                
            except Exception as e:
                print(f"❌ {route}: Error - {str(e)}")
                results[route] = False
        
        return results
    
    def test_edge_cases(self) -> Dict[str, bool]:
        """Test 4: Edge Cases"""
        print("\n=== TEST 4: EDGE CASES ===")
        results = {}
        
        # Test session persistence
        print("\n--- Session Persistence Test ---")
        login_success, _ = self.login(ADMIN_CREDENTIALS)
        if login_success:
            # Make multiple requests to verify session persists
            for i in range(3):
                response = self.session.get(f"{BASE_URL}/admin", allow_redirects=False)
                success = response.status_code == 200
                print(f"Request {i+1}: {'✅' if success else '❌'} Status: {response.status_code}")
                results[f"session_persistence_{i+1}"] = success
                time.sleep(0.5)
        
        # Test logout and re-access
        print("\n--- Logout and Re-access Test ---")
        logout_success = self.logout()
        print(f"Logout: {'✅' if logout_success else '❌'}")
        
        # Try to access protected route after logout
        response = self.session.get(f"{BASE_URL}/admin", allow_redirects=False)
        success = response.status_code == 302 and '/auth/login' in response.headers.get('Location', '')
        print(f"Access after logout: {'✅' if success else '❌'} - Redirects to login")
        results["logout_protection"] = success
        
        return results
    
    def test_admin_product_creation(self) -> Dict[str, bool]:
        """Test 5: Admin Product Creation Functionality"""
        print("\n=== TEST 5: ADMIN PRODUCT CREATION ===")
        results = {}
        
        # Login as admin first
        login_success, login_msg = self.login(ADMIN_CREDENTIALS)
        print(f"Admin login for product testing: {login_msg}")
        
        if not login_success:
            print("❌ Cannot proceed with product creation tests - admin login failed")
            return {"admin_login_for_products": False}
        
        # Test 1: Get existing products (should work)
        print("\n--- Test: GET /api/admin/products ---")
        try:
            response = self.session.get(f"{API_BASE}/admin/products")
            success = response.status_code == 200
            if success:
                products_data = response.json()
                print(f"✅ GET products successful: {len(products_data)} products found")
                results["get_products"] = True
            else:
                print(f"❌ GET products failed: {response.status_code} - {response.text}")
                results["get_products"] = False
        except Exception as e:
            print(f"❌ GET products error: {str(e)}")
            results["get_products"] = False
        
        # Test 2: Create new product with valid data
        print("\n--- Test: POST /api/admin/products (Valid Data) ---")
        test_product = {
            "name": "Directors & Officers Insurance",
            "description": "Coverage for directors and officers against legal action and financial losses",
            "basePrice": 25000,
            "coverageMin": 500000,
            "coverageMax": 10000000,
            "status": "active"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE}/admin/products",
                json=test_product,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 201:
                created_product = response.json()
                print(f"✅ Product creation successful")
                print(f"   Product ID: {created_product.get('id', 'N/A')}")
                print(f"   Product Name: {created_product.get('name', 'N/A')}")
                
                # Verify UUID is generated
                product_id = created_product.get('id')
                if product_id and len(product_id) == 36:  # UUID length
                    print(f"✅ UUID generated correctly: {product_id}")
                    results["product_uuid_generation"] = True
                else:
                    print(f"❌ UUID not generated properly: {product_id}")
                    results["product_uuid_generation"] = False
                
                # Store product ID for later tests
                self.created_product_id = product_id
                results["create_product_valid"] = True
                
            else:
                print(f"❌ Product creation failed: {response.status_code} - {response.text}")
                results["create_product_valid"] = False
                results["product_uuid_generation"] = False
                
        except Exception as e:
            print(f"❌ Product creation error: {str(e)}")
            results["create_product_valid"] = False
            results["product_uuid_generation"] = False
        
        # Test 3: Validation test - min coverage > max coverage
        print("\n--- Test: POST /api/admin/products (Invalid: Min > Max Coverage) ---")
        invalid_product = {
            "name": "Test Invalid Product",
            "description": "This should fail validation",
            "basePrice": 15000,
            "coverageMin": 10000000,  # Higher than max
            "coverageMax": 500000,    # Lower than min
            "status": "active"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE}/admin/products",
                json=invalid_product,
                headers={'Content-Type': 'application/json'}
            )
            
            # Should fail with 400 or similar
            if response.status_code >= 400:
                print(f"✅ Validation working: {response.status_code} - Rejected invalid data")
                results["validation_min_max_coverage"] = True
            else:
                print(f"❌ Validation failed: {response.status_code} - Should have rejected invalid data")
                results["validation_min_max_coverage"] = False
                
        except Exception as e:
            print(f"❌ Validation test error: {str(e)}")
            results["validation_min_max_coverage"] = False
        
        # Test 4: Missing required fields
        print("\n--- Test: POST /api/admin/products (Missing Required Fields) ---")
        incomplete_product = {
            "name": "Incomplete Product"
            # Missing description, basePrice, coverageMin, coverageMax
        }
        
        try:
            response = self.session.post(
                f"{API_BASE}/admin/products",
                json=incomplete_product,
                headers={'Content-Type': 'application/json'}
            )
            
            # Should fail with 400 or similar
            if response.status_code >= 400:
                print(f"✅ Required field validation working: {response.status_code}")
                results["validation_required_fields"] = True
            else:
                print(f"❌ Required field validation failed: {response.status_code}")
                results["validation_required_fields"] = False
                
        except Exception as e:
            print(f"❌ Required field validation test error: {str(e)}")
            results["validation_required_fields"] = False
        
        # Test 5: Verify product appears in list after creation
        print("\n--- Test: Verify New Product in List ---")
        try:
            response = self.session.get(f"{API_BASE}/admin/products")
            if response.status_code == 200:
                products_data = response.json()
                
                # Look for our created product
                created_product_found = False
                if hasattr(self, 'created_product_id') and self.created_product_id:
                    for product in products_data:
                        if product.get('id') == self.created_product_id:
                            created_product_found = True
                            print(f"✅ Created product found in list: {product.get('name')}")
                            break
                
                if created_product_found:
                    results["product_in_list_after_creation"] = True
                else:
                    print(f"❌ Created product not found in list")
                    results["product_in_list_after_creation"] = False
            else:
                print(f"❌ Failed to fetch products for verification: {response.status_code}")
                results["product_in_list_after_creation"] = False
                
        except Exception as e:
            print(f"❌ Product list verification error: {str(e)}")
            results["product_in_list_after_creation"] = False
        
        # Test 6: Check audit logging (if we can access audit logs)
        print("\n--- Test: Audit Logging Verification ---")
        try:
            # Try to access audit logs endpoint (if it exists)
            response = self.session.get(f"{API_BASE}/admin/audit-logs")
            if response.status_code == 200:
                audit_logs = response.json()
                
                # Look for product creation audit log
                product_creation_logged = False
                for log in audit_logs:
                    if (log.get('action') == 'create' and 
                        log.get('entityType') == 'product' and
                        hasattr(self, 'created_product_id') and
                        log.get('entityId') == self.created_product_id):
                        product_creation_logged = True
                        print(f"✅ Product creation audit log found")
                        break
                
                results["audit_logging"] = product_creation_logged
                if not product_creation_logged:
                    print(f"❌ Product creation audit log not found")
            else:
                print(f"⚠️  Audit logs endpoint not accessible: {response.status_code}")
                results["audit_logging"] = "NA"  # Not available for testing
                
        except Exception as e:
            print(f"⚠️  Audit logging test error: {str(e)}")
            results["audit_logging"] = "NA"  # Not available for testing
        
        return results

    def run_all_tests(self) -> Dict[str, Dict[str, bool]]:
        """Run all backend tests including route protection and product creation"""
        print("🔒 COMPREHENSIVE BACKEND TESTING")
        print("=" * 50)
        
        all_results = {}
        
        try:
            # Test 1: Unauthenticated access
            all_results["unauthenticated"] = self.test_unauthenticated_access()
            
            # Test 2: Admin role access
            all_results["admin_role"] = self.test_admin_role_access()
            
            # Test 3: Customer role access  
            all_results["customer_role"] = self.test_customer_role_access()
            
            # Test 4: Edge cases
            all_results["edge_cases"] = self.test_edge_cases()
            
            # Test 5: Admin product creation
            all_results["admin_product_creation"] = self.test_admin_product_creation()
            
        except Exception as e:
            print(f"❌ Critical error during testing: {str(e)}")
            all_results["critical_error"] = {"error": False}
        
        return all_results
    
    def print_summary(self, results: Dict[str, Dict[str, bool]]):
        """Print test summary"""
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        total_tests = 0
        passed_tests = 0
        
        for category, tests in results.items():
            print(f"\n{category.upper().replace('_', ' ')}:")
            category_passed = 0
            category_total = 0
            
            for test_name, passed in tests.items():
                status = "✅ PASS" if passed else "❌ FAIL"
                print(f"  {test_name}: {status}")
                category_total += 1
                if passed:
                    category_passed += 1
            
            print(f"  Category Score: {category_passed}/{category_total}")
            total_tests += category_total
            passed_tests += category_passed
        
        print(f"\n🎯 OVERALL SCORE: {passed_tests}/{total_tests} ({(passed_tests/total_tests*100):.1f}%)")
        
        if passed_tests == total_tests:
            print("🎉 ALL TESTS PASSED - Route protection is working correctly!")
        else:
            print("⚠️  SOME TESTS FAILED - Route protection needs attention!")

def main():
    """Main test execution"""
    tester = RouteProtectionTester()
    
    print("Starting comprehensive route protection testing...")
    print(f"Base URL: {BASE_URL}")
    print(f"Testing with Admin: {ADMIN_CREDENTIALS['email']}")
    print(f"Testing with Customer: {CUSTOMER_CREDENTIALS['email']}")
    
    # Run all tests
    results = tester.run_all_tests()
    
    # Print summary
    tester.print_summary(results)
    
    # Return exit code based on results
    total_passed = sum(sum(tests.values()) for tests in results.values())
    total_tests = sum(len(tests) for tests in results.values())
    
    if total_passed == total_tests:
        sys.exit(0)  # Success
    else:
        sys.exit(1)  # Some tests failed

if __name__ == "__main__":
    main()