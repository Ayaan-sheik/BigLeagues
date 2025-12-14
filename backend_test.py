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
    
    def run_all_tests(self) -> Dict[str, Dict[str, bool]]:
        """Run all route protection tests"""
        print("🔒 COMPREHENSIVE ROUTE PROTECTION TESTING")
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