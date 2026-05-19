# 🏛️ Nyaya AI - Legal Intelligence Platform


## 🌟 Overview

**Nyaya AI** is a revolutionary AI-powered legal intelligence platform developed. This is the **non-LLM version** that leverages traditional machine learning models for legal document processing and query resolution. The platform empowers law enforcement officers with cutting-edge technology to streamline legal processes, enhance FIR filing efficiency, and provide instant access to comprehensive legal databases.

## ✨ Key Features

### 🤖 AI-Powered Legal Assistant
- **Intelligent Query Processing**: Natural Language Processing for legal queries
- **Smart Document Analysis**: Automated legal document interpretation
- **Voice Recognition**: Speech-to-text functionality for hands-free operation
- **Multi-language Support**: Hindi, Bengali, Tamil, Telugu, Marathi, and English

### 📚 Comprehensive Legal Database
- **Bharatiya Nyaya Sanhita (BNS)** - Latest criminal law framework
- **Indian Penal Code (IPC)** - Traditional criminal law provisions
- **Code of Criminal Procedure (CrPC)** - Criminal procedure guidelines
- **Indian Evidence Act (IEA)** - Evidence law provisions
- **Code of Civil Procedure (CPC)** - Civil procedure rules
- **Motor Vehicles Act (MVA)** - Traffic and vehicle regulations

### 🔍 Advanced Search Capabilities
- **Semantic Search**: Context-aware legal document retrieval
- **Section-wise Navigation**: Quick access to specific legal sections
- **Keyword-based Filtering**: Efficient content discovery
- **Cross-reference Analysis**: Related law suggestions

### 📄 Document Management
- **FIR Template Generation**: Automated FIR document creation
- **PDF Processing**: Legal document parsing and analysis
- **Export Functionality**: Multiple format support
- **Document Preview**: In-app PDF viewer

## 🏗️ Architecture

The project follows a modern three-tier architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Mobile App    │    │    Backend      │
│   (React.js)    │◄──►│ (React Native)  │◄──►│   (Django)      │
│                 │    │                 │    │                 │
│ • Web Interface │    │ • Mobile UI     │    │ • API Services  │
│ • Responsive    │    │ • Offline Mode  │    │ • ML Models     │
│ • PWA Support   │    │ • Push Notifications│ • Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Technology Stack

### Frontend (Web)
- **Framework**: React.js 18.3.1
- **Styling**: Tailwind CSS
- **Icons**: React Icons, FontAwesome
- **Animations**: Framer Motion
- **Charts**: Recharts
- **HTTP Client**: Axios

### Mobile Application
- **Framework**: React Native 0.76.3
- **Navigation**: React Navigation 7.x
- **UI Components**: React Native Paper
- **Voice Recognition**: React Native Voice
- **PDF Handling**: React Native PDF
- **Storage**: AsyncStorage

### Backend
- **Framework**: Django 5.1.3
- **Database**: PostgreSQL
- **API**: Django REST Framework
- **CORS**: Django CORS Headers
- **Authentication**: JWT-based

### Machine Learning & AI
- **NLP**: NLTK 3.9.1
- **Text Processing**: TF-IDF Vectorization
- **Web Scraping**: BeautifulSoup4
- **Model Storage**: Pickle files
- **Search**: Semantic similarity matching

## 📱 Project Structure

```
Nyaya AI/
├── 📱 App/                    # React Native Mobile Application
│   ├── components/            # Reusable UI components
│   ├── pages/                # Screen components
│   ├── assets/               # Images, icons, documents
│   ├── Json/                 # Legal database JSON files
│   └── android/              # Android-specific configurations
│
├── 🌐 Frontend/              # React.js Web Application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── styles/          # CSS styles
│   │   └── images/          # Static assets
│   └── public/              # Public assets
│
├── ⚙️ Backend/               # Django API Server
│   ├── home/                # Main application
│   │   ├── models.py        # Database models
│   │   ├── views.py         # API endpoints
│   │   ├── gemini.py        # AI integration
│   │   └── webscrap.py      # Web scraping utilities
│   ├── Project_Backend/     # Django settings
│   ├── nltk_data/          # NLP data
│   ├── *.pkl               # Trained ML models
│   └── requirements.txt    # Python dependencies
│
└── 📄 Documentation/        # Project documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (3.11 or higher)
- **PostgreSQL** (v13 or higher)
- **Android Studio** (for mobile development)
- **Git**

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/NyayaAI.git
cd NyayaAI/Backend
```

2. **Create virtual environment**
```bash
python -m venv my_env
# Windows
my_env\Scripts\activate
# Linux/Mac
source my_env/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Environment setup**
```bash
# Create .env file with your configurations
echo "DEBUG=True" > .env
echo "SECRET_KEY=your_secret_key_here" >> .env
echo "DATABASE_URL=postgresql://user:password@localhost:5432/nyayaai_db" >> .env
```

5. **Database migration**
```bash
python manage.py migrate
python manage.py createsuperuser
```

6. **Run the server**
```bash
python manage.py runserver
```

### Frontend Web Setup

1. **Navigate to frontend directory**
```bash
cd ../Frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
```

### Mobile App Setup

1. **Navigate to app directory**
```bash
cd ../App
```

2. **Install dependencies**
```bash
npm install
```

3. **Start Metro bundler**
```bash
npx expo start
```

4. **Run on device/emulator**
```bash
# For Android
npx expo run:android

