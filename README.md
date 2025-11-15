# 🧪 ChemAI Lab

**The Smart Virtual Chemistry Mentor**

---

## 📝 Description

ChemAI Lab is an AI-powered chemistry lab simulator that enables students to conduct virtual chemistry experiments in a safe, interactive environment. The platform combines educational content with AI-powered assistance to help students learn and practice chemistry concepts through hands-on experimentation.

## 🚀 Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database (via Mongoose)
- **OpenAI API** - AI-powered assistance
- **N8N** - Workflow automation for report generation

## 📁 Project Structure

```
chemAI-lab/
│
├── client/                    # React frontend application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── assets/          # Images, styles, etc.
│   │   └── utils/           # Helper utilities
│   ├── .env.example         # Environment variables template
│   ├── package.json         # Frontend dependencies
│   └── README.md            # Frontend documentation
│
├── server/                   # Node.js backend application
│   ├── src/
│   │   ├── routes/          # API route definitions
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # Database models
│   │   ├── utils/           # Helper utilities
│   │   ├── config/          # Configuration files
│   │   └── server.js        # Express server entry point
│   ├── .env.example         # Environment variables template
│   ├── package.json         # Backend dependencies
│   └── README.md            # Backend documentation
│
├── docs/                     # Documentation and content
│   ├── experiments.json      # Experiment data
│   └── sampleReportTemplate.md  # Report template
│
├── n8n/                     # N8N workflow configurations
│   ├── chemLabReportFlow.json    # Report generation flow
│   └── chemLabEmailFlow.json     # Email notification flow
│
└── README.md                # Project overview (this file)
```

## 🏃 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud)
- OpenAI API key
- N8N account (optional for Phase 2)

### Running the Client

```bash
cd client
npm install
npm run dev
```

Client will be available at `http://localhost:5173`

### Running the Server

```bash
cd server
npm install
npm run server
```

Server will be available at `http://localhost:5000`

### Development Workflow

1. Start MongoDB service
2. Update `.env` files with your credentials (copy from `.env.example`)
3. Start the server: `cd server && npm run server`
4. Start the client: `cd client && npm run dev`
5. Navigate to `http://localhost:5173`

## 🎯 Features

- 🧬 Virtual Chemistry Experiments
- 🤖 AI-Powered Assistant
- 📊 Automated Report Generation
- 🔬 Safety-First Learning Environment
- 📈 Progress Tracking
- 💬 Interactive Guidance

## 📄 License

MIT

---

**Built with ❤️ for Chemistry Education**


