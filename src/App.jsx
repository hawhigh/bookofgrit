
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { db, auth } from './firebase'
import './index.css'
import PaymentModal from './components/PaymentModal'
import AdminDashboard from './components/AdminDashboard'

function App() {
  const [chapters, setChapters] = useState([])
  const [purchased, setPurchased] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChapters();
  }, [])

  const fetchChapters = async () => {
    try {
      console.log("FETCHING chapters from FIRESTORE");
      const q = query(collection(db, "chapters"), orderBy("id", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        firestoreId: doc.id // We keep the doc ID for deletion
      }));
      setChapters(data);
    } catch (err) {
      console.error("Failed to fetch chapters:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddChapter = async (newCh) => {
    try {
      await addDoc(collection(db, "chapters"), newCh);
      fetchChapters();
    } catch (err) {
      console.error("Failed to add chapter:", err);
    }
  }

  const handleDeleteChapter = async (firestoreId) => {
    try {
      if (!confirm("CONFIRM_PERMANENT_DELETION?")) return;
      await deleteDoc(doc(db, "chapters", firestoreId));
      fetchChapters();
    } catch (err) {
      console.error("Failed to delete chapter:", err);
    }
  }

  const handleSeedChapters = async () => {
    try {
      if (!confirm("WARNING: THIS WILL DUPLICATE DATA IF NOT EMPTY. PROCEED?")) return;
      const defaults = [
        { id: 'CH_01', name: 'The Void', price: '$3', borderClass: 'border-primary', colorClass: 'text-primary', glow: 'glow-cyan', description: 'A deep dive into the mental state required to start. When you have nothing, you have everything to gain.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsY68-HDaa2jNGV0f03uraeN1eAqz_z6KJdGELGwpfgV_IyaDsmNm2pUIj2CJopuOyrHLGHBhzaFEW4bSg7IwJ-h7tCXv37K4bHeQQNu4xjbR-Z7sIK3rK5CxFi1R4dufN5xFBtACCgXrI4cTbdlMCQMU9S-bVS557EShmVJerHO1WPZR8ZJdEu9rTI-YyCwg2-jTyA3K3D-k0fp3EWETdZu_8J9UFV0AU1nD4uKrflSJ-QCIsg1NLfo7rxfr-nITIal9-FpkOniZB', content: 'VOID_PROTOCOL: START_WITH_NOTHING.' },
        { id: 'CH_02', name: 'Pain Tolerance', price: '$3', borderClass: 'border-fire', colorClass: 'text-fire', glow: 'glow-orange', description: 'Pain is the only yardstick of progress. Understanding the difference between discomfort and damage.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuh9yajP2K2UokzC7ClDOOXipnj6G6thi0OzOv94tkXWtGDVl0dEnviC-6576FdKLS31wC_yPy4-nVxK2fqIAhvbecAFRogwdBnmndq16MPdnNr5_abVr8mAfJNY9JZHqNwSr244rPrC4nMj65BOa6xQIBuDDtGkH2yCqKygfBgMDTJsIjfNAVQHU7Gh9tNg-rDao62BLMbp1JKCQsqxqcwcfGZ23gyH72_j5q9Wdnbknj01wxnD0YLK8oDr32VUBlUqCNDB_1xgY0', content: 'PAIN_PROTOCOL: EMBRACE_THE_BURN.' },
        { id: 'CH_03', name: 'Legacy War', price: '$3', borderClass: 'border-neon-magenta', colorClass: 'text-neon-magenta', glow: 'glow-magenta', description: 'What will they say when you are gone? Building something that outlasts your biological existence.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC56kH_70TDlN9SyKgcd-f4074AztZff3B4A2Y04L_KrjaZF8QLytUNtIUD8Kg6a3WO04zeBGmLNAnw2T5tHnlrl2eTF3TzAmiimbqOAWPqYgFWtqkYuilGoC9YSeiixfAMX-L03LY1CIdwk7g_5GLKIyTi6dnsTqO1Uq9KqDKtfu8BqEAOcE66Eg4-tOz1rcDqsF197HDbUfR3v8h3TT-btXDZh8a98tx7-OzEzEReZGr40rMhqOWrQFUQE9u44NT25wi4j_CzHEYw', content: 'LEGACY_PROTOCOL: BUILD_TO_LAST.' },
        { id: 'CH_04', name: 'Final Stand', price: '$3', borderClass: 'border-zinc-500', colorClass: 'text-zinc-500', glow: 'border-white/50', description: 'The end-game manual. When everything is on the line and exhaustion sets in.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmffZph4QDexI5jYr49CCmsRxz_ynZIQPdmfDkbLEgj4y7Yi5iVymxj3UTjJp9-N6J_qM7lfY0MaExbUGpf2Y_VveR4yXRoXdmk_S6TI1Bt7y3IFPyPhulf42xH4aFv45FuijLtWH3F7vF8hnHHWYIr5jSAC-IBQVyqhpazomWHorUpw14GC2KAibvKiLoZQxghokSfOqcqvR6K4x24N-YDYp-1U-ERYvjhtf9R_7G6hwrvO_pzoefIDFMy-acsOR2puoWlGsQsxup', content: 'STAND_PROTOCOL: NO_DEFEAT.' }
      ];
      for (const ch of defaults) {
        await addDoc(collection(db, "chapters"), ch);
      }
      fetchChapters();
    } catch (err) {
      console.error("Failed to seed chapters:", err);
    }
  }

  const handleAdminAuth = () => {
    const pass = prompt("ENTER_ACCESS_KEY:");
    if (pass === "GRIT2026") {
      setAdminOpen(true);
    } else {
      alert("ACCESS_DENIED");
    }
  }

  const handleStartReading = () => {
    document.getElementById('archive-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleArchiveClick = (item) => {
    if (purchased.includes(item.id)) {
      handleDownload(item)
    } else {
      setSelectedItem(item)
      setModalOpen(true)
    }
  }

  const handleJoinMovement = () => {
    setSelectedItem({ id: 'SUB_MONTHLY', name: 'OPERATIONAL ACCESS (MONTHLY)', price: '$10' })
    setModalOpen(true)
  }

  const handlePaymentComplete = (item) => {
    if (item.id.startsWith('CH_')) {
      setPurchased(prev => [...prev, item.id])
      handleDownload(item)
    } else if (item.id === 'SUB_MONTHLY') {
      alert('ENLISTMENT SUCCESSFUL. CHECK DISCORD FOR DRILL SCHEDULE.')
    }
  }

  const handleDownload = (item) => {
    const text = item.content || `MANIFESSTO - ${item.name}\n\nNO ONE IS COMING TO SAVE YOU.\nDO THE WORK.`;
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
    <div className="concrete-texture font-display text-white selection:bg-primary selection:text-black min-h-screen">
      <div className="noise-overlay"></div>

      <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto border-x border-white/5 bg-black/60 shadow-2xl">
        {/* Header Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative pt-12 pb-16 px-6 overflow-hidden border-b-4 border-black"
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 blur-[80px]"></div>
          <div className="absolute top-20 -right-10 w-40 h-40 bg-fire/20 blur-[80px]"></div>

          <div className="relative z-10 text-center">
            <div className="mb-2 flex justify-center">
              <span className="material-symbols-outlined text-6xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">skull</span>
            </div>
            <h1 className="text-6xl graffiti-logo glitch-effect leading-none mb-6">BOOK OF<br />GRIT</h1>

            <div className="relative inline-block mb-10">
              <h2 className="text-4xl font-bombed text-white tracking-tighter leading-none drip bg-white bg-clip-text text-transparent">
                STOP MAKING<br />EXCUSES
              </h2>
              <div className="absolute -bottom-4 left-0 w-full h-1 bg-fire"></div>
            </div>

            <button
              onClick={handleStartReading}
              className="w-full bg-primary text-black font-stencil text-xl py-5 stencil-cutout shadow-[8px_8px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-[0.98] transition-all duration-100 cursor-pointer"
            >
              START READING
            </button>
          </div>
        </motion.section>

        {/* Ticker Section */}
        <div className="bg-neon-yellow py-2 ticker-wrap border-y-2 border-black">
          <div className="ticker-content flex gap-8 items-center">
            <span className="text-black font-technical font-bold text-xs uppercase tracking-tighter">
              8,400+ OPERATORS ACTIVE // MISSION LOGGED 2m AGO // 8,400+ OPERATORS ACTIVE
            </span>
            <span className="text-black font-technical font-bold text-xs uppercase tracking-tighter">
              8,400+ OPERATORS ACTIVE // MISSION LOGGED 2m AGO // 8,400+ OPERATORS ACTIVE
            </span>
          </div>
        </div>

        {/* Phase 01 Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="p-8 border-b-2 border-white/10 relative"
        >
          <div
            className="absolute inset-0 opacity-20 grayscale brightness-50"
            style={{
              backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuDrl4uGDOk0M867cc3FEsOMeXkKMdItGLFsrVthakyscjrzrJbJdmTJzOI5qC-LJo9PCnMdQe9pYFrZALBIGI4qzyNhxHpNFMTeD3b3IQiB1RWzItJ8aUQjPQWqe1vDBG8GYdIQkqv1TCwlkEc0uDfe8N0BEAuoI1YAG99VLN3iUSC3N4xLWIbaLJHVCkAMbNhPZKlrhPTD1bI2kdIBTOIi6Zkkx69z-Ur6Z13F9aiH761OzUzeyWSV-Xa2KXNSXfGHbBaD1Hfk7cEp)',
              backgroundSize: 'cover'
            }}
          ></div>
          <div className="relative z-10">
            <h3 className="font-stencil text-fire text-sm mb-2 tracking-[0.2em] uppercase">Phase_01</h3>
            <h2 className="text-4xl font-bombed mb-6 leading-none">TRUTH OVER COMFORT</h2>
            <p className="text-zinc-400 font-medium leading-relaxed mb-4">
              The world doesn't care about your potential. It only cares about what you've endured.
              <span className="text-white"> The Book of Grit is the manual for those who refuse to be forgotten.</span>
            </p>
            <div className="flex gap-2">
              <div className="h-1 w-12 bg-fire"></div>
              <div className="h-1 w-4 bg-zinc-800"></div>
              <div className="h-1 w-4 bg-zinc-800"></div>
            </div>
          </div>
        </motion.section>

        {/* Archive Section */}
        <section id="archive-section" className="p-6 bg-zinc-950/50">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-graffiti text-white uppercase tracking-tighter">THE ARCHIVE</h2>
            <span className="text-[10px] font-technical text-zinc-500 uppercase">
              {purchased.length} / {chapters.length} UNLOCKED
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center font-technical text-primary animate-pulse uppercase">decrypting_archive...</div>
          ) : chapters.length === 0 ? (
            <div className="py-20 text-center font-technical text-zinc-700 uppercase">archive_empty // connection_lost</div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10">
              {chapters.map((item, idx) => (
                <div
                  key={item.firestoreId || item.id}
                  onClick={() => handleArchiveClick(item)}
                  className={`relative group cursor-pointer ${idx % 2 !== 0 ? 'translate-y-6' : ''}`}
                >
                  <div className={`aspect-[3/4] bg-zinc-900 border-2 relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.02] ${purchased.includes(item.id) ? 'border-neon-yellow shadow-[0_0_15px_rgba(204,255,0,0.3)]' : `${item.borderClass} ${item.glow}`}`}>
                    <img
                      alt={item.name}
                      className={`w-full h-full object-cover transition-all duration-500 ${purchased.includes(item.id) ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
                      src={item.img}
                    />
                    <div className="absolute top-2 right-2 sticker-peel px-2 py-1 text-[10px] font-bold z-20">
                      {purchased.includes(item.id) ? 'OWNED' : item.price}
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-[10px] font-technical ${purchased.includes(item.id) ? 'text-neon-yellow' : item.colorClass}`}>{item.id}</p>
                    <p className="text-xs font-graffiti uppercase">{item.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="h-12"></div>
        </section>

        {/* Join Section */}
        <motion.section
          whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
          viewport={{ once: true }}
          className="p-6"
        >
          <div className="border-2 border-neon-magenta glow-magenta p-6 relative bg-black/40">
            <div className="absolute -top-3 left-4 bg-neon-magenta text-black px-3 py-0.5 text-[10px] font-bold font-technical">ENLIST_NOW</div>
            <h2 className="text-2xl font-bombed mb-4 leading-none text-white">JOIN THE MOVEMENT</h2>
            <ul className="space-y-3 mb-6 font-technical text-[10px]">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-neon-magenta text-sm">check_circle</span>
                WEEKLY OPERATIONAL DRILLS
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-neon-magenta text-sm">check_circle</span>
                PRIVATE DISCORD ACCESS
              </li>
            </ul>
            <button
              onClick={handleJoinMovement}
              className="w-full py-3 border-2 border-neon-magenta text-neon-magenta font-stencil hover:bg-neon-magenta hover:text-black active:scale-[0.98] transition-all cursor-pointer uppercase text-xs"
            >
              $10/MONTH ACCESS
            </button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="red-alert p-10 flex flex-col items-center justify-center text-center min-h-[400px] border-y-4 border-black"
        >
          <h2 className="text-6xl font-bombed text-white leading-none tracking-tighter mb-4 drop-shadow-[4px_4px_0px_#000]">
            NO ONE IS COMING TO SAVE YOU
          </h2>
          <div className="w-20 h-1 bg-white mb-8"></div>
          <p className="text-white font-stencil text-lg">DO THE WORK.</p>
        </motion.section>

        <footer className="p-8 bg-black border-t-4 border-zinc-900">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <div className="text-[10px] font-technical text-zinc-600">AUTH: CLASSIFIED_04</div>
                <button
                  onClick={handleAdminAuth}
                  className="text-[10px] font-technical text-zinc-800 text-left hover:text-fire transition-colors"
                >
                  SYS_ADMIN_LOGIN
                </button>
              </div>
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-zinc-700">lock</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[10px] font-technical text-zinc-400">
              <a className="hover:text-primary underline" href="#">TERMS_OF_GRIT</a>
              <a className="hover:text-primary underline" href="#">SECURE_DECRYPT</a>
            </div>

            <div className="pt-6 flex justify-center opacity-20">
              <h1 className="text-2xl graffiti-logo">BOOK OF GRIT</h1>
            </div>
          </div>
        </footer>

        <div className="h-8"></div>
      </div>

      <PaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        item={selectedItem}
        onComplete={handlePaymentComplete}
      />

      <AnimatePresence>
        {adminOpen && (
          <AdminDashboard
            chapters={chapters}
            onAdd={handleAddChapter}
            onDelete={handleDeleteChapter}
            onSeed={handleSeedChapters}
            onClose={() => setAdminOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
