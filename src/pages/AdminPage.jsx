import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, updateDoc, arrayUnion } from 'firebase/firestore'
import { db, auth } from '../firebase'
import AdminDashboard from '../components/AdminDashboard'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-red-500 p-10 font-mono flex flex-col items-center justify-center">
                    <h1 className="text-4xl mb-6 font-bold border-b border-red-500 pb-2">CRITICAL SYSTEM FAILURE</h1>
                    <div className="w-full max-w-4xl bg-zinc-900/50 p-6 rounded border border-red-900/50 overflow-auto">
                        <p className="text-xl mb-4 text-white">Error: {this.state.error && this.state.error.toString()}</p>
                        <details className="text-sm text-zinc-400">
                            <summary className="cursor-pointer hover:text-white mb-2">Stack Trace</summary>
                            <pre className="whitespace-pre-wrap">{this.state.error && this.state.error.stack}</pre>
                            <pre className="whitespace-pre-wrap mt-4">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                        </details>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-3 bg-red-600 text-white font-bold hover:bg-red-500 transition-colors"
                    >
                        REBOOT SYSTEM
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function AdminPage() {
    const [chapters, setChapters] = useState([])
    const [users, setUsers] = useState([])
    const [subs, setSubs] = useState([])
    const [drills, setDrills] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchAllData()
        const unsubscribe = auth.onAuthStateChanged((user) => {
            // Logic for auto-auth if needed
        })
        return () => unsubscribe()
    }, [])

    const fetchAllData = async () => {
        setLoading(true)
        await Promise.all([fetchChapters(), fetchUsers(), fetchSubs(), fetchDrills()])
        setLoading(false)
    }

    const fetchChapters = async () => {
        try {
            const q = query(collection(db, "chapters"), orderBy("id", "asc"))
            const querySnapshot = await getDocs(q)
            const data = querySnapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id }))
            setChapters(data)
        } catch (err) { console.error("Fetch chapters failed:", err) }
    }

    const fetchUsers = async () => {
        try {
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"))
            const querySnapshot = await getDocs(q)
            const data = querySnapshot.docs.map(doc => {
                const d = doc.data()
                return {
                    ...d,
                    id: doc.id,
                    firestoreId: doc.id,
                    joined: d.createdAt?.toDate().toLocaleDateString() || 'N/A'
                }
            })
            setUsers(data)
        } catch (err) { console.error("Fetch users failed:", err) }
    }

    const fetchSubs = async () => {
        try {
            const q = query(collection(db, "subscriptions"))
            const querySnapshot = await getDocs(q)
            const data = querySnapshot.docs.map(doc => {
                const d = doc.data()
                return {
                    ...d,
                    id: doc.id,
                    firestoreId: doc.id,
                    nextBilling: d.current_period_end ? new Date(d.current_period_end * 1000).toLocaleDateString() : 'N/A'
                }
            })
            setSubs(data)
        } catch (err) { console.error("Fetch subs failed:", err) }
    }

    const fetchDrills = async () => {
        try {
            const q = query(collection(db, "drills"), orderBy("timestamp", "desc"))
            const querySnapshot = await getDocs(q)
            const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
            setDrills(data)
        } catch (err) { console.error("Fetch drills failed:", err) }
    }

    const handleAddChapter = async (newCh) => {
        try {
            await addDoc(collection(db, "chapters"), newCh)
            fetchChapters()
        } catch (err) { console.error("Add failed:", err) }
    }

    const handleGrantAccess = async (uid) => {
        try {
            const itemId = prompt("ENTER_ASSET_ID_TO_GRANT (e.g. CH_01):")
            if (!itemId) return
            await updateDoc(doc(db, "users", uid), {
                purchased: arrayUnion(itemId)
            })
            alert("ACCESS_GRANTED_SUCCESSFULLY")
            fetchUsers()
        } catch (err) { console.error("Grant failed:", err) }
    }

    const handleResetProtocols = async (uid) => {
        try {
            if (!confirm("WIPE_USER_CLEARANCE? THIS WILL REMOVE ALL PURCHASES AND SUBS STATUS.")) return
            await updateDoc(doc(db, "users", uid), {
                purchased: [],
                isSubscriber: false
            })
            alert("PROTOCOL_RESET_COMPLETE")
            fetchUsers()
        } catch (err) { console.error("Reset failed:", err) }
    }

    const handleDeleteUser = async (uid) => {
        try {
            if (!confirm("DELETE_OPERATOR_PERMANENTLY?")) return
            await deleteDoc(doc(db, "users", uid))
            alert("OPERATOR_TERMINATED")
            fetchUsers()
        } catch (err) { console.error("Deletion failed:", err) }
    }

    const handleDeleteChapter = async (firestoreId) => {
        try {
            if (!confirm("CONFIRM_PERMANENT_DELETION?")) return
            await deleteDoc(doc(db, "chapters", firestoreId))
            fetchChapters()
        } catch (err) { console.error("Delete failed:", err) }
    }

    const handleUpdateChapter = async (firestoreId, updatedData) => {
        try {
            await updateDoc(doc(db, "chapters", firestoreId), updatedData)
            fetchChapters()
        } catch (err) { console.error("Update failed:", err) }
    }
    const handleAddDrill = async (drill) => {
        try {
            await addDoc(collection(db, "drills"), drill)
            fetchDrills()
        } catch (err) { console.error("Add drill failed:", err) }
    }

    const handleDeleteDrill = async (id) => {
        try {
            if (!confirm("TERMINATE_ACTIVE_DRILL?")) return
            await deleteDoc(doc(db, "drills", id))
            fetchDrills()
        } catch (err) { console.error("Delete drill failed:", err) }
    }

    const handleSeedChapters = async () => {
        try {
            if (!confirm("WARNING: THIS WILL DUPLICATE DATA IF NOT EMPTY. PROCEED?")) return

            const defaultChapters = [
                { id: 'CH_01', name: 'MANIFESTO', price: '$3', borderClass: 'border-primary', colorClass: 'text-primary', glow: 'glow-cyan', description: 'The founding principles of the grit mindset. Discomfort is not an obstacle; it is the path.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsY68-HDaa2jNGV0f03uraeN1eAqz_z6KJdGELGwpfgV_IyaDsmNm2pUIj2CJopuOyrHLGHBhzaFEW4bSg7IwJ-h7tCXv37K4bHeQQNu4xjbR-Z7sIK3rK5CxFi1R4dufN5xFBtACCgXrI4cTbdlMCQMU9S-bVS557EShmVJerHO1WPZR8ZJdEu9rTI-YyCwg2-jTyA3K3D-k0fp3EWETdZu_8J9UFV0AU1nD4uKrflSJ-QCIsg1NLfo7rxfr-nITIal9-FpkOniZB', content: 'MANIFESTO_PROTOCOL: THE ONLY EASY DAY WAS YESTERDAY.' },
                { id: 'CH_02', name: 'The Void', price: '$3', borderClass: 'border-fire', colorClass: 'text-fire', glow: 'glow-orange', description: 'Embracing the emptiness where growth happens. When you have nothing, you have everything to gain.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuh9yajP2K2UokzC7ClDOOXipnj6G6thi0OzOv94tkXWtGDVl0dEnviC-6576FdKLS31wC_yPy4-nVxK2fqIAhvbecAFRogwdBnmndq16MPdnNr5_abVr8mAfJNY9JZHqNwSr244rPrC4nMj65BOa6xQIBuDDtGkH2yCqKygfBgMDTJsIjfNAVQHU7Gh9tNg-rDao62BLMbp1JKCQsqxqcwcfGZ23gyH72_j5q9Wdnbknj01wxnD0YLK8oDr32VUBlUqCNDB_1xgY0', content: 'VOID_PROTOCOL: START_WITH_NOTHING.' },
                { id: 'CH_03', name: 'Pain Tolerance', price: '$3', borderClass: 'border-neon-magenta', colorClass: 'text-neon-magenta', glow: 'glow-magenta', description: 'Pain is the only yardstick of progress. Understanding the difference between discomfort and damage.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC56kH_70TDlN9SyKgcd-f4074AztZff3B4A2Y04L_KrjaZF8QLytUNtIUD8Kg6a3WO04zeBGmLNAnw2T5tHnlrl2eTF3TzAmiimbqOAWPqYgFWtqkYuilGoC9YSeiixfAMX-L03LY1CIdwk7g_5GLKIyTi6dnsTqO1Uq9KqDKtfu8BqEAOcE66Eg4-tOz1rcDqsF197HDbUfR3v8h3TT-btXDZh8a98tx7-OzEzEReZGr40rMhqOWrQFUQE9u44NT25wi4j_CzHEYw', content: 'PAIN_PROTOCOL: EMBRACE_THE_BURN.' },
                { id: 'CH_04', name: 'Legacy War', price: '$3', borderClass: 'border-zinc-500', colorClass: 'text-zinc-500', glow: 'border-white/50', description: 'What will they say when you are gone? Building something that outlasts your biological existence.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmffZph4QDexI5jYr49CCmsRxz_ynZIQPdmfDkbLEgj4y7Yi5iVymxj3UTjJp9-N6J_qM7lfY0MaExbUGpf2Y_VveR4yXRoXdmk_S6TI1Bt7y3IFPyPhulf42xH4aFv45FuijLtWH3F7vF8hnHHWYIr5jSAC-IBQVyqhpazomWHorUpw14GC2KAibvKiLoZQxghokSfOqcqvR6K4x24N-YDYp-1U-ERYvjhtf9R_7G6hwrvO_pzoefIDFMy-acsOR2puoWlGsQsxup', content: 'LEGACY_PROTOCOL: BUILD_TO_LAST.' }
            ]
            for (const ch of defaultChapters) {
                await addDoc(collection(db, "chapters"), ch)
            }

            const defaultUsers = [
                { id: 'USR_01', email: 'operator@bookofgrit.com', status: 'ACTIVE', role: 'COMMANDER', joined: '2023-10-15' },
                { id: 'USR_02', email: 'recruit@bookofgrit.com', status: 'PENDING', role: 'RECRUIT', joined: '2023-11-02' }
            ]
            for (const u of defaultUsers) {
                await addDoc(collection(db, "users"), u)
            }

            const defaultSubs = [
                { id: 'SUB_001', user: 'operator@bookofgrit.com', plan: 'THE MOVEMENT', status: 'ACTIVE', nextBilling: '2023-12-15' },
                { id: 'SUB_002', user: 'recruit@bookofgrit.com', plan: 'THE MOVEMENT', status: 'PAUSED', nextBilling: '2023-12-02' }
            ]
            for (const s of defaultSubs) {
                await addDoc(collection(db, "subscriptions"), s)
            }

            fetchAllData()
        } catch (err) { console.error("Seed failed:", err) }
    }

    return (
        <div className="min-h-screen bg-black">
            <ErrorBoundary>
                <AdminDashboard
                    chapters={chapters}
                    users={users}
                    subs={subs}
                    drills={drills}
                    onAdd={handleAddChapter}
                    onUpdate={handleUpdateChapter}
                    onDelete={handleDeleteChapter}
                    onGrantAccess={handleGrantAccess}
                    onAddDrill={handleAddDrill}
                    onDeleteDrill={handleDeleteDrill}
                    onResetProtocols={handleResetProtocols}
                    onDeleteUser={handleDeleteUser}
                    onSeed={handleSeedChapters}
                    onClose={() => navigate('/')}
                />
            </ErrorBoundary>
        </div>
    )
}
