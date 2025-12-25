"use client"

import { motion } from "framer-motion"
import { X, Zap } from "lucide-react"

interface ZenAddModalProps {
  isOpen: boolean
  onClose: () => void
  itemName: string
}

export function ZenAddModal({ isOpen, onClose, itemName }: ZenAddModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative bg-gradient-to-br from-cyan-900/90 via-gray-900/90 to-purple-900/90 border-2 border-cyan-500/50 rounded-3xl p-10 shadow-2xl max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/50"
          >
            <Zap className="w-10 h-10 text-white" strokeWidth={2.5} />
          </motion.div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
              Environment Added!
            </h2>
            <p className="text-gray-300 text-lg">Your new environment is ready:</p>
            <p className="text-xl font-bold text-white font-mono">{itemName}</p>
          </div>

          <p className="text-sm text-gray-400 font-mono">Visit Zen Mode to use your new environment</p>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-lg font-semibold transition-all shadow-lg hover:shadow-cyan-500/50"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}
