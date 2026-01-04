<template>
  <div class="w-full h-screen bg-black relative overflow-hidden text-white font-sans">
    
    <!-- Header / Interface -->
    <div class="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
      <div class="pointer-events-auto">
        <!-- Main Title with Enhanced Cyberpunk Style -->
        <div class="title-container">
          <h1 class="cyber-title">
            <img src="/favicon.svg" alt="Logo" class="title-icon" />
            <span class="title-text">
              <span class="title-glitch" data-text="KNOWLEDGE UNIVERSE">KNOWLEDGE UNIVERSE</span>
            </span>
          </h1>
          <!-- Animated underline -->
          <div class="title-underline">
            <div class="underline-glow"></div>
          </div>
        </div>
        
        <!-- Subtitle with Enhanced Style -->
        <div class="subtitle-container">
          <div class="subtitle-bracket">[</div>
          <p class="cyber-subtitle">
            <span class="subtitle-pulse">◆</span>
            REPOSITORY VISUALIZATION SYSTEM
            <span class="subtitle-pulse">◆</span>
          </p>
          <div class="subtitle-bracket">]</div>
        </div>
      </div>
      
      <!-- Camera Controls - Right Top Corner, Horizontal Layout -->
      <div class="pointer-events-auto flex gap-3 items-center">
        <button 
          @click="setCamera('overview')" 
          class="camera-btn"
          :class="{ 'camera-btn-active': currentCameraView === 'overview' }"
        >
          <span class="camera-btn-text">OVERVIEW</span>
        </button>
        <button 
          @click="setCamera('top')" 
          class="camera-btn"
          :class="{ 'camera-btn-active': currentCameraView === 'top' }"
        >
          <span class="camera-btn-text">TOP VIEW</span>
        </button>
        <button 
          @click="setCamera('deep')" 
          class="camera-btn"
          :class="{ 'camera-btn-active': currentCameraView === 'deep' }"
        >
          <span class="camera-btn-text">DEEP DIVE</span>
        </button>
        <button 
          @click="setCamera('reset')" 
          class="camera-btn"
          :class="{ 'camera-btn-active': currentCameraView === 'reset' }"
        >
          <span class="camera-btn-text">RESET</span>
        </button>
      </div>
    </div>

    <!-- Stats Dashboard - 左下角固定位置 (独立于 Header) -->
    <div class="fixed pointer-events-auto" style="bottom: 16px; left: 16px; z-index: 40;">
        <div class="system-metrics-container">
            <div class="metrics-header">
                <h3 class="metrics-title">SYSTEM METRICS</h3>
                <div class="metrics-subtitle">全局知识库统计</div>
            </div>
            
            <div class="metrics-content">
                <!-- KB Coverage -->
                <div class="metric-item">
                    <div class="metric-label-row">
                        <span class="metric-name">知识库覆盖率</span>
                        <span class="metric-count">{{ kbCount }} / {{ repos.length }}</span>
                    </div>
                    <div class="metric-bar-track">
                        <div class="metric-bar-fill kb-bar" :style="{ width: `${kbPercentage}%` }">
                            <span class="metric-bar-value">{{ kbPercentage }}%</span>
                        </div>
                    </div>
                    <div class="metric-target">TARGET: ALL REPOS</div>
                </div>

                <!-- Construction Progress -->
                <div class="metric-item">
                    <div class="metric-label-row">
                        <span class="metric-name">构建完成率</span>
                        <span class="metric-count">{{ constructionCount }} / {{ kbCount }}</span>
                    </div>
                    <div class="metric-bar-track">
                        <div class="metric-bar-fill construction-bar" :style="{ width: `${constructionPercentage}%` }">
                            <span class="metric-bar-value">{{ constructionPercentage }}%</span>
                        </div>
                    </div>
                    <div class="metric-target">TARGET: KB COMPLETED</div>
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
                    <!-- KB Status Badge OR Add to KB Button - inline with title -->
                    <div v-if="selectedRepo.knowledgeBase" class="kb-status-mini">
                       <div class="kb-mini-dot"></div>
                       <span>KB</span>
                    </div>
                    <!-- Add to Knowledge Base Button (for non-KB repos) -->
                    <button 
                        v-else
                        @click="addToKnowledgeBase"
                        :disabled="isUpdating"
                        class="cyber-add-btn group relative"
                    >
                        <!-- Border frame -->
                        <div class="cyber-add-border"></div>
                        <!-- Background -->
                        <div class="cyber-add-bg"></div>
                        <!-- Scan line effect -->
                        <div class="cyber-add-scanline"></div>
                        <!-- Content -->
                        <span class="relative z-10 text-[#00ff9f] text-[10px] font-bold uppercase tracking-[0.1em] font-mono transition-colors duration-300 inline-flex items-center gap-1" style="text-shadow: 0 0 6px #00ff9f;">
                            <svg class="w-[10px] h-[10px] transition-transform duration-300 group-hover:rotate-90 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="filter: drop-shadow(0 0 4px #00ff9f);">
                                <path d="M12 4v16m8-8H4" stroke-linecap="round"/>
                            </svg>
                            {{ isUpdating ? '添加中...' : '添加知识库' }}
                        </span>
                    </button>
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
    <!-- Team Stats Chart - 右下角固定位置 -->
    <div class="fixed pointer-events-auto" style="bottom: 16px; right: 16px; z-index: 40;">
        <TeamStatsChart :repos="repos" :tl-names="TL_NAMES" />
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import ThreeScene from './components/ThreeScene.vue';
import CyberPieChart from './components/CyberPieChart.vue';
import CyberProgressBar from './components/CyberProgressBar.vue';
import TeamStatsChart from './components/TeamStatsChart.vue';
import { TL_NAMES } from './config';

const repos = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedSegment = ref('');
const selectedRepo = ref(null);
const threeSceneRef = ref(null);
const isUpdating = ref(false);
const currentCameraView = ref('overview');

const handleSelectRepo = (repo) => {
    selectedRepo.value = repo;
};

const closeDetails = () => {
    selectedRepo.value = null;
};

// Handle ESC key to close details panel
const handleKeyDown = (event) => {
    if (event.key === 'Escape' && selectedRepo.value) {
        closeDetails();
    }
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
    currentCameraView.value = view;
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
  
  // Add keyboard event listener for ESC key
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  // Remove keyboard event listener
  window.removeEventListener('keydown', handleKeyDown);
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

/* ===== Enhanced Cyberpunk Title Styles ===== */

.title-container {
  position: relative;
  margin-bottom: 8px;
}

.cyber-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Courier New', monospace;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #22d3ee;
  position: relative;
  padding: 4px 0;
}

.title-icon {
  width: 36px;
  height: 36px;
  filter: drop-shadow(0 0 12px rgba(34, 211, 238, 0.8)) 
          drop-shadow(0 0 24px rgba(34, 211, 238, 0.4));
  animation: icon-spin 10s linear infinite, icon-pulse 2s ease-in-out infinite;
}

@keyframes icon-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes icon-pulse {
  0%, 100% { 
    filter: drop-shadow(0 0 12px rgba(34, 211, 238, 0.8)) 
            drop-shadow(0 0 24px rgba(34, 211, 238, 0.4));
  }
  50% { 
    filter: drop-shadow(0 0 16px rgba(34, 211, 238, 1)) 
            drop-shadow(0 0 32px rgba(34, 211, 238, 0.6));
  }
}

.title-text {
  position: relative;
  display: inline-block;
}

.title-glitch {
  position: relative;
  display: inline-block;
  text-shadow: 
    0 0 10px rgba(34, 211, 238, 0.8),
    0 0 20px rgba(34, 211, 238, 0.6),
    0 0 30px rgba(34, 211, 238, 0.4),
    2px 2px 0 rgba(0, 255, 159, 0.3),
    -2px -2px 0 rgba(255, 0, 255, 0.3);
  animation: title-glow 3s ease-in-out infinite;
}

/* Glitch effect on hover */
.title-glitch::before,
.title-glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.title-glitch::before {
  color: #00ff9f;
  animation: glitch-1 2.5s infinite;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
}

.title-glitch::after {
  color: #ff00ff;
  animation: glitch-2 2.5s infinite;
  clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
}

@keyframes title-glow {
  0%, 100% {
    text-shadow: 
      0 0 10px rgba(34, 211, 238, 0.8),
      0 0 20px rgba(34, 211, 238, 0.6),
      0 0 30px rgba(34, 211, 238, 0.4),
      2px 2px 0 rgba(0, 255, 159, 0.3),
      -2px -2px 0 rgba(255, 0, 255, 0.3);
  }
  50% {
    text-shadow: 
      0 0 15px rgba(34, 211, 238, 1),
      0 0 30px rgba(34, 211, 238, 0.8),
      0 0 45px rgba(34, 211, 238, 0.6),
      3px 3px 0 rgba(0, 255, 159, 0.4),
      -3px -3px 0 rgba(255, 0, 255, 0.4);
  }
}

@keyframes glitch-1 {
  0%, 90%, 100% {
    opacity: 0;
    transform: translate(0);
  }
  91%, 93% {
    opacity: 0.8;
    transform: translate(-2px, 2px);
  }
}

@keyframes glitch-2 {
  0%, 90%, 100% {
    opacity: 0;
    transform: translate(0);
  }
  92%, 94% {
    opacity: 0.8;
    transform: translate(2px, -2px);
  }
}

/* Animated underline */
.title-underline {
  position: relative;
  height: 2px;
  width: 100%;
  background: linear-gradient(90deg, 
    transparent 0%,
    rgba(34, 211, 238, 0.3) 20%,
    rgba(34, 211, 238, 0.8) 50%,
    rgba(34, 211, 238, 0.3) 80%,
    transparent 100%
  );
  overflow: hidden;
}

.underline-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(0, 255, 159, 1) 50%,
    transparent 100%
  );
  animation: underline-scan 3s ease-in-out infinite;
}

