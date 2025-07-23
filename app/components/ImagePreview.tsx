'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface ImagePreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
}

export function ImagePreview({ open, onOpenChange, imageUrl }: ImagePreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Image Preview</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <img src={imageUrl} alt="Preview" className="w-full h-auto rounded-lg" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
