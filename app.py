from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import bcrypt
import mysql.connector
import jwt
SECRET_KEY = 'Dap_130820004fhuefhfe9ua'
import datetime

app = Flask(__name__)
CORS(app)
# Fungsi untuk koneksi ke database
def create_connection():
    try:
        conn = mysql.connector.connect(
            user='root',         
            password='', 
            host='127.0.0.1',    
            database='jelajah_cuaca' 
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

# Rute untuk API user
@app.route('/api/user', methods=['GET'])
def get_users():
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM user')
    result = cursor.fetchall()
    conn.close()
    return jsonify(result)

@app.route('/api/user', methods=['POST'])
def add_user():
    username = request.json['username']
    email = request.json['email']
    password = request.json['password']
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    conn = create_connection()
    cursor = conn.cursor()

    insert_stmt = "INSERT INTO user (username, email, password) VALUES (%s, %s, %s)"
    data = (username, email, hashed_password)
    try:
        cursor.execute(insert_stmt, data)
        conn.commit()
    except:
        conn.rollback()
        return jsonify({'error': 'Failed to insert user'}), 500
    conn.close()
    if not username or not email or not password:
        return jsonify({'error': 'Invalid input'}), 400
    else:
        return jsonify({'username': username,'email': email,
                        "success": True,'message': 'User successfully registered!'})


@app.route('/api/user', methods=['PUT'])
def update_user():
    id_user = int(request.json['id_user'])
    username = request.json['username']
    email = request.json['email']
    password = request.json['password']
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())# Hash kata sandi baru
    conn = create_connection()
    cursor = conn.cursor()
    update_stmt = "UPDATE user SET username=%s, email=%s, password=%s WHERE id_user=%s"
    data = (username, email, hashed_password, id_user)
    try:
        cursor.execute(update_stmt, data)
        conn.commit()
    except:
        conn.rollback()
        return jsonify({'error': 'Failed to update user'}), 500
    conn.close()
    return jsonify({'id_user': id_user, 'username': username, 'email': email})

