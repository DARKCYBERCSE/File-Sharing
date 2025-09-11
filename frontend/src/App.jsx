import React from 'react'
import FileUpload from './components/FileUpload'
import FileList from './components/FileList'
import Profile from './components/Profile'

export default function App(){
  return (
    <div className="min-h-screen p-6 bg-gradient-to-tr from-brand1 to-brand2 text-white">
      <header className="max-w-6xl mx-auto mb-6">
        <h1 className="text-4xl font-extrabold text-center drop-shadow-lg">📂 File Sharing Online — Colorful & Animated</h1>
        <p className="text-center mt-2 opacity-80">Upload, share expiring links, animated UI — free stack</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2 space-y-6">
          <FileUpload />
          <FileList />
        </section>
        <aside>
          <Profile />
        </aside>
      </main>
    </div>
  )
}
