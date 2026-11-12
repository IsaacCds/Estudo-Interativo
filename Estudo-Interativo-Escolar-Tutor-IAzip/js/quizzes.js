// =========================================
// BANCO DE QUESTÕES
// =========================================

const quizzes = {

    matematica: {
        titulo: "Quiz de Matemática",

        questoes: [
            {
                pergunta: "Quanto é 2 + 2?",
                alternativas: [
                    "3",
                    "4",
                    "5",
                    "6"
                ],
                correta: 1
            },

            {
                pergunta: "Quanto é 5 × 3?",
                alternativas: [
                    "10",
                    "15",
                    "20",
                    "25"
                ],
                correta: 1
            },

            {
                pergunta: "Qual é a raiz quadrada de 64?",
                alternativas: [
                    "6",
                    "7",
                    "8",
                    "9"
                ],
                correta: 2
            }
        ]
    },


    fisica: {
        titulo: "Quiz de Física",

        questoes: [
            {
                pergunta: "Qual é a unidade de força no Sistema Internacional?",
                alternativas: [
                    "Joule",
                    "Watt",
                    "Newton",
                    "Pascal"
                ],
                correta: 2
            },

            {
                pergunta: "Qual grandeza é medida em metros por segundo?",
                alternativas: [
                    "Velocidade",
                    "Força",
                    "Energia",
                    "Massa"
                ],
                correta: 0
            },

            {
                pergunta: "Qual é aproximadamente a aceleração da gravidade na superfície da Terra?",
                alternativas: [
                    "2,8 m/s²",
                    "5,0 m/s²",
                    "9,8 m/s²",
                    "15 m/s²"
                ],
                correta: 2
            }
        ]
    },


    quimica: {
        titulo: "Quiz de Química",

        questoes: [
            {
                pergunta: "Qual é o símbolo químico do oxigênio?",
                alternativas: [
                    "O",
                    "Ox",
                    "Og",
                    "C"
                ],
                correta: 0
            },

            {
                pergunta: "Qual é a fórmula da água?",
                alternativas: [
                    "CO₂",
                    "H₂O",
                    "O₂",
                    "NaCl"
                ],
                correta: 1
            },

            {
                pergunta: "Qual partícula possui carga elétrica negativa?",
                alternativas: [
                    "Próton",
                    "Nêutron",
                    "Elétron",
                    "Núcleo"
                ],
                correta: 2
            }
        ]
    },


    biologia: {
        titulo: "Quiz de Biologia",

        questoes: [
            {
                pergunta: "Qual é considerada a unidade básica dos seres vivos?",
                alternativas: [
                    "Tecido",
                    "Órgão",
                    "Célula",
                    "Sistema"
                ],
                correta: 2
            },

            {
                pergunta: "Qual organela está relacionada à produção de energia celular?",
                alternativas: [
                    "Núcleo",
                    "Mitocôndria",
                    "Ribossomo",
                    "Lisossomo"
                ],
                correta: 1
            },

            {
                pergunta: "Qual molécula armazena a informação genética?",
                alternativas: [
                    "DNA",
                    "Glicose",
                    "Água",
                    "ATP"
                ],
                correta: 0
            }
        ]
    }

};


// =========================================
// ELEMENTOS DA PÁGINA
// =========================================

const subjectButtons =
    document.querySelectorAll(".quiz-subject");

const quizTitle =
    document.getElementById("quiz-title");

const questionElement =
    document.getElementById("question");

const optionsElement =
    document.getElementById("options");

const feedbackElement =
    document.getElementById("feedback");

const nextButton =
    document.getElementById("next-button");

const scoreElement =
    document.getElementById("score");

const questionNumberElement =
    document.getElementById("question-number");

const totalQuestionsElement =
    document.getElementById("total-questions");

const progressBar =
    document.getElementById("progress-bar");


// =========================================
// VARIÁVEIS DO QUIZ
// =========================================

let materiaAtual = "matematica";

let questaoAtual = 0;

let pontuacao = 0;

let respondeu = false;


// =========================================
// CARREGAR QUIZ
// =========================================

function carregarQuiz() {

    const quiz = quizzes[materiaAtual];

    if (!quiz) {
        return;
    }

    quizTitle.textContent = quiz.titulo;

    totalQuestionsElement.textContent =
        quiz.questoes.length;

    questaoAtual = 0;
    pontuacao = 0;

    scoreElement.textContent = pontuacao;

    nextButton.onclick = avancarQuestao;
    
    carregarQuestao();
}


