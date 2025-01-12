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
git clone https://github.com/yourusername/LectureBro.git
cd LectureBro
```

2. Install dependencies:

```bash
cd frontend
npm install
```

3. Build the extension:

```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `frontend/build` directory

## Development

Start the development server:

```bash
npm run dev
```

### Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Chrome Extensions API

### Project Structure

```
frontend/
├── public/
│   └── manifest.json    # Chrome extension manifest
├── src/
│   ├── components/      # UI components
│   ├── lib/            # Utility functions
│   ├── App.tsx         # Main application
│   └── main.tsx        # Entry point
└── package.json
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
