# Vamus Music

Vamus is an ad-free, high-fidelity music streaming application built with Next.js. It dynamically fetches music streams natively and provides AI-powered song recommendations based on your listening habits. 

It is styled as a perfect Progressive Web App (PWA), meaning it looks and acts flawlessly on both Desktop and Mobile browsers.

## Features
- 🎵 100% Ad-free music streaming
- 🤖 AI-powered recommendations (powered by Gemini)
- 📱 Fully responsive mobile UI (Progressive Web App)
- 🔍 Instant artist and song search capabilities
- 📚 Create your own library and playlists

## Setup & Installation

To run Vamus, your computer will act as the "server" to process the audio streams.

### 1. Clone the repository
```bash
git clone https://github.com/vasosofuji/vamus-music.git
cd vamus-music
```

### 2. Install Dependencies
Make sure you have [Node.js](https://nodejs.org/) installed, then run:
```bash
npm install
```

### 3. Configure API Keys
Vamus uses the Gemini API for its smart music recommendations engine. You need to provide your own API key.

1. Create a file named `.env.local` in the root directory of the project.
2. Add your Gemini API key inside it like this:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: The `.env.local` file is explicitly ignored by Git, so your key will always remain safe on your local machine).*

### 4. Run the App
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to start listening to music!

### Mobile Usage
To use the app on your phone:
1. Make sure your computer is running `npm run dev`.
2. Ensure your phone is connected to the same Wi-Fi network as your computer.
3. Open your phone's browser and go to your computer's local IP address on port 3000 (e.g., `http://192.168.1.100:3000`).
4. Tap **"Add to Home Screen"** in your browser menu to install it as a native full-screen app.

## Legal Disclaimer & Educational Purpose
This repository and its source code are provided strictly for **educational and research purposes only**. 

1. **No Hosted Content:** This application does not host, store, or distribute any copyrighted media or audio files. It merely acts as a client-side interface that interacts with publicly available APIs.
2. **Third-Party TOS:** The authors do not endorse or encourage the violation of any third-party Terms of Service. Users are solely responsible for how they choose to utilize this software and must ensure their usage complies with all applicable laws and platform policies.
3. **No Liability:** The software is provided "as is", without warranty of any kind. Under no circumstances shall the authors or contributors be held liable for any claims, damages, or legal actions arising from the use of this software.

By downloading, installing, or interacting with this repository, you agree to assume all legal responsibility for your actions.
