'use client'

import { HTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  icon?: ReactNode
  title?: string
  value?: string | number
  description?: string
  href?: string
}

export function Card({ 
  children, 
  className = '', 
  icon, 
  title, 
  value, 
  description, 
  href,
  ...props 
}: CardProps) {
  const content = (
    <div 
      className={`relative overflow-hidden p-6 bg-white rounded-xl shadow-lg transition-all duration-300 
            hover:shadow-xl hover:scale-[1.02] hover:bg-gradient-to-br hover:from-white hover:to-gray-50 ${className}`}
      {...props}
    >
      {(icon || title) && (
        <div className="flex items-center space-x-4">
          {icon && (
            <div className="p-3 rounded-lg bg-white/50 ring-1 ring-blue-100 shadow-sm">
              {icon}
            </div>
          )}
          {title && (
            <h3 className="text-lg font-semibold text-blue-800 font-inter">
              {title}
            </h3>
          )}
        </div>
      )}
      
      {(value || description) && (
        <div className="mt-4 flex flex-col space-y-2">
          {value && (
            <span className="text-3xl font-bold text-blue-900 font-inter animate-in zoom-in">
              {value}
            </span>
          )}
          {description && (
            <p className="text-sm text-blue-600/80">
              {description}
            </p>
          )}
        </div>
      )}
      
      {children}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}
