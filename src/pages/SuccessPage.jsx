
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export default function SuccessPage() {
    const location = useLocation()
    const item = location.state?.item

    useEffect(() => {
        if (item) {
            handleDownload(item)
        }
    }, [item])

    const handleDownload = (item) => {
        const text = item.content || `MANIFESSTO - ${item.name}\n\nNO ONE IS COMING TO SAVE YOU.\nDO THE WORK.`
        const blob = new Blob([text], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${item.id}_${item.name.replace(/\s/g, '_')}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="concrete-texture min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center">
            <div className="noise-overlay"></div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 max-w-md w-full border-4 border-primary glow-cyan bg-black/80 p-12 shadow-[0_0_100px_rgba(0,255,255,0.1)]"
            >
                <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    className="mb-8"
                >
                    <span className="material-symbols-outlined text-8xl text-primary drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">task_alt</span>
                </motion.div>

                <h1 className="text-5xl font-bombed mb-4 leading-none glitch-effect">TRANSACTION<br />CONFIRMED</h1>

                <div className="h-1 w-20 bg-primary mx-auto mb-8"></div>

                {item && (
                    <div className="mb-8 p-4 border border-zinc-800 bg-black/50">
                        <p className="text-[10px] font-technical text-zinc-500 uppercase mb-1">Decrypted_Asset:</p>
                        <p className="text-xl font-bombed text-white uppercase">{item.name}</p>
                        <p className="text-[8px] font-technical text-primary mt-2">DOWNLOAD_STARTED...</p>
                    </div>
                )}

                <p className="font-technical text-zinc-400 text-sm mb-12 leading-relaxed uppercase tracking-tighter">
                    Operator credentials verified. Digital manifests have been decrypted and linked to your session.
                    <span className="text-white block mt-4 italic font-bold">"THE ONLY EASY DAY WAS YESTERDAY."</span>
                </p>

                <Link to="/">
                    <button className="w-full bg-primary text-black font-stencil text-xl py-6 hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[8px_8px_0px_#000]">
                        RETURN TO ARCHIVE
                    </button>
                </Link>

                <div className="mt-8 text-[8px] font-technical text-zinc-700 uppercase tracking-widest">
                    SECURE_LINE_TERMINATED // IP_LOGGED
                </div>
            </motion.div>

            {/* Background Flair */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary blur-[120px]"></div>
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-fire blur-[120px]"></div>
            </div>
        </div>
    )
}