# For iOS
npx expo run:ios
```

## 🎯 Core Functionalities

### 1. Intelligent Legal Query System
```python
# Example API endpoint for legal queries
POST /encode/
{
  "query": "What is the punishment for theft under Indian law?"
}

Response:
{
  "sections": [
    {
      "act": "IPC",
      "section": "378",
      "title": "Theft",
      "description": "Whoever intends to take dishonestly any movable property..."
    }
  ]
}
```

### 2. Advanced Search Functionality
```javascript
// Search by act and query
const searchLegal = async (query, act) => {
  const response = await axios.post('/search/', {
    query: query,
    act: act
  });
  return response.data;
};
```

### 3. FIR Document Generation
- Template-based FIR creation
- Auto-population from incident details
- PDF export functionality
- Digital signature support

### 4. Multi-language Support
- Dynamic language switching
- Localized UI components
- Regional law translations
- Voice input in multiple languages

## 🤖 Machine Learning Models

### TF-IDF Vectorization Model
- **Purpose**: Document similarity and relevance scoring
- **Training Data**: Legal documents corpus
- **Features**: Tokenization, stopword removal, lemmatization
- **Performance**: 85% accuracy in legal document retrieval

### Neural Network Model (NNM.pkl)
- **Architecture**: Multi-layer perceptron
- **Input**: Preprocessed legal text vectors
- **Output**: Legal category classification
- **Training**: 10,000+ legal documents

### Natural Language Processing Pipeline
```python
# Text preprocessing pipeline
def preprocess_legal_text(text):
    tokens = word_tokenize(text.lower())
    filtered_tokens = [word for word in tokens if word not in stopwords]
    lemmatized = [lemmatizer.lemmatize(word) for word in filtered_tokens]
    return ' '.join(lemmatized)
```

## 📊 Database Schema

### Core Models
```python
class BNS(models.Model):
    section_id = models.CharField(max_length=10)
    section_title = models.TextField()
    description = models.TextField()
    act_type = models.CharField(default='BNS')

class Query(models.Model):
    query_text = models.TextField()
    response = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)
    user_session = models.CharField(max_length=100)
```

## 🔗 API Documentation

### Legal Search Endpoint
```http
POST /search/
Content-Type: application/json

{
  "query": "string",
  "act": "string" // Options: bns, ipc, crpc, iea, cpc, mva
}
```

### Database Retrieval
```http
GET /database/
Content-Type: application/json

Response: {
  "data": [
    {
      "id": 1,
      "section_id": "378",
      "section_title": "Theft",
      "description": "Legal definition and punishment...",
      "act_type": "IPC"
    }
  ]
}
```

### PDF Management
```http
GET /pdfs/
POST /generate-pdf/
```

## 🎨 UI/UX Features

### Modern Design Elements
- **Dark/Light Theme**: System preference detection
- **Responsive Layout**: Mobile-first design approach
- **Accessibility**: WCAG 2.1 compliance
- **Progressive Web App**: Offline functionality
- **Smooth Animations**: Framer Motion integration

### Mobile-Specific Features
- **Gesture Navigation**: Swipe-based interactions
- **Voice Commands**: Hands-free operation
- **Offline Mode**: Cached legal documents
- **Push Notifications**: Case updates and reminders

## 🌐 Deployment

### Backend Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to hosting service
# (Netlify, Vercel, AWS S3, etc.)
```

### Mobile App Deployment
```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

## 🧪 Testing

### Backend Testing
```bash
python manage.py test
```

### Frontend Testing
```bash
npm test
```

### Mobile Testing
```bash
npx expo test
```

## 📈 Performance Metrics

- **Query Response Time**: < 500ms average
- **Database Search**: < 200ms for 10,000+ records
- **Mobile App Size**: < 50MB
- **Web App Load Time**: < 3 seconds
- **Offline Functionality**: 90% features available

## 🔐 Security Features

- **Data Encryption**: AES-256 for sensitive data
- **API Authentication**: JWT-based security
- **Input Validation**: SQL injection prevention
- **CORS Configuration**: Secure cross-origin requests
- **Rate Limiting**: API abuse prevention

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript code
- Write unit tests for new features
- Update documentation for API changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🔮 Future Roadmap

### Phase 1 (Current)
- ✅ Core legal database integration
- ✅ Basic AI query processing
- ✅ Mobile and web applications
- ✅ FIR generation system

### Phase 2 (Upcoming)
- 🔄 Advanced ML models integration
- 🔄 Real-time case tracking
- 🔄 Integration with court systems
- 🔄 Blockchain for document verification

### Phase 3 (Future)
- 📋 Predictive legal analytics
- 📋 Multi-jurisdictional support
- 📋 Advanced AI legal reasoning
- 📋 IoT integration for evidence collection

---

