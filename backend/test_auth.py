
import requests

session = requests.Session()
base_url = "http://localhost:8000/api/"

# Get CSRF cookie
session.get(base_url + "auth/status/")
csrf_token = session.cookies.get("csrftoken")

if not csrf_token:
    print("CSRF cookie missing. Cannot continue.")
    raise SystemExit(1)

headers = {"X-CSRFToken": csrf_token}

# Log in
login_response = session.post(
    base_url + "auth/login/",
    json={
        "username": "crop_test_user",
        "password": "CropTest@2026Secure",
    },
    headers=headers,
)

print("Login:", login_response.status_code, login_response.text)

# Check whether the session is authenticated
status_response = session.get(base_url + "auth/status/")
print("Auth status:", status_response.status_code, status_response.text)


# Get the refreshed CSRF token after login
session.get(base_url + "auth/status/")
csrf_token = session.cookies.get("csrftoken")
headers = {"X-CSRFToken": csrf_token}

# Log out
logout_response = session.post(
    base_url + "auth/logout/",
    headers=headers,
)

print("Logout:", logout_response.status_code, logout_response.text)

# Confirm logged out
final_status = session.get(base_url + "auth/status/")
print("Final auth status:", final_status.status_code, final_status.text)
