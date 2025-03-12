// Game configuration
const gameConfig = {
    // Default method name and description (can be changed)
    methodName: "LAKTASYONEL AMONERE METODU (LAM)",
    methodDescription: "Laktasyonel amonere metodu; emzirmenin, bazı koşullara uyulması halinde, fizyolojik etkisiyle ovulasyonu baskılamasına dayanan bir aile planlaması yöntemidir.",
    
    // Questions with their details
    questions: [
        {
            id: 1,
            text: "Bebeğiniz 6 aylıktan daha küçük mü?",
            explanation: "6 aydan küçük bebeklerde LAM uygulanamaz."
        },
        {
            id: 2,
            text: "Adetleriniz başladı mı? (Doğumdan sonra ilk 8 haftadaki kanama sayılmaz.)",
            explanation: "Doğumdan sonraki 8 haftadan sonra 2 tam gün menstrüel kanama görülmüşse başka bir yöntem için danışmanlık alabilirsiniz.",
            negativeRequired: true
        },
        {
            id: 3,
            text: " Bebeğinizi gündüz ve gece her istedikçe, sık aralıklarla (günde 6-10 kez) ve en az 4 dakika, her iki memeden tam ve tama yakın emziriyor musunuz?",
            explanation: "LAM yöntemini etkili olarak kullanmak için tam emzirmenin olması gerekir. "
        },
        {
            id: 4,
            text: "Bebeğinize herhangi bir ek gıda veriyor musunuz?",
            explanation: "LAM'ın etkili olabilmesi için tam emzirme gerekir ve bunun için herhangi bir ek gıda kulanılmamalıdır. ",
            negativeRequired: true
        },
        {
            id: 5,
            text: "AIDS misiniz? AIDS' e yol açan HIV ile enfekte misiniz?",
            explanation: "HIV anne sütü ile bebeğe bulaşabilir. ",
            negativeRequired: true
        },
        {
            id: 6,
            text: "Sağlık personeli tarafından herhangi bir sebepten ötürü bebeğinizi emzirmemeniz gerektiği söylendi mi?",
            explanation: "Emzirmeyi etkileyecek ilaçlar kullanılıyorsa veya aktif viral hepatit varsa emzirilmemelidir. ",
            negativeRequired: true
        }
    ],
    
    // Sound settings
    sounds: {
        enabled: true,
        volume: 0.5
    }
};

// Game state
const gameState = {
    currentQuestionIndex: 0,
    answers: [],
    failedReasons: [],
    pathChosen: null
};

// Audio Context for sound effects
let audioContext;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const methodTitle = document.getElementById('method-title');
const methodDescription = document.getElementById('method-description');
const startButton = document.getElementById('start-button');
const questionText = document.getElementById('question-text');
const yesPath = document.getElementById('yes-path');
const noPath = document.getElementById('no-path');
const questionCounter = document.getElementById('question-counter');
const progressIndicator = document.getElementById('progress-indicator');
const resultTitle = document.getElementById('result-title');
const resultDescription = document.getElementById('result-description');
const resultIcon = document.getElementById('result-icon');
const failedReasons = document.getElementById('failed-reasons');
const restartButton = document.getElementById('restart-button');
const doctorCharacter = document.getElementById('doctor-character');
const currentJunction = document.getElementById('current-junction');

// Mobil cihaz kontrolü
let isMobile = false;

function checkIfMobile() {
    isMobile = window.innerWidth <= 768;
    
    // Mobil cihazlarda başlangıç konumu düzelt
    if (doctorCharacter) {
        doctorCharacter.style.bottom = isMobile ? 
            (window.innerWidth <= 480 ? '50px' : '40px') : '20px';
    }
    
    // Ekranlara mobil sınıfı ekle/çıkar
    document.body.classList.toggle('mobile-device', isMobile);
}

