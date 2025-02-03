from flask import Flask, request, request, jsonify
from flask_cors import CORS
import re
import nltk
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
import pickle
from sklearn.svm import SVC

app = Flask(__name__)
CORS(app)  # Izinkan CORS untuk semua rute
model1 = pickle.load(open('model1_svc.pkl','rb')) #Load model untuk prediksi sentimwn
model2 = pickle.load(open('model2_svc.pkl','rb')) #Load model untuk prediksi emotion
vectorizer = pickle.load(open('vectorizer.pkl','rb')) #Load model untuk prediksi emotion
predictions = []  # List untuk menyimpan hasil prediksi

# Downloading necessary NLTK packages
nltk.download('punkt_tab')
factory = StopWordRemoverFactory()
stop_words = set(factory.get_stop_words())
# Initialize stemmer once
factory = StemmerFactory()
stemmer = factory.create_stemmer()

def preprocess_text(text):
    # Convert to lowercase
    text = text.lower()

    # Remove special characters, punctuation, and numbers
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)  # Remove URLs
    text = re.sub(r'@\w+', '', text)  # Remove mentions
    text = re.sub(r'#\w+', '', text)  # Remove hashtags
    text = re.sub(r'[^\w\s]', '', text)  # Remove special characters
    text = re.sub(r'\d+', '', text) # remove number
    text = re.sub(r'\s+', ' ', text).strip()  # Remove extra whitespace

    # Tokenization
    tokens = nltk.word_tokenize(text)

    # Stop word removal
    filtered_tokens = [word for word in tokens if word not in stop_words]
    preprocessed_text = ' '.join(filtered_tokens)

    # Stemming
    preprocessed_text = stemmer.stem(preprocessed_text)
    return preprocessed_text

@app.route('/predict', methods=['POST'])
def predict():
    print("Form data received:", request.form)  # Debugging output
    if 'Data' not in request.form:
        return jsonify({'error': 'Data field is missing'}), 400
    
    text_input = request.form['Data']
    preprocessed_text=preprocess_text(text_input)
    text_vector =vectorizer.transform([preprocessed_text])
    sentiment_pred = model1.predict(text_vector)
    emotion_pred = model2.predict(text_vector)
    # Convert predictions to text instead of list
    sentiment_pred = sentiment_pred[0] if hasattr(sentiment_pred, '__getitem__') else sentiment_pred
    emotion_pred = emotion_pred[0] if hasattr(emotion_pred, '__getitem__') else emotion_pred

    prediction_data = {
            'Customer Review': text_input,
            'Sentimen': sentiment_pred,
            'Emotion': emotion_pred,
            }
    predictions.append(prediction_data)  # Tambah ke riwayat prediksi

    return jsonify(prediction_data)

@app.route('/predictions', methods=['GET'])
def get_predictions():
    # Mengembalikan seluruh hasil prediksi yang disimpan dalam list
    return jsonify(predictions)

if __name__ == '__main__':
    app.run(debug=True)
