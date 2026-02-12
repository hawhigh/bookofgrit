
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
        <div className="min-h-screen bg-black concrete-texture text-white selection:bg-neon-magenta selection:text-black overflow-x-hidden relative">
            {/* War Room Grid Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                <motion.div
                    animate={{ y: ['0%', '100%'] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-magenta/30 to-transparent h-[20%] w-full"
                />
            </div>

            {/* Header */}
            <header className="p-8 border-b-2 border-neon-magenta/10 flex justify-between items-center bg-black/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link to="/" className="w-12 h-12 flex items-center justify-center border border-neon-magenta/20 hover:border-neon-magenta hover:bg-neon-magenta/10 transition-all group">
                        <span className="material-symbols-outlined text-neon-magenta group-hover:scale-110 transition-transform">arrow_back</span>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-neon-magenta animate-pulse shadow-[0_0_10px_#ff00ff]"></div>
                            <h1 className="text-xl md:text-3xl font-bombed uppercase tracking-widest text-white italic">WAR_ROOM_ACCESS</h1>
                        </div>
                        <p className="text-[8px] font-technical text-neon-magenta/40 uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[10px]">sensors</span>
                            SIGNAL_STRENGTH: 98% // ENCRYPTION: OMEGA_IV
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex flex-col items-end border-r-2 border-neon-magenta/30 pr-6">
                    <span className="text-[8px] font-technical text-zinc-600 uppercase tracking-widest">CURRENT_LOGGED_OPERATOR</span>
                    <span className="text-sm font-bombed text-white tracking-widest flex items-center gap-2 italic">
                        {userData?.callsign || 'OPERATOR_X'}
                        <span className="material-symbols-outlined text-neon-magenta text-xs">verified</span>
                    </span>
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
                                <div className="p-20 border border-zinc-900 text-center space-y-6 bg-zinc-950/20 backdrop-blur-sm relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-neon-magenta/5 to-transparent"></div>
                                    <span className="material-symbols-outlined text-zinc-800 text-6xl group-hover:text-neon-magenta/20 transition-colors">radar</span>
                                    <div>
                                        <p className="font-technical text-[10px] text-zinc-600 uppercase tracking-[0.5em] mb-2">SCANNING_FOR_ACTIVE_SIGNALS...</p>
                                        <div className="w-32 h-[1px] bg-zinc-900 mx-auto relative overflow-hidden">
                                            <motion.div
                                                animate={{ x: ['-100%', '100%'] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 bg-neon-magenta/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                drills.map((drill, i) => (
                                    <motion.div
                                        key={drill.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1, duration: 0.6 }}
                                        className="group relative border border-zinc-900 hover:border-neon-magenta/40 bg-zinc-950/40 backdrop-blur-sm transition-all overflow-hidden"
                                    >
                                        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-neon-magenta/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                                        <div className="p-8">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex gap-4">
                                                    <span className="w-10 h-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 text-neon-magenta material-symbols-outlined">
                                                        {drill.type === 'PROTOCOL' ? 'terminal' : drill.type === 'MANIFESTO' ? 'contract' : 'description'}
                                                    </span>
                                                    <div>
                                                        <h3 className="text-2xl font-bombed uppercase group-hover:text-neon-magenta transition-colors italic">{drill.title}</h3>
                                                        <p className="text-[8px] font-technical text-zinc-600 uppercase tracking-widest underline decoration-zinc-800 underline-offset-4">
                                                            REF_ID: DRILL_{drill.id.substring(0, 6).toUpperCase()} // TYPE: {drill.type || 'RAW_INTEL'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bombed text-white underline decoration-neon-magenta/50">DECODED</p>
                                                    <p className="text-[8px] font-technical text-zinc-600 uppercase">{drill.timestamp?.toDate().toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="prose prose-invert prose-xs font-technical text-zinc-400 leading-relaxed mb-8 pl-6 border-l-2 border-zinc-900 group-hover:border-neon-magenta/30 transition-colors whitespace-pre-wrap">
                                                {drill.content}
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1 bg-neon-magenta/10 border border-neon-magenta/20 text-[8px] font-technical text-neon-magenta uppercase">
                                                        CLEARANCE: OPERATOR
                                                    </span>
                                                    <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-[8px] font-technical text-zinc-500 uppercase">
                                                        STATUS: VERIFIED
                                                    </span>
                                                </div>
                                                <button className="text-[10px] font-bombed uppercase text-zinc-700 hover:text-white transition-colors flex items-center gap-2">
                                                    MARK_AS_COMPLETE <span className="material-symbols-outlined text-xs">radio_button_unchecked</span>
                                                </button>
                                            </div>
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

            {/* War Room Footer Ticker */}
            <div className="fixed bottom-0 inset-x-0 h-10 bg-black/90 backdrop-blur-xl border-t-2 border-neon-magenta/20 flex items-center z-[100] overflow-hidden">
                <div className="bg-neon-magenta px-4 h-full flex items-center gap-2">
                    <span className="material-symbols-outlined text-black text-sm animate-spin-slow">settings</span>
                    <span className="text-[10px] font-technical font-bold text-black uppercase tracking-widest whitespace-nowrap">GLOBAL_LIVE_FEED:</span>
                </div>
                <div className="flex-1 px-8 overflow-hidden">
                    <motion.div
                        initial={{ x: '0%' }}
                        animate={{ x: '-50%' }}
                        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                        className="flex gap-16 whitespace-nowrap"
                    >
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex gap-16 uppercase text-[9px] font-technical text-neon-magenta tracking-[0.2em] font-bold">
                                <span>LATENCY: 12ms // SERVER: OMEGA_SOUTH // STATUS: DEEP_FETCH_ACTIVE</span>
                                <span>OPERATORS_ACTIVE: 1,402 // DRILLS_SYNCED: 100% // NOCOMING_SAVE_YOU</span>
                                <span>SIGNAL_LOCK: SECURE // VOID_PROTOCOL: INITIALIZED // GRIT_ORACLE_LIVE</span>
                                <span>LATENCY: 12ms // SERVER: OMEGA_SOUTH // STATUS: DEEP_FETCH_ACTIVE</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
                <div className="hidden md:flex bg-zinc-900 px-6 h-full items-center gap-4 text-[9px] font-technical text-zinc-500 tracking-[0.2em]">
                    <p>FREQ: 44.9KHZ</p>
                    <p className="text-neon-magenta">STATUS: CLEAR</p>
                </div>
            </div>

            {/* Spacer for ticker */}
            <div className="h-10"></div>
        </div>
    )
}