// Initialize the game
function initGame() {
    // Set method name and description
    methodTitle.textContent = gameConfig.methodName;
    methodDescription.textContent = gameConfig.methodDescription;
    
    // Reset game state
    gameState.currentQuestionIndex = 0;
    gameState.answers = [];
    gameState.failedReasons = [];
    gameState.pathChosen = null;
    
    // Mobil cihaz kontrolü
    checkIfMobile();
    
    // Reset doctor position
    doctorCharacter.style.transform = 'translateX(-50%)';
    doctorCharacter.style.bottom = isMobile ? '50px' : '20px';
    doctorCharacter.style.left = '50%';
    doctorCharacter.className = 'doctor-character';
    
    // Initialize Web Audio API
    initAudio();
    
    // Event listeners
    startButton.addEventListener('click', startGame);
    yesPath.addEventListener('click', () => selectPath(true));
    noPath.addEventListener('click', () => selectPath(false));
    restartButton.addEventListener('click', resetGame);
    
    // Ekran yeniden boyutlandırma için dinleyici
    window.addEventListener('resize', checkIfMobile);
}

// Initialize Audio Context for sound effects
function initAudio() {
    try {
        // Check if AudioContext is already initialized
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Resume audio context if it was suspended (browsers often require user interaction)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    } catch (e) {
        console.log('Web Audio API not supported in this browser');
        gameConfig.sounds.enabled = false;
    }
}

// Start the game
function startGame() {
    showScreen(gameScreen);
    displayCurrentQuestion();
    playUiSound('start');
}

// Display the current question
function displayCurrentQuestion() {
    const question = gameConfig.questions[gameState.currentQuestionIndex];
    questionText.textContent = question.text;
    
    // Update progress
    //const progress = ((gameState.currentQuestionIndex + 1) / gameConfig.questions.length) * 100;
    questionCounter.textContent = `Soru: ${gameState.currentQuestionIndex + 1}/${gameConfig.questions.length}`;
    //progressIndicator.textContent = `İlerleme: ${progress}%`;
    
    // Reset doctor for new question
    doctorCharacter.className = 'doctor-character';
    
    // Reset doctor position for the new question path
    if (gameState.currentQuestionIndex > 0) {
        // Reset position for next question
        setTimeout(() => {
            doctorCharacter.style.transition = 'none';
            doctorCharacter.style.bottom = '20px';
            doctorCharacter.style.left = '50%';
            setTimeout(() => {
                doctorCharacter.style.transition = 'all 0.8s ease';
            }, 50);
        }, 300);
        
        // Play new question sound
        playUiSound('question');
    }
}

// Handle path selection
function selectPath(isYes) {
    // Save chosen path
    gameState.pathChosen = isYes;
    
    // Animate doctor movement based on choice
    if (isYes) {
        doctorCharacter.classList.add('move-to-yes');
    } else {
        doctorCharacter.classList.add('move-to-no');
    }
    
    // After animation completes, process answer
    setTimeout(() => {
        processAnswer(isYes);
    }, 1500);
    
    // Disable path selection during animation
    yesPath.style.pointerEvents = 'none';
    noPath.style.pointerEvents = 'none';
    
    // Re-enable after animation
    setTimeout(() => {
        yesPath.style.pointerEvents = 'auto';
        noPath.style.pointerEvents = 'auto';
    }, 1600);
    
    // Play selection movement sound
    playMoveSound();
}

// Process the answer and determine next step
function processAnswer(isYes) {
    const currentQuestion = gameConfig.questions[gameState.currentQuestionIndex];
    const isCorrectAnswer = currentQuestion.negativeRequired ? !isYes : isYes;
    
    // Save answer
    gameState.answers.push({
        questionId: currentQuestion.id,
        question: currentQuestion.text,
        answer: isYes,
        isCorrect: isCorrectAnswer,
        explanation: currentQuestion.explanation
    });
    
    // If answer is incorrect, add to failed reasons
    if (!isCorrectAnswer) {
        gameState.failedReasons.push({
            question: currentQuestion.text,
            explanation: currentQuestion.explanation
        });
        
        // Play wrong answer sound
        playAnswerSound(false);
    } else {
        // Play correct answer sound
        playAnswerSound(true);
    }
    
    // Move to next question or show result
    if (gameState.currentQuestionIndex < gameConfig.questions.length - 1) {
        gameState.currentQuestionIndex++;
        displayCurrentQuestion();
    } else {
        showResult();
    }
}

