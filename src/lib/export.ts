// Data export/import utilities
import { useAppStore } from '../store/useAppStore'
import type { AppState } from '../types'

export interface ExportData {
  version: string
  timestamp: number
  data: AppState
}

export function exportData(): string {
  const state = useAppStore.getState()
  const exportData: ExportData = {
    version: '2.1.0',
    timestamp: Date.now(),
    data: state
  }
  
  return JSON.stringify(exportData, null, 2)
}

export function importData(jsonString: string): { success: boolean; error?: string } {
  try {
    const parsed: ExportData = JSON.parse(jsonString)
    
    // Validate the data structure
    if (!parsed.data || !parsed.version) {
      return { success: false, error: 'Invalid export file format' }
    }
    
    // Load the data into the store
    useAppStore.setState(parsed.data)
    
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to parse export file' 
    }
  }
}

export function downloadData(filename: string = 'quarterback-backup.json'): void {
  const data = exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function uploadData(file: File): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const result = importData(content)
      resolve(result)
    }
    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read file' })
    }
    reader.readAsText(file)
  })
}

