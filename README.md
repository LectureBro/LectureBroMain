
# LectureBro

LectureBro is a Chrome extension that generates real-time subtitles for live lectures and presentations. It helps students and professionals capture and save important information from audio content.

## Features

- Real-time speech-to-text transcription
- Multiple language support
- Auto-scrolling subtitles
- Copy transcriptions to clipboard
- Save transcriptions as text files
- Dark mode support

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/LectureBro/LectureBroMain.git
   cd LectureBro
   ```

2. Install dependencies for the **frontend**:

   ```bash
   cd frontend
   npm install
   ```

3. Build the Chrome extension (frontend):

   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `frontend/build` directory

5. Install dependencies for the **backend**:

   ```bash
   cd ../backend
   npm install
   ```

6. Start the backend server:

   ```bash
   npm run dev
   ```

7. Verify the backend is running:
   - Open a browser or API testing tool (like Postman) and make a `POST` request to:
     ```http
     http://localhost:5001/api/transcription/start
     ```
   - You should receive the following response:
     ```json
     { "message": "Transcription started", "sessionId": "12345" }
     ```

## Development

### Frontend Development

To start the development server for the frontend:

```bash
cd frontend
npm run dev
```

### Backend Development

To start the backend server for development with live reloading:

```bash
cd backend
npm run dev
```

### Tech Stack

- **Frontend**:
  - React + TypeScript
  - Vite
  - Tailwind CSS
  - shadcn/ui
  - Chrome Extensions API
- **Backend**:
  - Node.js
  - Express.js
  - CORS
  - Body-parser

## Project Structure

```
frontend/
├── public/
│   └── manifest.json    # Chrome extension manifest
├── src/
│   ├── components/      # UI components
│   ├── lib/             # Utility functions
│   ├── App.tsx          # Main application
│   └── main.tsx         # Entry point
└── package.json         # Frontend dependencies

backend/
├── src/
│   ├── routes/          # API route definitions
│   ├── controllers/     # Logic for handling API requests
│   ├── services/        # Backend business logic
│   └── utils/           # Utility functions
├── server.js            # Entry point for the backend
├── package.json         # Backend dependencies
└── README.md            # Documentation for backend
```

## API Endpoints (Backend)

| Endpoint                   | Method | Description                     |
|----------------------------|--------|---------------------------------|
| `/api/transcription/start` | POST   | Start a transcription session   |
| `/api/transcription/process` | POST | Process audio and return text   |
| `/api/transcription/end`   | POST   | End transcription session       |

### Example Responses

#### `/api/transcription/start`
Request:
```http
POST http://localhost:5001/api/transcription/start
```
Response:
```json
{ "message": "Transcription started", "sessionId": "12345" }
```

#### `/api/transcription/process`
Request:
```http
POST http://localhost:5001/api/transcription/process
```
Response:
```json
{ "message": "Audio processed", "text": "This is a sample transcribed text." }
```

#### `/api/transcription/end`
Request:
```http
POST http://localhost:5001/api/transcription/end
```
Response:
```json
{ "message": "Transcription ended", "transcriptId": "67890" }
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
