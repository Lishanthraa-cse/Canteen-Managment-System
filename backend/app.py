import pandas as pd
import speech_recognition as sr
import pyttsx3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Load food menu data from Excel
def load_data(file_path):
    menu_df = pd.read_excel(file_path, engine="openpyxl")
    menu_df.columns = menu_df.columns.str.strip()
    return menu_df

# Server-side text-to-speech output
def speak(text):
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()

# Optional voice input (not used in current route)
def get_voice_input():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening... Speak now!")
        recognizer.adjust_for_ambient_noise(source)
        try:
            audio = recognizer.listen(source, timeout=5)
            return recognizer.recognize_google(audio).lower()
        except sr.UnknownValueError:
            print("Sorry, I couldn't understand. Please try again.")
        except sr.RequestError:
            print("Could not connect to speech recognition service. Try again.")
        except sr.WaitTimeoutError:
            print("You took too long to respond. Please try again.")
    return None

# Function to respond to user query
def respond_to_query(df, query):
    words = query.lower().split()
    for _, row in df.iterrows():
        if any(word in row['Name'].lower() for word in words):
            food_name = row["Name"]
            price = row["Price"]
            start_time = row["Timing (Start)"]
            end_time = row["Timing (End)"]

            response_text = f"{food_name} costs {price} and is available from {start_time} to {end_time}."
            speak(response_text)
            return response_text

    response_text = "Sorry, I couldn't find that item in our menu. Try asking about something else!"
    speak(response_text)
    return response_text

# Chatbot POST endpoint
@app.route('/', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    df = load_data(r"D:\chatbot\food_menu_dataset.xlsx")
    response = respond_to_query(df, user_message)
    return jsonify({'response': response})

# Optional: Root GET endpoint to avoid 405 error
@app.route('/', methods=['GET'])
def index():
    return "✅ SREC Canteen Chatbot API is running. Use POST / to send queries."

if __name__ == '__main__':
    app.run(debug=True)
