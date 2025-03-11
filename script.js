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
const progressBar = document.getElementById('progress');
const progressText = document.getElementById('progress-text');
const resultTitle = document.getElementById('result-title');
const resultDescription = document.getElementById('result-description');
const resultIcon = document.getElementById('result-icon');
const failedReasons = document.getElementById('failed-reasons');
const restartButton = document.getElementById('restart-button');

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
    showScreen(questionsScreen);
    displayCurrentQuestion();
}

// Display the current question
function displayCurrentQuestion() {
    const question = gameConfig.questions[gameState.currentQuestionIndex];
    questionText.textContent = question.text;
    
    // Update progress
    const progress = ((gameState.currentQuestionIndex + 1) / gameConfig.questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Soru ${gameState.currentQuestionIndex + 1}/${gameConfig.questions.length}`;
}

// Handle question answer
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
        resultIcon.innerHTML = '✅';
        resultTitle.textContent = 'Bu yöntemi uygulayabilirsiniz!';
        resultDescription.textContent = `Tüm kriterler karşılandı. ${gameConfig.methodName} uygulanabilir.`;
        failedReasons.style.display = 'none';
    } else {
        // Failed case
        resultIcon.innerHTML = '❌';
        resultTitle.textContent = 'Bu yöntemi kullanamazsınız!';
        resultDescription.textContent = 'Aşağıdaki nedenlerden dolayı bu yöntem uygulanamaz:';
        
        // Display failed reasons
        failedReasons.style.display = 'block';
        failedReasons.innerHTML = '<h3>Kriterler karşılanmadı:</h3>';
        
        gameState.failedReasons.forEach(reason => {
            const reasonItem = document.createElement('div');
            reasonItem.classList.add('failed-reason-item');
            reasonItem.textContent = `${reason.explanation}`;
            failedReasons.appendChild(reasonItem);
        });
    }
}

// Reset the game to start again
function resetGame() {
    gameState.currentQuestionIndex = 0;
    gameState.answers = [];
    gameState.failedReasons = [];
    showScreen(startScreen);
}

// Helper function to show only one screen
function showScreen(screenToShow) {
    // Hide all screens
    startScreen.classList.remove('active');
    questionsScreen.classList.remove('active');
    resultScreen.classList.remove('active');
    
    // Show the requested screen
    screenToShow.classList.add('active');
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);
