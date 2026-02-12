import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { useNavigate, Link } from 'react-router-dom'
import { db, auth } from '../firebase'
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth'
import '../index.css'
import PaymentModal from '../components/PaymentModal'

export default function HomePage() {
  const [chapters, setChapters] = useState([])
  const [purchased, setPurchased] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [isSubscriber, setIsSubscriber] = useState(false)
  const [callsign, setCallsign] = useState('')
  const [drills, setDrills] = useState([])
  const [enlistEmail, setEnlistEmail] = useState('')
  const [enlistCallsign, setEnlistCallsign] = useState('')
  const [enlisted, setEnlisted] = useState(false)
  const [appForm, setAppForm] = useState({ q1: '', q2: '', q3: '', q4: '', q5: '' })
  const [formConfig, setFormConfig] = useState({ questions: ["LOADING...", "LOADING...", "LOADING...", "LOADING...", "LOADING..."] })
  const [appSubmitted, setAppSubmitted] = useState(false)
  const [supportForm, setSupportForm] = useState({ email: '', message: '' })
  const [supportSubmitted, setSupportSubmitted] = useState(false)
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
          setIsSubscriber(userData.isSubscriber || userData.purchased?.includes('SUB_MONTHLY'));
        }
      } else {
        setCallsign('');
        setPurchased([]);
        setIsSubscriber(false);
      }
    });

    const fetchConfig = async () => {
      const docSnap = await getDoc(doc(db, "form_config", "recruitment"));
      if (docSnap.exists()) {
        setFormConfig(docSnap.data());
      }
    };

    fetchChapters();
    fetchDrills();
    fetchConfig();
    return () => unsubscribe();
  }, [])

  const fetchDrills = async () => {
    try {
      const q = query(collection(db, "drills"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDrills(data);
    } catch (err) { console.error("Failed to fetch drills:", err); }
  }

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


  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState('google') // 'google', 'login', 'signup'
  const [authError, setAuthError] = useState(null)

  const handleGoogleLogin = async () => {
    try {
      setAuthError(null)
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google Auth Error:", err);
      setAuthError(err.message);
    }
  }

  const handleEmailAuth = async (isSignup) => {
    try {
      setAuthError(null)
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err) {
      console.error("Email Auth Error:", err);
      setAuthError(err.message.replace('Firebase: ', ''))
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
        purchased: purchased,
        isSubscriber: isSubscriber
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

  const handleAdminAuth = () => {
    navigate('/admin')
  }

  const handleDownload = (item) => {
    // If physical PDF exists, use the secure gatekeeper
    if (item.pdfUrl) {
      const filename = item.pdfUrl.split('/').pop();
      const downloadUrl = `/download.php?file=${filename}&uid=${user?.uid || 'anonymous'}`;
      window.open(downloadUrl, '_blank');
      return;
    }

    // Fallback: Generate PDF from text content
    const doc = new jsPDF();
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(255, 77, 0);
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
    doc.setTextColor(0, 0, 0);
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    const content = item.content || "NO CONTENT FOUND.\n\nSTAY HARD.";
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 15, 20);
    doc.save(`${item.id}_${item.name.replace(/\s/g, '_')}_DECRYPTED.pdf`);
  }

  const handleEnlistment = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "enlistments"), {
        email: enlistEmail,
        callsign: enlistCallsign,
        timestamp: new Date(),
        status: 'PENDING'
      });
      setEnlisted(true);
      setEnlistEmail('');
      setEnlistCallsign('');
    } catch (err) {
      console.error("Enlistment failed", err);
      alert("CONNECTION_STRENGTH_LOW: ENLISTMENT_FAILED");
    }
  };

  const handleApplication = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("UNAUTHORIZED: OPERATOR_MUST_LOG_IN_TO_APPLY");
      return;
    }
    try {
      await addDoc(collection(db, "applications"), {
        uid: user.uid,
        email: user.email,
        callsign: callsign || 'ANONYMOUS',
        ...appForm,
        timestamp: new Date(),
        status: 'PENDING_REVIEW'
      });
      setAppSubmitted(true);
    } catch (err) {
      console.error("Application failed", err);
      alert("CRITICAL_ERROR: UPLOAD_FAILED");
    }
  };

  const handleSupportSignal = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "support_signals"), {
        ...supportForm,
        timestamp: new Date(),
        status: 'NEW'
      });
      setSupportSubmitted(true);
    } catch (err) {
      console.error("Support signal failed", err);
      alert("TRANSMISSION_FAILED: SIGNAL_CORRUPT");
    }
  };

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

            {isSubscriber ? (
              <Link to="/dashboard" className="block w-full mt-4">
                <button
                  className="w-full bg-neon-magenta text-black font-stencil text-xl py-5 stencil-cutout shadow-[8px_8px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-[0.98] transition-all duration-100 cursor-pointer"
                >
                  ENTER THE DEEP WEB
                </button>
              </Link>
            ) : (
              <button
                onClick={() => document.getElementById('subs-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full mt-4 bg-neon-magenta text-black font-stencil text-xl py-5 stencil-cutout shadow-[8px_8px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-[0.98] transition-all duration-100 cursor-pointer"
              >
                ENTER TO GRIT
              </button>
            )}
          </div>
        </motion.section>

        {/* Ticker Section */}
        <div className="bg-neon-yellow py-2 ticker-wrap border-y-2 border-black overflow-hidden">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            className="ticker-content flex gap-8 items-center whitespace-nowrap"
          >
            {drills.length > 0 ? (
              drills.map((d, i) => (
                <span key={i} className="text-black font-technical font-bold text-xs uppercase tracking-tighter">
                  SIGNAL_REVEALED: {d.title} // TYPE: {d.type} // MISSION_START: {d.timestamp?.toDate().toLocaleTimeString()} //
                </span>
              ))
            ) : (
              <>
                <span className="text-black font-technical font-bold text-xs uppercase tracking-tighter">
                  8,400+ OPERATORS ACTIVE // MISSION LOGGED 2m AGO // SECURE_LINE_ACTIVE //
                </span>
                <span className="text-black font-technical font-bold text-xs uppercase tracking-tighter">
                  8,400+ OPERATORS ACTIVE // MISSION LOGGED 2m AGO // SECURE_LINE_ACTIVE //
                </span>
              </>
            )}
            {/* DUPLICATE FOR SEAMLESS LOOP */}
            {drills.length > 0 && drills.map((d, i) => (
              <span key={`dup-${i}`} className="text-black font-technical font-bold text-xs uppercase tracking-tighter">
                SIGNAL_REVEALED: {d.title} // TYPE: {d.type} // MISSION_START: {d.timestamp?.toDate().toLocaleTimeString()} //
              </span>
            ))}
          </motion.div>
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
              <div className="w-full space-y-4">
                {authMode === 'google' && (
                  <>
                    <button
                      onClick={() => setAuthMode('signup')}
                      className="w-full py-4 px-6 bg-primary text-black font-stencil hover:bg-white transition-colors flex items-center justify-center gap-3 shadow-[4px_4px_0px_#333] uppercase"
                    >
                      CREATE_NEW_IDENTITY
                    </button>
                    <div className="text-center mt-4">
                      <button onClick={() => setAuthMode('login')} className="text-[10px] font-technical text-zinc-600 hover:text-white uppercase transition-colors">
                        Authorized_Personnel_Login
                      </button>
                    </div>
                  </>
                )}

                {(authMode === 'login' || authMode === 'signup') && (
                  <div className="space-y-3 animate-fade-in">
                    <input
                      type="email"
                      placeholder="OPERATOR_EMAIL"
                      className="w-full bg-black border border-zinc-700 p-3 font-technical text-white text-xs placeholder-zinc-600 focus:border-primary outline-none uppercase"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="ACCESS_CODE"
                      className="w-full bg-black border border-zinc-700 p-3 font-technical text-white text-xs placeholder-zinc-600 focus:border-primary outline-none uppercase"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {authError && <p className="text-fire text-[10px] font-technical">{authError}</p>}

                    <button
                      onClick={() => handleEmailAuth(authMode === 'signup')}
                      className="w-full py-3 bg-primary text-black font-stencil hover:bg-white transition-colors uppercase"
                    >
                      {authMode === 'signup' ? 'ESTABLISH_IDENTITY' : 'AUTHENTICATE'}
                    </button>

                    <button
                      onClick={() => {
                        setAuthMode('google');
                        setAuthError(null);
                      }}
                      className="w-full text-[10px] font-technical text-zinc-500 hover:text-white uppercase"
                    >
                      ABORT_MANUAL_OVERRIDE
                    </button>
                  </div>
                )}
              </div>
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
          {/* Join Mailing List / Enlistment Section */}
          <div className="my-20 p-10 bg-zinc-950 border-2 border-zinc-900 relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="max-w-xl mx-auto text-center space-y-8 relative z-10">
              <div className="inline-block border border-primary/30 px-4 py-1.5 bg-primary/5">
                <span className="text-[10px] font-technical text-primary uppercase tracking-[0.3em]">SECURE_ENLISTMENT_LINE_OPEN</span>
              </div>

              {enlisted ? (
                <div className="space-y-4 animate-reveal">
                  <span className="material-symbols-outlined text-primary text-5xl">check_circle</span>
                  <h3 className="text-2xl font-bombed text-white uppercase italic">IDENTITY_LOGGED</h3>
                  <p className="text-xs font-technical text-zinc-500 uppercase tracking-widest">YOU_ARE_NOW_ON_THE_GRID. WATCH_FOR_SIGNALS.</p>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-4xl font-bombed uppercase italic text-white tracking-widest">JOIN_THE_MOVEMENT</h2>
                    <p className="text-[10px] font-technical text-zinc-600 uppercase tracking-widest leading-relaxed mt-4">
                      RESERVE YOUR ACCESS TO THE DEEP WEB. BE THE FIRST TO RECEIVE OMEGA_PROTOCOL ALERTS, PROMOTIONAL CODES, AND REDACTED INTEL.
                    </p>
                  </div>

                  <form onSubmit={handleEnlistment} className="mt-8 space-y-4">
                    <div className="flex flex-col md:flex-row gap-2">
                      <input
                        type="text"
                        required
                        placeholder="ENTER_CALLSIGN"
                        className="bg-black border border-zinc-800 p-4 font-technical text-white focus:border-primary outline-none text-xs w-full md:w-1/3"
                        value={enlistCallsign}
                        onChange={(e) => setEnlistCallsign(e.target.value)}
                      />
                      <input
                        type="email"
                        required
                        placeholder="ENTER_SECURE_EMAIL"
                        className="flex-1 bg-black border border-zinc-800 p-4 font-technical text-white focus:border-primary outline-none text-xs"
                        value={enlistEmail}
                        onChange={(e) => setEnlistEmail(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="bg-primary text-black font-stencil px-8 py-4 text-sm hover:bg-white transition-all transform hover:scale-[1.02]"
                      >
                        ENLIST_NOW
                      </button>
                    </div>
                    <p className="text-[8px] font-technical text-zinc-800 uppercase">SIGNAL_ENCRYPTION_ACTIVE // WE_ONLY_SEND_TRUTH.</p>
                  </form>
                </>
              )}
            </div>

            {/* Background scanline effect for the card */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-1 w-full animate-scan" style={{ top: '30%' }}></div>
            </div>
          </div>

          {/* Detailed Application Form */}
          <div id="application-section" className="my-20 p-10 bg-black border-2 border-fire relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 font-technical text-[8px] text-fire animate-pulse uppercase">HIGH_CLEARANCE_REQUIRED</div>

            <div className="max-w-2xl mx-auto space-y-10">
              <div className="text-center">
                <h2 className="text-4xl font-bombed text-white uppercase italic tracking-widest">CLEARANCE_APPLICATION</h2>
                <p className="text-[10px] font-technical text-zinc-500 uppercase tracking-widest mt-4">TERMINAL_REF: 404-APPLICATION_PROTOCOL</p>
              </div>

              {appSubmitted ? (
                <div className="p-12 border border-fire/30 bg-fire/5 text-center space-y-6 animate-reveal">
                  <span className="material-symbols-outlined text-fire text-6xl">shield_with_heart</span>
                  <h3 className="text-2xl font-bombed text-white uppercase italic">INTEL_RECEIVED</h3>
                  <p className="text-[10px] font-technical text-zinc-400 uppercase tracking-widest leading-relaxed">
                         // YOUR_APPLICATION_HAS_BEEN_ENCRYPTED_AND_STORED_IN_THE_OMEGA_VAULT.<br />
                         // CURRENT_QUEUE_POSITION: CALCULATING...<br />
                         // EXPECT_CONTACT_IF_INTEREST_IS_RECIPROCATED.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleApplication} className="space-y-6">
                  <div className="space-y-6">
                    {formConfig.questions.map((qData, idx) => {
                      const label = typeof qData === 'string' ? qData : (qData?.label || `QUESTION_0${idx + 1}`);
                      const type = typeof qData === 'string' ? 'LONG' : (qData?.type || 'LONG');

                      return (
                        <div key={idx} className="space-y-2">
                          <label className="text-[10px] font-technical text-zinc-500 uppercase">{label}</label>
                          {type === 'SHORT' ? (
                            <input
                              required
                              type="text"
                              className="w-full bg-zinc-900 border border-zinc-800 p-4 font-technical text-white focus:border-fire outline-none text-xs"
                              value={appForm[`q${idx + 1}`]}
                              onChange={e => setAppForm({ ...appForm, [`q${idx + 1}`]: e.target.value })}
                            />
                          ) : (
                            <textarea
                              required
                              rows="3"
                              className="w-full bg-zinc-900 border border-zinc-800 p-4 font-technical text-white focus:border-fire outline-none text-xs"
                              value={appForm[`q${idx + 1}`]}
                              onChange={e => setAppForm({ ...appForm, [`q${idx + 1}`]: e.target.value })}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-fire text-black font-stencil py-6 text-lg hover:bg-white transition-all transform hover:scale-[1.01] shadow-[0_5px_15px_rgba(255,100,0,0.2)]"
                  >
                    SUBMIT_FOR_REVIEW
                  </button>

                  {!user && (
                    <p className="text-[8px] font-technical text-fire uppercase text-center animate-pulse">
                      // ERROR: AUTHENTICATION_REQUIRED_TO_APPLY //
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>

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
                  <div className={`aspect-[3/4] bg-zinc-900 border-2 relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.02] animate-scan ${purchased.includes(item.id) ? 'border-neon-yellow shadow-[0_0_15px_rgba(204,255,0,0.3)]' : `${item.borderClass} ${item.glow}`}`}>
                    <img
                      alt={item.name}
                      className={`w-full h-full object-cover transition-all duration-500 ${purchased.includes(item.id) ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
                      src={item.img}
                    />
                    <div className={`absolute top-2 right-2 sticker-peel px-2 py-1.5 text-[10px] font-bold z-20 leading-none ${purchased.includes(item.id) ? 'bg-neon-yellow text-black' : 'bg-white text-black'}`}>
                      {purchased.includes(item.id) ? 'ACCESS_DATA' : 'ACQUIRE_TARGET'}
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
          <div className="border-4 border-neon-magenta p-10 relative bg-black shadow-[0_0_40px_rgba(255,0,255,0.1)] animate-scan magenta-scan">
            <div className="absolute -top-4 left-6 bg-neon-magenta text-black px-4 py-1 text-xs font-bold font-technical tracking-widest uppercase z-20">ENLIST_NOW</div>

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

            {isSubscriber ? (
              <div className="w-full py-6 bg-green-500/20 border border-green-500/50 text-green-500 font-stencil text-2xl text-center uppercase tracking-widest">
                OPERATIONAL_CLEARANCE_ACTIVE
              </div>
            ) : (
              <button
                onClick={handleJoinMovement}
                className="w-full py-6 bg-neon-magenta text-black font-stencil text-2xl hover:bg-white active:scale-[0.98] transition-all cursor-pointer shadow-[0_10px_30px_rgba(255,0,255,0.2)]"
              >
                $10/MONTH // JOIN THE 8,400+
              </button>
            )}
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

        <section className="py-20 px-8 bg-zinc-950/20 border-t border-zinc-900">
          {!supportSubmitted ? (
            <div className="max-w-2xl mx-auto border border-zinc-900 p-8 bg-zinc-950/50">
              <h4 className="text-xl font-bombed text-white uppercase mb-6 italic tracking-widest underline decoration-fire">TRANSMIT_DIRECT_SIGNAL</h4>
              <form onSubmit={handleSupportSignal} className="space-y-6">
                <input
                  required
                  type="email"
                  placeholder="RETURN_COORDINATES (EMAIL)"
                  className="w-full bg-black border border-zinc-800 p-4 font-technical text-white focus:border-fire outline-none text-xs"
                  value={supportForm.email}
                  onChange={e => setSupportForm({ ...supportForm, email: e.target.value })}
                />
                <textarea
                  required
                  rows="4"
                  placeholder="ENCODED_MESSAGE_DETAILS..."
                  className="w-full bg-black border border-zinc-800 p-4 font-technical text-white focus:border-fire outline-none text-xs"
                  value={supportForm.message}
                  onChange={e => setSupportForm({ ...supportForm, message: e.target.value })}
                />
                <button type="submit" className="w-full py-4 bg-fire text-white font-stencil text-xl hover:bg-white hover:text-black transition-all">
                  EXECUTE_BURST_TRANSMISSION
                </button>
              </form>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto border border-fire/30 p-12 bg-fire/5 text-center space-y-4">
              <span className="material-symbols-outlined text-fire text-5xl animate-pulse">sensors</span>
              <h4 className="text-2xl font-bombed text-white uppercase tracking-tighter">SIGNAL_RECEIVED</h4>
              <p className="text-[10px] font-technical text-zinc-500 uppercase">WE_WILL_REFLECT_AND_RESPOND_IF_DEEMED_NECESSARY.</p>
              <button
                onClick={() => setSupportSubmitted(false)}
                className="text-[8px] font-technical text-zinc-700 hover:text-white underline uppercase"
              >
                SEND_ANOTHER_SIGNAL
              </button>
            </div>
          )}
        </section>

        <footer className="p-8 bg-black border-t-4 border-zinc-900">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <div className="text-[10px] font-technical text-zinc-600">AUTH: CLASSIFIED_04</div>
                <button
                  onClick={handleAdminAuth}
                  className="text-[10px] font-technical text-zinc-600 text-left hover:text-fire transition-colors"
                >
                  SYS_ADMIN_LOGIN
                </button>
              </div>
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-zinc-700">lock</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[10px] font-technical text-zinc-400">
              <Link className="hover:text-primary underline" to="/terms">TERMS_OF_GRIT</Link>
              <Link className="hover:text-primary underline" to="/privacy">SECURE_DECRYPT</Link>
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
