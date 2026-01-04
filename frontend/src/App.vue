<template>
  <div class="w-full h-screen bg-black relative overflow-hidden text-white font-sans">
    
    <!-- Header / Interface -->
    <div class="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
      <div class="pointer-events-auto">
        <h1 class="text-3xl font-bold tracking-widest uppercase font-mono text-[#22d3ee]" style="text-shadow: 0 0 10px rgba(34,211,238,0.8);">Knowledge Universe</h1>
        <p class="text-cyan-500 text-xs tracking-[0.5em] mt-1 pl-1 font-mono animate-pulse drop-shadow-[0_0_2px_cyan]">REPOSITORY_VISUALIZATION_SYSTEM</p>

        <!-- Stats Pie Chart (Hidden as requested) -->
        <!-- <div class="mt-2 pl-1 flex items-center gap-4 group cursor-pointer hover:scale-105 transition-transform duration-300">
            <CyberPieChart :percentage="kbPercentage" />
            
            <div class="flex flex-col">
                <div class="text-[10px] font-mono font-bold text-cyan-600 tracking-widest uppercase mb-0.5">Coverage Analysis</div>
                <div class="text-xs font-bold text-cyan-100 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                    KNOWLEDGE BASE
                </div>
            </div>
        </div> -->
        
        <!-- Camera Controls (Moved Here, Vertical Column) -->
        <div class="mt-8 flex flex-col space-y-12 items-start">
          <button @click="setCamera('overview')" class="px-8 py-3 text-sm font-bold holo-btn clip-path-button w-48 tracking-widest">
              Overview
          </button>
          <button @click="setCamera('top')" class="px-8 py-3 text-sm font-bold holo-btn clip-path-button w-48 tracking-widest">
              Top View
          </button>
          <button @click="setCamera('deep')" class="px-8 py-3 text-sm font-bold holo-btn clip-path-button w-48 tracking-widest">
              Deep Dive
          </button>
          <button @click="setCamera('reset')" class="px-8 py-3 text-sm font-bold holo-btn clip-path-button w-48 tracking-widest">
              Reset
          </button>
        </div>
      </div>
      
      <div class="pointer-events-auto flex gap-4 items-center">
        <!-- Search and Filter (Hidden as requested) -->
        <!-- <div class="relative group">
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
        </div> -->
      </div>
    </div>

    <!-- Stats Dashboard - 左下角固定位置 (独立于 Header) -->
    <div class="fixed bottom-6 left-6 w-[300px] max-w-[300px] z-30 animate-fade-in-up pointer-events-auto" style="animation-delay: 0.5s; bottom: 12px">
        <div class="border-l-2 border-cyan-500 pl-2 bg-black/60 backdrop-blur-sm py-2 pr-1 rounded-r-lg w-full">
           <h3 class="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4 drop-shadow-[0_0_2px_cyan]">System Metrics</h3>
           
           <div class="space-y-4">
               <!-- KB Coverage -->
               <div>
                   <CyberProgressBar label="KB Coverage" :value="kbPercentage" color="cyan" />
                   <div class="flex justify-between text-[8px] text-[#00E5FF]/80 font-mono mt-0.5">
                       <span>TARGET: ALL REPOS</span>
                       <span>{{ kbCount }} / {{ repos.length }}</span>
                   </div>
               </div>

               <!-- Construction Progress -->
               <div>
                   <CyberProgressBar label="Construction" :value="constructionPercentage" color="purple" />
                   <div class="flex justify-between text-[8px] text-[#FF69B4]/80 font-mono mt-0.5">
                       <span>TARGET: KB COMPLETED</span>
                       <span>{{ constructionCount }} / {{ kbCount }}</span>
                   </div>
               </div>
           </div>
        </div>
    </div>

    <!-- Details Panel (Cyberpunk Modal) - Fixed position, independent -->
    <Transition name="slide-fade">
      <div v-if="selectedRepo" class="fixed w-96 tech-card p-8 text-cyan-50 pointer-events-auto" style="top: 80px; right: 16px; z-index: 200;">
          <!-- Cut corner bottom right handled by clip-path, maybe add accent line there? -->
          <div class="absolute bottom-[2px] right-[20px] w-8 h-[2px] bg-cyan-500 transform rotate-45 origin-right"></div>

          <div class="relative z-10">
              <div class="flex justify-between items-start mb-6 tech-header pb-2">
                 <div class="flex items-center gap-3 flex-1 min-w-0">
                    <!-- KB Status Badge - inline with title -->
                    <div v-if="selectedRepo.knowledgeBase" class="kb-status-mini">
                       <div class="kb-mini-dot"></div>
                       <span>KB</span>
                    </div>
                    <h3 class="text-xl font-bold text-cyan-300 truncate drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" :title="selectedRepo.name">{{ selectedRepo.name || 'Repository' }}</h3>
                 </div>
                 <!-- Cyberpunk Close Button -->
                 <button @click="closeDetails" class="cyber-close-btn group flex items-center justify-center" title="关闭">
                    <div class="cyber-close-border"></div>
                    <div class="cyber-close-bg"></div>
                    <svg class="cyber-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                       <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/>
                    </svg>
                 </button>
              </div>
              
              <div class="space-y-4 text-sm font-mono">
                 <!-- URL Link -->
                 <div class="flex flex-col gap-1">
                      <span class="info-label">链接：</span> 
                      <a :href="selectedRepo.url" target="_blank" class="text-white hover:text-cyan-300 hover:shadow-[0_0_10px_cyan] hover:underline truncate block transition-all font-semibold text-sm pl-1">{{ selectedRepo.url }}</a>
                  </div>
                 
                 <!-- Team -->
                 <div class="flex items-center gap-2">
                      <span class="info-label">团队：</span> 
                      <span class="info-value">{{ selectedRepo.team || '-' }}</span>
                  </div>
                 
                 <!-- Business Segment -->
                 <div class="flex items-center gap-2">
                      <span class="info-label">业务板块：</span> 
                      <span class="info-value">{{ selectedRepo.businessSegment || '-' }} 
                          <span v-if="selectedRepo.subSegment" class="text-yellow-400 px-1">/</span>
                          <span v-if="selectedRepo.subSegment">{{ selectedRepo.subSegment }}</span>
                      </span>
                  </div>
                 
                 <!-- Owner -->
                 <div class="flex items-center gap-2">
                      <span class="info-label">看护人：</span> 
                      <span class="info-value">{{ selectedRepo.caretaker || '-' }}</span>
                  </div>
                 
                 <!-- Notes (if exists) -->
                 <div v-if="selectedRepo.remark" class="flex flex-col gap-1">
                      <span class="info-label">备注：</span> 
                      <span class="text-cyan-200 italic text-sm pl-1">{{ selectedRepo.remark }}</span>
                  </div>
              </div>

              <!-- Footer Actions -->
              <div class="mt-6 flex justify-between items-center">
                  <!-- Add to Knowledge Base Button (for non-KB repos) -->
                  <button 
                      v-if="!selectedRepo.knowledgeBase" 
                      @click="addToKnowledgeBase"
                      :disabled="isUpdating"
                      class="group relative px-4 py-2 bg-green-900/30 hover:bg-green-600/40 border border-green-600 hover:border-green-400 transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <span class="relative z-10 text-green-400 text-xs font-bold uppercase tracking-widest group-hover:text-green-100 flex items-center gap-2">
                          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M12 4v16m8-8H4" stroke-linecap="round"/>
                          </svg>
                          {{ isUpdating ? '添加中...' : '添加知识库' }}
                      </span>
                      <div class="absolute inset-0 bg-green-500/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                  </button>
                  
                  <!-- Empty spacer for non-KB repos to maintain layout -->
                  <div v-else></div>
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
import CyberPieChart from './components/CyberPieChart.vue';
import CyberProgressBar from './components/CyberProgressBar.vue';

