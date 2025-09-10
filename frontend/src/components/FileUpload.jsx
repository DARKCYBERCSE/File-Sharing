import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud } from 'lucide-react'
import API_BASE_URL from '../config'

export default function FileUpload(){
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)

  async function handleUpload(){
    if(!file) return alert('Choose a file first')
    setLoading(true)
    const form = new FormData()
    form.append('file', file)
    form.append('expire_hours', 24)

    try {
      const resp = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: form
      })
      const data = await resp.json()
      alert('Uploaded! Open: ' + window.location.origin + data.download_url)
    } catch (err) {
      alert("Upload failed: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} className="glass p-6 rounded-2xl shadow-xl">
      <div className="flex items-center gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-white/10 to-white/5">
          <UploadCloud size={40} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold">Drag & Drop or Click to Upload</h3>
          <p className="text-sm opacity-80">Max file size: depends on your machine (this demo uses Google Drive)</p>
        </div>
      </div>

      <div className="mt-4">
        <input type="file" onChange={e=>setFile(e.target.files[0])}/>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleUpload}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-white text-brand1 font-bold shadow hover:scale-105 transform transition"
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
        <div className="flex-1">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div style={{width: `${progress}%`}} className="h-full bg-white/80"></div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
