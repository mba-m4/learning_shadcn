import { useLayoutEffect, useRef, useState } from 'react'

interface UseSignaturePadOptions {
  open: boolean
  enabled: boolean
  setSignature(data: string): void
}

export function useSignaturePad({
  open,
  enabled,
  setSignature,
}: UseSignaturePadOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const isDrawingRef = useRef(false)
  const hasStrokeRef = useRef(false)
  const [canvasNonce, setCanvasNonce] = useState(0)
  const [isSignatureConfirmed, setIsSignatureConfirmed] = useState(false)

  useLayoutEffect(() => {
    if (!open) {
      setIsSignatureConfirmed(false)
      return
    }

    if (!enabled) {
      setIsSignatureConfirmed(false)
      return
    }

    setIsSignatureConfirmed(false)
    hasStrokeRef.current = false
    isDrawingRef.current = false
    contextRef.current = null
    setSignature('')
    setCanvasNonce((value) => value + 1)

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    let rafId = 0
    let observer: ResizeObserver | null = null

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width < 10 || rect.height < 10) {
        rafId = window.requestAnimationFrame(setupCanvas)
        return
      }

      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      const width = Math.round(rect.width * ratio)
      const height = Math.round(rect.height * ratio)

      canvas.width = width
      canvas.height = height

      const context = canvas.getContext('2d')
      if (context) {
        context.setTransform(ratio, 0, 0, ratio, 0, 0)
        context.clearRect(0, 0, rect.width, rect.height)
        context.lineWidth = 2
        context.lineCap = 'round'
        context.strokeStyle = '#111827'
      }

      contextRef.current = context
    }

    rafId = window.requestAnimationFrame(setupCanvas)

    if ('ResizeObserver' in window) {
      observer = new ResizeObserver(() => {
        setupCanvas()
      })
      observer.observe(canvas)
    }

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
      observer?.disconnect()
      contextRef.current = null
      isDrawingRef.current = false
      hasStrokeRef.current = false
    }
  }, [enabled, open, setSignature])

  const ensureContext = () => {
    if (contextRef.current) {
      return contextRef.current
    }

    const canvas = canvasRef.current
    if (!canvas) {
      return null
    }

    const rect = canvas.getBoundingClientRect()
    if (canvas.width === 0 || canvas.height === 0) {
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      canvas.width = Math.max(1, Math.round(rect.width * ratio))
      canvas.height = Math.max(1, Math.round(rect.height * ratio))
      const context = canvas.getContext('2d')
      if (context) {
        context.setTransform(ratio, 0, 0, ratio, 0, 0)
      }
    }

    const context = canvas.getContext('2d')
    if (context) {
      context.lineWidth = 2
      context.lineCap = 'round'
      context.strokeStyle = '#111827'
    }

    contextRef.current = context
    return context
  }

  const startStroke = (x: number, y: number) => {
    if (isSignatureConfirmed) {
      setIsSignatureConfirmed(false)
      hasStrokeRef.current = false
      setSignature('')
    }

    const context = ensureContext()
    if (!context) {
      return
    }

    setIsSignatureConfirmed(false)
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + 0.1, y + 0.1)
    context.stroke()
    hasStrokeRef.current = true
    isDrawingRef.current = true
  }

  const moveStroke = (x: number, y: number) => {
    if (isSignatureConfirmed) {
      return
    }

    const context = ensureContext()
    if (!context || !isDrawingRef.current) {
      return
    }

    context.lineTo(x, y)
    context.stroke()
    hasStrokeRef.current = true
  }

  const endStroke = () => {
    if (!isDrawingRef.current) {
      return
    }

    isDrawingRef.current = false
    if (hasStrokeRef.current && canvasRef.current) {
      setSignature(canvasRef.current.toDataURL('image/png'))
    }
  }

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) {
      return { x: 0, y: 0 }
    }

    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) * canvas.width) / rect.width,
      y: ((event.clientY - rect.top) * canvas.height) / rect.height,
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    const { x, y } = getPoint(event)
    startStroke(x, y)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.buttons === 1 && !isDrawingRef.current) {
      const { x, y } = getPoint(event)
      startStroke(x, y)
    }

    if (isDrawingRef.current) {
      event.preventDefault()
      const { x, y } = getPoint(event)
      moveStroke(x, y)
    }
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    event.currentTarget.releasePointerCapture(event.pointerId)
    endStroke()
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    startStroke(
      ((event.clientX - rect.left) * canvas.width) / rect.width,
      ((event.clientY - rect.top) * canvas.height) / rect.height,
    )
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) {
      return
    }

    event.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    moveStroke(
      ((event.clientX - rect.left) * canvas.width) / rect.width,
      ((event.clientY - rect.top) * canvas.height) / rect.height,
    )
  }

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    endStroke()
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const context = contextRef.current
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height)
    }

    hasStrokeRef.current = false
    setIsSignatureConfirmed(false)
    setSignature('')
  }

  const confirmSignature = () => {
    if (!hasStrokeRef.current || !canvasRef.current) {
      return
    }

    setSignature(canvasRef.current.toDataURL('image/png'))
    setIsSignatureConfirmed(true)
  }

  return {
    canvasNonce,
    canvasRef,
    clearSignature,
    confirmSignature,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    hasStroke: hasStrokeRef.current,
    isSignatureConfirmed,
  }
}