<template>
  <div class="w-full h-screen bg-black relative overflow-hidden text-white font-sans">
    
    <!-- Header / Interface -->
    <div class="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
      <div class="pointer-events-auto">
        <h1 class="text-3xl font-bold tracking-widest uppercase bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">Knowledge Universe</h1>
        <p class="text-cyan-500 text-xs tracking-[0.5em] mt-1 pl-1 font-mono animate-pulse drop-shadow-[0_0_2px_cyan]">REPOSITORY_VISUALIZATION_SYSTEM</p>
      </div>

      <!-- Camera Controls -->
      <div class="pointer-events-auto flex gap-6 p-2">
          <button @click="setCamera('overview')" class="px-6 py-2 text-xs font-bold holo-btn clip-path-button">
              Overview
          </button>
          <button @click="setCamera('top')" class="px-6 py-2 text-xs font-bold holo-btn clip-path-button">
              Top View
          </button>
          <button @click="setCamera('deep')" class="px-6 py-2 text-xs font-bold holo-btn clip-path-button">
              Deep Dive
          </button>
          <button @click="setCamera('reset')" class="px-6 py-2 text-xs font-bold holo-btn clip-path-button">
              Reset
          </button>
      </div>
      
      <div class="pointer-events-auto flex gap-4 items-center">
        <div class="relative group">
            <div class="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
            <input 
              v-model="searchQuery" 
              @input="handleSearch"
              type="text" 
              placeholder="Search universe..." 
              class="relative bg-black/60 border border-cyan-500/30 text-cyan-100 placeholder-cyan-700/50 rounded px-4 py-2 text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all w-72 backdrop-blur-md"
            />
        </div>
        
        <div class="relative group">
             <div class="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
             <select v-model="selectedSegment" @change="handleSearch" class="relative bg-black/60 border border-cyan-500/30 text-cyan-100 rounded px-4 py-2 text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all backdrop-blur-md appearance-none cursor-pointer hover:bg-black/80">
                <option value="" class="bg-black text-white">All Segments</option>
                <option v-for="seg in segments" :key="seg" :value="seg" class="bg-black text-white">{{ seg }}</option>
            </select>
        </div>
      </div>
    </div>

    <!-- Details Panel (Cyberpunk Modal) -->
    <Transition name="slide-fade">
      <div v-if="selectedRepo" class="absolute top-[15%] right-8 w-96 tech-card p-6 text-cyan-50 z-20">
          <!-- Tech Corners -->
          <div class="tech-corner top-0 left-0 border-r-0 border-b-0"></div>
          <div class="tech-corner top-0 right-0 border-l-0 border-b-0"></div>
          <div class="tech-corner bottom-0 left-0 border-r-0 border-t-0"></div>
          <!-- Cut corner bottom right handled by clip-path, maybe add accent line there? -->
          <div class="absolute bottom-[2px] right-[20px] w-8 h-[2px] bg-cyan-500 transform rotate-45 origin-right"></div>

          <div class="relative z-10">
              <div class="flex justify-between items-start mb-6 tech-header pb-2">
                 <h2 class="text-xl font-bold text-cyan-400 truncate w-64" :title="selectedRepo.name">{{ selectedRepo.name || 'Repository' }}</h2>
                 <button @click="closeDetails" class="text-cyan-500 hover:text-cyan-300 hover:rotate-90 transition-all duration-300">✕</button>
              </div>
              
              <div class="space-y-5 text-sm font-mono tracking-wide">
                 <div class="flex group items-baseline">
                     <span class="text-cyan-600 w-24 uppercase text-[10px] font-bold tracking-widest">URL_LINK</span> 
                     <a :href="selectedRepo.url" target="_blank" class="text-cyan-100 hover:text-white hover:shadow-[0_0_10px_cyan] hover:underline truncate flex-1 block transition-all font-bold text-shadow-sm">{{ selectedRepo.url }}</a>
                 </div>
                 <div class="flex items-baseline">
                     <span class="text-cyan-600 w-24 uppercase text-[10px] font-bold tracking-widest">TEAM_ID</span> 
                     <span class="text-gray-100 font-semibold drop-shadow-md">{{ selectedRepo.team }}</span>
                 </div>
                 <div class="flex items-baseline">
                     <span class="text-cyan-600 w-24 uppercase text-[10px] font-bold tracking-widest">SECTOR</span> 
                     <span class="text-gray-100 font-semibold drop-shadow-md">{{ selectedRepo.businessSegment }} <span v-if="selectedRepo.subSegment" class="text-cyan-400 px-1">>></span> {{ selectedRepo.subSegment }}</span>
                 </div>
                 <div class="flex items-baseline">
                     <span class="text-cyan-600 w-24 uppercase text-[10px] font-bold tracking-widest">OWNER</span> 
                     <span class="text-gray-100 font-semibold drop-shadow-md">{{ selectedRepo.caretaker }}</span>
                 </div>
                 <div v-if="selectedRepo.remark" class="flex items-baseline">
                     <span class="text-cyan-600 w-24 uppercase text-[10px] font-bold tracking-widest">NOTES</span> 
                     <span class="text-slate-300 italic">{{ selectedRepo.remark }}</span>
                 </div>
                 
                 <div v-if="selectedRepo.knowledgeBase" class="mt-6 p-4 bg-gradient-to-r from-yellow-900/60 to-transparent border-l-4 border-yellow-400 flex items-center gap-4 relative overflow-hidden group">
                     <div class="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <span class="text-yellow-400 font-bold text-3xl animate-pulse drop-shadow-[0_0_5px_gold]">⚠</span>
                     <div>
                         <div class="text-yellow-500 text-[10px] font-bold uppercase tracking-[0.2em]">Classification</div>
                         <div class="text-yellow-100 font-bold text-base drop-shadow-md">Valid Knowledge Base</div>
                     </div>
                 </div>
              </div>

              <div class="mt-8 flex justify-end">
                  <button @click="closeDetails" class="group relative px-6 py-2 bg-cyan-900/20 hover:bg-cyan-500/20 border border-cyan-800 hover:border-cyan-400 transition-all overflow-hidden">
                      <span class="relative z-10 text-cyan-400 text-xs font-bold uppercase tracking-widest group-hover:text-cyan-100">Term_Close</span>
                      <div class="absolute inset-0 bg-cyan-500/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                  </button>
              </div>
          </div>
      </div>
    </Transition>

    <!-- 3D Scene -->
    <ThreeScene 
      ref="threeSceneRef"
      :repos="filteredRepos" 
      :selected-repo="selectedRepo"
      @select-repo="handleSelectRepo" 
    />

    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
      <div class="text-cyan-400 text-xl animate-pulse">Initializing Universe...</div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ThreeScene from './components/ThreeScene.vue';

