"use client"

import Image from "next/image"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ForuMsBadge() {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="https://foru.ms"
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-opacity hover:opacity-80"
            >
              <Image src="/foru-ms.svg" alt="Foru.ms" width={32} height={32} className="h-8 w-8" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Powered by Foru.ms</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
