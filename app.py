from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDTjpGqvnZhccBMMPle2-7D_K2XzGFQJA0"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/send_message', methods=['POST'])
def send_message():
    user_message = request.json.get('message')
    file_data = request.json.get('file')
    response = get_ai_response(user_message, file_data)
    return jsonify({'response': response})

def get_ai_response(message, file_data=None):
    payload = {
        "contents": [
            {
                "parts": [{"text": message}]
            }
        ]
    }

    headers = {
        'Content-Type': 'application/json'
    }

    try:
        response = requests.post(API_URL, json=payload, headers=headers)
        response_data = response.json()
        return response_data.get('candidates', [{}])[0].get('content', 'No response')

    except Exception as e:
        return "Error connecting to the AI service"

if __name__ == '__main__':
    app.run(debug=True)