// =========================================
// CARREGAR QUESTÃO
// =========================================

function carregarQuestao() {

    const quiz = quizzes[materiaAtual];

    const questao =
        quiz.questoes[questaoAtual];

    respondeu = false;

    feedbackElement.textContent = "";

    feedbackElement.className =
        "quiz-feedback";

    nextButton.style.display = "none";

    questionNumberElement.textContent =
        questaoAtual + 1;

    questionElement.textContent =
        questao.pergunta;


    // Atualiza barra de progresso
    const progresso =
        ((questaoAtual) / quiz.questoes.length) * 100;

    progressBar.style.width =
        `${progresso}%`;


    // Limpa alternativas anteriores
    optionsElement.innerHTML = "";


    // Cria alternativas
    questao.alternativas.forEach(
        (alternativa, index) => {

            const button =
                document.createElement("button");

            button.className =
                "quiz-option";

            button.textContent =
                alternativa;

            button.addEventListener(
                "click",
                () => selecionarResposta(
                    index,
                    button
                )
            );

            optionsElement.appendChild(button);
        }
    );
}


// =========================================
// SELECIONAR RESPOSTA
// =========================================

function selecionarResposta(
    indiceSelecionado,
    botaoSelecionado
) {

    if (respondeu) {
        return;
    }

    respondeu = true;

    const quiz = quizzes[materiaAtual];

    const questao =
        quiz.questoes[questaoAtual];

    const botoes =
        document.querySelectorAll(
            ".quiz-option"
        );


    // Desabilita os botões
    botoes.forEach(
        button => {
            button.disabled = true;
        }
    );


    // Verifica resposta
    if (
        indiceSelecionado ===
        questao.correta
    ) {

        pontuacao++;

        scoreElement.textContent =
            pontuacao;

        botaoSelecionado.classList.add(
            "correct"
        );

        feedbackElement.textContent =
            "✓ Resposta correta!";

        feedbackElement.classList.add(
            "correct-feedback"
        );

    } else {

        botaoSelecionado.classList.add(
            "incorrect"
        );

        botoes[
            questao.correta
        ].classList.add(
            "correct"
        );

        feedbackElement.textContent =
            "✕ Resposta incorreta.";

        feedbackElement.classList.add(
            "incorrect-feedback"
        );
    }


    nextButton.style.display =
        "inline-flex";
}


// =========================================
// PRÓXIMA QUESTÃO
// =========================================

function avancarQuestao() {

    const quiz =
        quizzes[materiaAtual];

    questaoAtual++;

    if (
        questaoAtual >=
        quiz.questoes.length
    ) {

        mostrarResultado();

    } else {

        carregarQuestao();
    }
}


// =========================================
// RESULTADO FINAL
// =========================================

function mostrarResultado() {

    const quiz =
        quizzes[materiaAtual];

    const total =
        quiz.questoes.length;

    const porcentagem =
        Math.round(
            (pontuacao / total) * 100
        );


    progressBar.style.width =
        "100%";


    questionNumberElement.textContent =
        total;


    questionElement.textContent =
        "Quiz concluído!";


    optionsElement.innerHTML = `
        <div class="quiz-result">
            <div class="quiz-result-icon">
                🎉
            </div>

            <h3>
                Você terminou o quiz!
            </h3>

            <p>
                Sua pontuação foi:
            </p>

            <strong class="quiz-final-score">
                ${pontuacao} de ${total}
            </strong>

            <p>
                Aproveitamento:
                <strong>${porcentagem}%</strong>
            </p>
        </div>
    `;


    feedbackElement.textContent = "";

    nextButton.textContent =
        "Refazer quiz";

    nextButton.style.display =
        "inline-flex";


    nextButton.onclick = () => {
        // Reinicia o quiz
        questaoAtual = 0;
        pontuacao = 0;

        scoreElement.textContent = 0;

        nextButton.textContent =
            "Próxima questão";

        // Carrega diretamente a primeira questão
        carregarQuestao();

        // Garante que o botão volte a avançar normalmente
        nextButton.onclick = avancarQuestao;
        
    };
}


// =========================================
// TROCAR DE MATÉRIA
// =========================================

subjectButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                subjectButtons.forEach(
                    item => {
                        item.classList.remove(
                            "active"
                        );
                    }
                );

                button.classList.add(
                    "active"
                );

                materiaAtual =
                    button.dataset.subject;

                carregarQuiz();
            }
        );

    }
);


// =========================================
// INICIAR
// =========================================

carregarQuiz();