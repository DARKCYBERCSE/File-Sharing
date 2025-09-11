import React from 'react'
import { motion } from 'framer-motion'

export default function Profile(){
  return (
    <motion.div initial={{scale:0.98, opacity:0}} animate={{scale:1, opacity:1}} className="glass p-6 rounded-2xl shadow-xl">
      <div className="flex flex-col items-center">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center mb-3">
          <img src="/profile.jpg" alt="profile" className="w-24 h-24 rounded-full"/>
        </div>
        <h3 className="font-bold">Muthuraj C</h3>
        <p className="text-sm opacity-80">Designer • Developer</p>
      
      </div>
      <div className="mt-4 text-sm opacity-80">
        <div>Socials</div>
        <div className="flex space-x-6 mt-4">
  <a
    href="https://www.linkedin.com/in/MuthurajC"
    target="_blank"
    rel="noreferrer"
    className="flex items-center space-x-2 text-blue-400 hover:text-blue-500 transition"
  >
    <img src="/icons/linkedin.svg" alt="LinkedIn" className="w-6 h-6" />
    <span className="underline">LinkedIn</span>
  </a>

  <a
    href="https://github.com/DARKCYBERCSE"
    target="_blank"
    rel="noreferrer"
    className="flex items-center space-x-2 text-gray-300 hover:text-white transition"
  >
    <img src="/icons/github.svg" alt="GitHub" className="w-6 h-6" />
    <span className="underline">GitHub</span>
  </a>
</div>

      </div>
    </motion.div>
  )
}
