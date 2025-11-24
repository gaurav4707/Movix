import os
from flask import Flask, request, jsonify
import mysql.connector

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    """Allow the frontend (Vite dev server) to call this API without flask_cors."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

def get_db():
    host = os.getenv("DB_HOST", "localhost")
    user = os.getenv("DB_USER", "root")
    password = os.getenv("DB_PASSWORD")
    database = os.getenv("DB_NAME", "movix_db")

    if not password:
        raise RuntimeError(
            "Database password not set. Export DB_PASSWORD env var or edit backend/server.py with the correct credentials."
        )

    return mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=database
    )

@app.route("/query")
def run_query():
    sql = request.args.get("q")
    
    if not sql:
        return jsonify({"error": "No SQL query provided"}), 400

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute(sql)
        
        if cursor.with_rows:
            result = cursor.fetchall()
        else:
            db.commit()
            result = {"affected_rows": cursor.rowcount}

        cursor.close()
        db.close()

        return jsonify(result)

    except mysql.connector.Error as err:
        return jsonify({
            "error": err.msg,
            "code": err.errno,
            "sqlstate": err.sqlstate
        }), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

app.run(debug=True, host="0.0.0.0", port=5000)
