"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-invert prose-sm max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Headings with gradient styling
        h1: ({ children }) => (
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mt-4 mb-3 first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-bold text-purple-300 mt-4 mb-2 first:mt-0 border-b border-purple-500/30 pb-1">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold text-cyan-300 mt-3 mb-2 first:mt-0">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-sm font-semibold text-gray-200 mt-2 mb-1">
            {children}
          </h4>
        ),

        // Paragraphs
        p: ({ children }) => (
          <p className="text-gray-200 leading-relaxed mb-3 last:mb-0">
            {children}
          </p>
        ),

        // Strong/Bold
        strong: ({ children }) => (
          <strong className="font-semibold text-white">
            {children}
          </strong>
        ),

        // Emphasis/Italic
        em: ({ children }) => (
          <em className="text-gray-300 italic">
            {children}
          </em>
        ),

        // Unordered lists
        ul: ({ children }) => (
          <ul className="space-y-2 my-3 ml-4 list-disc list-outside marker:text-purple-400">
            {children}
          </ul>
        ),

        // Ordered lists
        ol: ({ children }) => (
          <ol className="space-y-2 my-3 ml-4 list-decimal list-outside marker:text-purple-400">
            {children}
          </ol>
        ),

        // List items
        li: ({ children }) => (
          <li className="text-gray-200 pl-1">
            {children}
          </li>
        ),

        // Links
        a: ({ href, children }) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
          >
            {children}
          </a>
        ),

        // Code blocks
        code: ({ className, children }) => {
          const isInline = !className
          
          if (isInline) {
            return (
              <code className="bg-gray-700/50 text-cyan-300 px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            )
          }
          
          return (
            <code className={cn("block bg-gray-900/50 rounded-lg p-3 text-sm font-mono overflow-x-auto", className)}>
              {children}
            </code>
          )
        },

        // Preformatted text / code blocks
        pre: ({ children }) => (
          <pre className="bg-gray-900/50 rounded-lg p-4 my-3 overflow-x-auto border border-gray-700/50">
            {children}
          </pre>
        ),

        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-purple-500 pl-4 my-3 italic text-gray-300 bg-purple-500/10 py-2 pr-4 rounded-r-lg">
            {children}
          </blockquote>
        ),

        // Horizontal rule
        hr: () => (
          <hr className="border-gray-700 my-4" />
        ),

        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="min-w-full border-collapse border border-gray-700 rounded-lg overflow-hidden">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-gray-800/50">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-gray-700">
            {children}
          </tbody>
        ),
        tr: ({ children }) => (
          <tr className="hover:bg-gray-800/30 transition-colors">
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left text-sm font-semibold text-purple-300 border-b border-gray-700">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 text-sm text-gray-200">
            {children}
          </td>
        ),

        // Images
        img: ({ src, alt }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={src} 
            alt={alt || ''} 
            className="rounded-lg max-w-full h-auto my-3 border border-gray-700"
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  )
}

// Specialized component for alert/warning boxes
export function AlertBox({ 
  children, 
  type = 'info' 
}: { 
  children: React.ReactNode
  type?: 'info' | 'warning' | 'danger' | 'success' 
}) {
  const styles = {
    info: 'bg-blue-500/10 border-blue-500 text-blue-300',
    warning: 'bg-yellow-500/10 border-yellow-500 text-yellow-300',
    danger: 'bg-red-500/10 border-red-500 text-red-300',
    success: 'bg-green-500/10 border-green-500 text-green-300',
  }

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    danger: '🚨',
    success: '✅',
  }

  return (
    <div className={cn(
      "border-l-4 pl-4 py-3 pr-4 rounded-r-lg my-3",
      styles[type]
    )}>
      <span className="mr-2">{icons[type]}</span>
      {children}
    </div>
  )
}
