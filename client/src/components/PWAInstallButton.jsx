import { useState, useEffect } from 'react'

export function PWAInstallButton() {
  const [isPWAInstalled, setIsPWAInstalled] = useState(false)
  const [showInstallOptions, setShowInstallOptions] = useState(false)

  useEffect(() => {
    // Check if PWA is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsPWAInstalled(true)
      }
    }

    checkIfInstalled()
    window.addEventListener('appinstalled', () => setIsPWAInstalled(true))

    return () => {
      window.removeEventListener('appinstalled', () => setIsPWAInstalled(true))
    }
  }, [])

  const handleManualInstall = () => {
    setShowInstallOptions(true)
  }

  const closeInstallOptions = () => {
    setShowInstallOptions(false)
  }

  // Don't show if already installed
  if (isPWAInstalled) return null

  return (
    <>
      <button
        onClick={handleManualInstall}
        className="fixed top-4 right-4 z-40 bg-[rgb(22,163,74)] text-white px-4 py-2 rounded-lg shadow-lg hover:bg-[rgb(21,128,61)] transition-colors text-sm font-medium"
      >
        📱 Install App
      </button>

      {showInstallOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Install SocietySync</h3>
              <button
                onClick={closeInstallOptions}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📱 Android (Chrome)</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Tap the menu (⋮) in Chrome</li>
                  <li>2. Select "Add to Home Screen"</li>
                  <li>3. Tap "Add" to install</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">🍎 iOS (Safari)</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Tap the share button (□↑)</li>
                  <li>2. Select "Add to Home Screen"</li>
                  <li>3. Tap "Add" to install</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">💻 Desktop (Chrome/Edge)</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Look for install icon in address bar</li>
                  <li>2. Click the install button</li>
                  <li>3. Confirm installation</li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> For automatic install prompts, the app needs to be deployed with HTTPS.
                  This manual option works in development mode.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeInstallOptions}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
