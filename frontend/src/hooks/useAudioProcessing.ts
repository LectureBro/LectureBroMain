import { useState, useCallback, useRef } from "react";

export const useAudioProcessing = (isRecording: boolean, processAudio: () => Promise<void>) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const processingIntervalRef = useRef<number | null>(null);

  const startProcessing = useCallback(() => {
    if (!isProcessing) {
      setIsProcessing(true);
      const process = async () => {
        await processAudio();
        if (isRecording) {
          processingIntervalRef.current = window.setTimeout(process, 2000);
        }
      };
      process();
    }
  }, [isProcessing, isRecording, processAudio]);

  const stopProcessing = useCallback(() => {
    if (processingIntervalRef.current) {
      clearTimeout(processingIntervalRef.current);
    }
    setIsProcessing(false);
  }, []);

  return { startProcessing, stopProcessing, isProcessing };
};
