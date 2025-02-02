"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import userData from '../../../data.json';

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{
    verified: boolean;
    name?: string;
    team?: string;
    regNumber?: string;
  } | null>(null);
  const [error, setError] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    try {
      if (!window.isSecureContext) {
        throw new Error('Page must be served over HTTPS to access the camera');
      }

      // Request camera permissions with explicit mobile configuration
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      // Test camera access first
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // Stop the test stream immediately
      stream.getTracks().forEach(track => track.stop());

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: ["QR_CODE"]
      };

      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          const user = userData.find(user => user.hashed_code === decodedText);
          if (user) {
            setResult({
              verified: true,
              name: user.name,
              team: user.team,
              regNumber: user.reg_number
            });
            stopScanner();
          } else {
            setResult({ verified: false });
          }
        },
        (errorMessage) => {
          // Log scanning errors but don't stop scanner
          console.warn('Scan error:', errorMessage);
        }
      );
      setIsScanning(true);
      setError('');
    } catch (err) {
      let errorMessage = 'Failed to start scanner';
      if (err instanceof Error) {
        errorMessage = err.message;
        // Add more specific error messages
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please ensure your device has a working camera.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is in use by another application. Please close other apps using the camera.';
        }
      }
      setError(errorMessage);
      console.error('Scanner error:', err);
    }
  };

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isScanning) {
      await scannerRef.current.stop();
      setIsScanning(false);
    }
  }, [isScanning]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]); // Add stopScanner to dependencies array

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Ticket Scanner</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-200 rounded-lg text-red-800">
            <p className="font-medium">{error}</p>
            {error.includes('permission') && (
              <p className="text-sm mt-2">
                Please check your browser settings and ensure camera permissions are enabled.
                You may need to refresh the page after allowing access.
              </p>
            )}
            {error.includes('HTTPS') && (
              <p className="text-sm mt-2">
                This feature requires a secure HTTPS connection. Please ensure you&apos;re accessing the site via HTTPS.
              </p>
            )}
          </div>
        )}

        {!isScanning && (
          <button
            onClick={startScanner}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg mb-4 transition-colors"
          >
            Start Scanner
          </button>
        )}

        {isScanning && (
          <button
            onClick={stopScanner}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg mb-4 transition-colors"
          >
            Stop Scanner
          </button>
        )}

        <div id="qr-reader" className="mb-4 overflow-hidden rounded-lg" />

        {result && (
          <div className={`p-4 rounded-lg ${
            result.verified 
              ? 'bg-green-100 border border-green-200' 
              : 'bg-red-100 border border-red-200'
          }`}>
            {result.verified ? (
              <>
                <p className="font-bold text-green-800">✅ Valid Ticket</p>
                <p>Name: {result.name}</p>
                <p>Team: {result.team}</p>
                <p>Reg No: {result.regNumber}</p>
              </>
            ) : (
              <p className="font-bold text-red-800">❌ Invalid Ticket</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
