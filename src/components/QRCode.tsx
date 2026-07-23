'use client'

import { QRCodeSVG } from 'qrcode.react'

interface QRCodeProps {
  value: string
  size?: number
}

export function QRCodeDisplay({ value, size = 200 }: QRCodeProps) {
  return <QRCodeSVG value={value} size={size} bgColor="#FFFFFF" fgColor="#14181B" />
}
