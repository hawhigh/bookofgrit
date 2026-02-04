import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function PaymentModal({ isOpen, onClose, item, onComplete }) {
    const [status, setStatus] = useState('idle') // idle, processing, success, error
    const navigate = useNavigate()

    useEffect(() => {
        if (isOpen) setStatus('idle')
    }, [isOpen])

    const handlePayment = () => {
        setStatus('processing')
        // Simulate API call
        setTimeout(() => {
            setStatus('success')
            setTimeout(() => {
                onComplete(item)
                onClose()
                navigate('/success', { state: { item } })
            }, 1800)
        }, 2500)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-sm bg-black border-2 border-primary glow-cyan shadow-[0_0_50px_rgba(0,255,255,0.1)] overflow-hidden"
            >
                {/* Visual Flair */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/5 blur-[80px]"></div>

                <div className="p-8 relative z-10">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors material-symbols-outlined"
                    >
                        close
                    </button>

                    <AnimatePresence mode="wait">
                        {status === 'idle' && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <div className="text-center">
                                    <span className="material-symbols-outlined text-zinc-700 text-4xl mb-4">shield_with_heart</span>
                                    <h3 className="text-2xl font-bombed text-white mb-1 uppercase tracking-tighter">SECURE ACCESS</h3>
                                    <p className="text-primary font-technical text-[10px] mb-6 tracking-[0.2em]">{item?.id || 'AUTH_REQUIRED'}</p>

                                    <div className="bg-black border border-zinc-800 p-4 relative">
                                        <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-primary/30"></div>
                                        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-primary/30"></div>

                                        <p className="text-white font-graffiti text-lg mb-1">{item?.name || 'UNKNOWN_ITEM'}</p>
                                        {item?.description && (
                                            <p className="text-zinc-500 font-technical text-[9px] leading-relaxed italic">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs font-technical">
                                        <span className="text-zinc-500 uppercase">Transaction_Cost</span>
                                        <span className="text-white text-lg">{item?.price || '$0.00'}</span>
                                    </div>

                                    <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>

                                    <button
                                        onClick={handlePayment}
                                        className="w-full bg-primary text-black font-stencil py-4 hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(0,255,255,0.2)] flex items-center justify-center gap-3"
                                    >
                                        <span className="material-symbols-outlined text-xl">contactless</span>
                                        PROCEED TO CHECKOUT
                                    </button>

                                    <div className="flex items-center justify-center gap-4 opacity-30 grayscale">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
                                        <div className="w-px h-3 bg-zinc-700"></div>
                                        <span className="text-[8px] font-technical text-zinc-400">ENCRYPTED_256</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {status === 'processing' && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="py-12 text-center space-y-6"
                            >
                                <div className="relative inline-block">
                                    <div className="w-16 h-16 border-2 border-primary/20 rounded-full"></div>
                                    <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-primary rounded-full animate-spin"></div>
                                    <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-primary animate-pulse">sync_saved_locally</span>
                                </div>
                                <div>
                                    <p className="font-technical text-primary text-xs tracking-widest animate-pulse">AUTHORIZING_PAYMENT...</p>
                                    <p className="font-technical text-[8px] text-zinc-600 mt-2 uppercase tracking-tighter">Connecting to global grit network</p>
                                </div>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 text-center space-y-6"
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary animate-bounce">
                                    <span className="material-symbols-outlined text-5xl text-primary">done_all</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bombed text-white mb-2 underline decoration-primary underline-offset-8">ACCESS_GRANTED</h3>
                                    <p className="font-technical text-[10px] text-zinc-400 uppercase tracking-widest">Digital assets deployed to your session</p>
                                </div>
                                <div className="text-[8px] font-technical text-primary animate-pulse uppercase">
                                    preparing_download_packet...
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Decorative Footer */}
                <div className="bg-black px-8 py-3 border-t border-zinc-800/50 flex justify-between items-center">
                    <span className="text-[7px] font-technical text-zinc-700 tracking-tighter">REF: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                    <span className="text-[7px] font-technical text-zinc-700 tracking-tighter">VRS: 2.0.26</span>
                </div>
            </motion.div>
        </div>
    )
}