@keyframes underline-scan {
  0% { left: -100%; }
  100% { left: 200%; }
}

/* Subtitle Styles */
.subtitle-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding-left: 48px; /* Align with title text */
}

.subtitle-bracket {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  font-weight: 700;
  color: #00ff9f;
  text-shadow: 0 0 8px rgba(0, 255, 159, 0.8);
  animation: bracket-pulse 2s ease-in-out infinite;
}

@keyframes bracket-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.cyber-subtitle {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: rgba(34, 211, 238, 0.9);
  text-shadow: 
    0 0 5px rgba(34, 211, 238, 0.6),
    0 0 10px rgba(34, 211, 238, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  animation: subtitle-flicker 5s ease-in-out infinite;
}

.subtitle-pulse {
  color: #00ff9f;
  font-size: 8px;
  animation: diamond-pulse 1.5s ease-in-out infinite;
}

@keyframes diamond-pulse {
  0%, 100% { 
    opacity: 0.4;
    text-shadow: 0 0 4px rgba(0, 255, 159, 0.4);
  }
  50% { 
    opacity: 1;
    text-shadow: 0 0 8px rgba(0, 255, 159, 1);
  }
}

@keyframes subtitle-flicker {
  0%, 98%, 100% { opacity: 1; }
  99% { opacity: 0.8; }
}

/* Camera Control Buttons - Horizontal Layout */
.camera-btn {
  position: relative;
  padding: 8px 16px;
  background: rgba(5, 10, 20, 0.8);
  border: 1px solid rgba(34, 211, 238, 0.5);
  font-family: 'Courier New', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #22d3ee;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  clip-path: polygon(
    4px 0,
    100% 0,
    100% calc(100% - 4px),
    calc(100% - 4px) 100%,
    0 100%,
    0 4px
  );
  box-shadow: 
    0 0 10px rgba(34, 211, 238, 0.2),
    inset 0 0 10px rgba(34, 211, 238, 0.05);
}

