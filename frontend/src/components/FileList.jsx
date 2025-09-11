import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Link2 } from 'lucide-react'

function niceSize(n){
  if(n < 1024) return n + ' B'
  if(n < 1024*1024) return (n/1024).toFixed(1) + ' KB'
  if(n < 1024*1024*1024) return (n/(1024*1024)).toFixed(1) + ' MB'
  return (n/(1024*1024*1024)).toFixed(2) + ' GB'
}

export default function FileList(){
  const [files, setFiles] = useState([])

  useEffect(()=> {
    fetch('http://localhost:8000/files').then(r=>r.json()).then(data=>setFiles(data)).catch(()=>{})
  }, [])

  return (
    <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} className="glass p-6 rounded-2xl shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Uploaded Files</h3>
        <button className="text-sm opacity-80">Refresh</button>
      </div>

      <ul className="space-y-3">
        {files.map(f => (
          <li key={f.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition">
            <div className="p-2 bg-white/8 rounded-md"><FileText/></div>
            <div className="flex-1">
              <a className="font-medium" href={`http://localhost:8000/download/${f.id}`} target="_blank" rel="noreferrer">{f.name}</a>
              <div className="text-xs opacity-70">{niceSize(f.size)} • Expires: {new Date(f.expire_at*1000).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <a title="Create share link" className="text-sm underline cursor-pointer">Share</a>
              <a href={`http://localhost:8000/download/${f.id}`} target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-white/5">
                <Link2 />
              </a>
            </div>
          </li>
        ))}
        {files.length === 0 && <li className="text-sm opacity-70">No files yet — upload one!</li>}
      </ul>
    </motion.div>
  )
}
