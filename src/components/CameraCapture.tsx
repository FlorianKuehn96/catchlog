"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      setVideoReady(false);
      
      console.log("Starting camera with facingMode:", facingMode);
      
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Camera stream obtained:", stream);
      console.log("Tracks:", stream.getTracks());

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log("Video playing");
              setVideoReady(true);
              setLoading(false);
            }).catch((err) => {
              console.error("Error playing video:", err);
              setError("Fehler beim Starten der Kamera: " + err.message);
              setLoading(false);
            });
          }
        };
        
        videoRef.current.onerror = (err) => {
          console.error("Video element error:", err);
          setError("Fehler im Video-Element");
          setLoading(false);
        };
      }

      setIsCameraOpen(true);
    } catch (err: any) {
      console.error("Camera error:", err);
      setError(
        "Kamera konnte nicht gestartet werden: " + (err.message || "Unbekannter Fehler")
      );
      setLoading(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    console.log("Stopping camera");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        console.log("Stopping track:", track.label);
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
    }
    setIsCameraOpen(false);
    setVideoReady(false);
  }, []);

  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setTimeout(() => {
      startCamera();
    }, 300);
  }, [stopCamera, startCamera]);

  const capturePhoto = useCallback(() => {
    console.log("Capturing photo, video ready:", videoReady);
    if (videoRef.current && canvasRef.current && videoReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context && video.videoWidth && video.videoHeight) {
        console.log("Video dimensions:", video.videoWidth, "x", video.videoHeight);
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        // Optional: Add timestamp overlay
        const now = new Date();
        const timestamp = now.toLocaleString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        context.font = "bold 24px Arial";
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.textAlign = "right";

        // Draw timestamp
        const x = canvas.width - 20;
        const y = canvas.height - 20;
        context.strokeText(timestamp, x, y);
        context.fillText(timestamp, x, y);

        // Optional: Add watermark
        context.font = "bold 16px Arial";
        context.textAlign = "left";
        const watermarkX = 20;
        const watermarkY = canvas.height - 20;
        context.strokeText("CatchTracker", watermarkX, watermarkY);
        context.fillText("CatchTracker", watermarkX, watermarkY);

        const imageData = canvas.toDataURL("image/jpeg", 0.9);
        console.log("Photo captured, size:", imageData.length);
        setCapturedImage(imageData);
        stopCamera();
      } else {
        console.error("Video not ready or canvas context not available");
        setError("Video nicht bereit. Bitte warte einen Moment und versuche es erneut.");
      }
    } else {
      console.error("Refs not available or video not ready");
    }
  }, [stopCamera, videoReady]);

  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setVideoReady(false);
    startCamera();
  }, [startCamera]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setCapturedImage(result);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/50">
        <button
          onClick={() => {
            stopCamera();
            onCancel();
          }}
          className="text-white p-2 hover:bg-white/20 rounded-full transition-colors text-2xl"
        >
          ✕
        </button>
        <h2 className="text-white font-semibold">Fang fotografieren</h2>
        <div className="w-10" />{/* Spacer */}
      </div>

      {/* Initial State - Camera not started yet */}
      {!isCameraOpen && !capturedImage && !error && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <p className="text-white text-lg mb-8 text-center">
            Wähle eine Option, um ein Foto hinzuzufügen:
          </p>
          
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button
              onClick={startCamera}
              disabled={loading}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg disabled:opacity-50"
            >
              {loading ? "⏳ Lade..." : "📸 Kamera öffnen"}
            </button>
            
            <label className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors cursor-pointer text-lg">
              🖼️ Aus Galerie wählen
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-white text-lg mb-4">⏳ Kamera wird gestartet...</div>
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-red-400 text-center mb-4">{error}</div>
          <button
            onClick={startCamera}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Nochmal versuchen
          </button>
          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-4">Oder wähle ein Foto aus:</p>
            <label className="bg-gray-700 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-gray-600 inline-flex items-center gap-2">
              🖼️ Aus Galerie wählen
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Camera Preview */}
      {isCameraOpen && !capturedImage && !loading && (
        <>
          <div className="flex-1 relative bg-black flex items-center justify-center">
            {/* Loading indicator while video initializes */}
            {!videoReady && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-white text-lg">⏳ Kamera wird initialisiert...</div>
              </div>
            )}
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${videoReady ? 'opacity-100' : 'opacity-0'}`}
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />

            {/* Camera Controls */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8">
              {/* Switch Camera */}
              <button
                onClick={switchCamera}
                disabled={!videoReady}
                className="text-white p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors text-2xl disabled:opacity-50"
                title="Kamera wechseln"
              >
                🔄
              </button>

              {/* Capture Button */}
              <button
                onClick={capturePhoto}
                disabled={!videoReady}
                className="w-20 h-20 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <div className="w-16 h-16 rounded-full bg-white" />
              </button>

              {/* Gallery Option */}
              <label className="text-white p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors cursor-pointer text-2xl">
                🖼️
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </>
      )}

      {/* Captured Image Preview */}
      {capturedImage && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative bg-black flex items-center justify-center p-4">
            <img
              src={capturedImage}
              alt="Captured"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Preview Controls */}
          <div className="p-6 bg-gray-900 flex justify-center gap-4">
            <button
              onClick={retakePhoto}
              className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600"
            >
              🔄 Neu aufnehmen
            </button>

            <button
              onClick={confirmCapture}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              ✓ Verwenden
            </button>
          </div>
        </div>
      )}

      {/* Hidden Canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
