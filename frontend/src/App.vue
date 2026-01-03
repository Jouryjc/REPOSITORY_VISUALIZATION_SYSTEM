<template>
  <div class="w-full h-screen bg-black relative overflow-hidden text-white font-sans">
    
    <!-- Header / Interface -->
    <div class="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
      <div class="pointer-events-auto">
        <h1 class="text-2xl font-bold tracking-wider text-cyan-400 uppercase">Knowledge Universe</h1>
        <p class="text-cyan-600 text-xs tracking-[0.3em] mt-1 pl-1">REPOSITORY_VISUALIZATION_SYSTEM</p>
      </div>

      <!-- Camera Controls -->
      <div class="pointer-events-auto flex gap-2 bg-black/40 backdrop-blur-md p-1 rounded border border-cyan-900/50">
          <button @click="setCamera('overview')" class="px-3 py-1 text-xs font-mono text-cyan-400 hover:bg-cyan-900/50 hover:text-white border border-transparent hover:border-cyan-500/50 transition-all uppercase tracking-wider">
              Overview
          </button>
          <button @click="setCamera('top')" class="px-3 py-1 text-xs font-mono text-cyan-400 hover:bg-cyan-900/50 hover:text-white border border-transparent hover:border-cyan-500/50 transition-all uppercase tracking-wider">
              Top View
          </button>
          <button @click="setCamera('deep')" class="px-3 py-1 text-xs font-mono text-cyan-400 hover:bg-cyan-900/50 hover:text-white border border-transparent hover:border-cyan-500/50 transition-all uppercase tracking-wider">
              Deep Dive
          </button>
          <button @click="setCamera('reset')" class="px-3 py-1 text-xs font-mono text-cyan-400 hover:bg-cyan-900/50 hover:text-white border border-transparent hover:border-cyan-500/50 transition-all uppercase tracking-wider">
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
              
              <div class="space-y-4 text-sm font-mono tracking-wide">
                 <div class="flex group">
                     <span class="text-cyan-500 w-24 uppercase text-xs pt-1 font-bold">URL_LINK</span> 
                     <a :href="selectedRepo.url" target="_blank" class="text-white hover:text-cyan-300 hover:underline truncate flex-1 block transition-colors font-semibold">{{ selectedRepo.url }}</a>
                 </div>
                 <div class="flex">
                     <span class="text-cyan-500 w-24 uppercase text-xs pt-1 font-bold">TEAM_ID</span> 
                     <span class="text-white font-medium">{{ selectedRepo.team }}</span>
                 </div>
                 <div class="flex">
                     <span class="text-cyan-500 w-24 uppercase text-xs pt-1 font-bold">SECTOR</span> 
                     <span class="text-white font-medium">{{ selectedRepo.businessSegment }} <span v-if="selectedRepo.subSegment" class="text-cyan-400">>></span> {{ selectedRepo.subSegment }}</span>
                 </div>
                 <div class="flex">
                     <span class="text-cyan-500 w-24 uppercase text-xs pt-1 font-bold">OWNER</span> 
                     <span class="text-white font-medium">{{ selectedRepo.caretaker }}</span>
                 </div>
                 <div v-if="selectedRepo.remark" class="flex">
                     <span class="text-cyan-500 w-24 uppercase text-xs pt-1 font-bold">NOTES</span> 
                     <span class="text-slate-300 italic">{{ selectedRepo.remark }}</span>
                 </div>
                 
                 <div v-if="selectedRepo.knowledgeBase" class="mt-6 p-3 bg-yellow-900/40 border-l-4 border-yellow-500 flex items-center gap-3">
                     <span class="text-yellow-400 font-bold text-2xl animate-pulse">⚠</span>
                     <div>
                         <div class="text-yellow-500 text-xs font-bold uppercase tracking-widest">Classification</div>
                         <div class="text-white font-bold text-sm">Valid Knowledge Base</div>
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
    // If backend handles search, we might not need this if we reload data.
    // However, for 3D smoothness, client-side filtering of position/visibility or just reloading the scene is options.
    // Let's rely on backend filtering OR client side.
    // Given the props to ThreeScene updates the scene, let's just use the current `repos` which we fetch from backend.
    
    return repos.value; 
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
        if (searchQuery.value) params.append('search', searchQuery.value);
        if (selectedSegment.value) params.append('businessSegment', selectedSegment.value);

        const res = await fetch(`http://localhost:3000/api/repos?${params.toString()}`);
        const data = await res.json();
        repos.value = data;
    } catch (e) {
        console.error("Failed to fetch data", e);
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    // Debounce suggested for real app
    fetchData();
};

onMounted(async () => {
  // Trigger ingest first just to be sure (optional, usually done once)
  // For demo, let's try to ingest if empty, or just ingest always on load? No, expensive.
  // We assume user ran the ingest script or we trigger it via button. 
  // Let's add an auto-ingest check or just fetch.
  // Actually, let's trigger ingest once to ensure data is there.
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
}
</style>