const repos = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedSegment = ref('');
const selectedRepo = ref(null);
const threeSceneRef = ref(null);

const handleSelectRepo = (repo) => {
    selectedRepo.value = repo;
};

const closeDetails = () => {
    selectedRepo.value = null;
};

const setCamera = (view) => {
    if (threeSceneRef.value) {
        threeSceneRef.value.setCameraView(view);
    }
};

// Derived state
const filteredRepos = computed(() => {
    // Client-side filtering for SECTORS only. 
    // We do NOT filter by text anymore, as requested (text search selects instead).
    if (!selectedSegment.value) return repos.value;
    return repos.value.filter(r => r.businessSegment === selectedSegment.value);
});

const segments = computed(() => {
    const s = new Set(repos.value.map(r => r.businessSegment).filter(Boolean));
    return Array.from(s);
});

const kbCount = computed(() => repos.value.filter(r => r.knowledgeBase).length);

const fetchData = async () => {
    loading.value = true;
    try {
        const params = new URLSearchParams();
        // REMOVED searchQuery from params to keep all data loaded
        // if (searchQuery.value) params.append('search', searchQuery.value);
        
        // We might still want to filter by segment on backend to save bandwidth?
        // Or just load everything and filter client side?
        // Given visual nature, loading everything is better for "not hiding others".
        // Let's load everything.
        
        const res = await fetch(`http://localhost:3000/api/repos`);
        const data = await res.json();
        repos.value = data;
    } catch (e) {
        console.error("Failed to fetch data", e);
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    // Client-side selection logic
    if (!searchQuery.value) {
        return;
    }

    const query = searchQuery.value.toLowerCase();
    const candidates = filteredRepos.value;
    const match = candidates.find(r => 
        (r.name && r.name.toLowerCase().includes(query)) ||
        (r.url && r.url.toLowerCase().includes(query))
    );

    if (match) {
        selectedRepo.value = match;
    }
};

const rippleTrigger = ref(false);

const handleInput = () => {
    // Trigger logic search
    handleSearch();
    
    // Trigger Ripple Animation
    rippleTrigger.value = false;
    setTimeout(() => {
        rippleTrigger.value = true;
    }, 10);
};

onMounted(async () => {
  // Trigger ingest first just to be sure (optional, usually done once)
  try {
      await fetch('http://localhost:3000/api/ingest', { method: 'POST' });
  } catch (e) {
      console.warn("Auto-ingest failed, maybe backend not ready", e);
  }
  
  await fetchData();
});
</script>

<style>
/* Global resets if needed */
body {
  margin: 0;
  overflow: hidden;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

@layer utilities {
    .tech-card {
        background: #050a10; /* Solid dark background, no transparency */
        border: 1px solid rgba(6, 182, 212, 0.6); /* Brighter border */
        box-shadow: 0 0 25px rgba(0,0,0,0.9), 0 0 10px rgba(6, 182, 212, 0.2);
        clip-path: polygon(
            0 0, 
            100% 0, 
            100% calc(100% - 20px), 
            calc(100% - 20px) 100%, 
            0 100%
        );
        position: relative;
    }
    
    /* Subtle scanline background */
    .tech-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(6, 182, 212, 0.03) 3px /* Very subtle scanline */
        );
        pointer-events: none;
        z-index: 0;
    }

    .tech-corner {
        position: absolute;
        width: 10px;
        height: 10px;
        border: 2px solid #22d3ee; /* Solid Cyan-400 */
        transition: all 0.3s;
        z-index: 20;
    }
    
    .tech-header {
        font-family: 'Courier New', monospace;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        border-bottom: 2px solid rgba(6, 182, 212, 0.8);
    }
    .clip-path-button {
        clip-path: polygon(
            10px 0, 
            100% 0, 
            100% calc(100% - 10px), 
            calc(100% - 10px) 100%, 
            0 100%, 
            0 10px
        );
    }
    
    .holo-btn {
        position: relative;
        background: rgba(6, 182, 212, 0.15); /* Cyan glass base */
        backdrop-filter: blur(4px);
        border: 1px solid rgba(6, 182, 212, 0.5); /* Inner neon edge */
        box-shadow: 
            0 0 10px rgba(6, 182, 212, 0.3),
            inset 0 0 15px rgba(6, 182, 212, 0.1);
        color: #22d3ee;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-family: 'Courier New', monospace;
        overflow: hidden;
        transition: all 0.3s ease;
    }

    /* Flowing Grid Texture */
    .holo-btn::before {
        content: '';
        position: absolute;
        top: -50%; left: -50%; right: -50%; bottom: -50%;
        background-image: 
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
        background-size: 20px 20px;
        transform: perspective(500px) rotateX(20deg);
        animation: grid-flow 10s linear infinite;
        pointer-events: none;
        opacity: 0.5;
    }

    /* Broken Frame Elements (The "Bracket" look) */
    .holo-btn::after {
        content: '';
        position: absolute;
        inset: -2px;
        border: 2px solid transparent;
        /* create brackets using gradient borders */
        background: 
            linear-gradient(to right, #22d3ee 2px, transparent 2px) top left,
            linear-gradient(to bottom, #22d3ee 2px, transparent 2px) top left,
            linear-gradient(to left, #22d3ee 2px, transparent 2px) bottom right,
            linear-gradient(to top, #22d3ee 2px, transparent 2px) bottom right;
        background-size: 10px 10px;
        background-repeat: no-repeat;
        box-shadow: 0 0 10px #22d3ee; /* Glow on brackets */
        pointer-events: none;
        transition: all 0.3s ease;
        opacity: 0.8;
    }
    
    /* Hover State */
    .holo-btn:hover {
        background: rgba(6, 182, 212, 0.3);
        box-shadow: 
            0 0 20px rgba(6, 182, 212, 0.6),
            inset 0 0 20px rgba(6, 182, 212, 0.4);
        border-color: #a5f3fc;
        color: #fff;
        text-shadow: 0 0 8px #22d3ee;
        transform: translateY(-2px);
    }
    
    .holo-btn:hover::after {
        background-size: 15px 15px; /* Brackets expand */
        box-shadow: 0 0 15px #22d3ee, 0 0 5px #fff;
    }

    @keyframes grid-flow {
        0% { transform: perspective(500px) rotateX(20deg) translateY(0); }
        100% { transform: perspective(500px) rotateX(20deg) translateY(20px); }
    }

    /* --- Holographic Energy Shield Input --- */
    .holo-input-container {
        position: relative;
        width: 350px;
        height: 44px;
        display: flex;
        align-items: center;
        perspective: 1000px; /* For 3D depth */
    }

    /* 1. Underlying Energy Shield Shape (Backplate) */
    .holo-shield-backplate {
        position: absolute;
        inset: 0;
        background: rgba(5, 20, 35, 0.6); /* Deep dark cyan base */
        clip-path: polygon(
            15px 0, 
            100% 0, 
            100% calc(100% - 15px), 
            calc(100% - 15px) 100%, 
            0 100%, 
            0 15px
        );
        backdrop-filter: blur(8px);
        border: 1px solid rgba(6, 182, 212, 0.3);
        box-shadow: 0 0 15px rgba(6, 182, 212, 0.1);
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1;
    }

    /* Neon Rim Light (Pseudo-element for glowy border) */
    .holo-shield-backplate::before {
        content: '';
        position: absolute;
        inset: -1px;
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.8), transparent 40%, transparent 60%, rgba(34, 211, 238, 0.8));
        z-index: -1;
        opacity: 0.5;
        transition: opacity 0.3s;
        clip-path: polygon(
            15px 0, 
            100% 0, 
            100% calc(100% - 15px), 
            calc(100% - 15px) 100%, 
            0 100%, 
            0 15px
        );
    }
    
    /* Micro-Texture: Hex Grid */
    .holo-shield-backplate::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-image: 
            radial-gradient(circle, rgba(34, 211, 238, 0.1) 1px, transparent 1px);
        background-size: 6px 6px; /* Hex-like dots */
        opacity: 0.3;
        pointer-events: none;
    }

    /* Scanline Animation */
    .holo-scanline {
        position: absolute;
        top: 0; left: 0; right: 0; height: 100%;
        background: linear-gradient(to right, transparent, rgba(34, 211, 238, 0.2), transparent);
        transform: skewX(-20deg) translateX(-150%);
        animation: holo-scan 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        pointer-events: none;
        z-index: 2;
        mix-blend-mode: screen;
    }

    @keyframes holo-scan {
        0%, 80% { transform: skewX(-20deg) translateX(-150%); }
        100% { transform: skewX(-20deg) translateX(150%); }
    }

    /* 2. Input Field (Top Layer) */
    .holo-input-field {
        position: relative;
        z-index: 5;
        width: 100%;
        background: transparent;
        border: none;
        outline: none;
        padding: 0 40px 0 20px;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        color: #ccfbf1; /* Cyan-50 */
        font-size: 0.9rem;
        letter-spacing: 0.1em;
        text-shadow: 0 0 5px rgba(34, 211, 238, 0.5);
    }
    
    .holo-input-field::placeholder {
        color: rgba(34, 211, 238, 0.4);
        text-shadow: none;
        opacity: 1;
        animation: placeholder-pulse 2s infinite ease-in-out;
    }

    @keyframes placeholder-pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.7; }
    }

    /* Search Icon */
    .holo-search-icon {
        position: absolute;
        right: 15px;
        z-index: 6;
        color: #22d3ee;
        filter: drop-shadow(0 0 5px #22d3ee);
        transition: all 0.3s;
    }

    /* --- Interaction States --- */
    
    /* Focus: Energy Activation */
    .holo-input-container:focus-within .holo-shield-backplate {
        background: rgba(5, 25, 45, 0.85);
        box-shadow: 
            0 0 25px rgba(34, 211, 238, 0.4),
            inset 0 0 10px rgba(34, 211, 238, 0.2);
        border-color: #22d3ee;
    }

    .holo-input-container:focus-within .holo-shield-backplate::before {
        opacity: 1; /* Bright rim light */
        filter: drop-shadow(0 0 8px #22d3ee);
    }

    .holo-input-container:focus-within .holo-input-field {
        text-shadow: 0 0 8px rgba(34, 211, 238, 0.8);
        color: #fff;
    }
    
    /* Ripple Effect Logic (Simulated via active class) */
    .holo-input-ripple {
        position: absolute;
        top: 50%; left: 50%;
        width: 0; height: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(234, 179, 8, 0.8), transparent); /* Orange burst */
        transform: translate(-50%, -50%);
        opacity: 0;
        pointer-events: none;
        z-index: 4;
    }
    
    .ripple-active {
        animation: ripple-burst 0.4s ease-out forwards;
    }
    
    @keyframes ripple-burst {
        0% { width: 0; height: 0; opacity: 1; }
        100% { width: 200px; height: 100px; opacity: 0; }
    }

    /* Orange shift on Focus (Optional as per req) */
    .holo-input-container:focus-within .holo-search-icon {
        color: #fbbf24; /* Amber-400 */
        filter: drop-shadow(0 0 8px #fbbf24);
        transform: scale(1.1);
    }
}
</style>
