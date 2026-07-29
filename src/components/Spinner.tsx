import { motion } from 'framer-motion'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <motion.svg
      className={`${sizeMap[size]} ${className}`}
      viewBox="0 0 50 50"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.25" />
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray="31.4 94.2"
        strokeLinecap="round"
      />
    </motion.svg>
  )
}