.camera-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(34, 211, 238, 0.03) 2px,
    rgba(34, 211, 238, 0.03) 4px
  );
  pointer-events: none;
}

.camera-btn:hover {
  border-color: #22d3ee;
  box-shadow: 
    0 0 20px rgba(34, 211, 238, 0.5),
    0 0 30px rgba(34, 211, 238, 0.3),
    inset 0 0 20px rgba(34, 211, 238, 0.1);
  transform: translateY(-2px);
}

.camera-btn:active {
  transform: translateY(0);
}

.camera-btn-text {
  position: relative;
  z-index: 1;
  text-shadow: 0 0 8px rgba(34, 211, 238, 0.6);
}

.camera-btn:hover .camera-btn-text {
  text-shadow: 
    0 0 10px rgba(34, 211, 238, 1),
    0 0 20px rgba(34, 211, 238, 0.6);
}

/* Active State Styles */
.camera-btn-active {
  background: rgba(34, 211, 238, 0.2) !important;
  border-color: #22d3ee !important;
  box-shadow: 
    0 0 15px rgba(34, 211, 238, 0.4),
    inset 0 0 15px rgba(34, 211, 238, 0.2) !important;
}

.camera-btn-active .camera-btn-text {
  color: #fff;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
}

/* System Metrics Container - Matching Team Stats Style */
.system-metrics-container {
    position: relative;
    background: rgba(5, 10, 20, 0.9);
    border: 1px solid rgba(6, 182, 212, 0.6);
    border-left: 2px solid #22d3ee;
    padding: 16px;
    font-family: 'Courier New', monospace;
    overflow: hidden;
    width: 280px;
    clip-path: polygon(
        0 0, 
        100% 0, 
        100% calc(100% - 12px), 
        calc(100% - 12px) 100%, 
        0 100%
    );
    box-shadow: 
        0 0 20px rgba(6, 182, 212, 0.2),
        inset 0 0 30px rgba(6, 182, 212, 0.05);
}

