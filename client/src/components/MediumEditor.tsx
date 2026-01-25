import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPost } from '../lib/mock-api'
import './MediumEditor.css'
import { Link, useLocation } from 'wouter'

export const MediumEditor = ({ onSave, initialData = null }: any) => {
  const [title, setTitle] = useState(initialData?.title || '')
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '')
  const [blocks, setBlocks] = useState(initialData?.blocks || [{ id: Date.now(), type: 'paragraph', content: '' }])
  const [showToolbar, setShowToolbar] = useState(false)
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showInlineToolbar, setShowInlineToolbar] = useState(false)
  const [selection, setSelection] = useState<any>(null)
  const [publishData, setPublishData] = useState({
    tags: [] as string[],
    tagInput: '',
    canonicalLink: '',
    notifyFollowers: false
  })
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const autosaveTimerRef = useRef<NodeJS.Timeout>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const [, setLocation] = useLocation();

  // Autosave functionality
  const autosave = useCallback(() => {
    const draft = {
      title,
      subtitle,
      blocks,
      lastModified: new Date().toISOString()
    }
    localStorage.setItem('draft', JSON.stringify(draft))
    setLastSaved(new Date().toLocaleTimeString())
  }, [title, subtitle, blocks])

  // Autosave on changes
  useEffect(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current)
    }
    autosaveTimerRef.current = setTimeout(() => {
      autosave()
    }, 2000) // Save 2 seconds after last change

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current)
      }
    }
  }, [title, subtitle, blocks, autosave])

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('draft')
    if (savedDraft && !initialData) {
      try {
        const draft = JSON.parse(savedDraft)
        setTitle(draft.title || '')
        setSubtitle(draft.subtitle || '')
        setBlocks(draft.blocks || [{ id: Date.now(), type: 'paragraph', content: '' }])
        // Set initial content for contentEditable elements
        if (titleRef.current) titleRef.current.textContent = draft.title || ''
        if (subtitleRef.current) subtitleRef.current.textContent = draft.subtitle || ''
      } catch (e) {
        console.error('Error loading draft:', e)
      }
    }
  }, [initialData])

  // Set initial values for title and subtitle refs
  useEffect(() => {
    if (titleRef.current && title && !titleRef.current.textContent) {
      titleRef.current.textContent = title
    }
    if (subtitleRef.current && subtitle && !subtitleRef.current.textContent) {
      subtitleRef.current.textContent = subtitle
    }
  }, [])

  const addBlock = (type: string, afterId: number | null = null) => {
    const newBlock = {
      id: Date.now(),
      type,
      content: type === 'image' ? { url: '', caption: '' } : ''
    }

    setBlocks((prev: any[]) => {
      if (afterId === null) {
        return [...prev, newBlock]
      }
      const index = prev.findIndex(b => b.id === afterId)
      return [...prev.slice(0, index + 1), newBlock, ...prev.slice(index + 1)]
    })

    setShowToolbar(false)
    setTimeout(() => {
      const newBlockElement = document.querySelector(`[data-block-id="${newBlock.id}"] [contenteditable]`) as HTMLElement
      if (newBlockElement) {
        newBlockElement.focus()
      }
    }, 10)
  }

  const updateBlock = (id: number, content: any) => {
    setBlocks((prev: any[]) => prev.map(block => 
      block.id === id ? { ...block, content } : block
    ))
  }

  const deleteBlock = (id: number) => {
    setBlocks((prev: any[]) => {
      const filtered = prev.filter(b => b.id !== id)
      return filtered.length === 0 ? [{ id: Date.now(), type: 'paragraph', content: '' }] : filtered
    })
  }

  const handleBlockFocus = (id: number) => {
    setActiveBlockId(id)
    setShowToolbar(true)
  }

  const handleBlockBlur = () => {
    setTimeout(() => {
      if (!document.activeElement?.closest('.block-toolbar')) {
        setShowToolbar(false)
        setActiveBlockId(null)
      }
    }, 200)
  }

  const handlePublish = async () => {
    const post = {
      title,
      subtitle,
      blocks,
      tags: publishData.tags,
      excerpt: subtitle || blocks.find((b: any) => b.type === 'paragraph')?.content?.substring(0, 150) || '',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      read_time: `${Math.ceil(blocks.reduce((acc: number, b: any) => acc + (b.content?.length || 0), 0) / 200)} min read`,
      category: publishData.tags[0] || 'Article',
      created_at: new Date().toISOString()
    }
    
    // Save to Supabase (Mock)
    const savedPost = await createPost(post)
    
    if (savedPost) {
      // Clear draft
      localStorage.removeItem('draft')
      setLocation('/');
      
      if (onSave) {
        onSave(savedPost)
      }
    } else {
      alert('Error saving post. Please try again.')
    }
    
    setShowPublishDialog(false)
  }

  const handleExport = (format: string) => {
    if (format === 'html') {
      const html = blocks.map((block: any) => {
        if (block.type === 'paragraph') return `<p>${block.content}</p>`
        if (block.type === 'heading') return `<h2>${block.content}</h2>`
        if (block.type === 'code') return `<pre><code>${block.content}</code></pre>`
        if (block.type === 'quote') return `<blockquote>${block.content}</blockquote>`
        if (block.type === 'image') return `<img src="${block.content.url}" alt="${block.content.caption}" />`
        return ''
      }).join('\n')
      
      const blob = new Blob([`<h1>${title}</h1>\n${subtitle ? `<p>${subtitle}</p>` : ''}\n${html}`], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title || 'post'}.html`
      a.click()
    } else if (format === 'markdown') {
      const md = blocks.map((block: any) => {
        if (block.type === 'paragraph') return block.content
        if (block.type === 'heading') return `## ${block.content}`
        if (block.type === 'code') return `\`\`\`\n${block.content}\n\`\`\``
        if (block.type === 'quote') return `> ${block.content}`
        if (block.type === 'image') return `![${block.content.caption}](${block.content.url})`
        return ''
      }).join('\n\n')
      
      const blob = new Blob([`# ${title}\n\n${subtitle ? `${subtitle}\n\n` : ''}${md}`], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title || 'post'}.md`
      a.click()
    }
  }

  const addTag = () => {
    if (publishData.tagInput.trim() && publishData.tags.length < 5) {
      setPublishData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ''
      }))
    }
  }

  const removeTag = (tag: string) => {
    setPublishData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleImageUpload = (blockId: number, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      updateBlock(blockId, { url: e.target?.result, caption: '' })
    }
    reader.readAsDataURL(file)
  }

  const handleSelection = useCallback(() => {
    const sel = window.getSelection()
    if (sel && sel.toString().trim().length > 0 && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      // Only show toolbar if selection is within editor
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        setSelection({ rect })
        setShowInlineToolbar(true)
      }
    } else {
      setShowInlineToolbar(false)
      setSelection(null)
    }
  }, [])

  const applyFormat = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value as string)
    setShowInlineToolbar(false)
  }

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelection)
    return () => {
      document.removeEventListener('selectionchange', handleSelection)
    }
  }, [handleSelection])

  return (
    <div className="medium-editor" ref={editorRef}>
      {/* Header */}
      <div className="editor-header">
        <div className="header-left">
          <Link href="/" className="site-name">Sentient</Link>
          <span className="draft-label">/ Draft</span>
        </div>
        <div className="header-right">
          {lastSaved && <span className="save-indicator">Saved {lastSaved}</span>}
          <motion.button
            className="publish-button"
            onClick={() => setShowPublishDialog(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Publish
          </motion.button>
          <div className="more-menu-container">
            <motion.button
              className="more-button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              •••
            </motion.button>
            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  className="more-menu"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <button onClick={() => { handleExport('html'); setShowMoreMenu(false) }}>
                    Export as HTML
                  </button>
                  <button onClick={() => { handleExport('markdown'); setShowMoreMenu(false) }}>
                    Export as Markdown
                  </button>
                  <button onClick={() => { localStorage.removeItem('draft'); window.location.reload() }}>
                    Delete Draft
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="editor-canvas">
        {/* Title */}
        <div
          ref={titleRef}
          className="editor-title"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => setTitle(e.currentTarget.textContent || '')}
          onFocus={() => setShowToolbar(false)}
          data-placeholder="Title"
        />

        {/* Subtitle */}
        <div
          ref={subtitleRef}
          className="editor-subtitle"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => setSubtitle(e.currentTarget.textContent || '')}
          onFocus={() => setShowToolbar(false)}
          data-placeholder="Subtitle (optional)"
        />

        {/* Inline Formatting Toolbar */}
        <AnimatePresence>
          {showInlineToolbar && selection && (
            <motion.div
              className="inline-toolbar"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'fixed',
                left: selection.rect ? `${selection.rect.left + selection.rect.width / 2}px` : '50%',
                top: selection.rect ? `${selection.rect.top - 50}px` : '50%',
                transform: 'translateX(-50%)'
              }}
            >
              <button onMouseDown={(e) => { e.preventDefault(); applyFormat('bold') }} title="Bold">
                <strong>B</strong>
              </button>
              <button onMouseDown={(e) => { e.preventDefault(); applyFormat('italic') }} title="Italic">
                <em>I</em>
              </button>
              <button onMouseDown={(e) => {
                e.preventDefault()
                const url = prompt('Enter URL:')
                if (url) applyFormat('createLink', url)
              }} title="Add link">
                🔗
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Block Toolbar */}
        <AnimatePresence>
          {showToolbar && activeBlockId && (
            <motion.div
              className="block-toolbar"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <button className="toolbar-btn close" onClick={() => activeBlockId && deleteBlock(activeBlockId)} title="Remove block">
                ×
              </button>
              <button className="toolbar-btn" onClick={() => addBlock('image', activeBlockId)} title="Add image">
                🖼️
              </button>
              <button className="toolbar-btn" onClick={() => addBlock('code', activeBlockId)} title="Add code">
                {'<>'}
              </button>
              <button className="toolbar-btn" onClick={() => addBlock('quote', activeBlockId)} title="Add quote">
                ""
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="blocks-container">
          {blocks.map((block: any) => (
            <div
              key={block.id}
              className={`block block-${block.type}`}
              data-block-id={block.id}
              onClick={() => handleBlockFocus(block.id)}
            >
              {block.type === 'paragraph' && (
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => updateBlock(block.id, e.currentTarget.textContent)}
                  onBlur={handleBlockBlur}
                  data-placeholder="Tell your story..."
                >
                  {block.content}
                </p>
              )}
              {block.type === 'heading' && (
                <h2
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => updateBlock(block.id, e.currentTarget.textContent)}
                  onBlur={handleBlockBlur}
                  data-placeholder="Heading"
                >
                  {block.content}
                </h2>
              )}
              {block.type === 'quote' && (
                <blockquote
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => updateBlock(block.id, e.currentTarget.textContent)}
                  onBlur={handleBlockBlur}
                >
                  {block.content}
                </blockquote>
              )}
              {block.type === 'code' && (
                <pre>
                  <code
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => updateBlock(block.id, e.currentTarget.textContent)}
                    onBlur={handleBlockBlur}
                  >
                    {block.content}
                  </code>
                </pre>
              )}
              {block.type === 'image' && (
                <div className="image-block">
                  {block.content.url ? (
                    <>
                      <img src={block.content.url} alt="Uploaded content" />
                      <input
                        type="text"
                        className="image-caption"
                        placeholder="Type caption for image (optional)"
                        value={block.content.caption}
                        onChange={(e) => updateBlock(block.id, { ...block.content, caption: e.target.value })}
                        onBlur={handleBlockBlur}
                      />
                    </>
                  ) : (
                    <label className="image-upload-placeholder">
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(block.id, e.target.files[0])}
                      />
                      <span>Click to upload an image</span>
                    </label>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="add-block-btn" onClick={() => addBlock('paragraph')}>
          + Add a new text block
        </button>
      </div>

      {/* Publish Dialog */}
      <AnimatePresence>
        {showPublishDialog && (
          <div className="publish-dialog-overlay">
            <motion.div
              className="publish-dialog"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h2>Publish your story</h2>
              
              <div className="publish-field">
                <label>Tags (up to 5)</label>
                <div className="tags-input">
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    value={publishData.tagInput}
                    onChange={(e) => setPublishData({ ...publishData, tagInput: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  />
                  <button onClick={addTag}>Add</button>
                </div>
                <div className="tags-list">
                  {publishData.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                      <button onClick={() => removeTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="publish-field">
                <label>Canonical Link (optional)</label>
                <input
                  type="url"
                  placeholder="https://"
                  value={publishData.canonicalLink}
                  onChange={(e) => setPublishData({ ...publishData, canonicalLink: e.target.value })}
                />
              </div>

              <div className="publish-actions">
                <button className="cancel-btn" onClick={() => setShowPublishDialog(false)}>
                  Cancel
                </button>
                <button className="publish-confirm-btn" onClick={handlePublish}>
                  Publish Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
