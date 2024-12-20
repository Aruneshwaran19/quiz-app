const userName = "Arun";

// DOM Elements
const startButton = document.querySelector(".start");
const startScreen = document.querySelector(".start-screen");
const quizScreen = document.querySelector(".quiz");
const submitBtn = document.querySelector(".submit");
const nextBtn = document.querySelector(".next");
const restartBtn = document.querySelector(".restart");
const progressBar = document.querySelector(".progress-bar");
const progressText = document.querySelector(".progress-text");
const numQuestions = document.querySelector("#num-questions");
const category = document.querySelector("#category");
const difficulty = document.querySelector("#difficulty");
const timePerQuestion = document.querySelector("#time");

let questions = [],
  currentQuestion = 0,
  score = 0,
  timer,
  time = 30;

// Start quiz when clicked
const startQuiz = () => {
  const num = numQuestions.value,
    cat = category.value,
    diff = difficulty.value;
  loadingAnimation();
  const url = `https://opentdb.com/api.php?amount=${num}&category=${cat}&difficulty=${diff}&type=multiple`;
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      questions = data.results;
      setTimeout(() => {
        startScreen.classList.add("hide");
        quizScreen.classList.remove("hide");
        showQuestion(questions[currentQuestion]);
      }, 1000);
    })
    .catch((error) => console.error("Error fetching quiz data:", error));
};

const loadingAnimation = () => {
  startButton.innerHTML = "Loading";
  const loadingInterval = setInterval(() => {
    if (startButton.innerHTML.length === 10) {
      startButton.innerHTML = "Loading";
    } else {
      startButton.innerHTML += ".";
    }
  }, 500);
};

// Show question and answers
const showQuestion = (question) => {
  const questionText = document.querySelector(".question"),
    answersWrapper = document.querySelector(".answer-wrapper"),
    questionNumber = document.querySelector(".number");

  questionText.innerHTML = question.question;
  const answers = [
    ...question.incorrect_answers,
    question.correct_answer.toString(),
  ];
  answersWrapper.innerHTML = "";
  answers.sort(() => Math.random() - 0.5);
  answers.forEach((answer) => {
    answersWrapper.innerHTML += `
      <div class="answer">
        <span class="text">${answer}</span>
        <span class="checkbox"></span> <!-- Empty span for checkbox -->
      </div>
    `;
  });

  questionNumber.innerHTML = ` Question <span class="current">${
    currentQuestion + 1
  }</span><span class="total">/${questions.length}</span>`;

  // Add event listeners to each answer
  const answersDiv = document.querySelectorAll(".answer");
  answersDiv.forEach((answer) => {
    answer.addEventListener("click", () => {
      if (!answer.classList.contains("checked")) {
        answersDiv.forEach((answer) => {
          answer.classList.remove("selected");
        });
        answer.classList.add("selected");
        submitBtn.disabled = false;
      }
    });
  });

  time = timePerQuestion.value;
  startTimer(time);
};

// Timer function
const startTimer = (time) => {
  timer = setInterval(() => {
    if (time === 3) {
      playAudio("countdown.mp3");
    }
    if (time >= 0) {
      progress(time);
      time--;
    } else {
      checkAnswer();
    }
  }, 1000);
};

const progress = (value) => {
  const percentage = (value / time) * 100;
  progressBar.style.width = `${percentage}%`;
  progressText.innerHTML = `${value}`;
};

const checkAnswer = () => {
  clearInterval(timer);
  const selectedAnswer = document.querySelector(".answer.selected");

  if (selectedAnswer) {
    const answer = selectedAnswer.querySelector(".text").innerHTML;

    if (answer === questions[currentQuestion].correct_answer) {
      score++;
      selectedAnswer.classList.add("correct");
      selectedAnswer.querySelector(".checkbox").innerHTML =
        '<i class="fas fa-check"></i>';
    } else {
      selectedAnswer.classList.add("wrong");
      selectedAnswer.querySelector(".checkbox").innerHTML =
        '<i class="fas fa-times"></i>';

      document.querySelectorAll(".answer").forEach((answerDiv) => {
        const answerText = answerDiv.querySelector(".text").innerHTML;
        if (answerText === questions[currentQuestion].correct_answer) {
          answerDiv.classList.add("correct");
          answerDiv.querySelector(".checkbox").innerHTML =
            '<i class="fas fa-check"></i>';
        }
      });
    }
  }

  const answersDiv = document.querySelectorAll(".answer");
  answersDiv.forEach((answer) => {
    answer.classList.add("checked");
  });

  submitBtn.style.display = "none";
  nextBtn.style.display = "block";
};

const nextQuestion = () => {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion(questions[currentQuestion]);
    nextBtn.style.display = "none";
    submitBtn.style.display = "block";
    submitBtn.disabled = true;
  } else {
    showScore();
  }
};

// Show score at the end
const showScore = () => {
  const endScreen = document.querySelector(".end-screen"),
    finalScore = document.querySelector(".final-score"),
    totalScore = document.querySelector(".total-score");
  endScreen.classList.remove("hide");
  quizScreen.classList.add("hide");
  finalScore.innerHTML = score;
  totalScore.innerHTML = `/ ${questions.length}`;
};

restartBtn.addEventListener("click", () => {
  window.location.reload();
});

// Play audio (e.g., countdown)
const playAudio = (src) => {
  const audio = new Audio(src);
  audio.play();
};

startButton.addEventListener("click", startQuiz);
submitBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", nextQuestion);
