"""
Spencer Green Hotel HMS API Tests
Tests for refactored modular backend structure
Routes tested: auth, rooms, reservations, admin, content, reviews
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@spencergreenhotel.com"
ADMIN_PASSWORD = "admin123"


class TestHealthAndRoot:
    """Test basic API health and root endpoint"""
    
    def test_api_root(self):
        """Test API root endpoint returns correct response"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Spencer Green Hotel" in data["message"]
        print(f"✓ API root endpoint working: {data}")


class TestAuthEndpoints:
    """Test authentication endpoints - /api/auth/*"""
    
    def test_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "token" in data, "Token missing from response"
        assert "user" in data, "User data missing from response"
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        assert len(data["token"]) > 0
        print(f"✓ Admin login successful: {data['user']['email']}")
        return data["token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ Invalid login correctly rejected: {data['detail']}")
    
    def test_login_missing_fields(self):
        """Test login with missing fields returns 422"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL
        })
        assert response.status_code == 422
        print("✓ Missing password field correctly rejected")
    
    def test_get_me_with_token(self):
        """Test /auth/me endpoint with valid token"""
        # First login to get token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["token"]
        
        # Get user info
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        assert "password" not in data  # Password should be excluded
        print(f"✓ /auth/me returned user data: {data['email']}")
    
    def test_get_me_without_token(self):
        """Test /auth/me endpoint without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403]
        print("✓ /auth/me correctly requires authentication")


