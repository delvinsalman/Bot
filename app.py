from flask import Flask, render_template, request, jsonify
import requests  # For making API calls to external AI services (optional)

app = Flask(__name__)

# Your AI API URL
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDTjpGqvnZhccBMMPle2-7D_K2XzGFQJA0"

# Serve the HTML page
@app.route('/')
def index():
    return render_template('index.html')  # Ensure your HTML file is in the 'templates' folder

# Handle chat messages from the frontend
@app.route('/send_message', methods=['POST'])
def send_message():
    user_message = request.json.get('message')  # Get the user message from the request

    # Optional: Handle file attachments (if any)
    file_data = request.json.get('file')  # Check if there's a file
    # Process the file data if necessary (e.g., store it or pass to API)

    # Call the external AI API for a response (optional)
    response = get_ai_response(user_message, file_data)
    return jsonify({'response': response})

# Function to communicate with the AI API
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
        # Make the request to the AI service (use your actual API key)
        response = requests.post(API_URL, json=payload, headers=headers)
        response_data = response.json()

        # Process the response from the API and return the relevant data
        return response_data.get('candidates', [{}])[0].get('content', 'No response')

    except Exception as e:
        return "Error connecting to the AI service"

if __name__ == '__main__':
    app.run(debug=True)
