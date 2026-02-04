
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'

export default function PaymentModal({ isOpen, onClose, item, onComplete }) {
    const [status, setStatus] = useState('idle') // idle, processing, success, error
    const [errorMessage, setErrorMessage] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if (isOpen) {
            setStatus('idle')
            setErrorMessage('')
        }
    }, [isOpen])

    const handlePayment = async () => {
        setStatus('processing')
        setErrorMessage('')

        try {
            // 1. Call our PHP backend to create a Stripe Checkout Session
            const response = await fetch('/create-checkout-session.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemId: item.id,
                    name: item.name,
                    price: item.price,
                    img: item.img || 'https://thebookofgrit.com/bookofgrit_logo_v3.png',
                    uid: auth.currentUser?.uid || 'anonymous'
                }),
            });

            // Check if response is JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("Non-JSON response:", text);
                throw new Error("SERVER_CONFIGURATION_ERROR");
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // 2. Redirect to Stripe Checkout using the Direct URL
            if (data.url) {
                // We keep the processing state until the browser starts navigating
                window.location.href = data.url;
            } else {
                throw new Error("SECURE_LINK_GENERATION_FAILED");
            }

        } catch (err) {
            console.error("Payment Error:", err);
            setErrorMessage(err.message || "FAILED_TO_INITIALIZE_GATEWAY");
            setStatus('error');
        }
    }

    if (!isOpen) return null

    const isSubscription = item?.id === 'SUB_MONTHLY';

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 md:p-12">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                className={`relative w-full ${isSubscription ? 'max-w-4xl' : 'max-w-2xl'} bg-black border-2 ${isSubscription ? 'border-neon-magenta shadow-[0_0_80px_rgba(255,0,255,0.15)]' : 'border-primary shadow-[0_0_80px_rgba(0,240,255,0.15)]'} overflow-hidden h-fit max-h-[90vh] flex flex-col`}
            >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${isSubscription ? 'via-neon-magenta' : 'via-primary'} to-transparent opacity-50`}></div>

                <div className="p-8 md:p-12 relative z-10 flex-1 overflow-y-auto custom-scrollbar">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-zinc-600 hover:text-white transition-colors material-symbols-outlined text-4xl"
                    >
                        close
                    </button>

                    <AnimatePresence mode="wait">
                        {status === 'idle' && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-10"
                            >
                                <div className="text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-zinc-900 pb-8">
                                        <div>
                                            <h3 className={`text-4xl md:text-6xl font-bombed text-white mb-2 uppercase tracking-tighter ${isSubscription ? 'text-neon-magenta' : ''}`}>
                                                {isSubscription ? 'ELITE_ENLISTMENT' : 'SECURE_ACCESS'}
                                            </h3>
                                            <p className={`${isSubscription ? 'text-neon-magenta' : 'text-primary'} font-technical text-xs md:text-sm tracking-[0.4em] uppercase`}>
                                                {isSubscription ? 'OPERATIONAL FREQUENCY ACCESS' : `ASSET_ID: ${item?.id || 'AUTH_REQUIRED'}`}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center md:items-end">
                                            <span className="text-zinc-600 font-technical text-[10px] uppercase mb-1 tracking-widest">COST</span>
                                            <span className="text-white text-5xl font-bombed leading-none">{item?.price || '$0.00'}</span>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <div className="bg-zinc-900/40 border border-zinc-800 p-8 relative">
                                                <div className={`absolute -top-3 -left-3 w-8 h-8 border-l-2 border-t-2 ${isSubscription ? 'border-neon-magenta/40' : 'border-primary/40'}`}></div>
                                                <div className={`absolute -bottom-3 -right-3 w-8 h-8 border-r-2 border-b-2 ${isSubscription ? 'border-neon-magenta/40' : 'border-primary/40'}`}></div>

                                                <p className={`text-white font-graffiti text-3xl mb-4 italic ${isSubscription ? 'text-neon-magenta' : ''}`}>{item?.name || 'UNKNOWN_ITEM'}</p>
                                                <p className="text-zinc-400 font-technical text-xs leading-relaxed">
                                                    {item?.description || "Decryption sequence for operational manifests. Includes full tactical orientation and implementation protocols."}
                                                </p>
                                            </div>

                                            {isSubscription && (
                                                <div className="space-y-6">
                                                    <h4 className="text-neon-magenta font-stencil text-lg uppercase underline underline-offset-8 decoration-neon-magenta/30">WHY_JOIN_THE_MOVEMENT?</h4>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {[
                                                            { icon: 'hub', label: 'THE NETWORK', desc: 'Direct connection to a global collective of elite performers. No noise. Pure signal.' },
                                                            { icon: 'deployed_code', label: 'TACTICAL DRILLS', desc: 'Weekly operational procedures designed to push your limit and rebuild your discipline.' },
                                                            { icon: 'shield_with_heart', label: 'PRIVATE ARCHIVE', desc: 'Unrestricted access to the classified manifestos and unreleased grit protocols.' }
                                                        ].map((trait, i) => (
                                                            <div key={i} className="flex gap-4 group">
                                                                <span className="material-symbols-outlined text-neon-magenta text-3xl opacity-50 group-hover:opacity-100 transition-opacity">{trait.icon}</span>
                                                                <div>
                                                                    <p className="text-white font-bombed text-[10px] mb-1">{trait.label}</p>
                                                                    <p className="text-zinc-500 font-technical text-[9px] leading-tight">{trait.desc}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col justify-between space-y-8">
                                            <div className="space-y-6">
                                                <div className="bg-black/80 border border-zinc-800 p-6 font-technical text-[10px] text-zinc-500 space-y-2 leading-relaxed">
                                                    <p className="text-zinc-400 font-bold uppercase">MISSION_PROTOCOL_2.0:</p>
                                                    <p>By proceeding, you acknowledge that progress is only possible through consistent, uncomfortable work. The assets provided are tools, not solutions. No refunds will be issued for Lack of discipline.</p>
                                                </div>

                                                <ul className="space-y-3">
                                                    <li className="flex items-center gap-3 text-zinc-400 font-technical text-[10px]">
                                                        <span className={`material-symbols-outlined text-sm ${isSubscription ? 'text-neon-magenta' : 'text-primary'}`}>verified</span>
                                                        INSTANT DIGITAL DEPLOYMENT
                                                    </li>
                                                    <li className="flex items-center gap-3 text-zinc-400 font-technical text-[10px]">
                                                        <span className={`material-symbols-outlined text-sm ${isSubscription ? 'text-neon-magenta' : 'text-primary'}`}>security</span>
                                                        ENCRYPTED_SESSION_KEY_INCLUDED
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="space-y-4 pt-8 border-t border-zinc-900">
                                                <button
                                                    onClick={handlePayment}
                                                    className={`w-full py-6 font-stencil text-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl flex items-center justify-center gap-4 ${isSubscription ? 'bg-neon-magenta text-black shadow-neon-magenta/20' : 'bg-primary text-black shadow-primary/20'} hover:bg-white`}
                                                >
                                                    <span className="material-symbols-outlined text-3xl">terminal</span>
                                                    INITIALIZE CHECKOUT
                                                </button>

                                                <div className="flex items-center justify-center gap-6 opacity-30 invert pointer-events-none">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6" />
                                                    <div className="w-px h-6 bg-white"></div>
                                                    <span className="text-[10px] font-technical text-white tracking-widest uppercase">SSL_SECURE</span>
                                                </div>
                                            </div>
                                        </div>
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
                                className="py-24 text-center space-y-10"
                            >
                                <div className="relative inline-block scale-150">
                                    <div className={`w-24 h-24 border-2 ${isSubscription ? 'border-neon-magenta/10' : 'border-primary/10'} rounded-full`}></div>
                                    <div className={`absolute top-0 left-0 w-24 h-24 border-t-2 ${isSubscription ? 'border-neon-magenta' : 'border-primary'} rounded-full animate-spin`}></div>
                                    <span className={`absolute inset-0 flex items-center justify-center material-symbols-outlined text-4xl ${isSubscription ? 'text-neon-magenta' : 'text-primary'} animate-pulse`}>sensors</span>
                                </div>
                                <div>
                                    <p className={`font-bombed ${isSubscription ? 'text-neon-magenta' : 'text-primary'} text-2xl tracking-[0.2em] animate-pulse`}>AUTHORIZING_LINK...</p>
                                    <p className="font-technical text-xs text-zinc-600 mt-4 uppercase tracking-widest">Handshaking with secure payment node</p>
                                </div>
                            </motion.div>
                        )}

                        {status === 'error' && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="py-24 text-center space-y-10"
                            >
                                <span className="material-symbols-outlined text-7xl text-fire">warning</span>
                                <div>
                                    <p className="font-bombed text-fire text-2xl tracking-[0.2em]">CONNECTION_REJECTED</p>
                                    <p className="font-technical text-xs text-zinc-600 mt-4 uppercase tracking-widest">{errorMessage}</p>
                                </div>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="px-8 py-2 border border-zinc-800 text-zinc-500 font-technical text-[10px] hover:text-white hover:border-white transition-all uppercase"
                                >
                                    Retry Connection
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="bg-zinc-950 px-12 py-6 border-t border-zinc-900/50 flex justify-between items-center opacity-40">
                    <span className="text-[10px] font-technical text-zinc-600 tracking-tighter">SESSION_SIG: {Math.random().toString(36).substring(2, 15).toUpperCase()}</span>
                    <div className="flex gap-8">
                        <span className="text-[10px] font-technical text-zinc-600 tracking-tighter uppercase">Protocol: Grit_v3.2</span>
                        <span className="text-[10px] font-technical text-zinc-600 tracking-tighter uppercase">Loc: Global_Net</span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
