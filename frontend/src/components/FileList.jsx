import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Link2 } from 'lucide-react'

function niceSize(n) {
  if (n < 1024) return n + ' B'
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
  if (n < 1024 * 1024 * 1024) return (n / (1024 * 1024)).toFixed(1) + ' MB'
  return (n / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

export default function FileList() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadFiles() {
    try {
      const res = await fetch('https://file-sharing-z8q2.onrender.com/files')
      const data = await res.json()
      if (Array.isArray(data)) {
        setFiles(data)
      } else {
        setFiles([]) // ensure it's always an array
      }
    } catch (err) {
      console.error('Error loading files:', err)
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [])

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass p-6 rounded-2xl shadow-xl"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Uploaded Files</h3>
        <button onClick={loadFiles} className="text-sm opacity-80 hover:underline">
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm opacity-70">Loading...</p>
      ) : (
        <ul className="space-y-3">
          {files.map(f => (
            <li
              key={f.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition"
            >
              <div className="p-2 bg-white/8 rounded-md">
                <FileText />
              </div>
              <div className="flex-1">
                <a
                  className="font-medium"
                  href={`https://file-sharing-z8q2.onrender.com/download/${f.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {f.name}
                </a>
                <div className="text-xs opacity-70">
                  {f.size} • Expires: {f.expire_at}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  title="Create share link"
                  className="text-sm underline cursor-pointer"
                >
                  Share
                </a>
                <a
                  href={`https://file-sharing-z8q2.onrender.com/download/${f.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-md hover:bg-white/5"
                >
                  <Link2 />
                </a>
              </div>
            </li>
          ))}
          {files.length === 0 && (
            <li className="text-sm opacity-70">
              No files yet — upload one!
            </li>
          )}
        </ul>
      )}
    </motion.div>
  )
}
