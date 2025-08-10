"""
Test the period-enabled API endpoint
"""
import requests
import json

def test_period_api():
    print("TESTING PERIOD-ENABLED API")
    print("="*40)
    
    # Test session ID from your upload (replace with current session)
    session_id = "91d71c15-18f8-4a54-aba8-00e9b0028664"  # From your URL
    
    # Test different periods
    periods_to_test = ["3Q25E", "4Q25E", "2025E", "1Q26E"]
    
    for period in periods_to_test:
        print(f"\n--- Testing Period: {period} ---")
        
        try:
            url = f"http://localhost:8000/api/v1/variance/{session_id}"
            params = {"period": period}
            
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if we have real variance data
                exec_summary = data.get("executive_summary", {})
                revenue_variances = exec_summary.get("revenue_variances", {})
                
                if revenue_variances:
                    print(f"✅ SUCCESS - Found {len(revenue_variances)} variance segments")
                    
                    # Show total revenue variance if available
                    total_var = revenue_variances.get("total_revenue_variance")
                    if total_var:
                        old_val = total_var.get("old_value", 0)
                        new_val = total_var.get("new_value", 0)
                        variance = total_var.get("absolute_variance", 0)
                        print(f"   Total Revenue: ${old_val:,.0f}M -> ${new_val:,.0f}M (${variance:+,.0f}M)")
                else:
                    print(f"❌ FAIL - No revenue variance data returned")
                    print(f"   Keys in response: {list(exec_summary.keys())}")
                    
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                
        except Exception as e:
            print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_period_api()