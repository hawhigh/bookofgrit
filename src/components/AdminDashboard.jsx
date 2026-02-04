
import { useState } from 'react'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'

export default function AdminDashboard({ chapters, onAdd, onUpdate, onDelete, onSeed, onClose }) {
    const [newItem, setNewItem] = useState({
        id: '', name: '', img: '', price: '$3',
        borderClass: 'border-primary', colorClass: 'text-primary', glow: 'glow-cyan',
        description: '', content: ''
    });
    const [loginInfo, setLoginInfo] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const user = auth.currentUser;

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, loginInfo.email, loginInfo.password);
        } catch (err) {
            setError(err.message === 'Firebase: Error (auth/configuration-not-found).'
                ? 'EMAIL_AUTH_NOT_ENABLED_IN_CONSOLE'
                : err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = () => signOut(auth);

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(newItem);
        setNewItem({
            id: '', name: '', img: '', price: '$3',
            borderClass: 'border-primary', colorClass: 'text-primary', glow: 'glow-cyan',
            description: '', content: ''
        });
    };

    if (!user) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95">
                <div className="w-full max-w-md bg-zinc-900 border-2 border-fire p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-fire animate-pulse"></div>
                    <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                        <h2 className="text-2xl font-bombed text-white uppercase tracking-widest">RESTRICTED</h2>
                        <button onClick={onClose} className="text-zinc-500 hover:text-fire material-symbols-outlined text-4xl">cancel</button>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-technical text-zinc-500 uppercase tracking-widest">ID_CREDENTIAL</label>
                            <input
                                type="email" placeholder="admin@bookofgrit.com"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 overflow-y-auto">
            <div className="w-full max-w-4xl bg-zinc-900 border-2 border-fire p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bombed text-white uppercase tracking-widest">COMMAND CENTER</h2>
                        <span className="bg-fire text-black px-2 py-0.5 text-[10px] font-bold font-technical">SECURE_SESSION</span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={onSeed}
                            className="text-[10px] font-technical bg-zinc-800 text-zinc-400 px-3 py-1 hover:bg-fire hover:text-white transition-colors"
                        >
                            RESEED_ARCHIVE
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-[10px] font-technical text-zinc-500 hover:text-fire uppercase underline"
                        >
                            Logout
                        </button>
                        <button onClick={onClose} className="text-zinc-500 hover:text-fire material-symbols-outlined text-4xl">cancel</button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Add New Chapter */}
                    <div>
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
                            <button className="w-full bg-fire text-white font-stencil py-4 hover:bg-white hover:text-black transition-all">
                                DEPLOY_TO_ARCHIVE
                            </button>
                        </form>
                    </div>

                    {/* Manage Existing */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-technical text-primary mb-6 uppercase tracking-tighter underline">ACTIVE_ARCHIVE</h3>
                        <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {chapters.map(ch => (
                                <div key={ch.id} className="bg-black/50 p-4 border border-zinc-800 flex justify-between items-center group">
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
            </div>
        </div>
    )
}
