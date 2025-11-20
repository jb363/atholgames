const CACHE_NAME = 'treehouse-games-v16-superwhy';

const CACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_URLS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    })
  );
});
```eof

### Step 2: Update `index.html`
This file includes the new **Super Reader** game engines and character themes.

```html:index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#fef3c7">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Treehouse Games">
    <title>Treehouse Games</title>

    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link rel="manifest" href="manifest.json">

    <style>
        /* RESET & BASE */
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; background-color: #fef3c7; font-family: system-ui, -apple-system, sans-serif; user-select: none; touch-action: manipulation; }
        #root { width: 100%; min-height: 100vh; display: flex; flex-direction: column; }
        
        /* 3D BUTTONS */
        .btn-3d { transition: all 0.1s; box-shadow: 0px 8px 0px 0px rgba(0,0,0,0.2); transform: translateY(0); cursor: pointer; }
        .btn-3d:active { transform: translateY(8px); box-shadow: 0px 0px 0px 0px rgba(0,0,0,0); }

        /* REALISTIC 3D EMOJI EFFECT */
        .emoji-3d {
            filter: drop-shadow(0 10px 15px rgba(0,0,0,0.3));
            transform: perspective(500px) rotateX(10deg);
            transition: transform 0.3s;
        }

        /* ANIMATIONS */
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        
        /* SUPER WHY COLORS */
        .bg-super-green { background-color: #4ade80; } /* Super Why Green */
        .bg-alpha-orange { background-color: #fb923c; } /* Alpha Pig Orange */
        .bg-wonder-red { background-color: #f87171; } /* Wonder Red */
        .bg-presto-purple { background-color: #c084fc; } /* Princess Presto */

        /* LOADING SCREEN */
        #loading {
            position: fixed; inset: 0; z-index: 10000;
            background: radial-gradient(circle at 50% 50%, #1e1b4b 0%, #020617 100%);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            color: #fde047; transition: opacity 0.5s;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    
    <div id="loading">
        <div style="position: relative; width: 180px; height: 180px; margin-bottom: 30px;">
            <div style="width: 100%; height: 100%; background: #22c55e; border-radius: 20px; border: 8px solid #15803d; box-shadow: 0 0 20px #22c55e; display: flex; align-items: center; justify-content: center; animation: float 3s infinite ease-in-out;">
                <div style="font-size: 80px;">💻</div>
            </div>
        </div>
        <div id="loading-text" style="font-size: 24px; font-family: serif; letter-spacing: 2px; text-shadow: 0 0 10px #FDE047;">Powering Up...</div>
        <button id="start-btn" style="display: none; margin-top: 30px; background: #eab308; color: #422006; border: 4px solid #fef08a; padding: 20px 40px; border-radius: 50px; font-size: 24px; font-weight: 900; cursor: pointer; box-shadow: 0 0 20px #eab308;">▶ TAP TO START</button>
    </div>

    <script type="text/babel">
        const { useState, useEffect, useRef, useMemo } = React;

        // --- AUDIO ENGINE ---
        const synth = window.speechSynthesis;
        let audioCtx = null;

        const initAudio = () => {
            if (!audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioCtx = new AudioContext();
            }
            if (audioCtx.state === 'suspended') audioCtx.resume();
            // Wake up speech
            const u = new SpeechSynthesisUtterance("");
            synth.speak(u);
        };

        const speak = (text) => {
            if (!synth) return;
            synth.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.rate = 0.9; u.pitch = 1.2;
            synth.speak(u);
        };

        const playTone = (freq, type='sine', dur=0.1) => {
            if(!audioCtx) initAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type; osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(); osc.stop(audioCtx.currentTime + dur);
        };

        // --- GAME 1: ALPHA PIG'S LETTERS ---
        const AlphaGame = ({ onBack }) => {
            const [target, setTarget] = useState('A');
            const [options, setOptions] = useState(['A', 'B', 'C']);
            const [score, setScore] = useState(0);

            const generate = () => {
                const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                const t = alpha[Math.floor(Math.random() * 26)];
                setTarget(t);
                
                let opts = [t];
                while(opts.length < 3) {
                    const r = alpha[Math.floor(Math.random() * 26)];
                    if(!opts.includes(r)) opts.push(r);
                }
                setOptions(opts.sort(() => Math.random() - 0.5));
            };

            useEffect(generate, []);

            const check = (l) => {
                if(l === target) {
                    playTone(600, 'sine', 0.1); playTone(800, 'sine', 0.2);
                    speak(`Lickety Letters! That is ${l}!`);
                    setScore(s => s + 1);
                    setTimeout(generate, 1500);
                } else {
                    playTone(200, 'sawtooth', 0.2);
                    speak("Try again!");
                }
            };

            return (
                <div className="game-screen bg-orange-100 p-6 flex flex-col items-center">
                    <div className="w-full flex justify-between mb-8">
                        <button onClick={onBack} className="bg-white p-3 rounded-full shadow">⬅ Exit</button>
                        <div className="text-2xl font-bold text-orange-600">⭐ {score}</div>
                    </div>
                    
                    <div className="text-center mb-10">
                        <div className="text-6xl mb-4">🐷</div>
                        <h2 className="text-3xl font-black text-orange-800">Find the letter {target}!</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
                        {options.map((opt, i) => (
                            <button key={i} onClick={() => check(opt)} className="btn-3d bg-white border-b-8 border-orange-200 rounded-2xl py-8 text-6xl font-black text-orange-600 shadow-xl active:bg-orange-50">
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            );
        };

        // --- GAME 2: WONDER RED'S RHYME ---
        const RedGame = ({ onBack }) => {
            const [round, setRound] = useState(0);
            const rounds = [
                { word: "CAT", emoji: "🐱", match: "BAT", matchEmoji: "🦇", options: [{w:"BAT", e:"🦇"}, {w:"DOG", e:"🐶"}, {w:"SUN", e:"☀️"}] },
                { word: "FROG", emoji: "🐸", match: "LOG", matchEmoji: "🪵", options: [{w:"CAR", e:"🚗"}, {w:"LOG", e:"🪵"}, {w:"FISH", e:"🐟"}] },
                { word: "HOUSE", emoji: "🏠", match: "MOUSE", matchEmoji: "🐭", options: [{w:"TREE", e:"🌳"}, {w:"MOUSE", e:"🐭"}, {w:"BALL", e:"⚽"}] },
                { word: "BEE", emoji: "🐝", match: "TREE", matchEmoji: "🌳", options: [{w:"TREE", e:"🌳"}, {w:"COW", e:"🐄"}, {w:"CAR", e:"🚗"}] }
            ];

            const check = (opt) => {
                if(opt.w === rounds[round].match) {
                    playTone(500, 'sine', 0.1); playTone(700, 'sine', 0.3);
                    speak("Wonderiffic! They rhyme!");
                    setTimeout(() => setRound(r => (r+1)%rounds.length), 2000);
                } else {
                    playTone(150, 'sawtooth', 0.2);
                    speak("Not quite!");
                }
            };

            return (
                <div className="game-screen bg-red-100 p-6 flex flex-col items-center">
                    <button onClick={onBack} className="self-start bg-white p-3 rounded-full shadow mb-6">⬅ Exit</button>
                    
                    <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-red-200 text-center mb-10 w-full max-w-md">
                        <div className="text-8xl mb-2">{rounds[round].emoji}</div>
                        <div className="text-4xl font-black text-red-600 mb-2">{rounds[round].word}</div>
                        <p className="text-slate-500 text-xl">What rhymes with {rounds[round].word}?</p>
                    </div>

                    <div className="flex gap-4 justify-center w-full max-w-3xl flex-wrap">
                        {rounds[round].options.map((opt, i) => (
                            <button key={i} onClick={() => check(opt)} className="btn-3d bg-white border-b-8 border-red-200 p-6 rounded-2xl flex flex-col items-center min-w-[120px]">
                                <div className="text-6xl mb-2">{opt.e}</div>
                                <div className="text-xl font-bold text-slate-700">{opt.w}</div>
                            </button>
                        ))}
                    </div>
                </div>
            );
        };

        // --- GAME 3: SUPER WHY STORY POWER ---
        const SuperGame = ({ onBack }) => {
            const [word, setWord] = useState("DOG");
            const [emoji, setEmoji] = useState("🐕");

            const changeStory = (newWord, newEmoji) => {
                setWord(newWord);
                setEmoji(newEmoji);
                playTone(800, 'sine', 0.5); // Zap sound
                speak(`Super Duper! The ${newWord} jumps!`);
            };

            return (
                <div className="game-screen bg-green-100 p-6 flex flex-col items-center">
                    <button onClick={onBack} className="self-start bg-white p-3 rounded-full shadow mb-6">⬅ Exit</button>
                    
                    <div className="flex-grow flex flex-col items-center justify-center w-full max-w-2xl">
                        {/* Story Book */}
                        <div className="bg-white p-8 rounded-3xl shadow-2xl border-8 border-green-600 w-full text-center relative">
                            <div className="text-[120px] mb-6 animate-float">{emoji}</div>
                            <p className="text-4xl font-bold text-slate-800 leading-relaxed">
                                The <span className="text-green-600 border-b-4 border-green-600">{word}</span> likes to jump!
                            </p>
                            <div className="absolute -top-6 -right-6 text-6xl">🦸‍♂️</div>
                        </div>

                        <p className="mt-8 text-2xl font-bold text-green-800 mb-4">Change the Story!</p>
                        
                        <div className="flex gap-4">
                            <button onClick={() => changeStory("DOG", "🐕")} className="btn-3d bg-white p-4 rounded-xl text-5xl border-b-4 border-slate-300">🐕</button>
                            <button onClick={() => changeStory("CAT", "🐈")} className="btn-3d bg-white p-4 rounded-xl text-5xl border-b-4 border-slate-300">🐈</button>
                            <button onClick={() => changeStory("FROG", "🐸")} className="btn-3d bg-white p-4 rounded-xl text-5xl border-b-4 border-slate-300">🐸</button>
                            <button onClick={() => changeStory("PIG", "🐖")} className="btn-3d bg-white p-4 rounded-xl text-5xl border-b-4 border-slate-300">🐖</button>
                        </div>
                    </div>
                </div>
            );
        };

        // --- GAME 4: GABBA FREEZE DANCE ---
        const GabbaGame = ({ onBack }) => {
            const [dancing, setDancing] = useState(false);
            const intervalRef = useRef(null);
            
            const toggle = () => {
                initAudio();
                if(dancing) {
                    clearInterval(intervalRef.current);
                    setDancing(false);
                } else {
                    setDancing(true);
                    let b = 0;
                    intervalRef.current = setInterval(() => {
                        if(b%4===0) playTone(100,'square',0.1);
                        if(b%4===2) playTone(200,'sawtooth',0.1);
                        playTone(800,'triangle',0.05);
                        b++;
                    }, 400);
                }
            };

            useEffect(() => () => clearInterval(intervalRef.current), []);

            const chars = [
                {c:"🔴", n:"Muno", a:"animate-bounce"},
                {c:"🌸", n:"Foofa", a:"animate-pulse"},
                {c:"🥦", n:"Brobee", a:"animate-spin"},
                {c:"🤖", n:"Plex", a:"animate-bounce"},
                {c:"🥶", n:"Toodee", a:"animate-pulse"}
            ];

            return (
                <div className={`game-screen transition-colors duration-500 flex flex-col items-center ${dancing ? 'bg-slate-900' : 'bg-yellow-100'}`}>
                    <div className="w-full p-4 flex justify-between z-10">
                        <button onClick={onBack} className="bg-white p-3 rounded-full shadow">⬅ Exit</button>
                    </div>
                    
                    <div className="flex-grow flex flex-wrap justify-center items-center gap-6 p-4">
                        {chars.map((c, i) => (
                            <div key={i} className={`w-32 h-48 bg-white rounded-3xl flex items-center justify-center text-7xl border-b-8 border-black/10 shadow-xl transition-all duration-300 ${dancing ? c.a + ' scale-110' : ''}`}>
                                {c.c}
                            </div>
                        ))}
                    </div>
                    
                    <button onClick={toggle} className={`mb-10 px-10 py-6 rounded-full text-3xl font-black shadow-2xl transition-all ${dancing ? 'bg-red-500 text-white scale-110' : 'bg-green-500 text-white'}`}>
                        {dancing ? "FREEZE! 🛑" : "DANCE! 🎵"}
                    </button>
                </div>
            );
        };

        // --- GAME 5: FLASH CARDS ---
        const FlashGame = ({ onBack }) => {
            const cards = [{w:"Isla", e:"👧"}, {w:"Evie", e:"👶"}, {w:"Truck", e:"🛻"}, {w:"Dog", e:"🐕"}, {w:"Cat", e:"🐈"}, {w:"Apple", e:"🍎"}];
            const [i, setI] = useState(0);
            const play = () => speak(cards[i].w);
            
            return (
                <div className="game-screen bg-purple-100 p-6 flex flex-col items-center">
                    <div className="w-full flex justify-between">
                        <button onClick={onBack} className="bg-white p-3 rounded-full shadow">⬅ Exit</button>
                        <button onClick={play} className="bg-white p-3 rounded-full shadow text-2xl">🔊</button>
                    </div>
                    <div onClick={play} className="flex-grow flex flex-col justify-center items-center w-full">
                        <div className="bg-white rounded-[40px] shadow-2xl border-8 border-white p-10 aspect-square flex flex-col items-center justify-center active:scale-95 transition-transform">
                            <div className="text-[180px] mb-4 emoji-3d">{cards[i].e}</div>
                            <div className="text-6xl font-black text-slate-800">{cards[i].w}</div>
                        </div>
                    </div>
                    <div className="flex gap-4 w-full max-w-md">
                        <button onClick={()=>setI(x=>x===0?cards.length-1:x-1)} className="btn-3d flex-1 bg-white py-6 rounded-2xl text-3xl border-b-4 border-slate-200">⬅</button>
                        <button onClick={()=>setI(x=>(x+1)%cards.length)} className="btn-3d flex-1 bg-purple-500 text-white py-6 rounded-2xl text-3xl border-b-4 border-purple-700">➡</button>
                    </div>
                </div>
            );
        };

        // --- MAIN MENU ---
        const MainMenu = ({ onSelect }) => (
            <div className="game-screen bg-yellow-50 overflow-y-auto pt-8 pb-32">
                <h1 className="text-5xl font-black text-center text-green-800 mb-2">Treehouse Games</h1>
                <p className="text-center text-green-700 font-bold mb-8 opacity-70 text-xl">For Isla & Evie</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 max-w-4xl mx-auto">
                    {/* Super Reader Section */}
                    <div className="col-span-1 md:col-span-2 bg-green-100 p-4 rounded-3xl border-4 border-green-200">
                        <h2 className="text-2xl font-black text-green-800 mb-4 text-center">Super Readers 📚</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div onClick={() => onSelect('alpha')} className="btn-3d bg-white p-4 rounded-2xl flex flex-col items-center gap-2">
                                <div className="text-4xl">🐷</div>
                                <div className="font-bold text-sm text-center text-orange-600">Letters</div>
                            </div>
                            <div onClick={() => onSelect('red')} className="btn-3d bg-white p-4 rounded-2xl flex flex-col items-center gap-2">
                                <div className="text-4xl">🧢</div>
                                <div className="font-bold text-sm text-center text-red-600">Rhymes</div>
                            </div>
                            <div onClick={() => onSelect('super')} className="btn-3d bg-white p-4 rounded-2xl flex flex-col items-center gap-2">
                                <div className="text-4xl">🦸‍♂️</div>
                                <div className="font-bold text-sm text-center text-green-600">Stories</div>
                            </div>
                        </div>
                    </div>

                    <div onClick={() => onSelect('math')} className="btn-3d bg-blue-100 border-blue-300 border-b-8 p-6 rounded-3xl flex items-center gap-4">
                        <div className="text-5xl">🍪</div>
          
