"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Sparkles, X } from "lucide-react"

interface PurchaseSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  itemName: string
  itemType: "system" | "bounty"
}

export function PurchaseSuccessModal({ isOpen, onClose, itemName, itemType }: PurchaseSuccessModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated background glow */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className={`absolute inset-0 blur-3xl ${
                itemType === "system"
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500"
                  : "bg-gradient-to-r from-purple-500 to-pink-500"
              }`}
            />

            {/* Card */}
            <div className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-cyan-500/50 rounded-3xl p-12 shadow-2xl min-w-[400px]">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Success icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-green-500/50"
              >
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </motion.div>

              {/* Sparkles animation */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: [0, (Math.random() - 0.5) * 100],
                      y: [0, (Math.random() - 0.5) * 100],
                    }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 1 }}
                    className="absolute"
                  >
                    <Sparkles className={`w-4 h-4 ${itemType === "system" ? "text-cyan-400" : "text-purple-400"}`} />
                  </motion.div>
                ))}
              </div>

              {/* Text content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <h3 className="text-3xl font-bold text-white mb-3 font-mono">Purchase Successful!</h3>
                <p className="text-gray-400 mb-2">You've acquired</p>
                <p
                  className={`text-xl font-bold font-mono bg-gradient-to-r ${
                    itemType === "system" ? "from-cyan-400 to-purple-400" : "from-purple-400 to-pink-400"
                  } bg-clip-text text-transparent`}
                >
                  {itemName}
                </p>
                <p className="text-sm text-gray-500 mt-4 font-mono">Check your inventory to use it!</p>
              </motion.div>

              {/* Progress bar for auto-close */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 3, ease: "linear" }}
                className={`absolute bottom-0 left-0 right-0 h-1 ${
                  itemType === "system"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500"
                    : "bg-gradient-to-r from-purple-500 to-pink-500"
                } origin-left rounded-b-3xl`}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
