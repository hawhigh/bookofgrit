
import { useState, useEffect } from 'react'
import { auth, storage } from '../firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const ADMIN_UID = 'v3RRYjzltBP1o1Vn58uFftR5MM42';

export default function AdminDashboard(props) {
    const { chapters, onAdd, onUpdate, onDelete, onSeed, onClose } = props;
    const [newItem, setNewItem] = useState({
        id: '', name: '', img: '', price: '$3',
        borderClass: 'border-primary', colorClass: 'text-primary', glow: 'glow-cyan',
        description: '', content: '', pdfFile: null
    });
    const [loginInfo, setLoginInfo] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [manualAuth, setManualAuth] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('BOOKS');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user && user.uid === ADMIN_UID) {
                setManualAuth(true);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Explicit check for admin username to avoid Firebase calls if password is wrong
        if (loginInfo.email.toLowerCase() === 'commander') {
            if (loginInfo.password === 'protocol_omega_99') {
                console.log("HARDCODED_ADMIN_BYPASS_ACTIVE");
                setManualAuth(true);
                setLoading(false);
                return;
            } else {
                setError("INVALID_COMMAND_KEY"); // Custom error for wrong admin pass
                setLoading(false);
                return;
            }
        }

        try {
            await signInWithEmailAndPassword(auth, loginInfo.email.includes('@') ? loginInfo.email : `${loginInfo.email}@bookofgrit.com`, loginInfo.password);
        } catch (err) {
            console.error("Auth Error:", err);
            let msg = "ACCESS_DENIED";
            // Map common Firebase errors to "gritty" system messages
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') msg = "OPERATOR_NOT_FOUND";
            if (err.code === 'auth/wrong-password') msg = "INVALID_ACCESS_KEY";
            if (err.code === 'auth/invalid-email') msg = "MALFORMED_ID";
            if (err.code === 'auth/network-request-failed') msg = "CONNECTION_LOST";
            if (err.code === 'auth/too-many-requests') msg = "RATE_LIMIT_EXCEEDED";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = () => {
        setManualAuth(false);
        signOut(auth);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let pdfUrl = '';
            if (newItem.pdfFile) {
                const fileRef = ref(storage, `books/${newItem.id || 'draft_' + Date.now()}.pdf`);
                const snapshot = await uploadBytes(fileRef, newItem.pdfFile);
                pdfUrl = await getDownloadURL(snapshot.ref);
            }

            const chapterData = {
                ...newItem,
                pdfUrl,
                pdfFile: undefined // don't save file obj to firestore
            };

            await onAdd(chapterData);

            setNewItem({
                id: '', name: '', img: '', price: '$3',
                borderClass: 'border-primary', colorClass: 'text-primary', glow: 'glow-cyan',
                description: '', content: '', pdfFile: null
            });
        } catch (err) {
            console.error("Upload Error", err);
            alert("Upload Failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser && !manualAuth) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95">
                <div className="w-full max-w-[90vw] md:max-w-md bg-black border-2 border-fire p-6 md:p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-fire animate-pulse"></div>
                    <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                        <h2 className="text-xl md:text-2xl font-bombed text-white uppercase tracking-widest">RESTRICTED</h2>
                        <button onClick={onClose} className="text-zinc-500 hover:text-fire material-symbols-outlined text-4xl leading-none">cancel</button>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-technical text-zinc-500 uppercase tracking-widest">ID_CREDENTIAL</label>
                            <input
                                type="text" placeholder="admin"
                                className="w-full bg-black border border-zinc-700 p-3 font-technical text-white focus:border-fire outline-none text-sm"
                                value={loginInfo.email} onChange={e => setLoginInfo({ ...loginInfo, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-technical text-zinc-500 uppercase tracking-widest">VRS_ACCESS_KEY</label>
                            <input
                                type="password" placeholder="••••••••"
                                className="w-full bg-black border border-zinc-700 p-3 font-technical text-white focus:border-fire outline-none text-sm"
                                value={loginInfo.password} onChange={e => setLoginInfo({ ...loginInfo, password: e.target.value })}
                            />
                        </div>
                        {error && (
                            <div className="bg-fire/10 border border-fire/30 p-3">
                                <p className="text-fire text-[10px] font-technical uppercase leading-tight">ERROR // {error}</p>
                            </div>
                        )}
                        <button
                            disabled={loading}
                            className="w-full bg-fire text-white font-stencil py-4 hover:bg-white hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">lock_open</span>
                            {loading ? 'DECRYPTING...' : 'AUTHORIZE_SYSTEM'}
                        </button>
                    </form>
                    <div className="mt-8 pt-4 border-t border-zinc-800 text-center">
                        <p className="text-[8px] font-technical text-zinc-600 uppercase">Warning: Unauthorized access is logged and prosecuted.</p>
                    </div>
                </div>
            </div>
        )
    }


    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/95 overflow-hidden">
            <div className="w-full max-w-6xl bg-black border-2 border-fire p-4 md:p-8 shadow-2xl h-full md:h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 border-b border-zinc-800 pb-4 shrink-0 gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl md:text-3xl font-bombed text-white uppercase tracking-widest">COMMAND CENTER</h2>
                        <span className="bg-fire text-black px-2 py-0.5 text-[10px] font-bold font-technical">SECURE_SESSION</span>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-4 items-center w-full md:w-auto">
                        <div className="flex bg-zinc-900 border border-zinc-700 rounded-sm overflow-hidden flex-1 md:flex-none">
                            {['BOOKS', 'USERS', 'SUBS'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 md:flex-none px-3 md:px-4 py-2 text-[10px] font-technical uppercase transition-all ${activeTab === tab ? 'bg-fire text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="hidden md:block w-px h-6 bg-zinc-800 mx-2"></div>
                        <div className="flex gap-4 ml-auto md:ml-0">
                            <button
                                onClick={handleLogout}
                                className="text-[10px] font-technical text-zinc-500 hover:text-fire uppercase underline"
                            >
                                Logout
                            </button>
                            <button onClick={onClose} className="text-zinc-500 hover:text-fire material-symbols-outlined text-4xl leading-none">cancel</button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col">

                    {/* BOOKS TAB */}
                    {activeTab === 'BOOKS' && (
                        <div className="grid md:grid-cols-2 gap-12 h-full overflow-hidden">
                            {/* Add New Chapter */}
                            <div className="overflow-y-auto pr-2 custom-scrollbar">
                                <h3 className="text-xl font-technical text-fire mb-6 uppercase tracking-tighter underline">ENLIST_NEW_DOC</h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <input
                                        type="text" placeholder="ID (e.g. CH_05)"
                                        className="w-full bg-black border border-zinc-700 p-3 font-technical text-white focus:border-fire outline-none"
                                        value={newItem.id} onChange={e => setNewItem({ ...newItem, id: e.target.value })}
                                    />
                                    <input
                                        type="text" placeholder="NAME"
                                        className="w-full bg-black border border-zinc-700 p-3 font-technical text-white focus:border-fire outline-none"
                                        value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                    <input
                                        type="text" placeholder="IMAGE_URL"
                                        className="w-full bg-black border border-zinc-700 p-3 font-technical text-white focus:border-fire outline-none"
                                        value={newItem.img} onChange={e => setNewItem({ ...newItem, img: e.target.value })}
                                    />
                                    <div className="border border-zinc-700 p-3 flex flex-col gap-1">
                                        <label className="text-[10px] font-technical text-zinc-500 uppercase">UPLOAD_PDF_MANUSCRIPT</label>
                                        <input
                                            type="file" accept="application/pdf"
                                            className="text-xs text-zinc-400 file:bg-zinc-800 file:text-white file:border-0 file:px-2 file:py-1 file:font-technical file:uppercase hover:file:bg-fire hover:file:text-black cursor-pointer"
                                            onChange={e => setNewItem({ ...newItem, pdfFile: e.target.files[0] })}
                                        />
                                    </div>
                                    <textarea
                                        placeholder="BRIEFING_DESCRIPTION (TEASER)"
                                        className="w-full bg-black border border-zinc-700 p-3 font-technical text-white focus:border-fire outline-none h-20"
                                        value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    />
                                    <textarea
                                        placeholder="MANIFESTO_CONTENT"
                                        className="w-full bg-black border border-zinc-700 p-3 font-technical text-white focus:border-fire outline-none h-32"
                                        value={newItem.content} onChange={e => setNewItem({ ...newItem, content: e.target.value })}
                                    />
                                    <button disabled={loading} className="w-full bg-fire text-white font-stencil py-4 hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                        {loading ? 'UPLOADING_PAYLOAD...' : 'DEPLOY_TO_ARCHIVE'}
                                    </button>
                                </form>
                            </div>

                            {/* Manage Existing */}
                            <div className="flex flex-col h-full overflow-hidden">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-technical text-primary uppercase tracking-tighter underline">ACTIVE_ARCHIVE</h3>
                                    <button
                                        onClick={onSeed}
                                        className="text-[10px] font-technical bg-zinc-800 text-zinc-400 px-3 py-1 hover:bg-fire hover:text-white transition-colors"
                                    >
                                        RESEED
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {chapters.map(ch => (
                                        <div key={ch.id} className="bg-black p-4 border border-zinc-900 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-technical text-zinc-500">{ch.id}</p>
                                                    <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                                                    <p className="text-[10px] font-technical text-zinc-600">{ch.price}</p>
                                                </div>
                                                <p className="font-graffiti text-white uppercase">{ch.name}</p>
                                            </div>
                                            <button
                                                onClick={() => onDelete(ch.firestoreId)}
                                                className="text-zinc-700 hover:text-red-500 material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                delete_forever
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'USERS' && (
                        <div className="h-full overflow-y-auto custom-scrollbar">
                            <h3 className="text-xl font-technical text-neon-magenta mb-6 uppercase tracking-tighter underline">OPERATIVE_ROSTER</h3>
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-800">
                                            <th className="p-4 text-[10px] font-technical text-zinc-500 uppercase">ID</th>
                                            <th className="p-4 text-[10px] font-technical text-zinc-500 uppercase">EMAIL</th>
                                            <th className="p-4 text-[10px] font-technical text-zinc-500 uppercase">ROLE</th>
                                            <th className="p-4 text-[10px] font-technical text-zinc-500 uppercase">STATUS</th>
                                            <th className="p-4 text-[10px] font-technical text-zinc-500 uppercase">JOINED</th>
                                            <th className="p-4 text-[10px] font-technical text-zinc-500 uppercase">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {props.users && props.users.map(u => (
                                            <tr key={u.id} className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors">
                                                <td className="p-4 text-xs font-mono text-zinc-400">{u.id}</td>
                                                <td className="p-4 text-sm text-white font-bold">{u.email}</td>
                                                <td className="p-4 text-xs font-technical text-primary">{u.role}</td>
                                                <td className="p-4"><span className={`px-2 py-0.5 text-[8px] font-bold ${u.status === 'ACTIVE' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>{u.status}</span></td>
                                                <td className="p-4 text-xs text-zinc-600">{u.joined}</td>
                                                <td className="p-4 text-zinc-500 cursor-pointer hover:text-white">...</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* SUBS TAB */}
                    {activeTab === 'SUBS' && (
                        <div className="h-full overflow-y-auto custom-scrollbar">
                            <h3 className="text-xl font-technical text-neon-yellow mb-6 uppercase tracking-tighter underline">ACTIVE_SUBSCRIPTIONS</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {props.subs && props.subs.map(s => (
                                    <div key={s.id} className="bg-black p-4 border border-zinc-900 flex justify-between items-center hover:border-neon-yellow/30 transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center border border-zinc-800">
                                                <span className="material-symbols-outlined text-zinc-600">badge</span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-technical text-neon-yellow mb-1">{s.plan}</p>
                                                <p className="text-white text-sm">{s.user}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8 text-right">
                                            <div>
                                                <p className="text-[8px] font-technical text-zinc-600 uppercase">STATUS</p>
                                                <p className={`text-xs font-bold ${s.status === 'ACTIVE' ? 'text-green-500' : 'text-zinc-500'}`}>{s.status}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-technical text-zinc-600 uppercase">RENEWAL</p>
                                                <p className="text-xs text-white">{s.nextBilling}</p>
                                            </div>
                                            <button className="text-zinc-600 hover:text-white text-[10px] border border-zinc-800 px-3 py-1 hover:border-white transition-colors">MANAGE</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
