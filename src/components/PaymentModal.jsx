
import { useState, useEffect } from 'react'

export default function PaymentModal({ isOpen, onClose, item, onComplete }) {
    const [status, setStatus] = useState('idle') // idle, processing, success, error

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
            }, 1500)
        }, 2000)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-sm bg-zinc-900 border-2 border-primary glow-cyan p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-zinc-500 hover:text-white material-symbols-outlined"
                >
                    close
                </button>

                {status === 'idle' && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-bombed text-white mb-1">CONFIRM PURCHASE</h3>
                            <p className="text-primary font-technical text-sm mb-4 tracking-tighter">{item?.name || 'UNKNOWN_ITEM'}</p>
                            {item?.description && (
                                <p className="text-zinc-400 font-technical text-[10px] leading-relaxed mb-6 border-y border-zinc-800 py-4 italic">
                                    "{item.description}"
                                </p>
                            )}
                        </div>

                        <div className="bg-black/50 p-4 border border-zinc-700">
                            <div className="flex justify-between text-zinc-400 font-technical text-sm mb-2">
                                <span>ITEM_COST</span>
                                <span className="text-white">{item?.price || '$0.00'}</span>
                            </div>
                            <div className="flex justify-between text-zinc-400 font-technical text-sm mb-2">
                                <span>PROCESSING</span>
                                <span className="text-white">$0.00</span>
                            </div>
                            <div className="h-px bg-zinc-700 my-2"></div>
                            <div className="flex justify-between text-primary font-bold font-technical">
                                <span>TOTAL</span>
                                <span>{item?.price || '$0.00'}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            className="w-full bg-primary text-black font-stencil py-3 hover:bg-white transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">credit_card</span>
                            PAY NOW
                        </button>
                        <p className="text-[10px] text-center text-zinc-500 font-technical">
                            SECURE_TRANSACTION // ENCRYPTED_256BIT
                        </p>
                    </div>
                )}

                {status === 'processing' && (
                    <div className="py-8 text-center space-y-4">
                        <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-technical text-primary animate-pulse">PROCESSING_TRANSACTION...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-8 text-center space-y-4">
                        <span className="material-symbols-outlined text-6xl text-neon-yellow">check_circle</span>
                        <div>
                            <h3 className="text-xl font-bombed text-white">ACCESS GRANTED</h3>
                            <p className="font-technical text-xs text-zinc-400">DOWNLOADING ASSETS...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
