
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function PrivacyPage() {
    return (
        <div className="concrete-texture min-h-screen bg-black text-zinc-400 font-technical p-8 md:p-24 selection:bg-primary selection:text-black">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto border border-zinc-900 bg-zinc-950/50 p-8 md:p-16 relative"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                <Link to="/" className="text-primary hover:text-white mb-12 inline-block uppercase tracking-[0.2em] text-[10px]">
                    ← RETURN_TO_BASE
                </Link>

                <h1 className="text-4xl md:text-6xl font-bombed text-white mb-12 leading-none uppercase italic">PRIVACY_PROTOCOL</h1>

                <div className="space-y-12 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-white font-bombed text-xl mb-4 uppercase tracking-widest">01. DATA_COLLECTION</h2>
                        <p>
                            The Book of Grit collects minimal operator data required for session persistence and asset delivery. This includes email addresses provided via Google Auth and custom Callsigns initialized during operator setup.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-bombed text-xl mb-4 uppercase tracking-widest">02. TRANSACTION_SECURITY</h2>
                        <p>
                            All financial transactions are handled by Stripe. We do not store credit card details or sensitive billing information on our servers. Verification is performed via secure server-to-server handshakes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-bombed text-xl mb-4 uppercase tracking-widest">03. TRACKING_LOGS</h2>
                        <p>
                            Access to the archive is logged. IP addresses and session timestamps are recorded to prevent unauthorized distribution of classified assets.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-bombed text-xl mb-4 uppercase tracking-widest">04. DATA_RETENTION</h2>
                        <p>
                            Operators may terminate their session and request data deletion via the support channel. Upon termination, all linked assets will be purged from the active session.
                        </p>
                    </section>
                </div>

                <div className="mt-24 pt-8 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-600">
                    <span>DOC_ID: PRIV_GRIT_v1.0</span>
                    <span>LAST_MOD: 2024.02.12</span>
                </div>
            </motion.div>
        </div>
    )
}
