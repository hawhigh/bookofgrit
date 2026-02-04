
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore'

export default function DashboardPage() {
    const [user, setUser] = useState(null)
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [drills, setDrills] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            if (!u) {
                navigate('/')
                return
            }
            setUser(u)

            // Check subscription status
            const userRef = doc(db, "users", u.uid)
            const userSnap = await getDoc(userRef)

            if (userSnap.exists()) {
                const data = userSnap.data()
                if (!data.isSubscriber && !data.purchased?.includes('SUB_MONTHLY')) {
                    // Not a subscriber, send back or show restricted
                    // For now, let's just mark that they aren't a subscriber
                    setUserData(data)
                } else {
                    setUserData(data)
                    fetchDrills()
                }
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [navigate])

    const fetchDrills = async () => {
        try {
            const q = query(collection(db, "drills"), orderBy("timestamp", "desc"))
            const querySnapshot = await getDocs(q)
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setDrills(data)
        } catch (err) {
            console.error("Fetch drills failed:", err)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center font-technical text-primary uppercase tracking-[0.4em]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-1 w-full bg-zinc-900 overflow-hidden relative">
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="absolute inset-0 bg-primary"
                        />
                    </div>
                    AUTHENTICATING_OPERATOR...
                </div>
            </div>
        )
    }

    const isSubscribed = userData?.isSubscriber || userData?.purchased?.includes('SUB_MONTHLY')

    if (!isSubscribed) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <div className="max-w-md w-full border-2 border-fire/50 bg-black/80 backdrop-blur-xl p-10 text-center space-y-8 shadow-[0_0_50px_rgba(255,100,0,0.1)]">
                    <span className="material-symbols-outlined text-fire text-7xl">lock_open</span>
                    <div>
                        <h2 className="text-4xl font-bombed text-white mb-4 uppercase italic">ACCESS_DENIED</h2>
                        <p className="font-technical text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">
                            Terminal 4.1.0: "THE DEEP WEB" requires an active 'MOVEMENT' enlistment. Your clearance does not meet the minimum operational threshold.
                        </p>
                    </div>
                    <Link to="/">
                        <button className="w-full bg-fire text-black font-stencil text-lg py-4 hover:bg-white transition-all cursor-pointer">
                            ENLIST_NOW
                        </button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black concrete-texture text-white selection:bg-neon-magenta selection:text-black">
            {/* Header */}
            <header className="p-8 border-b-2 border-neon-magenta/20 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-2xl font-technical text-neon-magenta hover:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bombed uppercase tracking-widest text-white italic">THE_DEEP_WEB</h1>
                        <p className="text-[8px] font-technical text-neon-magenta/60 uppercase tracking-[0.3em]">Operational Area: Classified Archive</p>
                    </div>
                </div>
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-technical text-zinc-600 uppercase">Operator_Current:</span>
                    <span className="text-xs font-bombed text-neon-magenta tracking-widest">{userData?.callsign || 'SECURE_NODE'}</span>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-8 py-16">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left: Tactical Drills Feed */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="flex items-center gap-4 mb-4 border-l-4 border-neon-magenta pl-6">
                            <div>
                                <h2 className="text-4xl font-bombed uppercase italic">TACTICAL_DRILLS</h2>
                                <p className="text-[10px] font-technical text-zinc-500 uppercase tracking-widest">WEEKLY_OPERATIONAL_PROCEDURES</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {drills.length === 0 ? (
                                <div className="p-12 border border-zinc-900 text-center space-y-4 bg-zinc-950/50">
                                    <span className="material-symbols-outlined text-zinc-800 text-5xl">inventory_2</span>
                                    <p className="font-technical text-[10px] text-zinc-600 uppercase tracking-widest">ARCHIVE_TEMPORARILY_EMPTY <br /> NEW_DRILLS_DEPLOYING_SOON</p>
                                </div>
                            ) : (
                                drills.map((drill, i) => (
                                    <motion.div
                                        key={drill.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group relative p-8 border border-zinc-900 hover:border-neon-magenta/50 bg-black transition-all"
                                    >
                                        <div className="absolute top-0 right-0 p-4 font-technical text-[8px] text-zinc-700 uppercase">
                                            {drill.timestamp?.toDate().toLocaleDateString() || 'DATA_PENDING'}
                                        </div>
                                        <h3 className="text-2xl font-bombed mb-4 uppercase group-hover:text-neon-magenta transition-colors">{drill.title}</h3>
                                        <div className="prose prose-invert prose-xs font-technical text-zinc-400 leading-relaxed mb-6">
                                            {drill.content}
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="px-3 py-1 bg-neon-magenta/10 border border-neon-magenta/20 text-[8px] font-technical text-neon-magenta uppercase tracking-tighter">
                                                STATUS: ACTIVE
                                            </span>
                                            <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-[8px] font-technical text-zinc-500 uppercase tracking-tighter">
                                                TYPE: {drill.type || 'PROTOCOL'}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: Member Resources & Stats */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h4 className="text-neon-magenta font-stencil text-lg uppercase underline underline-offset-8 decoration-neon-magenta/30">MEMBER_ASSETS</h4>
                            <div className="grid gap-4">
                                {[
                                    { icon: 'description', label: 'THE CORE MANIFESTO', sub: 'Foundational Doc V3.2' },
                                    { icon: 'shield', label: 'OPERATOR PROTOCOLS', sub: 'Conduct & Discipline' },
                                    { icon: 'database', label: 'THE RAW ARCHIVE', sub: 'Unreleased Dumps' }
                                ].map((asset, i) => (
                                    <div key={i} className="p-4 border border-zinc-900 bg-zinc-950/30 hover:bg-zinc-900/50 transition-all cursor-pointer group flex items-center gap-4">
                                        <span className="material-symbols-outlined text-zinc-500 group-hover:text-neon-magenta">{asset.icon}</span>
                                        <div>
                                            <p className="text-[10px] font-bombed text-white uppercase">{asset.label}</p>
                                            <p className="text-[8px] font-technical text-zinc-600 uppercase tracking-tighter">{asset.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 bg-neon-magenta/5 border border-neon-magenta/10 space-y-6 relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-magenta/10 rounded-full blur-3xl animate-pulse"></div>
                            <h4 className="font-stencil text-neon-magenta text-sm uppercase">OPERATOR_STATUS</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end border-b border-zinc-900 pb-2">
                                    <span className="text-[10px] font-technical text-zinc-500 uppercase">TIER</span>
                                    <span className="text-xs font-bombed text-neon-magenta uppercase tracking-widest italic">MOVEMENT_ELITE</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-zinc-900 pb-2">
                                    <span className="text-[10px] font-technical text-zinc-500 uppercase">NETWORK_ID</span>
                                    <span className="text-[10px] font-technical text-zinc-300 uppercase">G_NODE_{user?.uid.substring(0, 8).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-zinc-900 pb-2">
                                    <span className="text-[10px] font-technical text-zinc-500 uppercase">SESSION_KEY</span>
                                    <span className="text-[10px] font-technical text-zinc-300 uppercase">ENC_VERIFIED</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-[8px] font-technical text-zinc-700 leading-relaxed uppercase">
                            Warning: Unauthorized distribution of Deep Web assets will result in permanent termination of operational status and network blacklisting.
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="p-12 border-t-2 border-white/5 bg-black/80">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
                    <span className="font-technical text-[10px] tracking-widest text-zinc-600 uppercase">DEEP_WEB_PROTOCOL_v1.0.4 // BOOK_OF_GRIT_ARCHIVE</span>
                    <div className="flex gap-12 font-technical text-[8px] tracking-[0.4em]">
                        <span className="text-zinc-500 uppercase">STATUS: SECURE</span>
                        <span className="text-zinc-500 uppercase">FREQ: KHZ_44.9</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
