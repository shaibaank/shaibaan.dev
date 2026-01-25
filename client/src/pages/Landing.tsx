import { SentientSphere } from '../components/SentientSphere'
import { motion } from 'framer-motion'
import { Link } from 'wouter'

export default function Landing() {
  const posts = JSON.parse(localStorage.getItem('posts') || '[]');

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/5">
        <div className="text-2xl font-serif font-bold tracking-tighter">
          Sentient<span className="text-primary">.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#featured" className="text-sm uppercase tracking-widest hover:text-primary transition-colors">Read</a>
          <Link href="/editor">
            <button className="px-6 py-2 border border-white/20 hover:border-primary hover:bg-primary/10 transition-all text-sm uppercase tracking-widest">
              Write
            </button>
          </Link>
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

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="font-serif text-5xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-6 mix-blend-difference"
          >
            DIGITAL<br />SENTIENCE
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-xl text-lg md:text-xl text-muted-foreground font-light leading-relaxed mb-12"
          >
            Exploring the intersection of brutalist aesthetics, code, and human expression. 
            A collection of thoughts on the modern web.
          </motion.p>
          
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.8, delay: 0.6 }}
             className="animate-bounce"
          >
             <span className="text-2xl opacity-50">↓</span>
          </motion.div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-0 pointer-events-none" />
      </header>

      {/* Featured Articles Section */}
      <section id="featured" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-16">
          <div className="h-px bg-white/20 flex-1" />
          <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">Latest Transmission</h2>
          <div className="h-px bg-white/20 flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Static Mock Post */}
          <motion.article 
            whileHover={{ y: -5 }}
            className="group cursor-pointer"
          >
            <div className="aspect-[4/3] bg-card border border-border mb-4 overflow-hidden relative">
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-full h-full flex items-center justify-center text-4xl text-white/5 font-serif font-bold group-hover:scale-110 transition-transform duration-700">01</div>
            </div>
            <div className="flex gap-2 mb-3">
              <span className="text-xs font-mono px-2 py-1 border border-primary/30 text-primary">DESIGN</span>
              <span className="text-xs font-mono px-2 py-1 border border-white/10 text-muted-foreground">5 MIN</span>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">
              The Return of Brutalism
            </h3>
            <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
              Why modern web design is stripping away the polish to reveal the raw structural elements underneath. An analysis of the neo-brutalist movement.
            </p>
          </motion.article>

          {/* Another Mock Post */}
          <motion.article 
            whileHover={{ y: -5 }}
            className="group cursor-pointer"
          >
             <div className="aspect-[4/3] bg-card border border-border mb-4 overflow-hidden relative">
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-full h-full flex items-center justify-center text-4xl text-white/5 font-serif font-bold group-hover:scale-110 transition-transform duration-700">02</div>
            </div>
            <div className="flex gap-2 mb-3">
              <span className="text-xs font-mono px-2 py-1 border border-primary/30 text-primary">CODE</span>
              <span className="text-xs font-mono px-2 py-1 border border-white/10 text-muted-foreground">8 MIN</span>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">
              React Three Fiber: A Deep Dive
            </h3>
            <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
              Creating immersive 3D experiences on the web has never been easier. Let's explore how to build the sphere header you saw above.
            </p>
          </motion.article>

           {/* Dynamic Posts from LocalStorage */}
           {posts.map((post: any) => (
            <motion.article 
              key={post.id}
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
            >
               <div className="aspect-[4/3] bg-card border border-border mb-4 overflow-hidden relative flex items-center justify-center">
                 {post.blocks.find((b: any) => b.type === 'image') ? (
                   <img src={post.blocks.find((b: any) => b.type === 'image').content.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                 ) : (
                   <div className="w-full h-full bg-secondary/20 flex items-center justify-center text-4xl text-white/5 font-serif font-bold">
                     {post.title.charAt(0)}
                   </div>
                 )}
              </div>
              <div className="flex gap-2 mb-3">
                {post.tags && post.tags[0] && (
                  <span className="text-xs font-mono px-2 py-1 border border-primary/30 text-primary uppercase">{post.tags[0]}</span>
                )}
                 <span className="text-xs font-mono px-2 py-1 border border-white/10 text-muted-foreground">{post.read_time || '5 MIN'}</span>
              </div>
              <h3 className="font-serif text-2xl md:text-3xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                {post.excerpt || post.subtitle || 'No description available.'}
              </p>
            </motion.article>
           ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-muted-foreground text-sm font-mono">
        <p>&copy; {new Date().getFullYear()} SENTIENT. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  )
}
