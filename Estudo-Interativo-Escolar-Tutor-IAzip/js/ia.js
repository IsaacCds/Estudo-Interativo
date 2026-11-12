
(() => {
  const input = document.getElementById('ia-question');
  const sendButton = document.getElementById('ia-send');
  const chat = document.querySelector('.ia-chat');
  const status = document.getElementById('ia-status-message');

  if (!input || !sendButton || !chat) return;

  const subjectMatchers = [
    [/matem[aá]tica|n[uú]meros|equ[aá]ç|polin[oô]mio|funç[aã]o/i, 'Matemática'],
    [/f[ií]sica|forç|velocidade|energia|eletricidade/i, 'Física'],
    [/qu[ií]mica|[áa]tomo|mol[eé]cula|reaç[aã]o|org[aâ]nica/i, 'Química'],
    [/biologia|c[eé]lula|gen[eé]tica|ecossistema|organismo|fotoss[ií]ntese/i, 'Biologia']
  ];

  function getSubject(question) {
    for (const [pattern, subject] of subjectMatchers) {
      if (pattern.test(question)) return subject;
    }
    return 'conteúdos escolares';
  }

  function addMessage(text, who) {
    const wrapper = document.createElement('div');
    wrapper.className =
      `ia-message ${who === 'user' ? 'ia-message-user' : 'ia-message-bot'}`;

    const avatar = document.createElement('div');
    avatar.className = 'ia-message-avatar';
    avatar.textContent = who === 'user' ? '👤' : '🤖';

    const content = document.createElement('div');
    content.className = 'ia-message-content';

    const name = document.createElement('strong');
    name.textContent = who === 'user' ? 'Você' : 'Tutor IA';

    const paragraph = document.createElement('div');
    paragraph.className =
      who === 'user' ? 'ia-user-text' : 'ia-markdown';
    paragraph.textContent = text;

    content.append(name, paragraph);
    wrapper.append(avatar, content);
    chat.appendChild(wrapper);
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    return paragraph;
  }

  // Escapa caracteres HTML para que fórmulas não sejam interpretadas
  // como marcação HTML ao serem restauradas depois do Markdown.
  function escapeHTML(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function prepareMath(text) {
    let result = String(text ?? '').replace(/\r\n?/g, '\n');
    const formulas = [];

    // Guarda fórmulas antes do Markdown, pois ele pode remover
    // as barras invertidas dos delimitadores do MathJax.
    function saveFormula(tex, display = false) {
      const token = `MATHPLACEHOLDERXYZ${formulas.length}XYZ`;
      formulas.push({ token, tex: tex.trim(), display });
      return token;
    }

    // Corrige negrito que chegou com os asteriscos escapados.
    result = result.replace(
      /\\\*\\\*([^*\n]+?)\\\*\\\*/g,
      '**$1**'
    );

    // Converte quebras HTML em quebras de linha normais.
    result = result.replace(/<br\s*\/?>/gi, '\n');

    // Preserva fórmulas que já usam delimitadores do MathJax.
    result = result.replace(
      /\\\[([\s\S]*?)\\\]/g,
      (_, tex) => saveFormula(tex, true)
    );

    result = result.replace(
      /\\\(([\s\S]*?)\\\)/g,
      (_, tex) => saveFormula(tex, false)
    );

    // Converte fórmulas que vieram entre colchetes.
    // Só converte quando encontra sinais claros de matemática,
    // evitando transformar listas e links comuns em fórmulas.
    result = result.replace(
      /\[\s*([^\[\]\n]+?)\s*\]/g,
      (match, tex) => {
        const value = tex.trim();

        const looksLikeMath =
          /\\(?:frac|sqrt|boxed|Delta|text|times|cdot|pm|quad|qquad|Longrightarrow|Rightarrow|displaystyle|mathrm|mathbf|begin|end|pi|sum|int)|[=^_]|(?:\d\s*[+\-*/]\s*\d)/i
            .test(value);

        return looksLikeMath
          ? saveFormula(value, false)
          : match;
      }
    );

    // Converte produtos escritos com parênteses duplicados,
    // por exemplo: ((x - p)(x - q)).
    result = result.replace(
      /\(\(([^()\n]+)\)\(([^()\n]+)\)\)/g,
      (_, first, second) =>
        saveFormula(`(${first})(${second})`, false)
    );

    // Converte expressões matemáticas entre parênteses:
    // (x^2 - 5x + 6 = 0), (a = 1), (a), (x - 2).
    result = result.replace(
      /\(([^()\n]+)\)/g,
      (match, expression) => {
        const value = expression.trim();

        const looksLikeMath =
          /[\\^_=]|^[a-zA-Z]\s*$|^[a-zA-Z]\s*[+\-*/]\s*[a-zA-Z0-9]|\d\s*[+\-*/]\s*\d/
            .test(value);

        return looksLikeMath
          ? saveFormula(value, false)
          : match;
      }
    );

    // Corrige fórmulas de bloco que vieram no formato $\
    // fórmula
    // \$
    result = result
      .replace(/\$[ \t]*\\[ \t]*\n/g, '\\[\n')
      .replace(/\\[ \t]*\n[ \t]*\$/g, '\n\\]');

    return { text: result, formulas };
  }

  async function renderAnswer(element, answer) {
    if (
      typeof marked === 'undefined' ||
      typeof DOMPurify === 'undefined'
    ) {
      element.textContent = String(answer ?? '');
      return;
    }

    const prepared = prepareMath(answer);

    // O Markdown é processado com marcadores temporários no lugar
    // das fórmulas, preservando os delimitadores do MathJax.
    let html = marked.parse(prepared.text, {
      gfm: true,
      breaks: false
    });

    // Restaura as fórmulas com caracteres HTML escapados.
    for (const formula of prepared.formulas) {
      const opening = formula.display ? '&#92;[' : '&#92;(';
      const closing = formula.display ? '&#92;]' : '&#92;)';

      const safeFormula =
        opening + escapeHTML(formula.tex) + closing;

      html = html.replaceAll(formula.token, safeFormula);
    }

    // Sanitiza o HTML depois de restaurar as fórmulas.
    element.innerHTML = DOMPurify.sanitize(html);

    if (window.MathJax?.typesetPromise) {
      try {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([element]);
        }

        await window.MathJax.typesetPromise([element]);
      } catch (error) {
        console.warn('Erro ao formatar fórmulas:', error);
      }
    }
  }

  async function sendQuestion() {
    const question = input.value.trim();

    if (!question || sendButton.disabled) {
      if (!question) {
        status.textContent = 'Digite sua dúvida antes de enviar.';
        input.focus();
      }
      return;
    }

    addMessage(question, 'user');
    input.value = '';
    sendButton.disabled = true;
    sendButton.setAttribute('aria-busy', 'true');
    status.textContent = 'O Tutor IA está pensando…';

    const reply = addMessage(
      'Estou preparando uma explicação para você…',
      'bot'
    );

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          subject: getSubject(question)
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || 'Não foi possível obter uma resposta.'
        );
      }

      if (typeof data.answer !== 'string' || !data.answer.trim()) {
        throw new Error('O tutor não retornou uma resposta válida.');
      }

      console.log('RESPOSTA ORIGINAL DA API:', data.answer);
      await renderAnswer(reply, data.answer);
      status.textContent =
        'Resposta recebida. Pode mandar outra pergunta!';
    } catch (error) {
      reply.textContent =
        error.message || 'Ocorreu um erro. Tente novamente.';
      status.textContent = 'Não foi possível concluir a pergunta.';
    } finally {
      sendButton.disabled = false;
      sendButton.removeAttribute('aria-busy');
      input.focus();
    }
  }

  sendButton.addEventListener('click', sendQuestion);

  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendQuestion();
    }
  });

  document
    .querySelectorAll('.ia-suggestion-list [data-question]')
    .forEach(button => {
      button.addEventListener('click', () => {
        input.value = button.dataset.question || '';
        input.focus();
      });
    });
})();