const repos = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedSegment = ref('');
const selectedRepo = ref(null);
const threeSceneRef = ref(null);
const isUpdating = ref(false);

const handleSelectRepo = (repo) => {
    selectedRepo.value = repo;
};

const closeDetails = () => {
    selectedRepo.value = null;
};

// Add to Knowledge Base
const addToKnowledgeBase = async () => {
    if (!selectedRepo.value || !selectedRepo.value._id) {
        console.error('No repository selected or missing ID');
        return;
    }
    
    isUpdating.value = true;
    try {
        const response = await fetch(`http://localhost:3000/api/repos/${selectedRepo.value._id}/knowledge-base`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ knowledgeBase: true })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update repository');
        }
        
        const data = await response.json();
        
        // Update the local repo data
        selectedRepo.value.knowledgeBase = true;
        
        // Update in the repos array as well
        const index = repos.value.findIndex(r => r._id === selectedRepo.value._id);
        if (index !== -1) {
            repos.value[index].knowledgeBase = true;
        }
        
        console.log('Repository added to knowledge base:', data);
    } catch (error) {
        console.error('Error updating repository:', error);
        alert('添加知识库失败，请稍后重试');
    } finally {
        isUpdating.value = false;
    }
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

const kbPercentage = computed(() => {
    if (repos.value.length === 0) return 0;
    return Math.round((kbCount.value / repos.value.length) * 100);
});

