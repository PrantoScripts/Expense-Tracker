import React, { useState } from "react";
import { UploadCloud, RefreshCw, Check, AlertCircle, X, FileImage, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface ReceiptCameraScannerProps {
  onScanSuccess: (data: { amount: number; date: string; note: string; category?: string }) => void;
  lang: 'en' | 'bn';
  onClose: () => void;
}

export function ReceiptCameraScanner({ onScanSuccess, lang, onClose }: ReceiptCameraScannerProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg(
        lang === 'bn' 
          ? "দয়া করে একটি ছবি ফাইল (.jpg, .png ইত্যাদি) নির্বাচন করুন।" 
          : "Please select an image file (.jpg, .png, etc.)."
      );
      return;
    }
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setErrorMsg(null);
  };

  const handleSubmitAnalysis = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem("spendwise_token");
      const response = await fetch("/api/transactions/parse-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          fileDataUrl: capturedImage,
          fileName: "uploaded_receipt.png",
          fileType: "image/png"
        })
      });

      const data = await response.json();
      if (response.ok && data.parsedTx) {
        onScanSuccess({
          amount: data.parsedTx.amount,
          date: data.parsedTx.date,
          note: data.parsedTx.note,
          category: data.parsedTx.category
        });
        onClose();
      } else {
        setErrorMsg(data.error || (lang === 'bn' ? "রিসিট স্ক্যানিং ব্যর্থ হয়েছে।" : "Failed to analyze receipt data. Please verify image content."));
      }
    } catch (err) {
      setErrorMsg(lang === 'bn' ? "সার্ভার নেটওয়ার্ক ত্রুটি ঘটেছে।" : "Server/network error during receipt analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg glass-panel overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl"
      >
        {/* Banner with close button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">
                {lang === 'bn' ? "এআই রিসিট স্ক্যানার" : "AI Receipt Image Scanner"}
              </h3>
              <p className="text-[10px] text-slate-400">
                {lang === 'bn' ? "রিসিটের ছবি আপলোড করে জেমিণী এআই দিয়ে স্ক্যান করুন" : "Upload receipt photo to let Gemini AI auto-extract details"}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white text-xs cursor-pointer transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Core View Container */}
          <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-slate-800 flex items-center justify-center">
            
            {/* Captured Still Review State */}
            {capturedImage && (
              <div className="relative w-full h-full">
                <img 
                  referrerPolicy="no-referrer"
                  src={capturedImage} 
                  alt="Receipt snapshot" 
                  className="w-full h-full object-contain" 
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center space-y-3">
                    <div className="relative p-4">
                      {/* Double spin ring */}
                      <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                      <div className="h-10 w-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs font-black text-white flex items-center justify-center gap-1.5 animate-pulse">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{lang === 'bn' ? "জেমিণী রিসিট ডেটা বিশ্লেষণ করছে..." : "Gemini AI is analyzing receipt..."}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {lang === 'bn' ? "তারিখ, পরিমাণ এবং নোট আলাদা করা হচ্ছে" : "Extracting exact currency, date, and items"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Inactive Camera / Upload Zone Selector */}
            {!capturedImage && (
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed transition-all p-5 text-center ${
                  isDragging 
                    ? "border-indigo-500 bg-indigo-500/5" 
                    : "border-slate-800 hover:border-slate-700 bg-slate-950/20"
                }`}
              >
                <div className="h-12 w-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400 shadow-inner mb-3">
                  <FileImage className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    {lang === 'bn' ? "ছবি টেনে আনুন অথবা ফাইল খুঁজুন" : "Drag and drop or select receipt snapshot"}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">
                    {lang === 'bn' 
                      ? "আপনার ডিভাইসের ফাইল ম্যানেজার থেকে যেকোনো রিসিটের ছবি ফাইল এখানে টানুন বা আপলোড বোতামে চাপুন।" 
                      : "Drop your purchase bills or snap copies directly from files or media library to analyze details."}
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Action Tools Controls */}
          <div className="flex gap-3 justify-center">

            {/* Review Controls */}
            {capturedImage && !isAnalyzing && (
              <div className="flex items-center gap-2.5 w-full">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold rounded-xl text-slate-300 hover:text-white cursor-pointer transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{lang === 'bn' ? "অন্য ছবি বাছুন" : "Choose Other"}</span>
                </button>
                <button
                  type="button"
                  id="camera-submit-analysis"
                  onClick={handleSubmitAnalysis}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl text-white shadow-md cursor-pointer transition flex items-center justify-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{lang === 'bn' ? "বিশ্লেষণ করুন" : "Analyze Auto-Fill"}</span>
                </button>
              </div>
            )}

            {/* Choose file fallback picker */}
            {!capturedImage && (
              <label className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white rounded-xl shadow-lg shadow-indigo-600/10 cursor-pointer transition flex items-center gap-1.5 justify-center">
                <UploadCloud className="h-4 w-4" />
                <span>{lang === 'bn' ? "রিসিটের ছবি আপলোড করুন" : "Upload Receipt Image"}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLocalFileSelect}
                  className="hidden" 
                />
              </label>
            )}

          </div>

        </div>

      </motion.div>
    </div>
  );
}
