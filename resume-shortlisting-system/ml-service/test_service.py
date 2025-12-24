#!/usr/bin/env python3
"""
Simple test script to verify ML service endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health Check: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_root():
    """Test the root endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Root Endpoint: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Root endpoint failed: {e}")
        return False

def test_test_endpoint():
    """Test the test endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/test")
        print(f"Test Endpoint: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Test endpoint failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing ML Service Endpoints...")
    print("=" * 40)
    
    tests = [
        ("Health Check", test_health),
        ("Root Endpoint", test_root),
        ("Test Endpoint", test_test_endpoint),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 40)
    print("Test Results:")
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    all_passed = all(result for _, result in results)
    if all_passed:
        print("\n🎉 All tests passed! ML service is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the ML service configuration.")

if __name__ == "__main__":
    main()
