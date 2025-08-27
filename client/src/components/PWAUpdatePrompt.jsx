import { useState, useEffect } from 'react'
import { Workbox } from 'workbox-window'

export function PWAUpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const wb = new Workbox('/sw.js')
      
      wb.addEventListener('waiting', () => {
        setNeedRefresh(true)
      })
      
      wb.addEventListener('controlling', () => {
        window.location.reload()
      })
      
      wb.register()
    }
  }, [])

  const close = () => {
    setNeedRefresh(false)
    setOfflineReady(false)
  }

  const updateSW = () => {
    if (needRefresh) {
      window.location.reload()
    }
  }

  if (!needRefresh && !offlineReady) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-card border border-border rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {needRefresh && (
            <div>
              <h3 className="text-sm font-semibold text-foreground">New version available</h3>
              <p className="text-xs text-muted-foreground mt-1">A new version of SocietySync is available. Update to get the latest features.</p>
            </div>
          )}
          {offlineReady && (
            <div>
              <h3 className="text-sm font-semibold text-foreground">Ready for offline use</h3>
              <p className="text-xs text-muted-foreground mt-1">SocietySync is now ready for offline use.</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          {needRefresh && (
            <button
              onClick={updateSW}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 transition-colors"
            >
              Update
            </button>
          )}
          <button
            onClick={close}
            className="px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-md hover:opacity-90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