@app.route('/api/login', methods=['POST'])
def login():
    # Mengambil data dari body JSON
    username = request.json.get('username')
    password = request.json.get('password')

    # Validasi input
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    # Membuka koneksi ke database
    conn = create_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500

    cursor = conn.cursor(dictionary=True)

    try:
        # Mengeksekusi query untuk mendapatkan user berdasarkan email
        cursor.execute('SELECT * FROM user WHERE username = %s', (username,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Menggunakan 'PASSWORD' dengan huruf kapital
        if bcrypt.checkpw(password.encode('utf-8'), user['PASSWORD'].encode('utf-8')):
            # Membuat token JWT dengan masa berlaku 1 jam
            token = jwt.encode(
                {'id_user': user['ID_USER'], 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
                SECRET_KEY,
                algorithm='HS256'
            )
            return jsonify({'success':True,'message': 'Login successful', 'token': token})

        else:
            return jsonify({'error': 'Invalid credentials'}), 401

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'An error occurred during login'}), 500

    finally:
        # Menutup koneksi ke database
        conn.close()


# Rute untuk API destination
@app.route('/api/destination', methods=['GET'])
def get_destination():
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM destination')
    result = cursor.fetchall()
    conn.close()
    return jsonify(result)

@app.route('/api/destination', methods=['POST'])
def add_destination():
    destination_name = request.json['destination_name']
    city = request.json['city']
    open_time = request.json['open_time']
    close_time = request.json['close_time']
    latitude = request.json['latitude']
    longitude = request.json['longitude']
    conn = create_connection()
    cursor = conn.cursor()
    insert_stmt = "INSERT INTO destination (destination_name, city, open_time, close_time, latitude, longitude) VALUES (%s, %s, %s, %s, %s, %s)"
    data = (destination_name, city, open_time, close_time, latitude, longitude)
    try:
        cursor.execute(insert_stmt, data)
        conn.commit()
    except:
        conn.rollback()
        return jsonify({'error': 'Failed to insert destination'}), 500
    conn.close()
    return jsonify({'destination_name': destination_name, 'open_time': open_time, 'close_time':close_time, 'latitude':latitude,'longitude':longitude})

@app.route('/api/destination', methods=['PUT'])
def update_destination():
    id_destination = int(request.json['id_destination'])
    destination_name = request.json['destination_name']
    city = request.json['city']
    open_time = request.json['open_time']
    close_time = request.json['close_time']
    latitude = request.json['latitude']
    longitude = request.json['longitude']
    conn = create_connection()
    cursor = conn.cursor()
    update_stmt = "UPDATE destination SET destination_name=%s, city=%s, open_time=%s, close_time=%s, latitude=%s, longitude=%s WHERE id_destination=%s"
    data = (destination_name, city, open_time, close_time, latitude, longitude, id_destination)
    try:
        cursor.execute(update_stmt, data)
        conn.commit()
    except:
        conn.rollback()
        return jsonify({'error': 'Failed to update destination'}), 500
    conn.close()
    return jsonify({'id_destination': id_destination, 'destination_name': destination_name, 
                    'open_time': open_time, 'close_time':close_time, 'latitude':latitude,'longitude':longitude})

# Rute untuk API trip
@app.route('/api/trip', methods=['GET'])
def get_trip():
    # Ambil id_user dari token JWT
    id_user, error = get_id_user_from_token()
    if error:
        return jsonify({'error': error}), 401

    # Koneksi ke database
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    # Query untuk mengambil trip berdasarkan id_user yang login
    cursor.execute("""
        SELECT trip.id_trip, trip.id_user, trip.id_destination, trip.start_date, trip.end_date, destination.destination_name
        FROM trip 
        JOIN destination ON trip.id_destination = destination.id_destination
        WHERE trip.id_user = %s
    """, (id_user,))

    result = cursor.fetchall()
    conn.close()

    return jsonify(result)


def get_id_user_from_token():
    token = request.headers.get('Authorization')
    print("Received Token:", token)  # Debugging: Cetak token yang diterima
    if not token:
        return None, 'Token is missing'
    
    # Menghapus "Bearer" jika ada
    token = token.replace("Bearer ", "")
    
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        print(f"Decoded token: {decoded}")  # Print decoded token
        return decoded['id_user'], None
    except jwt.ExpiredSignatureError:
        return None, 'Token has expired'
    except jwt.InvalidTokenError:
        return None, 'Invalid token'

@app.route('/api/trip', methods=['POST'])
def add_trip():
    id_user, error = get_id_user_from_token()
    if error:
        print(f"Error: {error}")  # Debugging: Token error
        return jsonify({'error': error}), 401

    data = request.json
    print(f"Received data: {data}")  # Debugging: Print received data
    if not data or 'id_destination' not in data or 'start_date' not in data or 'end_date' not in data:
        print("Missing required fields")  # Debugging: Missing fields
        return jsonify({'error': 'Missing required fields'}), 400

    id_destination = data['id_destination']
    start_date = data['start_date']
    end_date = data['end_date']

    # Masukkan data trip ke database
    conn = create_connection()
    cursor = conn.cursor()
    insert_stmt = "INSERT INTO trip (id_user, id_destination, start_date, end_date) VALUES (%s, %s, %s, %s)"
    data = (id_user, id_destination, start_date, end_date)
    cursor.execute(insert_stmt, data)
    conn.commit()
    conn.close()

    return jsonify({
        'id_user': id_user,
        'id_destination': id_destination,
        'start_date': start_date,
        'end_date': end_date
    }), 201

@app.route('/api/trip', methods=['PUT'])
def update_trip():
    id_user, error = get_id_user_from_token()

    if error:
        print(f"Error: {error}")  # Debugging: Token error
        return jsonify({'error': error}), 401

    # Ambil data dari permintaan JSON
    data = request.json
    print(f"Received data: {data}")  # Debugging: Print received data

    # Validasi input
    if not data or 'id_trip' not in data or 'id_destination' not in data or 'start_date' not in data or 'end_date' not in data:
        print("Missing required fields")  # Debugging: Missing fields
        return jsonify({'error': 'Missing required fields'}), 400

    id_trip=data['id_trip']
    id_destination = data['id_destination']
    start_date = data['start_date']
    end_date = data['end_date']

    # Masukkan data trip ke database
    conn = create_connection()
    cursor = conn.cursor()
    update_stmt = """
            UPDATE trip
            SET id_destination = %s, start_date = %s, end_date = %s
            WHERE id_trip = %s AND id_user = %s
        """
    try:
        cursor.execute(update_stmt, (id_destination, start_date, end_date, id_trip, id_user))
        conn.commit()
    except:
        conn.rollback()
        return jsonify({'error': 'Failed to update trip'}), 500
    conn.close()

    return jsonify({
        'id_trip':id_trip,
        'id_user': id_user,
        'id_destination': id_destination,
        'start_date': start_date,
        'end_date': end_date
    }), 201

@app.route('/api/trip', methods=['DELETE'])
def delete_trip():
    # Dapatkan id_user dari token
    id_user, error = get_id_user_from_token()
    if error:
        return jsonify({'error': error}), 401

    # Dapatkan data dari permintaan JSON
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON data'}), 400

    # Ambil id_trip dari data
    id_trip = data.get('id_trip')
    if not id_trip:
        return jsonify({'error': 'Missing id_trip'}), 400

    # Koneksi ke database dan hapus trip berdasarkan id_trip dan id_user
    conn = create_connection()
    cursor = conn.cursor()

    delete_stmt = """
        DELETE FROM trip
        WHERE id_trip = %s AND id_user = %s
    """
    try:
        cursor.execute(delete_stmt, (id_trip, id_user))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'No trip found with the provided id'}), 404
    except Exception as e:
        conn.rollback()
        return jsonify({'error': f'Failed to delete trip: {str(e)}'}), 500
    finally:
        conn.close()

    return jsonify({'message': 'Trip deleted successfully'}), 200

@app.route('/api/destination/weather', methods=['GET'])
def get_destination_weather():
    # Ambil latitude dan longitude dari parameter query
    id_destination = request.args.get('id_destination')
    if not id_destination:
        return jsonify({"error": "id_destination harus diberikan"}), 400
    # Ganti dengan API key OpenWeather Anda
    API_KEY = '25dbac6439dd9f6c50e3c57326298399'
    
    # Cek apakah destinasi dengan latitude dan longitude ada di database
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM destination WHERE id_destination = %s', (id_destination,))
    destination = cursor.fetchone()
    conn.close()

    if not destination:
        return jsonify({"error": "Destinasi tidak ditemukan"}), 404

    # Ambil latitude dan longitude dari data destinasi
    latitude = destination['LATITUDE']
    longitude = destination['LONGITUDE']

    # URL untuk permintaan ke API OpenWeather
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={API_KEY}&units=metric"

    # Lakukan permintaan ke OpenWeather API
    response = requests.get(url)
    if response.status_code != 200:
        return jsonify({"error": "Gagal mendapatkan data cuaca"}), response.status_code

    weather_data = response.json()

    # Format respons cuaca
    weather_info = {
        "destination_name": destination['DESTINATION_NAME'],
        "latitude": latitude,
        "longitude": longitude,
        "temperature": weather_data["main"]["temp"],
        "weather": weather_data["weather"][0]["description"],
        "humidity": weather_data["main"]["humidity"],
        "wind_speed": weather_data["wind"]["speed"]
    }

    return jsonify(weather_info)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5001)