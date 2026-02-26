# TripPlanner+

A framework-free web application for planning trips with AI-powered travel assistance, weather information, and trip management features made as a project during Web Project I course at La Salle Campus Barcelona.

## Features

- **Trip Planning**: Organize and manage your travel plans
- **AI Travel Assistant**: Get personalized destination recommendations, activity suggestions, and travel tips powered by Google Gemini AI
- **Weather Information**: Check weather conditions for your travel destinations
- **Contact/About**: Learn more about the platform and get in touch

## Technologies Used

- **Frontend**: HTML, CSS3, JavaScript (Eco-friendly with no frameworks)
- **APIs**: 
  - Google Gemini AI for intelligent travel recommendations
  - OpenWeather API for real-time weather data
  - EmailJS for contact form functionality

## Project Structure

```
Practice1/
├── index.html          # Main entry point
├── css/                # Stylesheets
│   ├── styles.css      # Global styles
│   ├── chat.css        # AI chat interface
│   ├── home.css
│   ├── trips.css
│   ├── weather.css
│   └── about.css
├── js/                 # JavaScript modules
│   ├── index.js        # Main app logic
│   ├── config.js       # API keys configuration
│   ├── ai.js           # AI chat functionality
│   ├── trips.js
│   ├── weather.js
│   ├── about.js
│   └── home.js
├── media/              # Images and media assets
└── pages/              # HTML page templates
    ├── home.html
    ├── trips.html
    ├── weather.html
    └── about.html
```

## Getting Started

### Prerequisites

- A... web browser, obviously
- A local web server, preferrably, Live Server extension in VS Code

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Practice1
```

2. Configure API keys:
   - Edit `js/config.js` to add your own API keys
   - Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Get a Weather API key from [OpenWeather](https://openweathermap.org/api)
   - Get EmailJS credentials from [EmailJS](https://www.emailjs.com/)

### Running the Application

#### Option 1: VS Code Live Server (Recommended)

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. The application will open automatically at `http://localhost:5500`

#### Option 2: Python HTTP Server

```bash
# Python 3
python -m http.server 8000

# Then open in browser: http://localhost:8000
```

#### Option 3: Node.js HTTP Server

```bash
# Install http-server globally (if not installed)
npm install -g http-server

# Run server
http-server -p 8000

# Then open in browser: http://localhost:8000
```

## Usage

1. **Home Page**: Landing page with an overview of features
2. **Trips**: View and manage your trip plans
3. **Weather**: Check weather forecasts for your destinations
4. **About**: Learn more about the project and contact information
5. **AI Chat**: Click "Chat with AI" button to get personalized travel suggestions

## License

This project is licensed under the MIT license. For details, see LICENSE
