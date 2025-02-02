"use client";
import { useState, useEffect, useRef } from 'react';
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
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
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
        () => {} // Ignore errors during scanning
      );
      setIsScanning(true);
    } catch (err) {
      alert('Failed to start scanner. Please check camera permissions.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      await scannerRef.current.stop();
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]); // Add stopScanner to dependencies array

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Ticket Scanner</h1>
        
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