// Construction Progress: Of the KBs, how many have profiles?
const constructionCount = computed(() => repos.value.filter(r => r.knowledgeBase && r.hasProfile).length);

const constructionPercentage = computed(() => {
    if (kbCount.value === 0) return 0;
    return Math.round((constructionCount.value / kbCount.value) * 100);
});


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
        // Optional: Deselect if empty?
        // selectedRepo.value = null; 
        return;
    }

    const query = searchQuery.value.toLowerCase();
    // Find best match. Priority: Exact name -> URL contains -> Partial name
    // Filter against the CURRENTLY VISIBLE set (filteredRepos) or ALL?
    // Probably all, but if we have a segment filter active, maybe we only search within it?
    // Let's search within filteredRepos to respect the sector view.
    
    const candidates = filteredRepos.value;
    const match = candidates.find(r => 
        (r.name && r.name.toLowerCase().includes(query)) ||
        (r.url && r.url.toLowerCase().includes(query))
    );

    if (match) {
        selectedRepo.value = match;
    }
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

.tech-card {
    background: #050a10 !important; /* Solid dark background */
    border: 1px solid rgba(6, 182, 212, 0.8) !important; /* Brighter cyan border */
    box-shadow: 0 0 30px rgba(0,0,0,0.95), 0 0 20px rgba(6, 182, 212, 0.4), inset 0 0 30px rgba(6, 182, 212, 0.1) !important;
    clip-path: polygon(
        0 0, 
        100% 0, 
        100% calc(100% - 20px), 
        calc(100% - 20px) 100%, 
        0 100%
    );
    color: #ffffff !important; /* Force white text color */
}

/* Info Label and Value Styles */
.info-label {
    color: #22d3ee; /* Bright cyan */
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.05em;
    flex-shrink: 0;
    text-shadow: 0 0 6px rgba(34, 211, 238, 0.5);
}

.info-value {
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    text-shadow: 0 0 4px rgba(255, 255, 255, 0.3);
}

/* Cyberpunk Close Button */
.cyber-close-btn {
    position: relative;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    cursor: pointer;
    background: transparent;
    border: none;
    transition: all 0.3s ease;
}

.cyber-close-border {
    position: absolute;
    inset: 0;
    border: 1px solid #06b6d4;
    clip-path: polygon(
        4px 0, 100% 0, 100% calc(100% - 4px),
        calc(100% - 4px) 100%, 0 100%, 0 4px
    );
    transition: all 0.3s ease;
}

.cyber-close-btn:hover .cyber-close-border {
    border-color: #22d3ee;
    box-shadow: 
        0 0 10px rgba(34, 211, 238, 0.5),
        inset 0 0 10px rgba(34, 211, 238, 0.1);
}

.cyber-close-bg {
    position: absolute;
    inset: 1px;
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(0, 20, 30, 0.8) 100%);
    clip-path: polygon(
        4px 0, 100% 0, 100% calc(100% - 4px),
        calc(100% - 4px) 100%, 0 100%, 0 4px
    );
    transition: all 0.3s ease;
}

.cyber-close-btn:hover .cyber-close-bg {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(0, 40, 50, 0.9) 100%);
}

.cyber-close-icon {
    position: relative;
    z-index: 10;
    width: 16px;
    height: 16px;
    stroke: #06b6d4;
    transition: all 0.3s ease;
    filter: drop-shadow(0 0 2px rgba(6, 182, 212, 0.5));
}

.cyber-close-btn:hover .cyber-close-icon {
    stroke: #22d3ee;
    filter: drop-shadow(0 0 6px rgba(34, 211, 238, 0.8));
    transform: rotate(90deg);
}

/* Mini KB Status Badge - Inline with title */
.kb-status-mini {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    background: linear-gradient(135deg, rgba(0, 255, 159, 0.2) 0%, rgba(0, 30, 20, 0.9) 100%);
    border: 1px solid #00ff9f;
    font-size: 10px;
    font-weight: 700;
    font-family: monospace;
    color: #00ff9f;
    letter-spacing: 0.1em;
    text-shadow: 0 0 6px #00ff9f;
    clip-path: polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px);
    box-shadow: 
        0 0 8px rgba(0, 255, 159, 0.4),
        inset 0 0 8px rgba(0, 255, 159, 0.1);
    flex-shrink: 0;
    animation: kb-mini-glow 2s ease-in-out infinite alternate;
}

