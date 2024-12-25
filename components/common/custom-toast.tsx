"use client";

import { X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toast, type Toast } from "react-hot-toast";

interface CustomToastProps {
  t?: Toast;
  message: string;
  description?: string;
  txId?: string;
  address?: string;
  icon?: React.ReactNode;
}

const ToastContent = ({
  t,
  message,
  description,
  txId,
  address,
  icon,
}: CustomToastProps) => {
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const [remainingTime, setRemainingTime] = useState(5000); // total duration
  const [isClosing, setIsClosing] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // timer and process logic
  useEffect(() => {
    const start = Date.now();
    const localRemaining = remainingTime;

    const updateProgress = () => {
      if (!paused) {
        const elapsed = Date.now() - start;
        const newRemaining = Math.max(localRemaining - elapsed, 0);
        const percentage = (newRemaining / 5000) * 100;

        setRemainingTime(newRemaining);
        setProgress(percentage);

        if (newRemaining <= 0) handleClose(); // auto dismiss when timer ends
      }
    };

    intervalRef.current = setInterval(updateProgress, 50);

    timeoutRef.current = setTimeout(handleClose, localRemaining);

    return () => {
      clearInterval(intervalRef.current!);
      clearTimeout(timeoutRef.current!);
    };
  }, [paused]);

  // close with z dir
  const handleClose = () => {
    if (!t) return;
    setIsClosing(true); // trigger shrink animation

    clearInterval(intervalRef.current!);
    clearTimeout(timeoutRef.current!);

    // wait for animation to complete before dismissing
    setTimeout(() => toast.dismiss(t.id), 300);
  };
  if (!t) return;
  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`${
        isClosing
          ? "animate-shrinkOut" // shrink animation on close
          : t.visible
          ? "animate-fadeInUp" // enter animation
          : ""
      } max-w-[300px] w-full bg-gray-800 shadow-lg rounded-lg border border-sky-500 pointer-events-auto overflow-hidden`}
    >
      <div className="relative w-full h-1 bg-blue-400/20">
        <div
          className="absolute top-0 left-0 h-full bg-blue-400 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white font-medium">
            {icon}
            <p className="font-medium text-sm">{message}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {description && (
          <p className="mt-2 text-slate-400 text-sm break-all">{description}</p>
        )}
        {txId && (
          <Link
            href={`https://explorer.solana.com/tx/${txId}/?cluster=devnet`}
            target="_blank"
            className="mt-2 text-slate-400 text-sm break-all hover:text-sky-500 underline"
          >
            {txId}
          </Link>
        )}
        {address && (
          <Link
            href={`https://explorer.solana.com/address/${address}/?cluster=devnet`}
            target="_blank"
            className="mt-2 text-slate-400 text-sm break-all hover:text-sky-500 underline"
          >
            {address}
          </Link>
        )}
      </div>
    </div>
  );
};

export const customToast = ({
  message,
  description,
  icon,
  txId,
  address,
}: CustomToastProps) => {
  return toast.custom(
    (t: Toast) => (
      <ToastContent
        t={t}
        message={message}
        description={description}
        icon={icon}
        txId={txId}
        address={address}
      />
    ),
    {
      duration: Infinity, // manual timer control
    }
  );
};
