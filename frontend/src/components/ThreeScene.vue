<template>
  <div ref="container" class="w-full h-full relative">
    <div v-if="hoveredRepo" class="absolute top-4 left-4 bg-black/80 border border-cyan-500 text-cyan-300 p-4 rounded max-w-sm backdrop-blur-sm select-none pointer-events-none z-10">
      <h3 class="text-xl font-bold mb-2">{{ hoveredRepo.name }}</h3>
      <p class="text-sm">Team: {{ hoveredRepo.team }}</p>
      <p class="text-sm">Business: {{ hoveredRepo.businessSegment }}</p>
      <p v-if="hoveredRepo.knowledgeBase" class="text-yellow-400 font-bold mt-1">★ Knowledge Base</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import Stats from 'stats.js';
import gsap from 'gsap';
import { calculateLayout } from '../utils/layout';

const props = defineProps({
  repos: {
    type: Array,
    default: () => []
  },
  selectedRepo: {
    type: Object,
    default: null
  }
});

const emits = defineEmits(['select-repo']);

const container = ref(null);
const hoveredRepo = ref(null);


let scene, camera, renderer, controls, raycaster, pointer, stats, composer;
let animationId;
let planetMeshes = [];

// Helper to create text sprite
const createTextSprite = (text) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // High resolution for sharpness
    const fontSize = 64; 
    const font = `bold ${fontSize}px "Courier New", monospace`;
    ctx.font = font; 
    
    // Measure text
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    
    // Resize canvas to fit text (pad for safety)
    canvas.width = textWidth + 40;
    canvas.height = fontSize + 40;
    
    // Redraw after resize
    ctx.font = font;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.0)'; // Transparent bg
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Remove Glow/Shadow for sharpness
    // ctx.shadowColor = 'rgba(0, 255, 255, 1)';
    // ctx.shadowBlur = 4;
    
    ctx.fillStyle = '#ccffff'; // Use a slightly off-white cyan for readability without harsh bloom
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 20, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    // Texture filtering improvements
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    // texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // If renderer accessible, usually 16

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    // Scale sprite to be reasonable size in 3D
    // Aspect ratio
    const aspect = canvas.width / canvas.height;
    // Base height in 3D units. 
    // Previously fontSize 24 -> scaleY 10. Ratio ~ 0.4
    // Now fontSize 64. To keep same visual size, we still want scaleY ~ 10-12 representing physical height.
    const scaleY = 12; 
    sprite.scale.set(scaleY * aspect, scaleY, 1);
    
    return sprite;
};

// Initializes the Three.js scene
const initScene = () => {
    // Stats setup
    stats = new Stats();
    stats.showPanel(0); 
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '0px';
    stats.dom.style.right = '0px';
    container.value.appendChild(stats.dom);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510); // Slightly lighter deep blue for contrast
    scene.fog = new THREE.FogExp2(0x050510, 0.0008); // Less fog for neon pop

    // Camera
    camera = new THREE.PerspectiveCamera(60, container.value.clientWidth / container.value.clientHeight, 1, 4000);
    camera.position.z = 1800;
    camera.position.y = 400;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" }); // Bloom requires disabling antialias in some setups or using MSAA pass, but standard is false + distinct pass
    renderer.setSize(container.value.clientWidth, container.value.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    container.value.appendChild(renderer.domElement);

    // Post Processing
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(container.value.clientWidth, container.value.clientHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.1;
    bloomPass.strength = 1.2; // High bloom for neon
    bloomPass.radius = 0.5;

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Low ambient
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ffff, 2, 0, 2); // Cyan main light
    pointLight.position.set(200, 200, 200);
    scene.add(pointLight);

    // Stars/Grid
    addStars();
    addGrid(); // Tech grid

    // Raycaster
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    window.addEventListener('resize', onWindowResize);
    container.value.addEventListener('mousemove', onPointerMove);
    
    // Add Planets if props already has data
    if (props.repos && props.repos.length) {
        updatePlanets();
    }

    animate();
};

const addStars = () => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 5000; i++) {
        vertices.push(
            THREE.MathUtils.randFloatSpread(5000),
            THREE.MathUtils.randFloatSpread(5000),
            THREE.MathUtils.randFloatSpread(5000)
        );
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0x88ccff, size: 2, transparent: true, opacity: 0.6 });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
};

