import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { CameraOff, CircleCheck, LoaderCircle, QrCode, X } from 'lucide-react'
import jsQR from 'jsqr'
import ReviewModal from './ReviewModal'

const API_BASE_URL = import.meta.env.VITE_API_URL

function QrScannerModal({ onClose }) {
  const [scannerSession, setScannerSession] = useState(0)
  const [status, setStatus] = useState('starting')
  const [message, setMessage] = useState('Starting camera...')
  const [scannedValue, setScannedValue] = useState('')
  const [resultTitle, setResultTitle] = useState('QR scanned')
  const [reviewContext, setReviewContext] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const cameraStreamRef = useRef(null)
  const scanFrameRef = useRef(null)
  const scanHandledRef = useRef(false)
  const apiRequestRef = useRef(null)

  const stopScanner = useCallback(() => {
    if (scanFrameRef.current) {
      cancelAnimationFrame(scanFrameRef.current)
      scanFrameRef.current = null
    }

    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop())
      cameraStreamRef.current = null
    }

    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const submitScannedQr = useCallback(
    async (value) => {
      if (scanHandledRef.current) return

      scanHandledRef.current = true
      stopScanner()
      setStatus('processing')
      setMessage('Verifying QR code and recording your visit...')

      const code = value.trim()
      const token = localStorage.getItem('token')
      const role = localStorage.getItem('role')

      if (!code) {
        setResultTitle('Invalid QR code')
        setStatus('error')
        setMessage('This is not a valid palace QR code.')
        return
      }

      setScannedValue(code)

      if (!token) {
        setResultTitle('Login required')
        setStatus('error')
        setMessage('Please log in before scanning a palace QR code.')
        return
      }

      if (role !== 'user') {
        setResultTitle('Visitor account required')
        setStatus('error')
        setMessage('QR check-in is only available to logged-in visitor accounts.')
        return
      }

      const controller = new AbortController()
      apiRequestRef.current = controller

      try {
        const response = await axios.post(
          `${API_BASE_URL}checkin/scan/${encodeURIComponent(code)}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        )

        const action = response?.data?.action
        setResultTitle(action === 'checkout' ? 'Checked out' : 'Checked in')
        setStatus('success')
        setMessage(response?.data?.message || 'QR scan recorded successfully.')
        if (action === 'checkout' && response?.data?.reviewContext) {
          setReviewContext(response.data.reviewContext)
        }
      } catch (requestError) {
        if (requestError.code === 'ERR_CANCELED') return

        setResultTitle('Scan failed')
        setStatus('error')
        setMessage(
          requestError?.response?.data?.message ||
            'Unable to verify this QR code. Please try again.',
        )
      } finally {
        apiRequestRef.current = null
      }
    },
    [stopScanner],
  )

  useEffect(() => {
    let cancelled = false

    Promise.resolve().then(async () => {
      const token = localStorage.getItem('token')
      const role = localStorage.getItem('role')

      if (!token) {
        setResultTitle('Login required')
        setStatus('error')
        setMessage('Please log in before scanning a palace QR code.')
        return
      }

      if (role !== 'user') {
        setResultTitle('Visitor account required')
        setStatus('error')
        setMessage('QR check-in is only available to logged-in visitor accounts.')
        return
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('error')
        setMessage('Camera access is unavailable. Open this site over HTTPS or use localhost.')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        cameraStreamRef.current = stream

        const video = videoRef.current
        if (!video) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        video.srcObject = stream
        await video.play()

        if (cancelled) return

        setStatus('scanning')
        setMessage('Point the camera at the palace QR code.')

        let lastScanTime = 0

        const scanFrame = (timestamp) => {
          const activeVideo = videoRef.current
          const canvas = canvasRef.current

          if (cancelled || !activeVideo || !canvas) return

          if (timestamp - lastScanTime >= 120 && activeVideo.readyState >= 2) {
            lastScanTime = timestamp

            const sourceWidth = activeVideo.videoWidth
            const sourceHeight = activeVideo.videoHeight

            if (sourceWidth && sourceHeight) {
              const scale = Math.min(1, 800 / sourceWidth)
              const scanWidth = Math.max(1, Math.round(sourceWidth * scale))
              const scanHeight = Math.max(1, Math.round(sourceHeight * scale))

              if (canvas.width !== scanWidth || canvas.height !== scanHeight) {
                canvas.width = scanWidth
                canvas.height = scanHeight
              }

              const context = canvas.getContext('2d', { willReadFrequently: true })

              if (context) {
                context.drawImage(activeVideo, 0, 0, scanWidth, scanHeight)
                const imageData = context.getImageData(0, 0, scanWidth, scanHeight)
                const detectedCode = jsQR(imageData.data, scanWidth, scanHeight, {
                  inversionAttempts: 'attemptBoth',
                })

                if (detectedCode?.data) {
                  submitScannedQr(detectedCode.data)
                  return
                }
              }
            }
          }

          if (!cancelled) scanFrameRef.current = requestAnimationFrame(scanFrame)
        }

        scanFrameRef.current = requestAnimationFrame(scanFrame)
      } catch (cameraError) {
        if (cancelled) return

        const cameraMessage =
          cameraError.name === 'NotAllowedError'
            ? 'Camera permission was denied. Allow camera access and try again.'
            : cameraError.name === 'NotFoundError'
              ? 'No camera was found on this device.'
              : 'Unable to start the camera. Please try again.'

        setResultTitle('Camera unavailable')
        setStatus('error')
        setMessage(cameraMessage)
        stopScanner()
      }
    })

    return () => {
      cancelled = true
      stopScanner()
    }
  }, [scannerSession, stopScanner, submitScannedQr])

  const retryScanner = () => {
    apiRequestRef.current?.abort()
    stopScanner()
    scanHandledRef.current = false
    setScannedValue('')
    setReviewContext(null)
    setResultTitle('QR scanned')
    setMessage('Starting camera...')
    setStatus('starting')
    setScannerSession((session) => session + 1)
  }

  const closeScanner = () => {
    apiRequestRef.current?.abort()
    stopScanner()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-scanner-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <QrCode size={21} aria-hidden="true" />
            </div>
            <div>
              <h2 id="qr-scanner-title" className="font-bold text-slate-900 dark:text-white">
                Scan Palace QR
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Use your device camera</p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeScanner}
            aria-label="Close QR scanner"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="p-5">
          {(status === 'starting' || status === 'scanning') && (
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-950">
              <video ref={videoRef} muted playsInline autoPlay className="h-full w-full object-cover" />
              <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

              <div className="pointer-events-none absolute inset-[12%] rounded-2xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(15,23,42,0.35)]">
                <span className="absolute left-0 right-0 top-1/2 h-0.5 animate-pulse bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
              </div>

              {status === 'starting' && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70">
                  <span className="h-9 w-9 animate-spin rounded-full border-3 border-white/30 border-t-white" aria-label="Starting camera" />
                </div>
              )}
            </div>
          )}

          {status === 'processing' && (
            <div className="rounded-2xl bg-blue-50 p-8 text-center dark:bg-blue-950/40">
              <LoaderCircle
                size={48}
                className="mx-auto animate-spin text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />
              <h3 className="mt-3 font-bold text-blue-900 dark:text-blue-200">Processing scan</h3>
            </div>
          )}

          {status === 'success' && (
            <div className="rounded-2xl bg-emerald-50 p-6 text-center dark:bg-emerald-950/40">
              <CircleCheck size={48} className="mx-auto text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <h3 className="mt-3 font-bold text-emerald-900 dark:text-emerald-200">{resultTitle}</h3>
              <p className="mt-3 max-h-24 overflow-y-auto break-all rounded-xl bg-white/70 p-3 text-left text-xs text-emerald-800 dark:bg-slate-900/60 dark:text-emerald-300">
                {scannedValue}
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-2xl bg-rose-50 p-6 text-center dark:bg-rose-950/40">
              <CameraOff size={44} className="mx-auto text-rose-600 dark:text-rose-400" aria-hidden="true" />
              <h3 className="mt-3 font-bold text-rose-900 dark:text-rose-200">{resultTitle}</h3>
            </div>
          )}

          <p
            className={`mt-4 text-center text-sm ${
              status === 'error' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
            }`}
            aria-live="polite"
          >
            {message}
          </p>

          {(status === 'success' || status === 'error') && (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={closeScanner}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={retryScanner}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Scan again
              </button>
            </div>
          )}
        </div>
      </div>
      {reviewContext && (
        <ReviewModal
          checkin={reviewContext}
          onClose={closeScanner}
          onSaved={closeScanner}
        />
      )}
    </div>
  )
}

export default QrScannerModal
