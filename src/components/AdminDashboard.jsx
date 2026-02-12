
import { useState, useEffect } from 'react'
import { auth, storage } from '../firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const ADMIN_UID = 'PiA69d9PK7WzdnKRJIrwgV8hCSr1';

export default function AdminDashboard(props) {
    const {
        chapters, users, subs, drills, enlistments, applications, orderIntents, supportSignals, formConfig,
        onAdd, onUpdate, onDelete, onSeed, onClose,
        onAddDrill, onDeleteDrill, onUpdateDrill, onGrantAccess,
        onResetProtocols, onDeleteUser, onDeleteEnlistment, onDeleteApplication, onDeleteOrderIntent, onDeleteSupportSignal,
        onUpdateSupportSignal, onUpdateFormConfig
    } = props;
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({
        id: '', name: '', img: '', price: '$3',
        borderClass: 'border-primary', colorClass: 'text-primary', glow: 'glow-cyan',
        description: '', content: '', pdfFile: null, imgFile: null
    });
    const [newDrill, setNewDrill] = useState({ title: '', content: '', type: 'PROTOCOL' });
    const [editingDrill, setEditingDrill] = useState(null);
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
        const admins = {
            'commander': 'protocol_omega_99',
            'vanguard': 'grit_vanguard_2026',
            'sentinel': 'grit_sentinel_2026'
        };

        if (admins[loginInfo.email.toLowerCase()]) {
            if (loginInfo.password === admins[loginInfo.email.toLowerCase()]) {
                console.log("HARDCODED_ADMIN_BYPASS_ACTIVE");
                setManualAuth(true);
                setLoading(false);
                return;
            } else {
                setError("INVALID_COMMAND_KEY");
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

    const resizeImage = (file, maxWidth = 800, maxHeight = 800) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("FAILED_TO_READ_FILE"));
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.onerror = () => reject(new Error("FAILED_TO_LOAD_IMAGE_DATA"));
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            reject(new Error("CANVAS_TO_BLOB_FAILED"));
                            return;
                        }
                        const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });
                        resolve(resizedFile);
                    }, 'image/jpeg', 0.8);
                };
            };

            // Safety timeout
            setTimeout(() => reject(new Error("RESIZE_PROTOCOL_TIMEOUT")), 10000);
        });
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setNewItem({
            id: item.id || '',
            name: item.name || '',
            img: item.img || '',
            price: item.price || '$3',
            borderClass: item.borderClass || 'border-primary',
            colorClass: item.colorClass || 'text-primary',
            glow: item.glow || 'glow-cyan',
            description: item.description || '',
            content: item.content || '',
            pdfFile: null,
            imgFile: null
        });
        setActiveTab('BOOKS');
    };

    const cancelEdit = () => {
        setEditingItem(null);
        setNewItem({
            id: '', name: '', img: '', price: '$3',
            borderClass: 'border-primary', colorClass: 'text-primary', glow: 'glow-cyan',
            description: '', content: '', pdfFile: null, imgFile: null
        });
    };

    const [logs, setLogs] = useState("PEER_NETWORK_LOGS_PENDING...");

    const [isGenerating, setIsGenerating] = useState(false);
    const generateAiDrill = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/generate-drill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficulty: 'OPERATOR' })
            });
            const data = await res.json();
            if (data.title) {
                setNewDrill({
                    title: data.title,
                    type: data.type || 'PROTOCOL',
                    content: data.content
                });
                alert("AI_SIGNAL_INTERCEPTED_AND_DECODED");
            }
        } catch (err) {
            console.error("AI Generation Failed", err);
            alert("SIGNAL_CORRUPT: AI_HANDSHAKE_FAILED");
        } finally {
            setIsGenerating(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch(`/ops.php?action=read_logs&t=${Date.now()}`, {
                headers: { 'X-Operator-Key': import.meta.env.VITE_OPERATOR_KEY }
            });
            const data = await res.json();
            if (data.status === 'success') setLogs(data.logs);
        } catch (err) { console.error("Logs Fetch Error", err); }
    };

    useEffect(() => {
        if (activeTab === 'LOGS') fetchLogs();
    }, [activeTab]);


    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('action', 'upload');
        const res = await fetch(`/ops.php?t=${Date.now()}`, {
            method: 'POST',
            headers: {
                'X-Operator-Key': import.meta.env.VITE_OPERATOR_KEY
            },
            body: formData
        });
        const data = await res.json();
        if (data.status === 'success') return data.url;
        throw new Error(data.message || "UPLOAD_FAILED");
    };



    const [uploadStatus, setUploadStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setUploadStatus('INITIALIZING...');
        try {
            let pdfUrl = editingItem?.pdfUrl || '';
            if (newItem.pdfFile) {
                setUploadStatus(`UPLOADING_MANUSCRIPT: ${newItem.pdfFile.name}...`);
                pdfUrl = await uploadFile(newItem.pdfFile);
            }

            let imgUrl = newItem.img;
            if (newItem.imgFile) {
                setUploadStatus(`OPTIMIZING_COVER: ${newItem.imgFile.name}...`);
                const resized = await resizeImage(newItem.imgFile);
                setUploadStatus(`UPLOADING_COVER...`);
                imgUrl = await uploadFile(resized);
            }

            // Fallback for cover if missing
            if (!imgUrl) {
                imgUrl = 'https://thebookofgrit.com/bookofgrit_logo_v3.png';
            }

            setUploadStatus('SYNCHRONIZING_WITH_FIRESTORE...');
            const chapterData = {
                id: newItem.id,
                name: newItem.name,
                img: imgUrl,
                price: newItem.price || '$3',
                borderClass: newItem.borderClass || 'border-primary',
                colorClass: newItem.colorClass || 'text-primary',
                glow: newItem.glow || 'glow-cyan',
                description: newItem.description || '',
                content: newItem.content || '',
                pdfUrl: pdfUrl || ''
            };

            if (editingItem) {
                await onUpdate(editingItem.firestoreId, chapterData);
            } else {
                await onAdd(chapterData);
            }

            setEditingItem(null);
            setNewItem({
                id: '', name: '', img: '', price: '$3',
                borderClass: 'border-primary', colorClass: 'text-primary', glow: 'glow-cyan',
                description: '', content: '', pdfFile: null, imgFile: null
            });
            setUploadStatus('');
            alert(editingItem ? "ASSET_UPDATED_SUCCESSFULLY" : "ASSET_DEPLOYED_SUCCESSFULLY");
        } catch (err) {
            console.error("Upload Error", err);
            setError("DEPLOYMENT_FAILED: " + err.message);
            setUploadStatus('');
        } finally {
            setLoading(false);
        }
    };

    const handleDrillSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingDrill) {
                await onUpdateDrill(editingDrill.id, newDrill);
                setEditingDrill(null);
            } else {
                await onAddDrill({ ...newDrill, timestamp: new Date() });
            }
            setNewDrill({ title: '', content: '', type: 'PROTOCOL' });
        } catch (err) {
            console.error("Drill Upload Error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDrillEdit = (drill) => {
        setEditingDrill(drill);
        setNewDrill({ title: drill.title, content: drill.content, type: drill.type });
    };

    if (!currentUser && !manualAuth) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 animate-scan">
                <div className="w-full max-w-[90vw] md:max-w-md bg-black border-2 border-fire p-6 md:p-8 shadow-[0_0_50px_rgba(255,77,0,0.2)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-fire animate-pulse"></div>
                    <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-fire animate-pulse">terminal</span>
                            <h2 className="text-xl md:text-2xl font-bombed text-white uppercase tracking-widest">AUTHENTICATION_REQUIRED</h2>
                        </div>
                        <button onClick={onClose} className="text-zinc-500 hover:text-fire material-symbols-outlined text-2xl leading-none transition-colors">close</button>
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
                            {['BOOKS', 'DRILLS', 'USERS', 'SUBS', 'ENLISTMENTS', 'APPLICATIONS', 'INTENTS', 'SIGNALS', 'CONFIG', 'LOGS'].map(tab => (
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
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-technical text-fire uppercase tracking-tighter underline">
                                        {editingItem ? 'MODIFY_ARCHIVE_DATA' : 'ENLIST_NEW_DOC'}
                                    </h3>
                                    {editingItem && (
                                        <button onClick={cancelEdit} className="text-[10px] font-technical bg-zinc-800 text-zinc-400 px-3 py-1 hover:bg-white hover:text-black transition-colors">CANCEL_EDIT</button>
                                    )}
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-technical text-zinc-600 uppercase">ASSET_IDENTIFIER</label>
                                            <input
                                                type="text" placeholder="ID (e.g. CH_05)"
                                                className="w-full bg-black border border-zinc-700 p-3 font-technical text-white focus:border-fire outline-none"
                                                value={newItem.id} onChange={e => setNewItem({ ...newItem, id: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-technical text-zinc-600 uppercase">MARKET_VALUATION</label>
                                            <input
                                                type="text" placeholder="PRICE (e.g. $10)"
                                                className="w-full bg-black border border-zinc-700 p-3 font-technical text-fire focus:border-white outline-none"
                                                value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-technical text-zinc-600 uppercase">CODENAME</label>
                                        <input
                                            type="text" placeholder="NAME"
                                            className="w-full bg-black border border-zinc-700 p-3 font-technical text-white focus:border-fire outline-none"
                                            value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="border border-zinc-700 p-3 flex flex-col gap-2 bg-zinc-900/20">
                                            <label className="text-[10px] font-technical text-zinc-500 uppercase flex justify-between">
                                                <span>COVER_ASSET</span>
                                                <span className="material-symbols-outlined text-xs">image</span>
                                            </label>
                                            <input
                                                type="file" accept="image/*"
                                                className="text-xs text-zinc-400 file:bg-zinc-800 file:text-white file:border-0 file:px-2 file:py-1 file:font-technical file:uppercase hover:file:bg-fire hover:file:text-black cursor-pointer"
                                                onChange={e => setNewItem({ ...newItem, imgFile: e.target.files[0] })}
                                            />
                                            {newItem.imgFile ? (
                                                <div className="mt-2 text-[8px] font-technical text-fire flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[10px]">image_search</span>
                                                    COVER_STAGED: {newItem.imgFile.name} (AUTO_OPTIMIZING)
                                                </div>
                                            ) : newItem.img && (
                                                <div className="mt-2 flex items-center gap-2 border border-zinc-800 p-1 bg-black/40">
                                                    <img src={newItem.img} alt="Preview" className="w-8 h-8 object-cover border border-zinc-700" />
                                                    <p className="text-[8px] text-zinc-600 truncate uppercase tracking-tighter">Existing_Cover_Linked</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="border border-zinc-700 p-3 flex flex-col gap-2 bg-zinc-900/20">
                                            <label className="text-[10px] font-technical text-zinc-500 uppercase flex justify-between">
                                                <span>PDF_MANUSCRIPT</span>
                                                <span className="material-symbols-outlined text-xs">picture_as_pdf</span>
                                            </label>
                                            <input
                                                type="file" accept="application/pdf"
                                                className="text-xs text-zinc-400 file:bg-zinc-800 file:text-white file:border-0 file:px-2 file:py-1 file:font-technical file:uppercase hover:file:bg-fire hover:file:text-black cursor-pointer"
                                                onChange={e => setNewItem({ ...newItem, pdfFile: e.target.files[0] })}
                                            />
                                            {newItem.pdfFile ? (
                                                <div className="mt-2 text-[8px] font-technical text-primary flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[10px]">check_circle</span>
                                                    FILE_STAGED: {newItem.pdfFile.name}
                                                </div>
                                            ) : (
                                                <p className="text-[8px] text-zinc-600 mt-2 uppercase tracking-tighter">No_File_Selected</p>
                                            )}
                                        </div>
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
                                    <button disabled={loading} className={`w-full ${editingItem ? 'bg-white text-black' : 'bg-fire text-white'} font-stencil py-4 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase`}>
                                        {loading ? uploadStatus : (editingItem ? 'UPDATE_ARCHIVE' : 'DEPLOY_TO_ARCHIVE')}
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
                                        <div key={ch.id} className={`bg-black p-4 border flex justify-between items-center group transition-colors ${editingItem?.id === ch.id ? 'border-white' : 'border-zinc-900 hover:border-zinc-700'}`}>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-technical text-zinc-500">{ch.id}</p>
                                                    <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                                                    <p className="text-[10px] font-technical text-fire">{ch.price}</p>
                                                    {ch.pdfUrl ? (
                                                        <span className="text-[8px] bg-green-900/30 text-green-500 px-1 border border-green-900 font-technical">PDF_READY</span>
                                                    ) : (
                                                        <span className="text-[8px] bg-red-900/30 text-red-500 px-1 border border-red-900 font-technical">NO_PDF</span>
                                                    )}
                                                </div>
                                                <p className="font-bombed text-white uppercase tracking-wider">{ch.name}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(ch)}
                                                    className="text-zinc-700 hover:text-white material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    edit
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm(`PERMANENTLY_DELETE_ASSET: ${ch.name}?`)) {
                                                            setLoading(true);
                                                            try {
                                                                // 1. Delete Physical Files
                                                                if (ch.pdfUrl) {
                                                                    const formData = new FormData();
                                                                    formData.append('action', 'delete');
                                                                    formData.append('fileUrl', ch.pdfUrl);
                                                                    await fetch(`/ops.php?t=${Date.now()}`, {
                                                                        method: 'POST',
                                                                        headers: { 'X-Operator-Key': import.meta.env.VITE_OPERATOR_KEY },
                                                                        body: formData
                                                                    });
                                                                }
                                                                if (ch.img) {
                                                                    const formData = new FormData();
                                                                    formData.append('action', 'delete');
                                                                    formData.append('fileUrl', ch.img);
                                                                    await fetch(`/ops.php?t=${Date.now()}`, {
                                                                        method: 'POST',
                                                                        headers: { 'X-Operator-Key': import.meta.env.VITE_OPERATOR_KEY },
                                                                        body: formData
                                                                    });
                                                                }
                                                                // 2. Delete Database Record
                                                                await onDelete(ch.firestoreId);
                                                                alert("ASSET_WIPED_FROM_EXISTENCE");
                                                            } catch (err) {
                                                                console.error("Deletion Failed", err);
                                                                alert("DELETION_ERROR_CHECK_LOGS");
                                                            } finally {
                                                                setLoading(false);
                                                            }
                                                        }
                                                    }}
                                                    className="text-zinc-700 hover:text-red-500 material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    delete_forever
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* DRILLS TAB */}
                    {activeTab === 'DRILLS' && (
                        <div className="grid md:grid-cols-2 gap-12 h-full overflow-hidden">
                            <div className="overflow-y-auto pr-2 custom-scrollbar">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-technical text-neon-magenta uppercase tracking-tighter underline">
                                        {editingDrill ? 'RECONFIGURE_PROTOCOL' : 'DEPLOY_DRILL'}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={generateAiDrill}
                                        disabled={isGenerating}
                                        className="text-[10px] font-technical text-white border border-neon-magenta px-3 py-1 hover:bg-neon-magenta hover:text-black transition-all flex items-center gap-2 animate-pulse"
                                    >
                                        <span className="material-symbols-outlined text-xs">psychology</span>
                                        {isGenerating ? 'DECODING_AI_SIGNAL...' : 'GENERATE_VIA_AI'}
                                    </button>
                                </div>
                                <form onSubmit={handleDrillSubmit} className="space-y-4">
                                    <input
                                        type="text" placeholder="DRILL_TITLE"
                                        className="w-full bg-black border border-zinc-700 p-3 font-technical text-white focus:border-neon-magenta outline-none"
                                        value={newDrill.title} onChange={e => setNewDrill({ ...newDrill, title: e.target.value })}
                                    />
                                    <select
                                        className="w-full bg-black border border-zinc-700 p-3 font-technical text-white focus:border-neon-magenta outline-none"
                                        value={newDrill.type} onChange={e => setNewDrill({ ...newDrill, type: e.target.value })}
                                    >
                                        <option value="PROTOCOL">PROTOCOL</option>
                                        <option value="MANIFESTO">MANIFESTO</option>
                                        <option value="TACTICAL">TACTICAL</option>
                                        <option value="CLEARANCE">CLEARANCE</option>
                                    </select>
                                    <textarea
                                        placeholder="DRILL_CONTENT (TECHNICAL_BREIFING)"
                                        className="w-full bg-black border border-zinc-700 p-3 font-technical text-white focus:border-neon-magenta outline-none h-64"
                                        value={newDrill.content} onChange={e => setNewDrill({ ...newDrill, content: e.target.value })}
                                    />
                                    <button disabled={loading} className="w-full bg-neon-magenta text-black font-stencil py-4 hover:bg-white transition-all disabled:opacity-50">
                                        {loading ? 'BROADCASTING...' : (editingDrill ? 'UPDATE_SIGNAL' : 'INITIALIZE_BROADCAST')}
                                    </button>
                                </form>
                            </div>
                            <div className="flex flex-col h-full overflow-hidden">
                                <h3 className="text-xl font-technical text-zinc-500 mb-6 uppercase tracking-tighter underline">ACTIVE_SIGNALS</h3>
                                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {drills && drills.map(d => (
                                        <div key={d.id} className="bg-black p-4 border border-zinc-900 flex justify-between items-center group hover:border-neon-magenta/30 transition-colors">
                                            <div>
                                                <p className="text-[8px] font-technical text-zinc-600 mb-1">{d.timestamp?.toDate().toLocaleDateString()}</p>
                                                <p className="font-bombed text-white uppercase tracking-widest">{d.title}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDrillEdit(d)}
                                                    className="text-zinc-700 hover:text-white material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    edit
                                                </button>
                                                <button
                                                    onClick={() => onDeleteDrill(d.id)}
                                                    className="text-zinc-700 hover:text-fire material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    delete_sweep
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'USERS' && (
                        <div className="h-full overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-technical text-neon-magenta uppercase tracking-tighter underline">OPERATIVE_ROSTER</h3>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            const emails = users.map(u => u.email).join(', ');
                                            navigator.clipboard.writeText(emails);
                                            alert("ALL_USER_EMAILS_COPIED");
                                        }}
                                        className="text-[10px] font-technical text-zinc-500 hover:text-neon-magenta border border-zinc-900 px-2 py-1"
                                    >
                                        COPY_ALL_EMAILS
                                    </button>
                                    <span className="text-[10px] font-technical text-zinc-500 uppercase">{users?.length || 0}_OPERATIVES_ONLINE</span>
                                </div>
                            </div>
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
                                        {users && users.map(u => (
                                            <tr key={u.id} className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors">
                                                <td className="p-4 text-xs font-mono text-zinc-400">{u.id}</td>
                                                <td className="p-4 text-sm text-white font-bold">{u.email}</td>
                                                <td className="p-4 text-xs font-technical text-primary">{u.role}</td>
                                                <td className="p-4"><span className={`px-2 py-0.5 text-[8px] font-bold ${u.status === 'ACTIVE' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>{u.status}</span></td>
                                                <td className="p-4 text-xs text-zinc-600">{u.joined}</td>
                                                <td className="p-4 flex gap-2">
                                                    <button
                                                        onClick={() => onGrantAccess(u.id)}
                                                        className="text-[10px] bg-primary/10 text-primary border border-primary/30 px-2 py-1 hover:bg-primary hover:text-black transition-all font-technical"
                                                    >
                                                        GRANT_ACCESS
                                                    </button>
                                                    <button
                                                        onClick={() => onResetProtocols(u.id)}
                                                        className="text-[10px] bg-zinc-900 text-zinc-600 border border-zinc-800 px-2 py-1 hover:text-white transition-all font-technical"
                                                    >
                                                        RESET_PROTOCOLS
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteUser(u.id)}
                                                        className="text-[10px] bg-fire/10 text-fire border border-fire/30 px-2 py-1 hover:bg-fire hover:text-white transition-all font-technical"
                                                    >
                                                        TERMINATE
                                                    </button>
                                                </td>
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
                                {subs && subs.map(s => (
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
                                            <button
                                                onClick={() => alert(`OPERATOR_QUERY: ${s.user}\nTARGET_PLAN: ${s.plan}\nCURRENT_STATUS: ${s.status}\n\nManual status overrides must be performed via Stripe Dashboard.`)}
                                                className="text-zinc-600 hover:text-white text-[10px] border border-zinc-800 px-3 py-1 hover:border-white transition-colors"
                                            >
                                                MANAGE
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* LOGS TAB */}
                    {activeTab === 'ENLISTMENTS' && (
                        <div className="space-y-6 h-full overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-technical text-primary uppercase underline italic">PRE_ENLISTMENT_DATABASE</h3>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            const emails = enlistments.map(e => e.email).join(', ');
                                            navigator.clipboard.writeText(emails);
                                            alert("ALL_EMAILS_COPIED_TO_CLIPBOARD");
                                        }}
                                        className="text-[10px] font-technical text-zinc-500 hover:text-primary border border-zinc-900 px-2 py-1"
                                    >
                                        COPY_ALL_EMAILS
                                    </button>
                                    <span className="text-[10px] font-technical text-zinc-500 uppercase">{enlistments?.length || 0}_ENTRIES_FOUND</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="grid gap-4">
                                    {enlistments && enlistments.map((e, idx) => (
                                        <div key={e.id} className="bg-zinc-950 border border-zinc-900 p-6 flex justify-between items-center group hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-6">
                                                <span className="text-zinc-800 font-technical text-sm">{String(idx + 1).padStart(3, '0')}</span>
                                                <div>
                                                    <p className="text-sm font-bombed text-white tracking-widest uppercase">{e.callsign || 'ANONYMOUS_RECRUIT'} // {e.email}</p>
                                                    <p className="text-[8px] font-technical text-zinc-600 uppercase mt-1">
                                                        HANDSHAKE: {e.timestamp?.toDate().toLocaleString()} // STATUS: {e.status}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <button
                                                    onClick={() => {
                                                        const promo = prompt("ENTER_PROMO_CODE:");
                                                        if (promo) alert(`SIGNAL_SENT: Promo ${promo} transmitted to ${e.email}`);
                                                    }}
                                                    className="text-[10px] font-technical text-zinc-500 hover:text-primary transition-colors flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-sm">send</span>
                                                    SEND_SIGNAL
                                                </button>
                                                <button
                                                    onClick={() => onDeleteEnlistment(e.id)}
                                                    className="text-zinc-800 hover:text-fire material-symbols-outlined transition-colors"
                                                >
                                                    delete_forever
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!enlistments || enlistments.length === 0) && (
                                        <div className="p-20 border border-dashed border-zinc-900 text-center space-y-4">
                                            <span className="material-symbols-outlined text-zinc-800 text-5xl">person_search</span>
                                            <p className="text-[10px] font-technical text-zinc-700 uppercase">NO_RECRUITS_IN_QUEUE</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'APPLICATIONS' && (
                        <div className="space-y-6 h-full overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-technical text-neon-magenta uppercase underline italic">CLEARANCE_REQUEST_QUEUE</h3>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            const emails = applications.map(a => a.email).join(', ');
                                            navigator.clipboard.writeText(emails);
                                            alert("APPLICANT_EMAILS_COPIED");
                                        }}
                                        className="text-[10px] font-technical text-zinc-500 hover:text-neon-magenta border border-zinc-900 px-2 py-1"
                                    >
                                        COPY_MAILING_LIST
                                    </button>
                                    <span className="text-[10px] font-technical text-zinc-500 uppercase">{applications?.length || 0}_PENDING_REVIEWS</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="grid gap-6">
                                    {applications && applications.map((app, idx) => (
                                        <div key={app.id} className="bg-zinc-950 border border-zinc-900 overflow-hidden group hover:border-neon-magenta/30 transition-all">
                                            <div className="bg-zinc-900/50 p-4 border-b border-zinc-800 flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-zinc-700 font-technical text-xs">{String(idx + 1).padStart(3, '0')}</span>
                                                    <div>
                                                        <p className="text-xs font-bombed text-white tracking-widest uppercase">{app.callsign} // {app.email}</p>
                                                        <p className="text-[8px] font-technical text-zinc-600 uppercase">RECEIVED: {app.timestamp?.toDate().toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                {formConfig?.questions?.map((qData, idx) => {
                                                    const label = typeof qData === 'string' ? qData : (qData?.label || `QUESTION_0${idx + 1}`);
                                                    return (
                                                        <div key={idx}>
                                                            <p className="text-[7px] font-technical text-zinc-500 uppercase mb-1">Q0{idx + 1}: {label}</p>
                                                            <p className="text-xs font-technical text-zinc-300 italic bg-black/40 p-3 border-l border-zinc-800">
                                                                "{app[`q${idx + 1}`] || 'N/A'}"
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="bg-black/60 p-4 border-t border-zinc-900 flex justify-between items-center">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => alert(`Reviewing status for operator ${app.callsign}...`)}
                                                        className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-[8px] font-technical text-zinc-400 hover:text-white transition-colors uppercase"
                                                    >
                                                        MARK_AS_REVIEWED
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => onDeleteApplication(app.id)}
                                                    className="text-zinc-800 hover:text-fire material-symbols-outlined transition-colors"
                                                >
                                                    delete_sweep
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!applications || applications.length === 0) && (
                                        <div className="p-20 border border-dashed border-zinc-900 text-center space-y-4">
                                            <span className="material-symbols-outlined text-zinc-800 text-5xl">folder_shared</span>
                                            <p className="text-[10px] font-technical text-zinc-700 uppercase">QUEUE_EMPTY // NO_ACTIVE_APPLICATIONS</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'INTENTS' && (
                        <div className="space-y-6 h-full overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-technical text-neon-yellow uppercase underline italic">PRE_PURCHASE_INTEL</h3>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            const emails = orderIntents.map(i => i.email).join(', ');
                                            navigator.clipboard.writeText(emails);
                                            alert("INTENT_EMAILS_COPIED");
                                        }}
                                        className="text-[10px] font-technical text-zinc-500 hover:text-neon-yellow border border-zinc-900 px-2 py-1"
                                    >
                                        COPY_EMAILS
                                    </button>
                                    <span className="text-[10px] font-technical text-zinc-500 uppercase">{orderIntents?.length || 0}_INTENTS_LOGGED</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="grid gap-4">
                                    {orderIntents && orderIntents.map((intent, idx) => (
                                        <div key={intent.id} className="bg-zinc-950 border border-zinc-900 p-6 flex justify-between items-center group hover:border-neon-yellow/30 transition-all">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <span className="text-[8px] font-technical text-zinc-700">{String(idx + 1).padStart(3, '0')}</span>
                                                    <p className="text-xs font-technical text-white uppercase tracking-widest">{intent.callsign} // {intent.email}</p>
                                                    <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-[8px] font-technical text-zinc-500">{intent.itemName}</span>
                                                </div>
                                                <p className="text-[10px] font-technical text-zinc-400 italic">"{intent.mission}"</p>
                                                <p className="text-[7px] font-technical text-zinc-800 uppercase mt-2">TIMESTAMP: {intent.timestamp?.toDate().toLocaleString()}</p>
                                            </div>
                                            <button
                                                onClick={() => onDeleteOrderIntent(intent.id)}
                                                className="text-zinc-800 hover:text-fire material-symbols-outlined transition-colors ml-4"
                                            >
                                                delete_forever
                                            </button>
                                        </div>
                                    ))}
                                    {(!orderIntents || orderIntents.length === 0) && (
                                        <div className="p-20 border border-dashed border-zinc-900 text-center space-y-4">
                                            <span className="material-symbols-outlined text-zinc-800 text-5xl">inventory_2</span>
                                            <p className="text-[10px] font-technical text-zinc-700 uppercase">NO_INTENT_SIGNALS_DETECTED</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'SIGNALS' && (
                        <div className="space-y-6 h-full overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-technical text-fire uppercase underline italic">SUPPORT_COMMUNICATIONS</h3>
                                <span className="text-[10px] font-technical text-zinc-500 uppercase">{supportSignals?.length || 0}_PENDING_SIGNALS</span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="grid gap-4">
                                    {supportSignals && supportSignals.map((signal, idx) => (
                                        <div key={signal.id} className={`bg-zinc-950 border ${signal.status === 'PROCESSED' ? 'border-zinc-900 opacity-60' : 'border-fire/40 shadow-[0_0_15px_rgba(255,100,0,0.05)]'} p-6 flex flex-col group hover:border-fire transition-all`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-sm font-technical text-white uppercase tracking-widest">{signal.email}</p>
                                                        {signal.status === 'PROCESSED' ? (
                                                            <span className="text-[7px] font-technical bg-zinc-800 text-zinc-500 px-1 border border-zinc-700">ARCHIVED</span>
                                                        ) : (
                                                            <span className="text-[7px] font-technical bg-fire/20 text-fire px-1 border border-fire/40 animate-pulse">NEW_COMMUNICATION</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[7px] font-technical text-zinc-800 uppercase mt-1">TIMESTAMP: {signal.timestamp?.toDate().toLocaleString()}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => onUpdateSupportSignal(signal.id, { status: signal.status === 'PROCESSED' ? 'NEW' : 'PROCESSED' })}
                                                        className={`material-symbols-outlined text-sm ${signal.status === 'PROCESSED' ? 'text-zinc-700 hover:text-fire' : 'text-fire hover:text-white'}`}
                                                        title={signal.status === 'PROCESSED' ? 'Restore to Inbox' : 'Mark as Processed'}
                                                    >
                                                        {signal.status === 'PROCESSED' ? 'unarchive' : 'check_circle'}
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteSupportSignal(signal.id)}
                                                        className="text-zinc-800 hover:text-fire material-symbols-outlined transition-colors"
                                                    >
                                                        delete_forever
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-black border border-zinc-900 font-technical text-xs text-zinc-400 italic leading-relaxed">
                                                {signal.message}
                                            </div>
                                        </div>
                                    ))}
                                    {(!supportSignals || supportSignals.length === 0) && (
                                        <div className="p-20 border border-dashed border-zinc-900 text-center space-y-4">
                                            <span className="material-symbols-outlined text-zinc-800 text-5xl">mark_email_read</span>
                                            <p className="text-[10px] font-technical text-zinc-700 uppercase">NO_NEW_SIGNALS_PENDING</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'CONFIG' && (
                        <div className="space-y-6 h-full overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-technical text-white uppercase underline italic">RECRUITMENT_PROTOCOL_CONFIG</h3>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.target);
                                        const questions = [0, 1, 2, 3, 4].map(idx => ({
                                            label: formData.get(`q${idx + 1}_label`),
                                            type: formData.get(`q${idx + 1}_type`)
                                        }));
                                        onUpdateFormConfig({ questions });
                                    }}
                                    className="space-y-6 bg-zinc-950 border border-zinc-900 p-8"
                                >
                                    <p className="text-[10px] font-technical text-zinc-500 uppercase mb-4 italic">DEFINE_THE_5_QUESTIONS_FOR_WANNABE_OPERATORS</p>
                                    {[0, 1, 2, 3, 4].map(idx => {
                                        const qData = formConfig?.questions?.[idx];
                                        const label = typeof qData === 'string' ? qData : (qData?.label || '');
                                        const type = typeof qData === 'string' ? 'LONG' : (qData?.type || 'LONG');

                                        return (
                                            <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-zinc-900 bg-black/30">
                                                <div className="md:col-span-3 space-y-2">
                                                    <label className="text-[10px] font-technical text-zinc-600 uppercase">QUESTION_0{idx + 1}_TEXT</label>
                                                    <input
                                                        name={`q${idx + 1}_label`}
                                                        defaultValue={label}
                                                        className="w-full bg-black border border-zinc-800 p-3 font-technical text-white focus:border-primary outline-none text-xs"
                                                        placeholder={`ENTER_QUESTION_ALPHA_${idx + 1}`}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-technical text-zinc-600 uppercase">FIELD_TYPE</label>
                                                    <select
                                                        name={`q${idx + 1}_type`}
                                                        defaultValue={type}
                                                        className="w-full bg-black border border-zinc-800 p-3 font-technical text-white focus:border-primary outline-none text-xs"
                                                    >
                                                        <option value="SHORT">SHORT_TEXT</option>
                                                        <option value="LONG">LONG_TEXT</option>
                                                    </select>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <button type="submit" className="w-full py-4 bg-primary text-black font-stencil text-xl hover:bg-white transition-all">
                                        RE-ENCRYPT_FORM_PROTOCOL
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'LOGS' && (
                        <div className="h-full flex flex-col gap-4">
                            <div className="flex justify-between items-center mb-2">
                                <div>
                                    <h3 className="text-xl font-bombed text-white uppercase tracking-tighter italic">FULFILLMENT_AUDIT_TRAIL</h3>
                                    <p className="text-[8px] font-technical text-zinc-500 uppercase tracking-widest">LIVE_SERVER_DATA // SECURE_FETCH_ACTIVE</p>
                                </div>
                                <button onClick={fetchLogs} className="bg-zinc-900 border border-zinc-800 px-4 py-2 text-[10px] font-technical text-zinc-400 hover:text-white hover:border-white transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">terminal</span>
                                    RE-SYNC_TERMINAL
                                </button>
                            </div>

                            <div className="flex-1 bg-black border-2 border-zinc-900 p-0 font-mono text-[10px] overflow-hidden flex flex-col shadow-2xl">
                                <div className="bg-zinc-900/50 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                                        <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                                        <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
                                    </div>
                                    <span className="text-[8px] text-zinc-500 uppercase tracking-widest">AUDIT_PROTOCOL_v4.2.0</span>
                                </div>

                                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-2">
                                    {logs === "NO_LOGS_ON_DISK_CURRENTLY" ? (
                                        <div className="h-full flex flex-col items-center justify-center text-zinc-700 animate-pulse">
                                            <span className="material-symbols-outlined text-4xl mb-4">folder_open</span>
                                            <p className="font-technical tracking-widest">ARCHIVE_TEMPORARILY_EMPTY</p>
                                        </div>
                                    ) : (
                                        logs.split('\n').filter(line => line.trim()).map((line, i) => {
                                            const isSuccess = line.includes('SUCCESS') || line.includes('GRANTED');
                                            const isError = line.includes('ERROR') || line.includes('FAILED');
                                            const isInfo = line.includes('RECEIVED') || line.includes('FETCHED');

                                            let color = 'text-zinc-500';
                                            if (isSuccess) color = 'text-green-500';
                                            if (isError) color = 'text-red-500';
                                            if (isInfo) color = 'text-primary';

                                            return (
                                                <div key={i} className="flex gap-4 group hover:bg-zinc-900/50 p-1 -ml-1 transition-colors">
                                                    <span className="text-zinc-800 select-none">{String(i + 1).padStart(3, '0')}</span>
                                                    <span className={`${color} leading-relaxed`}>
                                                        {line}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="bg-zinc-950 px-4 py-2 border-t border-zinc-900 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
                                            <span className="text-[8px] text-zinc-500 uppercase">System_Online</span>
                                        </div>
                                        <span className="text-zinc-800">|</span>
                                        <span className="text-[8px] text-zinc-600 uppercase">Last_Update: {new Date().toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] text-zinc-700 uppercase">Root@GRIT_SERVER_NODE</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
