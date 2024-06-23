from flask import Flask, render_template, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer
import requests
import random
from urllib.parse import quote

PEXELS_API_KEY = 'KQLQ1rv8kErAhw9O37XwDW7vS82wYf6yKeW9gqfocoAOsRxuq1BnGGFU'

OPENWEATHERMAP_API_KEY = 'e960a40dd0698d63acb12d234029fdb8'

OPENWEATHERMAP_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

app = Flask(__name__)
tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")

@app.route("/")
def index():
    return render_template('chat.html')

@app.route("/get", methods=["POST"])
def chat():
    msg = request.form["msg"]
    response = get_chat_response(msg)
    return jsonify(response)

def get_chat_response(text):
    trimmed_text = text.strip().lower()

    trigger_word_inspire = "inspire"
    quotes = [
        "The best way to predict the future is to invent it.",
        "The only limit to our realization of tomorrow is our doubts of today.",
        "Your time is limited, don't waste it living someone else's life.",
        "The only way to do great work is to love what you do.",
        "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you.",
    ]

    trigger_word_joke = "joke"
    jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "Why did the scarecrow win an award? Because he was outstanding in his field!",
        "Why don't some couples go to the gym? Because some relationships don't work out.",
        "I told my wife she was drawing her eyebrows too high. She looked surprised.",
        "I threw a boomerang a few years ago. I now live in constant fear.",
    ]

    trigger_word_photo = "photo"  
    trigger_word_weather = "weather"  

    if trimmed_text == trigger_word_inspire:
        response = {
            "text": random.choice(quotes)
        }
    elif trimmed_text == trigger_word_joke:
        response = {
            "text": random.choice(jokes)
        }
    elif trimmed_text == trigger_word_photo:
        photo_url = fetch_random_photo()
        response = {
            "text": f"Here's a random photo for you:\n{photo_url}"
        }
    elif trimmed_text.startswith(trigger_word_weather):
        location = trimmed_text.replace(trigger_word_weather, "").strip()
        weather_response = get_weather(location)
        response = {
            "text": weather_response
        }
    else:
        new_user_input_ids = tokenizer.encode(str(text) + tokenizer.eos_token, return_tensors='pt')
        bot_input_ids = new_user_input_ids
        chat_history_ids = model.generate(bot_input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id)
        response = {
            "text": tokenizer.decode(chat_history_ids[:, bot_input_ids.shape[-1]:][0], skip_special_tokens=True)
        }

    return response

def fetch_random_photo():
    endpoint = "https://api.pexels.com/v1/search"
    headers = {
        "Authorization": PEXELS_API_KEY
    }

    random_queries = ["nature", "technology", "people", "animals", "architecture", "food", "travel", "sports", "fashion", "abstract"]
    query = random.choice(random_queries)

    params = {
        "query": query,  
        "per_page": 1,
        "page": random.randint(1, 10)  
    }

    try:
        response = requests.get(endpoint, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        if data['photos']:
            return data['photos'][0]['src']['original']
        else:
            return "Sorry, I couldn't find any photos right now."
    except requests.exceptions.RequestException as e:
        return f"Error fetching photo: {str(e)}"

def get_weather(location):
    try:
        encoded_location = quote(location)

        url = f"{OPENWEATHERMAP_BASE_URL}?q={encoded_location}&appid={OPENWEATHERMAP_API_KEY}&units=metric"

        response = requests.get(url)
        response.raise_for_status()
        weather_data = response.json()

        if weather_data.get('main') and weather_data.get('weather'):
            description = weather_data['weather'][0]['description']
            temperature = weather_data['main']['temp']
            city = weather_data['name']
            country = weather_data['sys']['country']

            weather_response = f"Current weather in {city}, {country}: {description}, Temperature: {temperature}°C"
        else:
            weather_response = "Sorry, I couldn't retrieve the weather information."

        return weather_response

    except requests.exceptions.RequestException as e:
        return f"Error fetching weather: {str(e)}"

if __name__ == '__main__':
    app.run()