.system-metrics-container::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(6, 182, 212, 0.02) 2px,
        rgba(6, 182, 212, 0.02) 4px
    );
    pointer-events: none;
    z-index: 1;
}

.metrics-header {
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(6, 182, 212, 0.4);
    position: relative;
    z-index: 2;
}

.metrics-title {
    font-size: 11px;
    font-weight: 700;
    color: #22d3ee;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin: 0 0 4px 0;
    text-shadow: 0 0 8px rgba(34, 211, 238, 0.6);
}

.metrics-subtitle {
    font-size: 9px;
    color: rgba(34, 211, 238, 0.6);
    letter-spacing: 0.1em;
}

.metrics-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.metric-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.metric-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.metric-name {
    font-size: 10px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 0.05em;
}

.metric-count {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
}

.metric-bar-track {
    height: 14px;
    background: rgba(6, 182, 212, 0.1);
    border-radius: 2px;
    overflow: hidden;
    position: relative;
}

.metric-bar-fill {
    height: 100%;
    border-radius: 2px;
    position: relative;
    transition: width 0.8s ease;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 6px;
    min-width: 40px;
}

.metric-bar-fill.kb-bar {
    background: linear-gradient(90deg, rgba(34, 211, 238, 0.3) 0%, #22d3ee 100%);
    box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
}

.metric-bar-fill.construction-bar {
    background: linear-gradient(90deg, rgba(0, 255, 159, 0.3) 0%, #00ff9f 100%);
    box-shadow: 0 0 10px rgba(0, 255, 159, 0.5);
}

.metric-bar-value {
    font-size: 9px;
    font-weight: 700;
    color: #000;
    text-shadow: none;
}

.metric-target {
    font-size: 8px;
    color: rgba(34, 211, 238, 0.5);
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

/* Scan line effect for metrics */
.metrics-scan-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
        transparent 0%,
        rgba(34, 211, 238, 0.8) 50%,
        transparent 100%
    );
    animation: metrics-scan 3s linear infinite;
    pointer-events: none;
}

@keyframes metrics-scan {
    0% { top: 0; opacity: 0.8; }
    50% { opacity: 0.4; }
    100% { top: 100%; opacity: 0.8; }
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

/* Cyberpunk Add to Knowledge Base Button - Matching KB Badge Style */
.cyber-add-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: transparent;
    border: none;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    clip-path: polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px);
}

.cyber-add-btn:hover {
    transform: translateY(-2px);
}

.cyber-add-btn:active {
    transform: translateY(0);
}

.cyber-add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.cyber-add-border {
    position: absolute;
    inset: 0;
    border: 1px solid #00ff9f;
    clip-path: polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px);
    transition: all 0.3s ease;
    box-shadow: 
        0 0 8px rgba(0, 255, 159, 0.4),
        inset 0 0 8px rgba(0, 255, 159, 0.1);
    animation: kb-mini-glow 2s ease-in-out infinite alternate;
}

.cyber-add-btn:hover .cyber-add-border {
    border-color: #4dffb8;
    box-shadow: 
        0 0 15px rgba(0, 255, 159, 0.7),
        0 0 25px rgba(0, 255, 159, 0.4),
        inset 0 0 15px rgba(0, 255, 159, 0.2);
}

.cyber-add-bg {
    position: absolute;
    inset: 1px;
    background: linear-gradient(135deg, rgba(0, 255, 159, 0.2) 0%, rgba(0, 30, 20, 0.9) 100%);
    clip-path: polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px);
    transition: all 0.3s ease;
}

.cyber-add-btn:hover .cyber-add-bg {
    background: linear-gradient(135deg, rgba(0, 255, 159, 0.35) 0%, rgba(0, 50, 35, 0.95) 100%);
}

/* Animated scan line effect */
.cyber-add-scanline {
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
    opacity: 0;
    animation: add-scan 2s linear infinite;
    pointer-events: none;
    z-index: 5;
}

.cyber-add-btn:hover .cyber-add-scanline {
    opacity: 0.8;
}

@keyframes add-scan {
    0% { top: 0; opacity: 0.8; }
    50% { opacity: 0.4; }
    100% { top: 100%; opacity: 0.8; }
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
