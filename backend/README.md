
# LectureBro Backend

The backend for LectureBro is a Node.js server that processes real-time speech-to-text transcription requests. It handles endpoints for starting, processing, and ending transcription sessions.

## Features

- Start a transcription session
- Process audio and return transcriptions
- End transcription sessions
- Designed to work seamlessly with the LectureBro frontend

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/LectureBro.git
   cd LectureBro/backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the backend server:

   ```bash
   npm run dev
   ```

4. Verify the server is running:
   - Open a browser or API testing tool (like Postman) and make a `POST` request to:
     ```http
     http://localhost:5001/api/transcription/start
     ```
   - You should receive the following response:
     ```json
     { "message": "Transcription started", "sessionId": "12345" }
     ```

## Development

### Available Scripts

- `npm run start`: Start the server in production mode.
- `npm run dev`: Start the server in development mode with `nodemon` for live reloading.

### Tech Stack

- Node.js
- Express.js
- CORS
- Body-parser

## Project Structure

```
backend/
├── src/
│   ├── routes/          # API route definitions
│   ├── controllers/     # Logic for handling API requests
│   ├── services/        # Backend business logic
│   └── utils/           # Utility functions
├── server.js            # Entry point for the backend
├── package.json         # Project metadata and dependencies
└── README.md            # Documentation for backend
```

## API Endpoints

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
