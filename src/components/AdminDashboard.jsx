
import { useState } from 'react'

export default function AdminDashboard({ chapters, onAdd, onUpdate, onDelete, onClose }) {
    const [newItem, setNewItem] = useState({
        id: '', name: '', img: '', price: '$3',
        borderClass: 'border-primary', colorClass: 'text-primary', glow: 'glow-cyan',
        description: '', content: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(newItem);
        setNewItem({
            id: '', name: '', img: '', price: '$3',
            borderClass: 'border-primary', colorClass: 'text-primary', glow: 'glow-cyan',
            description: '', content: ''
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 overflow-y-auto">
            <div className="w-full max-w-4xl bg-zinc-900 border-2 border-fire p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                    <h2 className="text-3xl font-bombed text-white uppercase tracking-widest">COMMAND CENTER</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-fire material-symbols-outlined text-4xl">cancel</button>
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
                                        <p className="text-xs font-technical text-zinc-500">{ch.id}</p>
                                        <p className="font-graffiti text-white uppercase">{ch.name}</p>
                                    </div>
                                    <button
                                        onClick={() => onDelete(ch.id)}
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
