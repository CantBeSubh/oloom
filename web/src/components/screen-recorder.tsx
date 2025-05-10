"use client";

import { useRef, useState } from "react";

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: 60 },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          displaySurface: "monitor",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      const options = {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 8000000, // 8 Mbps
      };

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        setRecordedChunks(chunks);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting screen recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const downloadRecording = async () => {
    if (recordedChunks.length === 0) return;

    try {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style.display = "none";
      a.href = url;
      a.download = "screen-recording.webm";
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setRecordedChunks([]);
    } catch (error) {
      console.error("Error converting video:", error);
      alert("Error converting video. Downloading in WebM format instead.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="mb-4 text-2xl font-bold">High Quality Screen Recorder</h2>
      <div className="flex gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            Start Recording (60 FPS)
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700"
          >
            Stop Recording
          </button>
        )}
        {recordedChunks.length > 0 && (
          <button
            onClick={downloadRecording}
            className="rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
          >
            Download MP4
          </button>
        )}
      </div>
    </div>
  );
}
