
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function SuccessPage() {
    const location = useLocation()
    const [item, setItem] = useState(location.state?.item || null)
    const [loading, setLoading] = useState(!item)

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const itemId = queryParams.get('item_id');

        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u && itemId) {
                syncPurchaseToCloud(u.uid, itemId);
            }
        });

        if (!item && itemId) {
            fetchItemById(itemId);
        } else if (item) {
            handleDownload(item);
        }

        return () => unsubscribe();
    }, [])

    const syncPurchaseToCloud = async (uid, itemId) => {
        try {
            const userRef = doc(db, "users", uid);
            const updateData = {
                purchased: arrayUnion(itemId)
            };

            if (itemId === 'SUB_MONTHLY') {
                updateData.isSubscriber = true;
            }

            await updateDoc(userRef, updateData);
            console.log("CLOUDSYNC_COMPLETE:", itemId);
        } catch (err) {
            console.error("CLOUDSYNC_FAILED:", err);
        }
    }

    const fetchItemById = async (id) => {
        try {
            console.log("FETCHING item for success:", id);
            const q = query(collection(db, "chapters"), where("id", "==", id));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const foundItem = querySnapshot.docs[0].data();
                setItem(foundItem);
                handleDownload(foundItem);
            } else {
                console.error("No item found for ID:", id);
            }
        } catch (err) {
            console.error("Failed to fetch item for success download:", err);
        } finally {
            setLoading(false);
        }
    }

    const handleDownload = (item) => {
        // If the item has a real PDF URL, we should redirect or open that
        // Otherwise, fallback to the text manifest.
        if (item.pdfUrl) {
            window.open(item.pdfUrl, '_blank');
            return;
        }

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

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 max-w-md w-full border-4 border-primary glow-cyan bg-black p-12 shadow-[0_0_100px_rgba(0,255,255,0.1)]"
            >
                <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    className="mb-8"
                >
                    <span className="material-symbols-outlined text-8xl text-primary drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">task_alt</span>
                </motion.div>

                <h1 className="text-5xl font-bombed mb-4 leading-none italic">TRANSACTION<br />CONFIRMED</h1>

                <div className="h-1 w-20 bg-primary mx-auto mb-8"></div>

                {loading ? (
                    <div className="mb-8 p-4 border border-zinc-900 bg-black animate-pulse text-center">
                        <p className="text-[10px] font-technical text-zinc-600 uppercase">IDENTIFYING_ASSET...</p>
                    </div>
                ) : item ? (
                    <div className="mb-8 p-4 border border-zinc-800 bg-black text-center">
                        <p className="text-[10px] font-technical text-zinc-500 uppercase mb-1">Decrypted_Asset:</p>
                        <p className="text-xl font-bombed text-white uppercase">{item.name}</p>
                        <p className="text-[8px] font-technical text-primary mt-2">DOWNLOAD_STARTED...</p>
                    </div>
                ) : (
                    <div className="mb-8 p-4 border border-fire/20 bg-black text-center">
                        <p className="text-fire text-[10px] font-technical uppercase">ASSET_NOT_FOUND_IN_ARCHIVE</p>
                    </div>
                )}

                <p className="font-technical text-zinc-400 text-[10px] mb-12 leading-relaxed uppercase tracking-tighter">
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

        </div>
    )
}