const addGrid = () => {
    // A subtle floor grid for orientation/tech feel
    const gridHelper = new THREE.GridHelper(2000, 50, 0x00ffff, 0x004488);
    gridHelper.position.y = -500;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
};

// Create Planet Objects
const createPlanet = (repo) => {
    const isKB = repo.knowledgeBase;
    // Neon Colors
    const color = isKB ? 0xffdd00 : 0x00ffff; 
    const emissive = isKB ? 0xffaa00 : 0x0088ff;
    const size = isKB ? 14 : 6;

    // Icosahedron for more low-poly tech look? Or smooth sphere? 
    // Let's go with Icosahedron with flat shading for "tech" feel
    const geometry = new THREE.IcosahedronGeometry(size, 1);
    
    const material = new THREE.MeshPhysicalMaterial({ 
        color: color,
        emissive: emissive,
        emissiveIntensity: 2.0, // High for bloom
        roughness: 0.2,
        metalness: 0.8,
        flatShading: true 
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(repo.position.x, repo.position.y, repo.position.z);
    mesh.userData = { repo }; 
    
    // KB Ring - Neon
    if (isKB) {
        const ringGeo = new THREE.TorusGeometry(size * 1.5, 1, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.8 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        // Random rotation axis to look dynamic
        mesh.add(ring);
    }

    // Label
    // Simplify name: take last part of simple name or URL
    // repo.name is already 'last part' from backend, but verify
    let labelText = repo.name || 'Repo';
    // If URL is present and name is empty/default, try parsing URL again to be safe
    if (!repo.name && repo.url) {
        const parts = repo.url.split('/').filter(Boolean);
        labelText = parts[parts.length - 1];
    }
    
    const sprite = createTextSprite(labelText);
    sprite.position.set(0, size + 10, 0); // Above the planet
    sprite.visible = false; // Hidden by default, show on hover or proximity? 
    // User asked to "Add display", typically implies permanent or LOD.
    // 800 permanently visible sprites is visually noisy. 
    // Let's make KB always visible, others visible on distance/hover? 
    // Or maybe just Make them all visible but fairly small/transparent?
    // Let's try visible=true but maybe opacity logic in animate loop if needed.
    // For now, let's keep it simple: Show all. User can ask to hide if noisy.
    
    // Correction: 800 text sprites might be heavy on draw calls but okayish.
    sprite.visible = true;
    // Reduce scale of non-KB sprites?
    if (!isKB) {
        sprite.scale.multiplyScalar(0.7);
        sprite.material.opacity = 0.7;
    }
    
    mesh.add(sprite);

    return mesh;
};

const updatePlanets = () => {
    planetMeshes.forEach(mesh => {
        scene.remove(mesh);
        // cleaning children (sprites/rings)
        mesh.children.forEach(c => {
             if(c.geometry) c.geometry.dispose();
             if(c.material) c.material.dispose();
        });
        mesh.geometry.dispose();
        mesh.material.dispose();
    });
    planetMeshes = [];

    const layoutData = calculateLayout(props.repos, 800); // Expanded radius for more space
    
    layoutData.forEach(repo => {
        const mesh = createPlanet(repo);
        scene.add(mesh);
        planetMeshes.push(mesh);
    });
};

const onPointerMove = (event) => {
    const rect = container.value.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
};

const onWindowResize = () => {
    if (!container.value) return;
    camera.aspect = container.value.clientWidth / container.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.value.clientWidth, container.value.clientHeight);
    composer.setSize(container.value.clientWidth, container.value.clientHeight);
};

const animate = () => {
    animationId = requestAnimationFrame(animate);
    
    stats.begin();
    controls.update();

    // Raycasting (Only if no repo selected)
    if (!props.selectedRepo) {
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(planetMeshes);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            container.value.style.cursor = 'pointer';
            
            if (hoveredRepo.value !== object.userData.repo) {
                hoveredRepo.value = object.userData.repo;
                object.scale.set(1.2, 1.2, 1.2);
                // Removed sprite scaling to avoid "flying text" effect
            }
        } else {
            container.value.style.cursor = 'default';
            if (hoveredRepo.value) {
                 const prevMesh = planetMeshes.find(m => m.userData.repo === hoveredRepo.value);
                 if (prevMesh) {
                     prevMesh.scale.set(1, 1, 1);
                     const sprite = prevMesh.children.find(c => c.isSprite);
                     if(sprite) sprite.scale.multiplyScalar(1/1.5);
                 }
                 hoveredRepo.value = null;
            }
        }
    } else {
        // If selected, ensure cursor is default
        container.value.style.cursor = 'default';
        if (hoveredRepo.value) {
             const prevMesh = planetMeshes.find(m => m.userData.repo === hoveredRepo.value);
             if (prevMesh) {
                 prevMesh.scale.set(1, 1, 1);
                 // Sprite scale resets automatically with parent scale reset if we didn't modify it separately?
                 // Actually, if we modified sprite scale relative to parent, we'd need to reset.
                 // But since we removed the modification above, we don't need to reset it here either,
                 // assuming the parent scale reset handles the overall size. 
                 // However, let's just be clean.
             }
             hoveredRepo.value = null;
        }
    }

    // Render with Composer
    composer.render();
    stats.end();
};

watch(() => props.repos, () => {
    if (scene) updatePlanets();
}, { deep: true });

// Click Handler
const onPointerClick = (event) => {
    // Basic raycast check (reuse logic or separate)
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(planetMeshes);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        emits('select-repo', object.userData.repo);
    } else {
        // Click on empty space deselects?
        // emits('select-repo', null);
    }
};

