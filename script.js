import * as THREE from 'three';

// Global variables
let scene, camera, renderer, heartMesh, particles;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let isAnimating = false;
let musicPlaying = false;
let currentMemoryIndex = 0;

// Memories Data
const memories = [
    // Images
    { type: 'image', src: 'images/image1.png', alt: 'Our Memory 1', caption: 'Beautiful Moment 1' },
    { type: 'image', src: 'images/image2.png', alt: 'Our Memory 2', caption: 'Beautiful Moment 2' },
    { type: 'image', src: 'images/image3.png', alt: 'Our Memory 3', caption: 'Beautiful Moment 3' },
    { type: 'image', src: 'images/imsge4.png', alt: 'Our Memory 4', caption: 'Beautiful Moment 4' },
    { type: 'image', src: 'images/imsge5.png', alt: 'Our Memory 5', caption: 'Beautiful Moment 5' },
    // Videos
    { type: 'video', src: 'videos/video1.mp4', alt: 'Video Memory 1', caption: 'Special Video Moment 1' },
    { type: 'video', src: 'videos/video2.mp4', alt: 'Video Memory 2', caption: 'Special Video Moment 2' },
    { type: 'video', src: 'videos/video3.mp4', alt: 'Video Memory 3', caption: 'Special Video Moment 3' },
    { type: 'video', src: 'videos/video4.mp4', alt: 'Video Memory 4', caption: 'Special Video Moment 4' },
    { type: 'video', src: 'videos/video5.mp4', alt: 'Video Memory 5', caption: 'Special Video Moment 5' },
    { type: 'video', src: 'videos/video6.mp4', alt: 'Video Memory 6', caption: 'Special Video Moment 6' },
    { type: 'video', src: 'videos/video7.mp4', alt: 'Video Memory 7', caption: 'Special Video Moment 7' },
    { type: 'video', src: 'videos/video8.mp4', alt: 'Video Memory 8', caption: 'Special Video Moment 8' },
    { type: 'video', src: 'videos/video9.mp4', alt: 'Video Memory 9', caption: 'Special Video Moment 9' }
];

// DOM Elements
let letterOverlay, mainContent, envelope, letter, openHeartBtn, musicToggle, backgroundMusic, messageText, iloveyouText, finalHearts, photoGrid, lightboxModal, lightboxImg, lightboxVideo, lightboxCaption, lightboxClose, cursorGlow, replayBtn, lightboxPrev, lightboxNext;

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    letterOverlay = document.getElementById('letter-overlay');
    mainContent = document.getElementById('main-content');
    envelope = document.querySelector('.envelope');
    letter = document.querySelector('.letter');
    openHeartBtn = document.getElementById('open-heart-btn');
    musicToggle = document.getElementById('music-toggle');
    backgroundMusic = document.getElementById('bg-music');
    messageText = document.querySelector('.message-card');
    iloveyouText = document.getElementById('iloveyou-text');
    finalHearts = document.getElementById('final-hearts');
    photoGrid = document.getElementById('photo-grid');
    lightboxModal = document.getElementById('lightbox-modal');
    lightboxImg = document.getElementById('lightbox-img');
    lightboxVideo = document.getElementById('lightbox-video');
    lightboxCaption = document.getElementById('lightbox-caption');
    lightboxClose = document.getElementById('lightbox-close');
    cursorGlow = document.getElementById('cursor-glow');
    replayBtn = document.getElementById('replay-btn');
    lightboxPrev = document.getElementById('lightbox-prev');
    lightboxNext = document.getElementById('lightbox-next');

    init();
    initFloatingHearts();
    initPhotoGrid();
    initEventListeners();
    animate();
});

// Initialize Three.js scene
function init() {
    const container = document.getElementById('threejs-container');
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xff6b6b, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0x8e44ad, 1, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);
    
    // Create 3D Heart
    createHeart();
    
    // Create particles
    createParticles();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Mouse tracking for parallax effect
    document.addEventListener('mousemove', onDocumentMouseMove);
}

// Create 3D Heart
function createHeart() {
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xff6b6b,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.5,
        thickness: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.8
    });
    
    heartMesh = new THREE.Mesh(geometry, material);
    scene.add(heartMesh);
    
    // Add inner glow
    const innerGlowGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const innerGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff8e8e,
        transparent: true,
        opacity: 0.3
    });
    const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
    heartMesh.add(innerGlow);
}

// Create particle system
function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const count = 1000;
    
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const color = new THREE.Color();
    
    for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 20;
        color.setHSL(Math.random(), 0.8, 0.5);
        colors[i] = color.r;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.6
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

