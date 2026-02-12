
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function TermsPage() {
    return (
        <div className="concrete-texture min-h-screen bg-black text-zinc-400 font-technical p-8 md:p-24 selection:bg-fire selection:text-black">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto border border-zinc-900 bg-zinc-950/50 p-8 md:p-16 relative"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-fire"></div>
                <Link to="/" className="text-fire hover:text-white mb-12 inline-block uppercase tracking-[0.2em] text-[10px]">
                    ← RETURN_TO_BASE
                </Link>

                <h1 className="text-4xl md:text-6xl font-bombed text-white mb-12 leading-none uppercase italic">TERMS_OF_GRIT</h1>

                <div className="space-y-12 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-white font-bombed text-xl mb-4 uppercase tracking-widest">01. NO_REFUNDS</h2>
                        <p>
                            All assets acquired through the Book of Grit are digital and non-refundable. Discomfort is part of the process. Requesting a refund due to lack of discipline is a violation of the grit code.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-bombed text-xl mb-4 uppercase tracking-widest">02. ASSET_USAGE</h2>
                        <p>
                            Manuals are for individual use only. Redistribution, resale, or public broadcasting of classified manifests is strictly prohibited and will result in permanent session termination.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-bombed text-xl mb-4 uppercase tracking-widest">03. MEMBERSHIP_ENLISTMENT</h2>
                        <p>
                            The Movement subscription provides recurring access to the archive and drills. Operators may cancel their enlistment at any time, but access to elite channels will be revoked at the end of the billing cycle.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-bombed text-xl mb-4 uppercase tracking-widest">04. OPERATOR_CONDUCT</h2>
                        <p>
                            Disrespecting the collective or sharing information from the private signal channels will result in immediate discharge without warning.
                        </p>
                    </section>
                </div>

                <div className="mt-24 pt-8 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-600">
                    <span>DOC_ID: TERMS_GRIT_v1.0</span>
                    <span>LAST_MOD: 2024.02.12</span>
                </div>
            </motion.div>
        </div>
    )
}
