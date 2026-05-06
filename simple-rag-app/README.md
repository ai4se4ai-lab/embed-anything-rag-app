Here is a comprehensive `README.md` for your project. It’s designed to look professional, explain the technical "why" behind the stack, and provide clear steps for anyone (including future you) to get it running in minutes.

---

# 🦀 Local RAG System with EmbedAnything

A high-performance, local-first Retrieval-Augmented Generation (RAG) system. This project allows you to upload multiple documents (PDFs, Markdown, Text) and perform semantic searches against them using your CPU—no expensive GPU or cloud credits required.

---

## 🚀 Why this project?

Most RAG systems rely on heavy Python libraries like PyTorch or expensive OpenAI API calls. This project uses **EmbedAnything**, which is built on **Rust**. 

*   **Lightning Fast**: Leverages Rust's memory safety and speed for embedding generation.
*   **Privacy First**: Everything stays on your machine. Your documents never leave your local environment.
*   **Lightweight**: Runs on standard CPUs using the `all-MiniLM-L12-v2` model, which has a tiny memory footprint.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), Tailwind CSS, TypeScript |
| **Backend** | FastAPI (Python) |
| **Embedding Engine** | EmbedAnything (Rust-powered pipeline) |
| **Models** | Hugging Face (Candle/ONNX) |

---

## 📂 Project Structure

```text
my-rag-app/
├── main.py              # FastAPI server & EmbedAnything logic
├── requirements.txt     # Python dependencies
├── .env.local           # Environment variables for Next.js
├── next.config.ts       # Next.js configuration (CORS/Rewrites)
└── app/                 # Next.js App Router
    ├── layout.tsx       # Root layout with hydration fixes
    └── page.tsx         # The RAG UI & Interaction logic
```

---

## 📦 Prerequisites

*   **Node.js 20+** and **npm**
*   **Python 3.10+**
*   **Pip** (Python package manager)

---

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies
Install the Python backend requirements:
```bash
pip install fastapi uvicorn embed-anything python-multipart numpy
```

Install the Frontend packages:
```bash
npm install
```

### 2. Configuration
Create a `.env.local` file in the root directory:
```text
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🏃 Running the Application

You will need two terminal windows open:

### Step 1: Start the Backend (Python)
The first time you run this, it will download the embedding model (~80MB) from Hugging Face.
```bash
python main.py
```
*Ensure you see: `INFO: Uvicorn running on [http://0.0.0.0:8000](http://0.0.0.0:8000)`.*

### Step 2: Start the Frontend (Next.js)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port specified in your terminal) in your browser.

---

## 📖 How to Use

1.  **Ingest**: Select multiple files (PDF, `.md`, or `.txt`) using the file picker.
2.  **Index**: Click **Upload & Index**. The backend will chunk your files and convert them into mathematical vectors (embeddings) stored in RAM.
3.  **Ask**: Type a question in the search box like *"What are the key takeaways from the document?"*.
4.  **Retrieve**: The system will find the top 4 most relevant text segments and display them with their similarity scores.

---

## ⚠️ Important Notes

> [!IMPORTANT]
> **Ephemeral Storage**: This basic version uses in-memory storage. If you stop the Python `main.py` server, the indexed data is cleared. You will need to re-upload files to search them again in a new session.

> [!TIP]
> To use larger files, you can adjust the `chunk_size` in `main.py` to balance between speed and context preservation.

---

## 🤝 Contributing
Feel free to fork this project and add features like:
*   Persistent vector storage (using ChromaDB or Qdrant).
*   Chat history.
*   Integration with local LLMs (like Ollama) to generate full answers.