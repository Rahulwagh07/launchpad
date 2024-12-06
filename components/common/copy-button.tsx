'use client'

import { useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CopyButtonProps {
  value: string
  label?: string
  className?: string
}

export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();  
    await navigator.clipboard.writeText(value);
    setCopied(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
 
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
      timeoutRef.current = null;  
    }, 1000);
  };


  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`text-zinc-400 hover:text-zinc-100 ${className}`}
            onClick={copy}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">Copy {label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy {label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