// Show the result screen
function showResult() {
    showScreen(resultScreen);
    
    // Determine if all answers are correct
    const isSuccessful = gameState.failedReasons.length === 0;
    
    if (isSuccessful) {
        // Success case
        resultIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        resultIcon.className = 'result-icon success';
        resultTitle.textContent = 'Yöntem Uygulanabilir!';
        resultDescription.textContent = `Tüm kriterleri karşıladınız. ${gameConfig.methodName} uygulanabilir.`;
        failedReasons.style.display = 'none';
        
        // Show confetti for success
        showConfetti();
        
        // Play success sound
        playResultSound(true);
    } else {
        // Failed case
        resultIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        resultIcon.className = 'result-icon failure';
        resultTitle.textContent = 'Yöntem Uygulanamaz!';
        resultDescription.textContent = 'Aşağıdaki nedenlerden dolayı bu yöntem uygulanamaz:';
        
        // Display failed reasons
        failedReasons.style.display = 'block';
        failedReasons.innerHTML = '<h3>Kriterleri karşılamayan durumlar:</h3>';
        
        gameState.failedReasons.forEach(reason => {
            const reasonItem = document.createElement('div');
            reasonItem.classList.add('failed-reason-item');
            reasonItem.textContent = `${reason.explanation}`;
            failedReasons.appendChild(reasonItem);
        });
        
        // Play failure sound
        playResultSound(false);
    }
}

