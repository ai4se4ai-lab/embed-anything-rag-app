"use client";
import { useState, useEffect, useRef } from "react";

export default function TerminalRAG() {
  const [history, setHistory] = useState<string[]>(["System initialized. Type 'help' for commands."]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Auto-scroll to bottom of terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const addLog = (msg: string) => setHistory((prev) => [...prev, `> ${msg}`]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    addLog(input);
    setInput("");

    if (cmd === "help") {
      addLog("Available commands: 'upload', 'clear', 'ls', or just type your query to search.");
    } else if (cmd === "clear") {
      setHistory([]);
    } else if (cmd === "ls") {
      addLog("Documents currently indexed in RAM.");
    } else if (cmd === "upload") {
      document.getElementById("fileInput")?.click();
    } else {
      // Treat any other input as a RAG Query
      await performSearch(cmd);
    }
  };

  const performSearch = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.results.length > 0) {
        data.results.forEach((r: any) => {
          addLog(`[MATCH ${Math.round(r.score * 100)}%]: ${r.text}`);
        });
      } else {
        addLog("No relevant matches found. Try uploading more files.");
      }
    } catch (e) {
      addLog("ERROR: Connection to backend failed.");
    }
    setLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    setLoading(true);
    addLog(`Uploading ${selectedFiles.length} files...`);
    const formData = new FormData();
    Array.from(selectedFiles).forEach((f) => formData.append("files", f));

    try {
      const res = await fetch(`${BACKEND_URL}/upload`, { method: "POST", body: formData });
      if (res.ok) addLog("SUCCESS: Files indexed into knowledge base.");
      else addLog("ERROR: Backend failed to process files.");
    } catch (e) {
      addLog("ERROR: Could not reach server.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black p-4 font-mono text-green-500 selection:bg-green-900 selection:text-white">
      {/* Hidden File Input */}
      <input type="file" id="fileInput" multiple className="hidden" onChange={handleFileChange} />

      <div className="mx-auto max-w-5xl border border-green-900 bg-black/50 p-6 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
        {/* Terminal Header */}
        <div className="mb-4 flex items-center gap-2 border-b border-green-900 pb-2 text-xs opacity-50">
          <div className="h-3 w-3 rounded-full bg-red-900" />
          <div className="h-3 w-3 rounded-full bg-yellow-900" />
          <div className="h-3 w-3 rounded-full bg-green-900" />
          <span className="ml-2">guest@embed-anything:~</span>
        </div>

        {/* Output History */}
        <div className="h-[70vh] overflow-y-auto space-y-1 mb-4 custom-scrollbar">
          {history.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-words leading-relaxed">
              {line}
            </div>
          ))}
          {loading && <div className="animate-pulse">_ Processing request...</div>}
          <div ref={terminalEndRef} />
        </div>

        {/* Input Line */}
        <form onSubmit={handleCommand} className="flex items-center gap-2">
          <span className="text-blue-400">guest@rag:~$</span>
          <input
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none border-none focus:ring-0 text-green-400"
            spellCheck="false"
            autoComplete="off"
          />
        </form>
      </div>

      {/* Global CSS for the CRT scanline effect (Optional) */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #064e3b; border-radius: 10px; }
        body {
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          background-size: 100% 2px, 3px 100%;
        }
      `}</style>
    </main>
  );
}