// Window resize handler
function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Mouse move handler for parallax effect
function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) / 100;
    mouseY = (event.clientY - windowHalfY) / 100;
    
    // Update cursor glow position
    cursorGlow.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (heartMesh) {
        // Heart rotation
        heartMesh.rotation.x += 0.005;
        heartMesh.rotation.y += 0.01;
        
        // Heart pulsing
        const scale = 1 + Math.sin(Date.now() * 0.002) * 0.05;
        heartMesh.scale.set(scale, scale, scale);
        
        // Parallax effect
        heartMesh.position.x += (mouseX - heartMesh.position.x) * 0.05;
        heartMesh.position.y += (-mouseY - heartMesh.position.y) * 0.05;
    }
    
    if (particles) {
        // Rotate particles slowly
        particles.rotation.y += 0.001;
        particles.rotation.x += 0.0005;
    }
    
    renderer.render(scene, camera);
}

// Initialize floating hearts
function initFloatingHearts() {
    const container = document.getElementById('floating-hearts');
    const heartCount = 20;
    
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart-particle';
        heart.innerHTML = '❤️';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 6 + 's';
        heart.style.animationDuration = (Math.random() * 3 + 3) + 's';
        container.appendChild(heart);
    }
}

// Initialize photo grid with sample photos and video
function initPhotoGrid() {
    memories.forEach((memory, index) => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        
        let contentHtml = '';
        if (memory.type === 'video') {
            contentHtml = `
                <video src="${memory.src}" muted loop playsinline preload="metadata"></video>
                <div class="play-icon">
                    <i class="fas fa-play-circle"></i>
                </div>
            `;
        } else {
            contentHtml = `<img src="${memory.src}" alt="${memory.alt}" loading="lazy">`;
        }
        
        card.innerHTML = `
            ${contentHtml}
            <div class="photo-overlay">
                <span>${memory.caption}</span>
            </div>
        `;
        
        // Add hover effect for videos
        if (memory.type === 'video') {
            const video = card.querySelector('video');
            card.addEventListener('mouseenter', () => {
                video.play().catch(e => console.log('Preview play failed:', e));
            });
            card.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
        }
        
        card.addEventListener('click', () => openLightbox(index));
        photoGrid.appendChild(card);
    });
}

// Lightbox functionality
function openLightbox(index) {
    currentMemoryIndex = index;
    updateLightboxContent();
    lightboxModal.classList.add('open');
}

function updateLightboxContent() {
    const memory = memories[currentMemoryIndex];
    lightboxCaption.textContent = memory.caption;
    
    if (memory.type === 'video') {
        lightboxImg.style.display = 'none';
        lightboxVideo.style.display = 'block';
        lightboxVideo.src = memory.src;
        lightboxVideo.play().catch(e => console.log('Video play failed:', e));
    } else {
        lightboxVideo.style.display = 'none';
        lightboxVideo.pause();
        lightboxImg.style.display = 'block';
        lightboxImg.src = memory.src;
        lightboxImg.alt = memory.alt;
        
        // Add animation class
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightboxImg.style.opacity = '1';
        }, 100);
    }
}

function nextMemory(e) {
    if (e) e.stopPropagation();
    currentMemoryIndex = (currentMemoryIndex + 1) % memories.length;
    updateLightboxContent();
}

function prevMemory(e) {
    if (e) e.stopPropagation();
    currentMemoryIndex = (currentMemoryIndex - 1 + memories.length) % memories.length;
    updateLightboxContent();
}

function closeLightbox() {
    lightboxModal.classList.remove('open');
    lightboxVideo.pause();
    lightboxVideo.currentTime = 0;
}

// Event listeners
function initEventListeners() {
    // Letter opening animation
    envelope.addEventListener('click', openEnvelope);
    letter.addEventListener('click', openMessage);
    
    // Sync music state
    backgroundMusic.addEventListener('play', () => {
        musicPlaying = true;
        musicToggle.classList.add('active');
    });
    
    backgroundMusic.addEventListener('pause', () => {
        musicPlaying = false;
        musicToggle.classList.remove('active');
    });
    
    // Play music on first interaction (browser policy)
    const playMusic = () => {
        backgroundMusic.play().then(() => {
            musicToggle.classList.add('active');
            musicPlaying = true;
            document.removeEventListener('click', playMusic);
        }).catch(e => console.log('Auto-play prevented:', e));
    };
    
    document.addEventListener('click', playMusic, { once: true });
    
    // Music toggle
    musicToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMusic();
    });
    
    // Lightbox close
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            closeLightbox();
        }
    });
    
    // Replay button
    if (replayBtn) {
        replayBtn.addEventListener('click', replayStory);
    }
    
    // Open heart button (scroll to message)
    if (openHeartBtn) {
        openHeartBtn.addEventListener('click', () => {
            const loveMessage = document.getElementById('love-message');
            if (loveMessage) {
                // Account for fixed header or add offset if needed
                const offset = 50;
                const elementPosition = loveMessage.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    }

    // Lightbox navigation
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', prevMemory);
    }
    if (lightboxNext) {
        lightboxNext.addEventListener('click', nextMemory);
    }

    // Mobile Swipe Navigation
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightboxModal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    lightboxModal.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        // Minimum swipe distance to trigger action
        const threshold = 50;
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) > threshold) {
            if (swipeDistance < 0) {
                // Swipe Left -> Next
                nextMemory();
            } else {
                // Swipe Right -> Previous
                prevMemory();
            }
        }
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft' && lightboxModal.classList.contains('open')) {
            prevMemory();
        } else if (e.key === 'ArrowRight' && lightboxModal.classList.contains('open')) {
            nextMemory();
        }
    });
    
    // Scroll animations
    window.addEventListener('scroll', handleScroll);
    
    // Add cursor glow on mouse enter
    document.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-active');
    });
    
    document.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-active');
    });
}

