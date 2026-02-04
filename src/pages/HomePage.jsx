import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase'
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import '../index.css'
import PaymentModal from '../components/PaymentModal'

export default function HomePage() {
  const [chapters, setChapters] = useState([])
  const [purchased, setPurchased] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [callsign, setCallsign] = useState('')
  const navigate = useNavigate()


  useEffect(() => {
    // Listen for Auth State Changes
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Fetch User Data from Firestore
        const userRef = doc(db, "users", u.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setCallsign(userData.callsign || '');
          if (userData.purchased) {
            setPurchased(userData.purchased);
          }
        }
      } else {
        setCallsign('');
        setPurchased([]);
      }
    });

    fetchChapters();
    return () => unsubscribe();
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


  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google Auth Error:", err);
    }
  }

  const handleSignOut = async () => {
    await signOut(auth);
  }

  const handleInitCallsign = async (val) => {
    if (!user || !val) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        callsign: val.toUpperCase(),
        email: user.email,
        purchased: purchased
      }, { merge: true });
      setCallsign(val.toUpperCase());
    } catch (err) {
      console.error("Failed to init callsign:", err);
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
    setSelectedItem({
      id: 'SUB_MONTHLY',
      name: 'THE MOVEMENT',
      price: '$10/MO',
      description: 'Elite access to the global collective. Includes weekly drills, private discord connectivity, and full archive decryption. No excuses allowed.'
    })
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
    const doc = new jsPDF();

    // Set background to black (simulated with dark grey rect as full black drains toner)
    // Actually for a text document, white background with black text is better for printing,
    // but we can add a cool cover page.

    // COVER PAGE
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 297, 'F'); // Full page black

    doc.setTextColor(255, 77, 0); // Fire orange
    doc.setFont("courier", "bold");
    doc.setFontSize(22);
    doc.text("CLASSIFIED ASSET", 105, 40, null, null, "center");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(30);
    doc.text(item.name.toUpperCase(), 105, 120, null, null, "center");

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`ID: ${item.id}`, 105, 135, null, null, "center");
    doc.text("AUTHORIZATION: GRIT_MASTER", 105, 140, null, null, "center");

    doc.addPage();

    // CONTENT PAGE
    doc.setTextColor(0, 0, 0);
    doc.setFont("times", "normal");
    doc.setFontSize(12);

    const content = item.content || "NO CONTENT FOUND.\n\nSTAY HARD.";
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 15, 20);

    doc.save(`${item.id}_${item.name.replace(/\s/g, '_')}_DECRYPTED.pdf`);
  }

  return (
    <div className="concrete-texture font-display text-white selection:bg-primary selection:text-black min-h-screen">

      <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-black">
        {/* Header Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative pt-6 pb-12 px-6 border-b-4 border-black"
        >
          {/* Removed Status/ID text as requested */}

          <div className="relative z-10 text-center">
            <div className="mb-2 flex justify-center">
              <img src="/bookofgrit_logo_v3.png" alt="BOOK OF GRIT LOGO" className="w-64 md:w-80 h-auto drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
            </div>

            <div className="relative inline-block mb-8">
              <h2 className="text-4xl font-bombed text-white tracking-tighter leading-none drip bg-white bg-clip-text text-transparent uppercase">
                No comfort.<br />Just grit.
              </h2>
              <div className="absolute -bottom-4 left-0 w-full h-1 bg-fire"></div>
            </div>

            <button
              onClick={handleStartReading}
              className="w-full bg-primary text-black font-stencil text-xl py-5 stencil-cutout shadow-[8px_8px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-[0.98] transition-all duration-100 cursor-pointer"
            >
              ACQUIRE MANUALS
            </button>

            <button
              onClick={() => document.getElementById('subs-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full mt-4 bg-neon-magenta text-black font-stencil text-xl py-5 stencil-cutout shadow-[8px_8px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-[0.98] transition-all duration-100 cursor-pointer"
            >
              ENTER TO GRIT
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
          className="p-8 border-b-2 border-white/10 relative bg-black"
        >
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

        {/* User Auth Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="p-8 bg-black border-b-2 border-white/5"
        >
          {!user ? (
            <div className="space-y-6">
              <h3 className="font-technical text-[10px] text-zinc-500 mb-4 uppercase tracking-widest text-center">INITIALIZE_OPERATOR_ENLISTMENT</h3>
              <button
                onClick={handleGoogleLogin}
                className="w-full bg-white text-black font-stencil py-4 flex items-center justify-center gap-4 hover:bg-primary transition-all cursor-pointer"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />
                ENLIST WITH GOOGLE
              </button>
              <div className="text-center">
                <span className="text-zinc-700 font-technical text-[8px] uppercase tracking-widest">--- OR_USE_SECURE_CHANNEL ---</span>
              </div>
              <p className="text-zinc-600 font-technical text-[8px] text-center uppercase">Email Authentication available in Phase 02</p>
            </div>
          ) : !callsign ? (
            <div className="space-y-6">
              <h3 className="font-technical text-[10px] text-zinc-500 mb-4 uppercase tracking-widest text-center">ENCRYPT_OPERATOR_IDENTITY</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ENTER_CALLSIGN"
                  id="callsign-input"
                  className="flex-1 bg-black border border-zinc-800 p-3 font-technical text-white focus:border-primary outline-none text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleInitCallsign(e.target.value);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const val = document.getElementById('callsign-input').value;
                    handleInitCallsign(val);
                  }}
                  className="bg-primary text-black font-stencil px-4 text-xs"
                >
                  ENCRYPT
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center bg-zinc-900/30 p-4 border border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <div>
                  <p className="text-[8px] font-technical text-zinc-500 uppercase">Authenticated_Operator:</p>
                  <p className="text-xs font-bombed text-white tracking-widest">{callsign}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-[8px] font-technical text-zinc-700 hover:text-fire uppercase underline"
              >
                Terminate_Session
              </button>
            </div>
          )}
        </motion.section>

        {/* Archive Section */}
        <section id="archive-section" className="p-6 bg-black">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-graffiti text-white uppercase tracking-tighter">FIELD MANUALS</h2>
            <span className="text-[10px] font-technical text-zinc-500 uppercase">
              {purchased.length} / {chapters.length} UNLOCKED
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center font-technical text-primary animate-pulse uppercase">decrypting_archive...</div>
          ) : chapters.length === 0 ? (
            <div className="py-20 text-center font-technical text-zinc-700 uppercase">archive_empty // connection_lost</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-10">
              {chapters.map((item, idx) => (
                <div
                  key={item.firestoreId || item.id}
                  onClick={() => handleArchiveClick(item)}
                  className={`relative group cursor-pointer ${idx % 2 !== 0 ? 'md:translate-y-6' : ''}`}
                >
                  <div className={`aspect-[3/4] bg-zinc-900 border-2 relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.02] ${purchased.includes(item.id) ? 'border-neon-yellow shadow-[0_0_15px_rgba(204,255,0,0.3)]' : `${item.borderClass} ${item.glow}`}`}>
                    <img
                      alt={item.name}
                      className={`w-full h-full object-cover transition-all duration-500 ${purchased.includes(item.id) ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
                      src={item.img}
                    />
                    <div className="absolute top-2 right-2 sticker-peel px-2 py-1.5 text-[10px] font-bold z-20 leading-none">
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

        <motion.section
          id="subs-section"
          whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
          viewport={{ once: true }}
          className="p-6 mb-12"
        >
          <div className="border-4 border-neon-magenta p-10 relative bg-black shadow-[0_0_40px_rgba(255,0,255,0.1)]">
            <div className="absolute -top-4 left-6 bg-neon-magenta text-black px-4 py-1 text-xs font-bold font-technical tracking-widest uppercase">ENLIST_NOW</div>

            <div className="mb-10 text-center">
              <h2 className="text-4xl md:text-5xl font-bombed mb-4 leading-none text-white italic drop-shadow-[0_0_10px_rgba(255,0,255,0.3)]">REWRITE YOUR REALITY</h2>
              <div className="h-0.5 w-16 bg-neon-magenta mx-auto mb-6"></div>
              <p className="font-technical text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto uppercase tracking-tighter">
                Individuality is a weakness. The collective is an accelerator. Most people fail because they lack the network to hold them accountable.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 mb-12">
              {[
                { title: 'TACTICAL_DRILLS', color: 'primary', desc: 'Custom tailored physical and mental protocols delivered weekly to ensure exponential growth.' },
                { title: 'DIRECT_SIGNAL', color: 'neon-magenta', desc: 'Bypass the noise of public socials. Direct access to the inner circle and decentralized discord backbone.' },
                { title: 'RESOURCE_DUMP', color: 'fire', desc: 'Immediate unlocking of the full grit archive, including classified strategy decks and behavioral templates.' }
              ].map((benefit, i) => (
                <div key={i} className="flex gap-6 items-start border-l-2 border-zinc-900 pl-6 hover:border-neon-magenta transition-colors group">
                  <div className="pt-1">
                    <span className="material-symbols-outlined text-neon-magenta opacity-50 group-hover:opacity-100 transition-all font-bold">bolt</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bombed text-[12px] mb-2 tracking-widest underline decoration-zinc-800">{benefit.title}</h4>
                    <p className="text-zinc-500 font-technical text-[10px] leading-snug">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleJoinMovement}
              className="w-full py-6 bg-neon-magenta text-black font-stencil text-2xl hover:bg-white active:scale-[0.98] transition-all cursor-pointer shadow-[0_10px_30px_rgba(255,0,255,0.2)]"
            >
              $10/MONTH // JOIN THE 8,400+
            </button>
            <p className="text-center mt-6 text-zinc-700 font-technical text-[8px] uppercase tracking-[0.4em]">NO_REFUNDS // NO_EXCUSES // NO_RETREAT</p>
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
    </div>
  )
}