@keyframes kb-mini-glow {
    0% {
        box-shadow: 
            0 0 8px rgba(0, 255, 159, 0.4),
            inset 0 0 8px rgba(0, 255, 159, 0.1);
    }
    100% {
        box-shadow: 
            0 0 15px rgba(0, 255, 159, 0.6),
            inset 0 0 12px rgba(0, 255, 159, 0.2);
    }
}

.kb-mini-dot {
    width: 6px;
    height: 6px;
    background: #00ff9f;
    border-radius: 50%;
    animation: kb-mini-pulse 1s ease-in-out infinite;
    box-shadow: 0 0 6px #00ff9f;
}

@keyframes kb-mini-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.8); }
}

/* Cyberpunk Knowledge Base Badge */
.kb-badge {
    position: relative;
    padding: 8px 16px;
    background: linear-gradient(135deg, rgba(0, 255, 159, 0.15) 0%, rgba(0, 40, 30, 0.9) 100%);
    border: 1px solid #00ff9f;
    clip-path: polygon(
        8px 0, 
        100% 0, 
        100% calc(100% - 8px), 
        calc(100% - 8px) 100%, 
        0 100%, 
        0 8px
    );
    box-shadow: 
        0 0 20px rgba(0, 255, 159, 0.4),
        0 0 40px rgba(0, 255, 159, 0.2),
        inset 0 0 20px rgba(0, 255, 159, 0.1);
    overflow: hidden;
    transition: all 0.3s ease;
}

.kb-badge:hover {
    box-shadow: 
        0 0 30px rgba(0, 255, 159, 0.6),
        0 0 60px rgba(0, 255, 159, 0.3),
        inset 0 0 30px rgba(0, 255, 159, 0.2);
    border-color: #4dffb8;
}

/* Animated scan line effect */
.kb-scanline {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
        transparent 0%,
        #00ff9f 20%,
        #00ff9f 80%,
        transparent 100%
    );
    opacity: 0.8;
    animation: kb-scan 2s linear infinite;
}

@keyframes kb-scan {
    0% { top: 0; opacity: 0.8; }
    50% { opacity: 0.4; }
    100% { top: 100%; opacity: 0.8; }
}

/* Glitch effect overlay */
.kb-glitch {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 255, 159, 0.03) 2px,
        rgba(0, 255, 159, 0.03) 4px
    );
    pointer-events: none;
    animation: kb-glitch 0.3s infinite;
}

@keyframes kb-glitch {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
}

/* Icon wrapper with rotation animation */
.kb-icon-wrapper {
    animation: kb-icon-pulse 2s ease-in-out infinite;
}

@keyframes kb-icon-pulse {
    0%, 100% { 
        filter: drop-shadow(0 0 4px #00ff9f);
        transform: scale(1);
    }
    50% { 
        filter: drop-shadow(0 0 12px #00ff9f);
        transform: scale(1.1);
    }
}

/* Text glow effect */
.kb-text {
    text-shadow: 
        0 0 5px #00ff9f,
        0 0 10px #00ff9f,
        0 0 20px rgba(0, 255, 159, 0.5);
    animation: kb-text-flicker 4s ease-in-out infinite;
}

@keyframes kb-text-flicker {
    0%, 100% { opacity: 1; }
    92% { opacity: 1; }
    93% { opacity: 0.8; }
    94% { opacity: 1; }
    95% { opacity: 0.9; }
    96% { opacity: 1; }
}

/* Pulsing indicator dot */
.kb-pulse-dot {
    width: 8px;
    height: 8px;
    background: #00ff9f;
    border-radius: 50%;
    box-shadow: 0 0 10px #00ff9f;
    animation: kb-dot-pulse 1.5s ease-in-out infinite;
}

@keyframes kb-dot-pulse {
    0%, 100% { 
        transform: scale(1);
        box-shadow: 0 0 10px #00ff9f, 0 0 20px rgba(0, 255, 159, 0.5);
    }
    50% { 
        transform: scale(1.3);
        box-shadow: 0 0 15px #00ff9f, 0 0 30px rgba(0, 255, 159, 0.8);
    }
}

@layer utilities {
    
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
}
</style>
