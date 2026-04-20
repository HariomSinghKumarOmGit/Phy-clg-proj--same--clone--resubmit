# ChemAI Lab - Server

Node.js/Express backend API for ChemAI Lab chemistry education platform.

## Setup

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=5000
OPENAI_API_KEY=your_openai_api_key
MONGO_URI=your_mongodb_connection_string
N8N_WEBHOOK=your_n8n_webhook_url
```

## Development

```bash
npm run server
```

Server will run at `http://localhost:5000`

## Production

```bash
npm start
```

## API Routes

- `GET /api` - API health check
- `GET /api/experiments` - Fetch all experiments
- `POST /api/experiments/:id/ask` - AI-powered Q&A for experiments
- `POST /api/experiments/:id/report` - Generate lab report

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- OpenAI API
- N8N for workflow automation


