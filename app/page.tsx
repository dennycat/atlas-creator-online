"use client";

import React, { useState } from "react";

export default function Home() {
  const [frames, setFrames] = useState<File[]>([]);
  const [cellsX, setCellsX] = useState(6);
  const [cellsY, setCellsY] = useState(5);
  const [cellWidth, setCellWidth] = useState(512);
  const [cellHeight, setCellHeight] = useState(512);

  const [showFrames, setShowFrames] = useState(false);
  const [loading, setLoading] = useState(false);

  function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const list = Array.from(e.target.files);
    setFrames(list);
  }

  async function onCreateAtlas() {
    if (frames.length === 0) {
      alert("Спочатку завантаж PNG файли.");
      return;
    }

    setLoading(true);

    const form = new FormData();
    frames.forEach(f => form.append("frames", f));
    form.append("cellsX", String(cellsX));
    form.append("cellsY", String(cellsY));
    form.append("cellWidth", String(cellWidth));
    form.append("cellHeight", String(cellHeight));

    const res = await fetch("/api/create-atlas", {
      method: "POST",
      body: form,
    });

    setLoading(false);

    if (!res.ok) {
      alert("Помилка при створенні атласу.");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "atlas.png";
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main
      style={{
        padding: 24,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        maxWidth: 900,
        margin: "0 auto",
        color: "#eee",
        backgroundColor: "#111",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>Atlas Creator Online</h1>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20 }}>Завантаження PNG файлів</h2>
        <p>Вибери PNG кадри, які хочеш зібрати в атлас.</p>
        <input type="file" multiple accept="image/png" onChange={onFilesSelected} />

        <button
          onClick={() => setShowFrames(!showFrames)}
          style={{
            marginLeft: 12,
            padding: "6px 12px",
            cursor: "pointer",
            backgroundColor: "#333",
            color: "#eee",
            border: "1px solid #555",
            borderRadius: 4,
          }}
        >
          Показати / сховати список ({frames.length})
        </button>

        {showFrames && (
          <div
            style={{
              maxHeight: 200,
              overflowY: "auto",
              marginTop: 12,
              border: "1px solid #444",
              padding: 8,
              borderRadius: 4,
              backgroundColor: "#181818",
            }}
          >
            {frames.length === 0 && <div>Файлів поки немає.</div>}
            {frames.map((f, i) => (
              <div key={i}>{f.name}</div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20 }}>Параметри сітки</h2>

        <div style={{ marginTop: 8 }}>
          <label>Клітинок по ширині: </label>
          <input
            type="number"
            value={cellsX}
            onChange={e => setCellsX(parseInt(e.target.value || "0", 10))}
            style={{ width: 80 }}
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Клітинок по висоті: </label>
          <input
            type="number"
            value={cellsY}
            onChange={e => setCellsY(parseInt(e.target.value || "0", 10))}
            style={{ width: 80 }}
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Ширина клітинки: </label>
          <input
            type="number"
            value={cellWidth}
            onChange={e => setCellWidth(parseInt(e.target.value || "0", 10))}
            style={{ width: 80 }}
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Висота клітинки: </label>
          <input
            type="number"
            value={cellHeight}
            onChange={e => setCellHeight(parseInt(e.target.value || "0", 10))}
            style={{ width: 80 }}
          />
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <button
          onClick={onCreateAtlas}
          disabled={loading}
          style={{
            padding: "10px 20px",
            fontSize: 16,
            cursor: "pointer",
            backgroundColor: loading ? "#555" : "#00bcd4",
            border: "none",
            borderRadius: 4,
            color: "#000",
          }}
        >
          {loading ? "Створення..." : "Створити атлас"}
        </button>
      </section>
    </main>
  );
}
