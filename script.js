// Game configuration
const gameConfig = {
    // Default method name and description (can be changed)
    methodName: "Epidural Anestezi",
    methodDescription: "Epidural anestezi, doğum sırasında ağrı kontrolü sağlayan bir yöntemdir. Uygulanabilirliğini değerlendirmek için aşağıdaki kriterleri kontrol edin.",
    
    // Questions with their details
    questions: [
        {
            id: 1,
            text: "Hasta epidural anestezi için onay veriyor mu?",
            explanation: "Hastanın bilgilendirilmiş onamı olmadan hiçbir işlem yapılamaz."
        },
        {
            id: 2,
            text: "Hastada kanama bozukluğu var mı?",
            explanation: "Kanama bozukluğu olan hastalarda epidural anestezi uygulanması kontrendikedir.",
            negativeRequired: true // For this question, "No" is the correct answer
        },
        {
            id: 3,
            text: "Epidural anestezi için gerekli ekipman mevcut mu?",
            explanation: "Gerekli ekipman olmadan işlem yapılamaz."
        },
        {
            id: 4,
            text: "Hastada lokal anestezik alerjisi var mı?",
            explanation: "Lokal anestezik alerjisi olan hastalarda epidural anestezi uygulanması kontrendikedir.",
            negativeRequired: true
        },
        {
            id: 5,
            text: "Anestezi uzmanı mevcut mu?",
            explanation: "Epidural anestezi, yalnızca anestezi uzmanı tarafından uygulanabilir."
        }
    ]
};

// Game state
const gameState = {
    currentQuestionIndex: 0,
    answers: [],
    failedReasons: []
};

// DOM Elements
const startScreen = document.getElementById('start-screen');
const questionsScreen = document.getElementById('questions-screen');
const resultScreen = document.getElementById('result-screen');
const methodTitle = document.getElementById('method-title');
const methodDescription = document.getElementById('method-description');
const startButton = document.getElementById('start-button');
const questionText = document.getElementById('question-text');
const yesButton = document.getElementById('yes-button');
const noButton = document.getElementById('no-button');
const progressCircle = document.querySelector('.progress-circle');
const progressPercentage = document.getElementById('progress-percentage');
const progressText = document.getElementById('progress-text');
const resultTitle = document.getElementById('result-title');
const resultDescription = document.getElementById('result-description');
const resultIcon = document.getElementById('result-icon');
const failedReasons = document.getElementById('failed-reasons');
const restartButton = document.getElementById('restart-button');
const confettiContainer = document.getElementById('confetti-container');
const questionCard = document.querySelector('.question-card');

// Initialize the game
function initGame() {
    // Set method name and description
    methodTitle.textContent = gameConfig.methodName;
    methodDescription.textContent = gameConfig.methodDescription;
    
    // Reset game state
    gameState.currentQuestionIndex = 0;
    gameState.answers = [];
    gameState.failedReasons = [];
    
    // Event listeners
    startButton.addEventListener('click', startGame);
    yesButton.addEventListener('click', () => answerQuestion(true));
    noButton.addEventListener('click', () => answerQuestion(false));
    restartButton.addEventListener('click', resetGame);
}

// Start the game
function startGame() {
    // Add transition class for smooth animation
    startScreen.classList.add('transition-out');
    
    // Wait for transition to complete before showing questions screen
    setTimeout(() => {
        showScreen(questionsScreen);
        displayCurrentQuestion();
    }, 300);
}

// Display the current question with animation
function displayCurrentQuestion() {
    const question = gameConfig.questions[gameState.currentQuestionIndex];
    
    // Animate question card out
    if (questionCard) {
        questionCard.style.opacity = '0';
        questionCard.style.transform = 'translateY(20px)';
    }
    
    // Update question text and animate in after a short delay
    setTimeout(() => {
        questionText.textContent = question.text;
        
        // Update progress
        const progress = ((gameState.currentQuestionIndex + 1) / gameConfig.questions.length) * 100;
        progressCircle.style.setProperty('--progress-value', `${progress}%`);
        progressPercentage.textContent = `${Math.round(progress)}%`;
        progressText.textContent = `Soru ${gameState.currentQuestionIndex + 1}/${gameConfig.questions.length}`;
        
        // Animate question card in
        if (questionCard) {
            questionCard.style.opacity = '1';
            questionCard.style.transform = 'translateY(0)';
        }
    }, 300);
}

