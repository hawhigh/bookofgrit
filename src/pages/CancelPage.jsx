
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function CancelPage() {
    return (
        <div className="concrete-texture min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center">

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative z-10 max-w-md w-full border-4 border-fire glow-orange bg-black p-12 shadow-[0_0_100px_rgba(255,80,0,0.1)]"
            >
                <div className="mb-8">
                    <span className="material-symbols-outlined text-8xl text-fire animate-pulse">warning</span>
                </div>

                <h1 className="text-5xl font-bombed mb-4 leading-none text-fire">MISSION<br />ABORTED</h1>

                <div className="h-1 w-20 bg-fire mx-auto mb-8"></div>

                <p className="font-technical text-zinc-500 text-sm mb-12 leading-relaxed uppercase tracking-tighter">
                    Authorization sequence interrupted. The deployment has been halted. No assets were moved.
                    <span className="text-zinc-300 block mt-4 italic font-bold">"FAILURE IS NOT AN OPTION, BUT PAYMENTS ARE."</span>
                </p>

                <Link to="/">
                    <button className="w-full bg-zinc-800 text-white font-stencil text-xl py-6 hover:bg-fire hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                        RETRY DEPLOYMENT
                    </button>
                </Link>

                <div className="mt-8 text-[8px] font-technical text-zinc-800 uppercase tracking-widest">
                    ERROR_CODE: PAYMENT_CANCELLED_BY_OPERATOR
                </div>
            </motion.div>
        </div>
    )
}