// Focus Animation
const focusOnRepo = (repo) => {
    if (!repo) {
        // Reset View
        gsap.to(camera.position, {
            duration: 1.5,
            x: 0,
            y: 200,
            z: 800,
            ease: "power2.inOut"
        });
        gsap.to(controls.target, {
            duration: 1.5,
            x: 0,
            y: 0,
            z: 0,
            ease: "power2.inOut",
            onUpdate: () => controls.update()
        });
        return;
    }

    const mesh = planetMeshes.find(m => m.userData.repo === repo);
    if (mesh) {
        // Target position: slightly offset from planet
        // We want to be "in front" of the planet basically.
        // Simple approach: normalize position vector, multiply by (dist + offset)
        const targetPos = mesh.position.clone();
        const offset = mesh.position.clone().normalize().multiplyScalar(100); // 100 units away
        const camPos = targetPos.clone().add(offset);
        
        // If 100 units is too close/far, adjust based on size. size is 6-14.
        
        gsap.to(camera.position, {
            duration: 1.5,
            x: camPos.x,
            y: camPos.y + 20, // slightly above
            z: camPos.z,
            ease: "power2.inOut"
        });
        
        gsap.to(controls.target, {
            duration: 1.5,
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            ease: "power2.inOut",
            onUpdate: () => controls.update()
        });
    }
};

watch(() => props.selectedRepo, (newVal) => {
    if (controls) {
        controls.autoRotate = !newVal;
    }
    focusOnRepo(newVal);
});

const setCameraView = (view) => {
    let targetPos = { x: 0, y: 0, z: 0 };
    let camPos = { x: 0, y: 0, z: 800 };

    switch(view) {
        case 'overview':
            camPos = { x: 0, y: 400, z: 1800 };
            targetPos = { x: 0, y: 0, z: 0 };
            break;
        case 'deep':
            camPos = { x: 0, y: 0, z: 50 }; // Very close inside
            targetPos = { x: 200, y: 0, z: -200 }; // Look outward slightly
            break;
        case 'top':
             camPos = { x: 0, y: 1200, z: 10 };
             targetPos = { x: 0, y: 0, z: 0 };
             break;
        case 'reset':
        default:
            camPos = { x: 0, y: 200, z: 800 };
            targetPos = { x: 0, y: 0, z: 0 };
            break;
    }

    gsap.to(camera.position, {
        duration: 2,
        x: camPos.x,
        y: camPos.y,
        z: camPos.z,
        ease: "power2.inOut"
    });

    gsap.to(controls.target, {
        duration: 2,
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        ease: "power2.inOut",
        onUpdate: () => controls.update()
    });
};

defineExpose({
    setCameraView
});

onMounted(() => {
    initScene();
    container.value.addEventListener('click', onPointerClick);
});

onBeforeUnmount(() => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', onWindowResize);
    container.value?.removeEventListener('mousemove', onPointerMove);
    container.value?.removeEventListener('click', onPointerClick);
    renderer.dispose();
    composer.dispose();
    if (stats) {
        container.value.removeChild(stats.dom);
    }
});
</script>
<script>
// Separate script block for import if needed, or just standard import in setup
</script>

<style scoped>
/* No specific styles needed, using Tailwind in template */
</style>