// Show confetti animation for success
function showConfetti() {
    const confettiContainer = document.getElementById('confetti-container');
    confettiContainer.innerHTML = '';
    
    // Create confetti pieces
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random properties
        const size = Math.random() * 10 + 5;
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.backgroundColor = color;
        confetti.style.position = 'absolute';
        confetti.style.top = '-20px';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.opacity = Math.random() + 0.5;
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        // Animation
        const animationDuration = Math.random() * 3 + 2;
        confetti.style.animation = `fall ${animationDuration}s linear forwards`;
        
        confettiContainer.appendChild(confetti);
    }
    
    // Add style for fall animation
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes fall {
            0% { transform: translateY(0) rotate(0); }
            100% { transform: translateY(600px) rotate(360deg); }
        }
        .confetti {
            border-radius: 50%;
        }
    `;
    document.head.appendChild(styleSheet);
}

// Reset the game to start again
function resetGame() {
    gameState.currentQuestionIndex = 0;
    gameState.answers = [];
    gameState.failedReasons = [];
    gameState.pathChosen = null;
    
    // Reset doctor character
    doctorCharacter.className = 'doctor-character';
    doctorCharacter.style.bottom = isMobile ? 
        (window.innerWidth <= 480 ? '50px' : '40px') : '20px';
    doctorCharacter.style.left = '50%';
    
    showScreen(startScreen);
    
    // Play reset sound
    playUiSound('reset');
}

// Helper function to show only one screen
function showScreen(screenToShow) {
    // Hide all screens
    startScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    resultScreen.classList.remove('active');
    
    // Show the requested screen
    screenToShow.classList.add('active');
}

// Sound Effect Functions
function playAnswerSound(isCorrect) {
    if (!gameConfig.sounds.enabled || !audioContext) return;
    
    try {
        if (isCorrect) {
            // DOĞRU CEVAP: Neşeli, yükselen arpej
            const correctSequence = [
                { freq: 440.00, duration: 0.1, start: 0.0, type: 'sine' },     // A4
                { freq: 554.37, duration: 0.1, start: 0.1, type: 'sine' },     // C#5
                { freq: 659.25, duration: 0.1, start: 0.2, type: 'sine' },     // E5
                { freq: 880.00, duration: 0.2, start: 0.3, type: 'sine' }      // A5
            ];
            
            // Her nota için ayrı osilatör oluştur
            correctSequence.forEach(note => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                
                osc.type = note.type;
                osc.frequency.value = note.freq;
                
                // Ses yükselme ve azalma ile daha doğal ses
                gain.gain.setValueAtTime(0, audioContext.currentTime + note.start);
                gain.gain.linearRampToValueAtTime(gameConfig.sounds.volume, audioContext.currentTime + note.start + 0.01);
                gain.gain.setValueAtTime(gameConfig.sounds.volume, audioContext.currentTime + note.start + note.duration - 0.05);
                gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + note.start + note.duration);
                
                osc.connect(gain);
                gain.connect(audioContext.destination);
                
                osc.start(audioContext.currentTime + note.start);
                osc.stop(audioContext.currentTime + note.start + note.duration);
            });
            
            // Ek parlak efekt için kısa süre içerisinde yüksek frekans
            const shineFx = audioContext.createOscillator();
            const shineGain = audioContext.createGain();
            
            shineFx.type = 'sine';
            shineFx.frequency.value = 1200;
            
            shineGain.gain.setValueAtTime(0, audioContext.currentTime + 0.45);
            shineGain.gain.linearRampToValueAtTime(gameConfig.sounds.volume * 0.15, audioContext.currentTime + 0.47);
            shineGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.6);
            
            shineFx.connect(shineGain);
            shineGain.connect(audioContext.destination);
            
            shineFx.start(audioContext.currentTime + 0.45);
            shineFx.stop(audioContext.currentTime + 0.6);
        } else {
            // YANLIŞ CEVAP: Düşük, rahatsız edici ses
            const wrongSound = audioContext.createOscillator();
            const distortion = audioContext.createWaveShaper();
            const filter = audioContext.createBiquadFilter();
            const gain = audioContext.createGain();
            
            // Bozulma efekti için fonksiyon
            function makeDistortionCurve(amount) {
                const samples = 44100;
                const curve = new Float32Array(samples);
                const deg = Math.PI / 180;
                
                for (let i = 0; i < samples; ++i) {
                    const x = i * 2 / samples - 1;
                    curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
                }
                
                return curve;
            }
            
            // Düşük, karamsar ses
            wrongSound.type = 'sawtooth';
            wrongSound.frequency.setValueAtTime(180, audioContext.currentTime);
            wrongSound.frequency.setValueAtTime(150, audioContext.currentTime + 0.2);
            wrongSound.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.6);
            
            // Bozulma ve filtre ekle
            distortion.curve = makeDistortionCurve(30);
            filter.type = 'lowpass';
            filter.frequency.value = 600;
            filter.Q.value = 15;
            
            // Ses şiddetini ayarla
            gain.gain.setValueAtTime(0, audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(gameConfig.sounds.volume * 0.3, audioContext.currentTime + 0.05);
            gain.gain.setValueAtTime(gameConfig.sounds.volume * 0.3, audioContext.currentTime + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.7);
            
            // Bağlantıları yap
            wrongSound.connect(distortion);
            distortion.connect(filter);
            filter.connect(gain);
            gain.connect(audioContext.destination);
            
            wrongSound.start();
            wrongSound.stop(audioContext.currentTime + 0.7);
            
            // İkinci bir düşük ton ekle
            setTimeout(() => {
                const secondWrong = audioContext.createOscillator();
                const secondGain = audioContext.createGain();
                
                secondWrong.type = 'triangle';
                secondWrong.frequency.setValueAtTime(120, audioContext.currentTime);
                secondWrong.frequency.linearRampToValueAtTime(80, audioContext.currentTime + 0.3);
                
                secondGain.gain.setValueAtTime(0, audioContext.currentTime);
                secondGain.gain.linearRampToValueAtTime(gameConfig.sounds.volume * 0.2, audioContext.currentTime + 0.05);
                secondGain.gain.setValueAtTime(gameConfig.sounds.volume * 0.2, audioContext.currentTime + 0.15);
                secondGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.4);
                
                secondWrong.connect(secondGain);
                secondGain.connect(audioContext.destination);
                
                secondWrong.start();
                secondWrong.stop(audioContext.currentTime + 0.4);
            }, 150);
        }
    } catch (e) {
        console.log('Sound could not be played', e);
    }
}

function playResultSound(isSuccess) {
    if (!gameConfig.sounds.enabled || !audioContext) return;
    
    try {
        if (isSuccess) {
            // BAŞARI FANFAR SESİ - Daha zengin ve coşkulu
            
            // Ana melodi sesleri
            const fanfarNotes = [
                { freq: 523.25, time: 0.0, duration: 0.15 },   // C5
                { freq: 659.25, time: 0.15, duration: 0.15 },  // E5
                { freq: 783.99, time: 0.3, duration: 0.15 },   // G5
                { freq: 1046.50, time: 0.45, duration: 0.6 }   // C6 (uzun)
            ];
            
            // Ana melodiyi çal
            fanfarNotes.forEach(note => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = note.freq;
                
                gain.gain.setValueAtTime(0, audioContext.currentTime + note.time);
                gain.gain.linearRampToValueAtTime(gameConfig.sounds.volume * 0.5, audioContext.currentTime + note.time + 0.02);
                
                // Son nota için azalma ekle
                if (note.time === 0.45) {
                    gain.gain.setValueAtTime(gameConfig.sounds.volume * 0.5, audioContext.currentTime + note.time + note.duration - 0.3);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + note.time + note.duration);
                } else {
                    gain.gain.setValueAtTime(gameConfig.sounds.volume * 0.5, audioContext.currentTime + note.time + note.duration - 0.05);
                    gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + note.time + note.duration);
                }
                
                osc.connect(gain);
                gain.connect(audioContext.destination);
                
                osc.start(audioContext.currentTime + note.time);
                osc.stop(audioContext.currentTime + note.time + note.duration);
            });
            
            // Armoni ekleme - Alt notalar
            const harmonyNotes = [
                { freq: 261.63, time: 0.0, duration: 0.3 },    // C4
                { freq: 329.63, time: 0.3, duration: 0.3 },    // E4
                { freq: 392.00, time: 0.6, duration: 0.45 }    // G4
            ];
            
            harmonyNotes.forEach(note => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = note.freq;
                
                gain.gain.setValueAtTime(0, audioContext.currentTime + note.time);
                gain.gain.linearRampToValueAtTime(gameConfig.sounds.volume * 0.3, audioContext.currentTime + note.time + 0.05);
                gain.gain.setValueAtTime(gameConfig.sounds.volume * 0.3, audioContext.currentTime + note.time + note.duration - 0.1);
                gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + note.time + note.duration);
                
                osc.connect(gain);
                gain.connect(audioContext.destination);
                
                osc.start(audioContext.currentTime + note.time);
                osc.stop(audioContext.currentTime + note.time + note.duration);
            });
            
            // Parlak efekt ekleme
            setTimeout(() => {
                const shimmerOsc = audioContext.createOscillator();
                const shimmerGain = audioContext.createGain();
                const shimmerFilter = audioContext.createBiquadFilter();
                
                shimmerOsc.type = 'triangle';
                shimmerOsc.frequency.value = 1200;
                
                shimmerFilter.type = 'highpass';
                shimmerFilter.frequency.value = 800;
                
                shimmerGain.gain.setValueAtTime(0, audioContext.currentTime);
                shimmerGain.gain.linearRampToValueAtTime(gameConfig.sounds.volume * 0.1, audioContext.currentTime + 0.1);
                shimmerGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
                
                shimmerOsc.connect(shimmerFilter);
                shimmerFilter.connect(shimmerGain);
                shimmerGain.connect(audioContext.destination);
                
                shimmerOsc.start();
                shimmerOsc.stop(audioContext.currentTime + 0.8);
            }, 500);
            
        } else {
            // BAŞARISIZLIK SESİ - Daha dramatik, düşüş etkisi
            
            // Başarısızlık ana tonları
            const failNotes = [
                { freq: 466.16, time: 0.0, duration: 0.2, type: 'sawtooth' },  // A#4/Bb4
                { freq: 392.00, time: 0.2, duration: 0.2, type: 'sawtooth' },  // G4
                { freq: 349.23, time: 0.4, duration: 0.2, type: 'sawtooth' },  // F4
                { freq: 311.13, time: 0.6, duration: 0.2, type: 'sawtooth' },  // D#4/Eb4
                { freq: 277.18, time: 0.8, duration: 0.4, type: 'sawtooth' },  // C#4/Db4
                { freq: 233.08, time: 1.2, duration: 0.8, type: 'sawtooth' }   // A#3/Bb3 (uzun)
            ];
            
            // Daha zengin ses için bir distortion oluştur
            const distortion = audioContext.createWaveShaper();
            function makeDistortionCurve(amount) {
                let k = typeof amount === 'number' ? amount : 25;
                const n_samples = 44100;
                const curve = new Float32Array(n_samples);
                const deg = Math.PI / 180;
                
                for (let i = 0; i < n_samples; ++i) {
                    const x = i * 2 / n_samples - 1;
                    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
                }
                return curve;
            }
            distortion.curve = makeDistortionCurve(5);
            distortion.oversample = '4x';
            
            // Başarısızlık seslerini çal
            failNotes.forEach(note => {
                // Ana osilatör
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                const filter = audioContext.createBiquadFilter();
                
                osc.type = note.type;
                osc.frequency.value = note.freq;
                
                filter.type = 'lowpass';
                filter.frequency.value = 2000;
                
                gain.gain.setValueAtTime(0, audioContext.currentTime + note.time);
                gain.gain.linearRampToValueAtTime(gameConfig.sounds.volume * 0.25, audioContext.currentTime + note.time + 0.05);
                
                // Son nota için özel azalma ekle
                if (note.time === 1.2) {
                    gain.gain.setValueAtTime(gameConfig.sounds.volume * 0.25, audioContext.currentTime + note.time + 0.4);
                    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + note.time + note.duration);
                } else {
                    gain.gain.setValueAtTime(gameConfig.sounds.volume * 0.25, audioContext.currentTime + note.time + note.duration - 0.05);
                    gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + note.time + note.duration);
                }
                
                osc.connect(filter);
                filter.connect(distortion);
                distortion.connect(gain);
                gain.connect(audioContext.destination);
                
                osc.start(audioContext.currentTime + note.time);
                osc.stop(audioContext.currentTime + note.time + note.duration);
                
                // Her notaya düşük frekans ekleme
                if (note.time < 1.0) {
                    const subOsc = audioContext.createOscillator();
                    const subGain = audioContext.createGain();
                    
                    subOsc.type = 'sine';
                    subOsc.frequency.value = note.freq / 2; // Bir oktav aşağısı
                    
                    subGain.gain.setValueAtTime(0, audioContext.currentTime + note.time);
                    subGain.gain.linearRampToValueAtTime(gameConfig.sounds.volume * 0.15, audioContext.currentTime + note.time + 0.05);
                    subGain.gain.setValueAtTime(gameConfig.sounds.volume * 0.15, audioContext.currentTime + note.time + note.duration - 0.05);
                    subGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + note.time + note.duration);
                    
                    subOsc.connect(subGain);
                    subGain.connect(audioContext.destination);
                    
                    subOsc.start(audioContext.currentTime + note.time);
                    subOsc.stop(audioContext.currentTime + note.time + note.duration);
                }
            });
            
            // Ek dramatik düşük ton efekti
            setTimeout(() => {
                const rumbleOsc = audioContext.createOscillator();
                const rumbleGain = audioContext.createGain();
                const rumbleFilter = audioContext.createBiquadFilter();
                
                rumbleOsc.type = 'sine';
                rumbleOsc.frequency.value = 60;
                
                rumbleFilter.type = 'lowpass';
                rumbleFilter.frequency.value = 100;
                
                rumbleGain.gain.setValueAtTime(0, audioContext.currentTime);
                rumbleGain.gain.linearRampToValueAtTime(gameConfig.sounds.volume * 0.2, audioContext.currentTime + 0.3);
                rumbleGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.0);
                
                rumbleOsc.connect(rumbleFilter);
                rumbleFilter.connect(rumbleGain);
                rumbleGain.connect(audioContext.destination);
                
                rumbleOsc.start();
                rumbleOsc.stop(audioContext.currentTime + 1.0);
            }, 800);
        }
    } catch (e) {
        console.log('Result sound could not be played', e);
    }
}

function playMoveSound() {
    if (!gameConfig.sounds.enabled || !audioContext) return;
    
    try {
        // Movement sound - footsteps/movement effect
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        // Configure oscillator
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioContext.currentTime);
        osc.frequency.linearRampToValueAtTime(80, audioContext.currentTime + 0.3);
        
        // Configure filter
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 5;
        
        // Configure gain
        gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(gameConfig.sounds.volume * 0.3, audioContext.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        // Connect nodes
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);
        
        // Start and stop
        osc.start();
        osc.stop(audioContext.currentTime + 0.3);
        
        // Add second movement sound after a delay
        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            const filter2 = audioContext.createBiquadFilter();
            
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(120, audioContext.currentTime);
            osc2.frequency.linearRampToValueAtTime(60, audioContext.currentTime + 0.3);
            
            filter2.type = 'lowpass';
            filter2.frequency.value = 600;
            filter2.Q.value = 5;
            
            gain2.gain.setValueAtTime(0, audioContext.currentTime);
            gain2.gain.linearRampToValueAtTime(gameConfig.sounds.volume * 0.3, audioContext.currentTime + 0.01);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            
            osc2.connect(filter2);
            filter2.connect(gain2);
            gain2.connect(audioContext.destination);
            
            osc2.start();
            osc2.stop(audioContext.currentTime + 0.4);
        }, 300);
    } catch (e) {
        console.log('Move sound could not be played', e);
    }
}

function playUiSound(soundType) {
    if (!gameConfig.sounds.enabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        switch (soundType) {
            case 'start':
                // Game start sound
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(880, audioContext.currentTime + 0.1);
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(gameConfig.sounds.volume * 0.5, audioContext.currentTime + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                break;
                
            case 'reset':
                // Game reset sound
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(440, audioContext.currentTime + 0.2);
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(gameConfig.sounds.volume * 0.4, audioContext.currentTime + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                break;
                
            case 'question':
                // New question sound
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(700, audioContext.currentTime + 0.05);
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(gameConfig.sounds.volume * 0.3, audioContext.currentTime + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                break;
        }
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('UI sound could not be played', e);
    }
}

// Lazy load images for better performance
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// Initialize the game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set page-specific metadata for better SEO
    document.title = `${gameConfig.methodName} | Tıbbi Yol Karar Oyunu`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', gameConfig.methodDescription);
    }
    
    // Initialize game
    initGame();
    
    // Lazy load images
    lazyLoadImages();
    
    // Add event listeners for analytics
    document.getElementById('start-button').addEventListener('click', () => {
        if (typeof gtag === 'function') {
            gtag('event', 'game_start', {
                'event_category': 'engagement',
                'event_label': gameConfig.methodName
            });
        }
    });
    
    document.getElementById('restart-button').addEventListener('click', () => {
        if (typeof gtag === 'function') {
            gtag('event', 'game_restart', {
                'event_category': 'engagement',
                'event_label': gameConfig.methodName
            });
        }
    });
});
