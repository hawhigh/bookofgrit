
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { db, auth } from '../firebase'
import AdminDashboard from '../components/AdminDashboard'

export default function AdminPage() {
    const [chapters, setChapters] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchChapters()
        const unsubscribe = auth.onAuthStateChanged((user) => {
            // Logic for auto-auth if needed
        })
        return () => unsubscribe()
    }, [])

    const fetchChapters = async () => {
        try {
            const q = query(collection(db, "chapters"), orderBy("id", "asc"))
            const querySnapshot = await getDocs(q)
            const data = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                firestoreId: doc.id
            }))
            setChapters(data)
        } catch (err) {
            console.error("Fetch failed:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleAddChapter = async (newCh) => {
        try {
            await addDoc(collection(db, "chapters"), newCh)
            fetchChapters()
        } catch (err) {
            console.error("Add failed:", err)
        }
    }

    const handleDeleteChapter = async (firestoreId) => {
        try {
            if (!confirm("CONFIRM_PERMANENT_DELETION?")) return
            await deleteDoc(doc(db, "chapters", firestoreId))
            fetchChapters()
        } catch (err) {
            console.error("Delete failed:", err)
        }
    }

    const handleSeedChapters = async () => {
        try {
            if (!confirm("WARNING: THIS WILL DUPLICATE DATA IF NOT EMPTY. PROCEED?")) return
            const defaults = [
                { id: 'CH_01', name: 'The Void', price: '$3', borderClass: 'border-primary', colorClass: 'text-primary', glow: 'glow-cyan', description: 'A deep dive into the mental state required to start.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsY68-HDaa2jNGV0f03uraeN1eAqz_z6KJdGELGwpfgV_IyaDsmNm2pUIj2CJopuOyrHLGHBhzaFEW4bSg7IwJ-h7tCXv37K4bHeQQNu4xjbR-Z7sIK3rK5CxFi1R4dufN5xFBtACCgXrI4cTbdlMCQMU9S-bVS557EShmVJerHO1WPZR8ZJdEu9rTI-YyCwg2-jTyA3K3D-k0fp3EWETdZu_8J9UFV0AU1nD4uKrflSJ-QCIsg1NLfo7rxfr-nITIal9-FpkOniZB', content: 'VOID_PROTOCOL' },
                { id: 'CH_02', name: 'Pain Tolerance', price: '$3', borderClass: 'border-fire', colorClass: 'text-fire', glow: 'glow-orange', description: 'Pain is the only yardstick of progress.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuh9yajP2K2UokzC7ClDOOXipnj6G6thi0OzOv94tkXWtGDVl0dEnviC-6576FdKLS31wC_yPy4-nVxK2fqIAhvbecAFRogwdBnmndq16MPdnNr5_abVr8mAfJNY9JZHqNwSr244rPrC4nMj65BOa6xQIBuDDtGkH2yCqKygfBgMDTJsIjfNAVQHU7Gh9tNg-rDao62BLMbp1JKCQsqxqcwcfGZ23gyH72_j5q9Wdnbknj01wxnD0YLK8oDr32VUBlUqCNDB_1xgY0', content: 'PAIN_PROTOCOL' },
            ]
            for (const ch of defaults) {
                await addDoc(collection(db, "chapters"), ch)
            }
            fetchChapters()
        } catch (err) {
            console.error("Seed failed:", err)
        }
    }

    return (
        <div className="min-h-screen bg-black">
            <AdminDashboard
                chapters={chapters}
                onAdd={handleAddChapter}
                onDelete={handleDeleteChapter}
                onSeed={handleSeedChapters}
                onClose={() => navigate('/')}
            />
        </div>
    )
}
