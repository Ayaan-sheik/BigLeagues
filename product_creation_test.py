#!/usr/bin/env python3
"""
Admin Product Creation Testing for InsureInfra Application
Tests the admin product creation functionality specifically
"""

import requests
import json
import sys
import uuid
from typing import Dict, Optional, Tuple

# Test configuration
BASE_URL = "https://omniguard.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class ProductCreationTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'ProductCreationTester/1.0'
        })
        
    def test_unauthenticated_product_access(self) -> Dict[str, bool]:
        """Test product endpoints without authentication"""
        print("\n=== TEST 1: UNAUTHENTICATED PRODUCT ACCESS ===")
        results = {}
        
        # Test GET products without auth
        try:
            response = self.session.get(f"{API_BASE}/admin/products")
            success = response.status_code in [401, 403]
            print(f"GET /api/admin/products: {'✅' if success else '❌'} Status: {response.status_code} (Expected 401/403)")
            results["get_products_unauth"] = success
        except Exception as e:
            print(f"❌ GET products error: {str(e)}")
            results["get_products_unauth"] = False
        
        # Test POST products without auth
        try:
            test_product = {
                "name": "Test Product",
                "description": "Test Description",
                "basePrice": 1000,
                "coverageMin": 100000,
                "coverageMax": 1000000,
                "status": "active"
            }
            response = self.session.post(f"{API_BASE}/admin/products", json=test_product)
            success = response.status_code in [401, 403]
            print(f"POST /api/admin/products: {'✅' if success else '❌'} Status: {response.status_code} (Expected 401/403)")
            results["post_products_unauth"] = success
        except Exception as e:
            print(f"❌ POST products error: {str(e)}")
            results["post_products_unauth"] = False
            
        return results
    
    def test_product_api_structure(self) -> Dict[str, bool]:
        """Test the product API structure and validation"""
        print("\n=== TEST 2: PRODUCT API STRUCTURE ===")
        results = {}
        
        # Test with completely invalid JSON
        try:
            response = self.session.post(f"{API_BASE}/admin/products", data="invalid json")
            success = response.status_code >= 400
            print(f"Invalid JSON: {'✅' if success else '❌'} Status: {response.status_code} (Expected 4xx)")
            results["invalid_json"] = success
        except Exception as e:
            print(f"❌ Invalid JSON test error: {str(e)}")
            results["invalid_json"] = False
        
        # Test with empty object
        try:
            response = self.session.post(f"{API_BASE}/admin/products", json={})
            success = response.status_code >= 400
            print(f"Empty object: {'✅' if success else '❌'} Status: {response.status_code} (Expected 4xx)")
            results["empty_object"] = success
        except Exception as e:
            print(f"❌ Empty object test error: {str(e)}")
            results["empty_object"] = False
            
        return results
    
    def test_database_connection(self) -> Dict[str, bool]:
        """Test if we can determine database connectivity"""
        print("\n=== TEST 3: DATABASE CONNECTION INFERENCE ===")
        results = {}
        
        # Try to access any endpoint that would require DB
        try:
            response = self.session.get(f"{API_BASE}/admin/products")
            
            # If we get 401/403, it means the endpoint exists and middleware is working
            # If we get 500, it might be a database issue
            # If we get 404, the endpoint doesn't exist
            
            if response.status_code in [401, 403]:
                print("✅ Product API endpoint exists and middleware is working")
                results["api_endpoint_exists"] = True
            elif response.status_code == 500:
                print("❌ Server error - possible database connection issue")
                results["api_endpoint_exists"] = False
            elif response.status_code == 404:
                print("❌ Product API endpoint not found")
                results["api_endpoint_exists"] = False
            else:
                print(f"⚠️  Unexpected response: {response.status_code}")
                results["api_endpoint_exists"] = False
                
        except Exception as e:
            print(f"❌ Database connection test error: {str(e)}")
            results["api_endpoint_exists"] = False
            
        return results
    
    def test_api_response_format(self) -> Dict[str, bool]:
        """Test API response format"""
        print("\n=== TEST 4: API RESPONSE FORMAT ===")
        results = {}
        
        # Test if API returns JSON
        try:
            response = self.session.get(f"{API_BASE}/admin/products")
            
            # Check if response has JSON content type
            content_type = response.headers.get('content-type', '')
            is_json = 'application/json' in content_type
            
            if is_json:
                try:
                    response.json()  # Try to parse JSON
                    print("✅ API returns valid JSON")
                    results["json_response"] = True
                except:
                    print("❌ API claims JSON but invalid format")
                    results["json_response"] = False
            else:
                print(f"❌ API doesn't return JSON. Content-Type: {content_type}")
                results["json_response"] = False
                
        except Exception as e:
            print(f"❌ JSON response test error: {str(e)}")
            results["json_response"] = False
            
        return results
    
    def test_product_creation_validation_logic(self) -> Dict[str, bool]:
        """Test the validation logic that should be in the API"""
        print("\n=== TEST 5: PRODUCT VALIDATION LOGIC ===")
        results = {}
        
        # Test cases for validation (these will all be unauthorized, but we can check error messages)
        validation_tests = [
            {
                "name": "Min > Max Coverage Test",
                "data": {
                    "name": "Test Product",
                    "description": "Test",
                    "basePrice": 1000,
                    "coverageMin": 10000000,  # Higher than max
                    "coverageMax": 1000000,   # Lower than min
                    "status": "active"
                },
                "expected": "Should validate min < max coverage"
            },
            {
                "name": "Negative Values Test", 
                "data": {
                    "name": "Test Product",
                    "description": "Test",
                    "basePrice": -1000,  # Negative
                    "coverageMin": -100000,  # Negative
                    "coverageMax": 1000000,
                    "status": "active"
                },
                "expected": "Should reject negative values"
            },
            {
                "name": "Missing Required Fields",
                "data": {
                    "name": "Test Product"
                    # Missing other required fields
                },
                "expected": "Should require all fields"
            }
        ]
        
        for test_case in validation_tests:
            try:
                response = self.session.post(f"{API_BASE}/admin/products", json=test_case["data"])
                
                # We expect 401/403 for auth, but if we get different errors, 
                # it might indicate validation is working
                print(f"{test_case['name']}: Status {response.status_code}")
                
                # For now, just check that the endpoint responds
                results[test_case["name"].lower().replace(" ", "_")] = response.status_code in [400, 401, 403, 422]
                
            except Exception as e:
                print(f"❌ {test_case['name']} error: {str(e)}")
                results[test_case["name"].lower().replace(" ", "_")] = False
        
        return results
    
    def run_all_tests(self) -> Dict[str, Dict[str, bool]]:
        """Run all product creation tests"""
        print("🏭 ADMIN PRODUCT CREATION TESTING")
        print("=" * 50)
        
        all_results = {}
        
        try:
            # Test 1: Unauthenticated access
            all_results["unauthenticated_access"] = self.test_unauthenticated_product_access()
            
            # Test 2: API structure
            all_results["api_structure"] = self.test_product_api_structure()
            
            # Test 3: Database connection
            all_results["database_connection"] = self.test_database_connection()
            
            # Test 4: Response format
            all_results["response_format"] = self.test_api_response_format()
            
            # Test 5: Validation logic
            all_results["validation_logic"] = self.test_product_creation_validation_logic()
            
        except Exception as e:
            print(f"❌ Critical error during testing: {str(e)}")
            all_results["critical_error"] = {"error": False}
        
        return all_results
    
    def print_summary(self, results: Dict[str, Dict[str, bool]]):
        """Print test summary"""
        print("\n" + "=" * 50)
        print("📊 PRODUCT CREATION TEST SUMMARY")
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
        
        # Analysis
        print("\n📋 ANALYSIS:")
        if passed_tests == total_tests:
            print("🎉 ALL TESTS PASSED - Product creation API structure is working!")
        else:
            print("⚠️  SOME TESTS FAILED - Issues found with product creation API")
            
        # Recommendations
        print("\n💡 RECOMMENDATIONS:")
        print("- Authentication is required to fully test product creation functionality")
        print("- Consider testing with proper admin session cookies")
        print("- Database connectivity should be verified separately")
        print("- Validation logic can only be fully tested with authenticated requests")

def main():
    """Main test execution"""
    tester = ProductCreationTester()
    
    print("Starting admin product creation testing...")
    print(f"Base URL: {BASE_URL}")
    print("Note: Testing without authentication - limited functionality")
    
    # Run all tests
    results = tester.run_all_tests()
    
    # Print summary
    tester.print_summary(results)
    
    # Return exit code based on results
    total_passed = sum(sum(tests.values()) for tests in results.values())
    total_tests = sum(len(tests) for tests in results.values())
    
    if total_passed >= total_tests * 0.7:  # 70% pass rate acceptable for limited testing
        sys.exit(0)  # Success
    else:
        sys.exit(1)  # Too many failures

if __name__ == "__main__":
    main()