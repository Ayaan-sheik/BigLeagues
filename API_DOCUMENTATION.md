# 🔌 Vantage API Documentation

## Overview

The Vantage API allows customers to programmatically access their insurance policy and premium information. This API uses API key authentication and returns data in JSON format.

---

## 🔑 Authentication

All API requests require authentication using an API key. You can generate your API key from the customer dashboard.

### Getting Your API Key

1. Login to your customer account
2. Navigate to **Integration & API** page (`/customer/integration`)
3. Click **"Generate New Key"** button
4. Copy and securely store your API key

**API Key Format**: `sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

⚠️ **Security Warning**: Never share your API key or commit it to version control. Treat it like a password.

---

## 📡 API Endpoints

### Get Premium Information

Retrieves premium information for all approved policies of the authenticated customer.

**Endpoint**: `GET /api/v1/premium`

**Authentication**: Required (Bearer token)

**Rate Limit**: 100 requests per minute

#### Request Headers

```http
Authorization: Bearer YOUR_API_KEY
```

#### Example Request (cURL)

```bash
curl -X GET 'https://your-domain.com/api/v1/premium' \
  -H 'Authorization: Bearer sk_6c392f4d9fc30995d22389256dd68e6f...'
```

#### Example Request (JavaScript)

```javascript
const response = await fetch('https://your-domain.com/api/v1/premium', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const data = await response.json();
console.log(data);
```

#### Example Request (Python)

```python
import requests

url = 'https://your-domain.com/api/v1/premium'
headers = {
    'Authorization': 'Bearer YOUR_API_KEY'
}

response = requests.get(url, headers=headers)
data = response.json()

print(f"Total Premium: ₹{data['data']['summary']['totalPremium']}")
print(f"Total Policies: {data['data']['summary']['totalPolicies']}")
```

#### Example Request (Node.js)

```javascript
const axios = require('axios');

const config = {
  method: 'get',
  url: 'https://your-domain.com/api/v1/premium',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
};

axios(config)
  .then(response => {
    console.log(JSON.stringify(response.data, null, 2));
  })
  .catch(error => {
    console.log(error);
  });
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "companyName": "TechStart Solutions",
    "policies": [
      {
        "serviceId": "APP-1765692230910-A7JRWR",
        "productName": "Product Liability Insurance",
        "productId": "40f68f97-ae17-49a4-bfe1-432ec5648cc5",
        "companyName": "TechStart Solutions",
        "coverageAmount": 10000000,
        "premium": {
          "recommended": 750,
          "actual": 800,
          "currency": "INR"
        },
        "status": "active",
        "createdAt": "2024-12-14T06:03:50.910Z",
        "updatedAt": "2024-12-14T06:12:21.108Z"
      }
    ],
    "summary": {
      "totalPolicies": 1,
      "totalPremium": 800,
      "currency": "INR"
    }
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `data.companyName` | string | Name of the customer's company |
| `data.policies` | array | Array of approved policy objects |
| `data.policies[].serviceId` | string | Unique application/policy number |
| `data.policies[].productName` | string | Name of the insurance product |
| `data.policies[].productId` | string | Unique identifier for the product |
| `data.policies[].companyName` | string | Customer's company name |
| `data.policies[].coverageAmount` | number | Total coverage amount in INR |
| `data.policies[].premium.recommended` | number | Recommended premium amount in INR |
| `data.policies[].premium.actual` | number | Actual premium amount charged in INR |
| `data.policies[].premium.currency` | string | Currency code (INR) |
| `data.policies[].status` | string | Policy status (always "active" for approved) |
| `data.policies[].createdAt` | string | ISO 8601 timestamp of policy creation |
| `data.policies[].updatedAt` | string | ISO 8601 timestamp of last update |
| `data.summary.totalPolicies` | number | Total number of active policies |
| `data.summary.totalPremium` | number | Sum of all premium amounts in INR |
| `data.summary.currency` | string | Currency code (INR) |

#### Error Responses

**401 Unauthorized - Missing Authorization Header**
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid Authorization header. Use: Authorization: Bearer YOUR_API_KEY"
}
```

**401 Unauthorized - Invalid API Key**
```json
{
  "error": "Unauthorized",
  "message": "Invalid API key"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "Failed to fetch premium information"
}
```

---

## 💡 Use Cases

### 1. Dashboard Integration
Display premium information on your company's internal dashboard:

```javascript
async function fetchPremiumData() {
  const response = await fetch('/api/v1/premium', {
    headers: {
      'Authorization': `Bearer ${process.env.INSUREINFRA_API_KEY}`
    }
  });
  
  const { data } = await response.json();
  
  return {
    totalPremium: data.summary.totalPremium,
    policyCount: data.summary.totalPolicies,
    policies: data.policies
  };
}
```

### 2. Financial Reporting
Export premium data for financial analysis:

```python
import csv
import requests

# Fetch premium data
response = requests.get(
    'https://your-domain.com/api/v1/premium',
    headers={'Authorization': f'Bearer {api_key}'}
)
data = response.json()['data']

# Export to CSV
with open('premium_report.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Service ID', 'Product', 'Premium', 'Coverage'])
    
    for policy in data['policies']:
        writer.writerow([
            policy['serviceId'],
            policy['productName'],
            policy['premium']['actual'],
            policy['coverageAmount']
        ])
```

### 3. Automated Monitoring
Set up alerts for premium changes:

```javascript
const checkPremiumChanges = async () => {
  const response = await fetch('/api/v1/premium', {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });
  
  const { data } = await response.json();
  const totalPremium = data.summary.totalPremium;
  
  // Compare with previous value (stored elsewhere)
  if (totalPremium > previousTotal) {
    sendAlert(`Premium increased to ₹${totalPremium}`);
  }
};
```

---

## 🔒 Security Best Practices

1. **Store API Keys Securely**
   - Use environment variables
   - Never hardcode in source code
   - Use secret management services in production

2. **Rotate Keys Regularly**
   - Generate new keys periodically
   - Invalidate old keys after rotation
   - Update all integrations with new key

3. **Monitor API Usage**
   - Track API calls and responses
   - Set up alerts for unusual activity
   - Review access logs regularly

4. **Use HTTPS**
   - Always use HTTPS endpoints
   - Never send API keys over HTTP
   - Validate SSL certificates

---

## 📊 Rate Limits

| Limit Type | Value |
|------------|-------|
| Requests per minute | 100 |
| Concurrent requests | 10 |
| Response size | 5 MB |

If you exceed rate limits, you'll receive a `429 Too Many Requests` response.

---

## 🐛 Troubleshooting

### Issue: "Invalid API key" error

**Solution**: 
- Verify your API key is correct
- Regenerate API key from dashboard
- Check that Bearer token format is correct

### Issue: No policies returned

**Solution**:
- Check that you have approved policies
- Pending/rejected applications are not included
- Contact admin if policies should be approved

### Issue: Rate limit exceeded

**Solution**:
- Reduce request frequency
- Implement caching
- Contact support for higher limits

---

## 📞 Support

For API support, please contact:
- **Email**: support@vandage.com
- **Dashboard**: Navigate to Support section
- **Documentation**: Check `/customer/integration` page

---

## 📝 Changelog

### Version 1.0 (December 2024)
- Initial release
- GET /api/v1/premium endpoint
- API key authentication
- Premium summary for approved policies

---

**Base URL**: `https://your-domain.com/api/v1`  
**API Version**: 1.0  
**Last Updated**: December 14, 2024