// Handle question answer with animations
function answerQuestion(isYes) {
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
    }
    
    // Apply answer feedback animation
    const button = isYes ? yesButton : noButton;
    
    // Add appropriate animation class based on correctness
    if (isCorrectAnswer) {
        button.classList.add('correct-answer');
        playSuccessSound();
    } else {
        button.classList.add('wrong-answer');
        playErrorSound();
    }
    
    // Remove animation class after animation completes
    setTimeout(() => {
        button.classList.remove('correct-answer', 'wrong-answer');
        
        // Move to next question or show result
        if (gameState.currentQuestionIndex < gameConfig.questions.length - 1) {
            gameState.currentQuestionIndex++;
            displayCurrentQuestion();
        } else {
            showResult();
        }
    }, 500);
}

// Show the result screen with animations
function showResult() {
    // Add transition class for smooth animation
    questionsScreen.classList.add('transition-out');
    
    setTimeout(() => {
        showScreen(resultScreen);
        
        // Determine if all answers are correct
        const isSuccessful = gameState.failedReasons.length === 0;
        
        if (isSuccessful) {
            // Success case
            resultIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
            resultIcon.classList.add('success');
            resultTitle.textContent = 'Bu yöntemi uygulayabilirsiniz!';
            resultDescription.textContent = `Tüm kriterler karşılandı. ${gameConfig.methodName} uygulanabilir.`;
            failedReasons.style.display = 'none';
            
            // Create confetti effect for success
            createConfetti();
            playSuccessSound();
        } else {
            // Failed case
            resultIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
            resultIcon.classList.add('error');
            resultTitle.textContent = 'Bu yöntemi kullanamazsınız!';
            resultDescription.textContent = 'Aşağıdaki nedenlerden dolayı bu yöntem uygulanamaz:';
            
            // Display failed reasons with staggered animation
            failedReasons.style.display = 'block';
            failedReasons.innerHTML = '<h3>Kriterler karşılanmadı:</h3>';
            
            gameState.failedReasons.forEach((reason, index) => {
                const reasonItem = document.createElement('div');
                reasonItem.classList.add('failed-reason-item');
                reasonItem.textContent = `${reason.explanation}`;
                reasonItem.style.animationDelay = `${0.2 + index * 0.1}s`;
                failedReasons.appendChild(reasonItem);
            });
            
            playErrorSound();
        }
    }, 300);
}

// Reset the game to start again with animations
function resetGame() {
    // Add transition class for smooth animation
    resultScreen.classList.add('transition-out');
    
    setTimeout(() => {
        // Reset game state
        gameState.currentQuestionIndex = 0;
        gameState.answers = [];
        gameState.failedReasons = [];
        
        // Clear confetti
        confettiContainer.innerHTML = '';
        
        // Reset result icon classes
        resultIcon.classList.remove('success', 'error');
        
        showScreen(startScreen);
    }, 300);
}

// Helper function to show only one screen with animations
function showScreen(screenToShow) {
    // Hide all screens
    startScreen.classList.remove('active', 'transition-out');
    questionsScreen.classList.remove('active', 'transition-out');
    resultScreen.classList.remove('active', 'transition-out');
    
    // Show the requested screen
    screenToShow.classList.add('active');
}

// Create confetti animation for success
function createConfetti() {
    // Clear previous confetti
    confettiContainer.innerHTML = '';
    
    // Create confetti pieces
    const colors = ['#4a6fa5', '#166088', '#4cb5ae', '#4CAF50', '#ffeb3b'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        // Random position
        confetti.style.left = `${Math.random() * 100}%`;
        
        // Random color
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Random size
        const size = Math.random() * 10 + 5;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        
        // Random shape
        const shapes = ['circle', 'square', 'triangle'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        if (shape === 'circle') {
            confetti.style.borderRadius = '50%';
        } else if (shape === 'triangle') {
            confetti.style.width = '0';
            confetti.style.height = '0';
            confetti.style.backgroundColor = 'transparent';
            confetti.style.borderLeft = `${size}px solid transparent`;
            confetti.style.borderRight = `${size}px solid transparent`;
            confetti.style.borderBottom = `${size}px solid ${colors[Math.floor(Math.random() * colors.length)]}`;
        }
        
        // Random animation duration
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        
        // Random animation delay
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        
        confettiContainer.appendChild(confetti);
    }
}

// Simple sound effects (optional)
function playSuccessSound() {
    // Implement only if browser supports AudioContext
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(587.33, audioContext.currentTime); // D5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function playErrorSound() {
    // Implement only if browser supports AudioContext
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime); // G4
        oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime + 0.1); // F4
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);