// Open envelope animation
function openEnvelope() {
    if (envelope.classList.contains('opened')) return;
    envelope.classList.add('opened');
    
    // Ensure music plays when envelope is opened (user interaction)
    if (!musicPlaying) {
        backgroundMusic.play().then(() => {
            musicToggle.classList.add('active');
            musicPlaying = true;
        }).catch(e => console.log('Music play failed:', e));
    }
}

// Open message animation (transition to main content)
function openMessage(e) {
    e.stopPropagation();
    if (!envelope.classList.contains('opened') || isAnimating) return;
    
    isAnimating = true;
    
    // Fade out overlay
    letterOverlay.style.opacity = '0';
    
    setTimeout(() => {
        letterOverlay.style.display = 'none';
        mainContent.style.display = 'block';
        
        // Trigger scroll animations
        setTimeout(() => {
            triggerScrollAnimations();
        }, 100);
        
        isAnimating = false;
    }, 500);
}

// Toggle background music
function toggleMusic() {
    if (musicPlaying) {
        backgroundMusic.pause();
        musicToggle.classList.remove('active');
        musicPlaying = false;
    } else {
        backgroundMusic.play().catch(e => console.log('Music play failed:', e));
        musicToggle.classList.add('active');
        musicPlaying = true;
    }
}

// Handle scroll animations
function handleScroll() {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Animate message text paragraphs
    const paragraphs = messageText.querySelectorAll('p');
    paragraphs.forEach((p, index) => {
        const elementTop = p.getBoundingClientRect().top + scrollPosition;
        const startAnimation = elementTop < scrollPosition + windowHeight - 100;
        
        if (startAnimation) {
            p.style.transitionDelay = `${index * 0.2}s`;
            p.style.opacity = '1';
            p.style.transform = 'translateY(0)';
        }
    });
    
    // Animate I Love You text
    const iloveyouTop = iloveyouText.getBoundingClientRect().top + scrollPosition;
    if (iloveyouTop < scrollPosition + windowHeight - 100) {
        iloveyouText.style.opacity = '1';
        iloveyouText.style.transform = 'scale(1)';
    }
    
    // Create final hearts animation
    if (scrollPosition > document.body.scrollHeight - windowHeight - 200) {
        createFinalHearts();
    }
}

// Trigger initial scroll animations
function triggerScrollAnimations() {
    // Animate hero content
    const heroContent = document.querySelector('.hero-content');
    heroContent.style.opacity = '1';
    heroContent.style.transform = 'translateY(0)';
    
    // Animate scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    scrollIndicator.style.opacity = '1';
    scrollIndicator.style.transform = 'translateY(0)';
}

// Create final hearts animation
function createFinalHearts() {
    if (finalHearts.children.length > 0) return;
    
    const heartCount = 10;
    
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart-icon-small';
        heart.innerHTML = '❤️';
        heart.style.animationDelay = Math.random() * 2 + 's';
        finalHearts.appendChild(heart);
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .hero-content {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
    }
    
    .scroll-indicator {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
    }
    
    .final-title {
        opacity: 0;
        transform: scale(0.8);
        transition: all 1s cubic-bezier(0.4, 0.0, 0.2, 1);
    }
`;
document.head.appendChild(style);

// Replay functionality
function replayStory() {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Fade out main content
    mainContent.style.transition = 'opacity 0.8s ease';
    mainContent.style.opacity = '0';
    
    setTimeout(() => {
        // Hide main content and show overlay
        mainContent.style.display = 'none';
        letterOverlay.style.display = 'flex';
        
        // Reset envelope state
        envelope.classList.remove('opened');
        
        // Fade in overlay
        setTimeout(() => {
            letterOverlay.style.opacity = '1';
            
            // Reset main content opacity for next time
            mainContent.style.opacity = '1';
            
            // Reset animations
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.opacity = '0';
                heroContent.style.transform = 'translateY(30px)';
            }
            
            const scrollIndicator = document.querySelector('.scroll-indicator');
            if (scrollIndicator) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.transform = 'translateY(20px)';
            }
            
            // Reset text animations
            const paragraphs = messageText.querySelectorAll('p');
            paragraphs.forEach(p => {
                p.style.opacity = '0';
                p.style.transform = 'translateY(20px)';
            });
            
            iloveyouText.style.opacity = '0';
            iloveyouText.style.transform = 'scale(0.8)';
            
        }, 50);
    }, 800);
}