class TestRoomsEndpoints:
    """Test room endpoints - /api/rooms/*"""
    
    def test_get_rooms(self):
        """Test GET /api/rooms returns active rooms"""
        response = requests.get(f"{BASE_URL}/api/rooms")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"✓ GET /api/rooms returned {len(data)} rooms")
        
        # Validate room structure if rooms exist
        if len(data) > 0:
            room = data[0]
            assert "room_type_id" in room
            assert "name" in room
            assert "base_price" in room
            assert "_id" not in room  # MongoDB _id should be excluded
            print(f"  First room: {room['name']} - IDR {room['base_price']}")
        
        return data
    
    def test_get_single_room(self):
        """Test GET /api/rooms/{room_type_id} returns specific room"""
        # First get all rooms
        rooms_response = requests.get(f"{BASE_URL}/api/rooms")
        rooms = rooms_response.json()
        
        if len(rooms) > 0:
            room_id = rooms[0]["room_type_id"]
            response = requests.get(f"{BASE_URL}/api/rooms/{room_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["room_type_id"] == room_id
            assert "_id" not in data
            print(f"✓ GET /api/rooms/{room_id} returned: {data['name']}")
        else:
            pytest.skip("No rooms available to test")
    
    def test_get_nonexistent_room(self):
        """Test GET /api/rooms/{invalid_id} returns 404"""
        response = requests.get(f"{BASE_URL}/api/rooms/nonexistent-room-id")
        assert response.status_code == 404
        print("✓ Nonexistent room correctly returns 404")


class TestAvailabilityEndpoint:
    """Test availability checking - /api/availability"""
    
    def test_check_availability(self):
        """Test GET /api/availability with valid dates"""
        check_in = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        check_out = (datetime.now() + timedelta(days=9)).strftime("%Y-%m-%d")
        
        response = requests.get(
            f"{BASE_URL}/api/availability",
            params={"check_in": check_in, "check_out": check_out}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"✓ Availability check ({check_in} to {check_out}): {len(data)} rooms available")
        
        # Validate available room structure
        if len(data) > 0:
            room = data[0]
            assert "room_type_id" in room
            assert "name" in room
            assert "available_rate" in room
            assert "_id" not in room
            print(f"  First available: {room['name']} - IDR {room.get('available_rate', room.get('base_price'))}")
    
    def test_check_availability_specific_dates(self):
        """Test availability for specific dates from requirements"""
        response = requests.get(
            f"{BASE_URL}/api/availability",
            params={"check_in": "2025-01-15", "check_out": "2025-01-17"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Availability for 2025-01-15 to 2025-01-17: {len(data)} rooms")
    
    def test_check_availability_missing_params(self):
        """Test availability without required params"""
        response = requests.get(f"{BASE_URL}/api/availability")
        # Should return 422 for missing required params
        assert response.status_code == 422
        print("✓ Missing availability params correctly rejected")


class TestContentEndpoints:
    """Test content management - /api/content/*"""
    
    def test_get_all_content(self):
        """Test GET /api/content returns all site content"""
        response = requests.get(f"{BASE_URL}/api/content")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"✓ GET /api/content returned {len(data)} content items")
        
        # Validate content structure if content exists
        if len(data) > 0:
            content = data[0]
            assert "_id" not in content
            print(f"  Content sections: {set(c.get('section', 'unknown') for c in data)}")
    
    def test_get_page_content(self):
        """Test GET /api/content/{page} returns page-specific content"""
        response = requests.get(f"{BASE_URL}/api/content/home")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/content/home returned {len(data)} items")


class TestReviewsEndpoints:
    """Test reviews - /api/reviews/*"""
    
    def test_get_visible_reviews(self):
        """Test GET /api/reviews returns visible reviews"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"✓ GET /api/reviews returned {len(data)} visible reviews")
        
        # Validate review structure if reviews exist
        if len(data) > 0:
            review = data[0]
            assert "_id" not in review
            assert "is_visible" in review
            assert review["is_visible"] == True  # Only visible reviews
            print(f"  First review: {review.get('guest_name', 'Anonymous')} - {review.get('rating', 0)} stars")
    
    def test_create_review(self):
        """Test POST /api/reviews creates a new review (pending approval)"""
        review_data = {
            "guest_name": "TEST_Reviewer",
            "guest_email": "test_reviewer@example.com",
            "rating": 5,
            "comment": "Test review - excellent hotel!",
            "reservation_id": ""
        }
        
        response = requests.post(f"{BASE_URL}/api/reviews", json=review_data)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Review created: {data['message']}")


class TestReservationsEndpoints:
    """Test reservations - /api/reservations/*"""
    
    def test_create_reservation(self):
        """Test POST /api/reservations creates a new reservation"""
        # First get available rooms
        rooms_response = requests.get(f"{BASE_URL}/api/rooms")
        rooms = rooms_response.json()
        
        if len(rooms) == 0:
            pytest.skip("No rooms available for reservation test")
        
        room = rooms[0]
        check_in = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        check_out = (datetime.now() + timedelta(days=32)).strftime("%Y-%m-%d")
        
        reservation_data = {
            "guest_name": "TEST_Guest",
            "guest_email": "test_guest@example.com",
            "guest_phone": "+6281234567890",
            "room_type_id": room["room_type_id"],
            "check_in": check_in,
            "check_out": check_out,
            "guests": 2,
            "special_requests": "Test reservation - please ignore",
            "promo_code": ""
        }
        
        response = requests.post(f"{BASE_URL}/api/reservations", json=reservation_data)
        assert response.status_code == 200, f"Reservation failed: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "reservation_id" in data
        assert "booking_code" in data
        assert "total_amount" in data
        assert data["guest_name"] == "TEST_Guest"
        assert data["status"] == "pending"
        assert "_id" not in data  # MongoDB _id should be excluded
        
        print(f"✓ Reservation created: {data['booking_code']} - IDR {data['total_amount']}")
        return data
    
    def test_create_reservation_invalid_dates(self):
        """Test reservation with invalid dates (check_out before check_in)"""
        rooms_response = requests.get(f"{BASE_URL}/api/rooms")
        rooms = rooms_response.json()
        
        if len(rooms) == 0:
            pytest.skip("No rooms available")
        
        reservation_data = {
            "guest_name": "TEST_Invalid",
            "guest_email": "test@example.com",
            "guest_phone": "+6281234567890",
            "room_type_id": rooms[0]["room_type_id"],
            "check_in": "2025-01-20",
            "check_out": "2025-01-18",  # Before check_in
            "guests": 2
        }
        
        response = requests.post(f"{BASE_URL}/api/reservations", json=reservation_data)
        assert response.status_code == 400
        print("✓ Invalid dates correctly rejected")
    
    def test_check_reservation_by_email(self):
        """Test GET /api/reservations/check with email"""
        response = requests.get(
            f"{BASE_URL}/api/reservations/check",
            params={"email": "test_guest@example.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Reservation check by email returned {len(data)} reservations")
    
    def test_check_reservation_no_params(self):
        """Test reservation check without params returns 400"""
        response = requests.get(f"{BASE_URL}/api/reservations/check")
        assert response.status_code == 400
        print("✓ Reservation check without params correctly rejected")


class TestAdminDashboard:
    """Test admin dashboard - /api/admin/dashboard (requires auth)"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Authentication failed")
    
    def test_dashboard_with_auth(self, auth_token):
        """Test GET /api/admin/dashboard with valid token"""
        response = requests.get(
            f"{BASE_URL}/api/admin/dashboard",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Validate dashboard structure
        assert "occupied_rooms" in data
        assert "available_rooms" in data
        assert "monthly_revenue" in data
        assert "total_room_types" in data
        assert "pending_reviews" in data
        assert "recent_reservations" in data
        
        print(f"✓ Dashboard stats:")
        print(f"  - Occupied rooms: {data['occupied_rooms']}")
        print(f"  - Available rooms: {data['available_rooms']}")
        print(f"  - Monthly revenue: IDR {data['monthly_revenue']}")
        print(f"  - Total room types: {data['total_room_types']}")
        print(f"  - Pending reviews: {data['pending_reviews']}")
        print(f"  - Recent reservations: {len(data['recent_reservations'])}")
    
    def test_dashboard_without_auth(self):
        """Test dashboard without token returns 401/403"""
        response = requests.get(f"{BASE_URL}/api/admin/dashboard")
        assert response.status_code in [401, 403]
        print("✓ Dashboard correctly requires authentication")


class TestAdminReservations:
    """Test admin reservation management - /api/admin/reservations/*"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Authentication failed")
    
    def test_get_all_reservations(self, auth_token):
        """Test GET /api/admin/reservations returns all reservations"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reservations",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"✓ Admin reservations: {len(data)} total")
        
        # Validate structure if reservations exist
        if len(data) > 0:
            res = data[0]
            assert "_id" not in res
            assert "reservation_id" in res
            assert "booking_code" in res
    
    def test_get_reservations_filtered(self, auth_token):
        """Test GET /api/admin/reservations with status filter"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reservations",
            params={"status": "pending"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # All returned should be pending
        for res in data:
            assert res["status"] == "pending"
        print(f"✓ Filtered reservations (pending): {len(data)}")


class TestAdminUsers:
    """Test admin user management - /api/admin/users/*"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Authentication failed")
    
    def test_get_users(self, auth_token):
        """Test GET /api/admin/users returns all users"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"✓ Admin users: {len(data)} total")
        
        # Validate structure
        if len(data) > 0:
            user = data[0]
            assert "_id" not in user
            assert "password" not in user  # Password should be excluded
            assert "user_id" in user
            assert "email" in user


class TestInventoryEndpoints:
    """Test inventory management - /api/inventory/*"""
    
    def test_get_inventory(self):
        """Test GET /api/inventory returns inventory data"""
        response = requests.get(f"{BASE_URL}/api/inventory")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"✓ GET /api/inventory returned {len(data)} inventory records")
        
        if len(data) > 0:
            inv = data[0]
            assert "_id" not in inv
            assert "room_type_id" in inv
            assert "date" in inv
    
    def test_get_inventory_filtered(self):
        """Test GET /api/inventory with date filter"""
        start_date = datetime.now().strftime("%Y-%m-%d")
        end_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        
        response = requests.get(
            f"{BASE_URL}/api/inventory",
            params={"start_date": start_date, "end_date": end_date}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Filtered inventory ({start_date} to {end_date}): {len(data)} records")


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
