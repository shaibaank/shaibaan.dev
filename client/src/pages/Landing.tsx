import { SentientSphere } from '../components/SentientSphere'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

function TypingAnimation({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 50)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return (
    <span>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/5">
        <div className="text-2xl font-serif font-bold tracking-tighter">
          shaibaan<span className="text-primary">.dev</span>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0 opacity-60">
          <SentientSphere />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 relative rounded-none overflow-hidden border-2 border-primary rotate-3 transition-transform hover:rotate-0 duration-500">
               <img src="/avatar.png" alt="Profile" className="w-full h-full object-cover pixelated" style={{ imageRendering: 'pixelated' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="font-mono text-xl md:text-2xl lg:text-3xl font-medium tracking-tight mb-6"
          >
            <TypingAnimation text="sup, Im shaibaan, i tinker around with software until i break or make something :)" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-xl text-lg md:text-xl text-muted-foreground font-light leading-relaxed mb-12"
          >
             welcome to my digital garden
          </motion.p>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-0 pointer-events-none" />
      </header>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-muted-foreground text-sm font-mono">
        <p>&copy; {new Date().getFullYear()} shaibaan.dev. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  )
}
