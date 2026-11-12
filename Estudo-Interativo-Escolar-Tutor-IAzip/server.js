
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 5000);
const API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf'
};

const requestCounts = new Map();

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });

  res.end(JSON.stringify(data));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk;

      if (body.length > 20_000) {
        reject(new Error('A mensagem é muito grande.'));
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(
          new Error('Não consegui ler sua mensagem. Tente novamente.')
        );
      }
    });

    req.on('error', reject);
  });
}

const SYSTEM_PROMPT = `
Você é o Tutor IA do projeto escolar Estudo Interativo Escolar,
destinado a estudantes do Ensino Médio no Brasil.

OBJETIVO
Explique os conteúdos de forma didática, clara, organizada e adequada
à idade do estudante. Priorize Matemática, Física, Química e Biologia.
Em exercícios, mostre o raciocínio passo a passo e confira os resultados.

REGRAS OBRIGATÓRIAS DE FORMATAÇÃO

1. Use Markdown válido para organizar a resposta.
2. Coloque espaços entre as palavras e os marcadores Markdown.
   Correto: "Usaremos **dois métodos** para resolver."
   Incorreto: "Usaremos**dois métodos**para resolver."
3. Use títulos Markdown com espaço após os sinais #.
   Exemplo: "## Passo a passo".
4. Para listas, use "- " ou números seguidos de ponto e espaço.
5. Não produza tabelas quando uma lista for mais clara.
   Se usar tabela, não coloque HTML como <br> dentro das células.
6. Não use HTML bruto para formatar a resposta.
7. Não coloque fórmulas matemáticas entre colchetes comuns.
8. Não use cifrões ($) como delimitadores de fórmulas.
9. Use exclusivamente estes delimitadores LaTeX:
   - Fórmula dentro do texto: \\( ... \\)
   - Fórmula em destaque: \\[ ... \\]
10. Escreva expressões LaTeX válidas, sem vírgulas artificiais
    dentro dos comandos e sem ponto e vírgula entre operadores.
11. Exemplos de notação correta:
    \\(x^2 - 5x + 6 = 0\\)
    \\(\\Delta = b^2 - 4ac\\)
    \\[x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}\\]
    \\[\\boxed{x = 2 \\quad \\text{ou} \\quad x = 3}\\]
12. Não use LaTeX para palavras comuns, títulos ou frases inteiras.
13. Sempre informe os valores das variáveis e coeficientes quando
    forem necessários para compreender a explicação.
14. Não omita resultados importantes. Termine a resposta com uma
    conclusão clara.
15. Antes de enviar, confira mentalmente se os delimitadores matemáticos
    estão completos e se os comandos LaTeX estão escritos corretamente.
16. Não inclua a palavra "Tutor IA" como título da resposta; a interface
    já mostra esse nome.

CONTEÚDO
Use português brasileiro. Explique de maneira acolhedora, sem complicar
desnecessariamente. Se não souber algo, admita isso. Não invente fontes
nem afirme que consultou materiais que não recebeu. Para assuntos fora
das matérias escolares, responda brevemente e redirecione gentilmente
a conversa aos estudos.
`.trim();

async function handleChat(req, res) {
  const ip = req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const record = requestCounts.get(ip) || {
    start: now,
    count: 0
  };

  if (now - record.start > 60_000) {
    record.start = now;
    record.count = 0;
  }

  record.count += 1;
  requestCounts.set(ip, record);

  if (record.count > 15) {
    return sendJson(res, 429, {
      error: 'Muitas perguntas em pouco tempo. Aguarde um minuto e tente novamente.'
    });
  }

  let payload;

  try {
    payload = await readJson(req);
  } catch (error) {
    return sendJson(res, 400, {
      error: error.message
    });
  }

  const question =
    typeof payload.question === 'string'
      ? payload.question.trim()
      : '';

  if (!question) {
    return sendJson(res, 400, {
      error: 'Digite uma pergunta antes de enviar.'
    });
  }

  if (question.length > 4000) {
    return sendJson(res, 400, {
      error: 'Sua pergunta ficou muito longa. Use até 4.000 caracteres.'
    });
  }

  if (!API_KEY) {
    return sendJson(res, 503, {
      error: 'A chave da IA ainda não foi configurada no Replit. Adicione GROQ_API_KEY em Secrets e reinicie o projeto.'
    });
  }

  const subject =
    typeof payload.subject === 'string'
      ? payload.subject.slice(0, 40)
      : 'conteúdos escolares';

  const userPrompt = [
    `Matéria selecionada: ${subject}.`,
    `Pergunta do estudante: ${question}`,
    '',
    'Responda seguindo rigorosamente as regras de formatação do sistema.'
  ].join('\n');

  try {
    const apiResponse = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.2,
          max_completion_tokens: 1400
        }),
        signal: AbortSignal.timeout(45_000)
      }
    );

    const data = await apiResponse.json().catch(() => ({}));

    if (!apiResponse.ok) {
      console.error(
        'Groq API status:',
        apiResponse.status,
        data?.error?.type || data?.error?.code || 'API_ERROR'
      );

      if (apiResponse.status === 429) {
        return sendJson(res, 429, {
          error: 'O limite de uso da API pode ter sido atingido. Aguarde um pouco e tente novamente.'
        });
      }

      if (apiResponse.status === 401 || apiResponse.status === 403) {
        return sendJson(res, 502, {
          error: 'A API não aceitou a chave. Confira GROQ_API_KEY nos Secrets do Replit.'
        });
      }

      if (apiResponse.status === 400) {
        return sendJson(res, 502, {
          error: 'A API recusou a solicitação. Confira o modelo configurado em GROQ_MODEL.'
        });
      }

      return sendJson(res, 502, {
        error: 'A IA não conseguiu responder agora. Tente novamente em instantes.'
      });
    }

    const answer =
      data.choices?.[0]?.message?.content?.trim() || '';

    if (!answer) {
      return sendJson(res, 502, {
        error: 'A IA retornou uma resposta vazia. Tente reformular a pergunta.'
      });
    }

    return sendJson(res, 200, { answer });

  } catch (error) {
    console.error(
      'Erro ao consultar Groq:',
      error.name || 'RequestError'
    );

    return sendJson(res, 502, {
      error: 'Não consegui conectar à IA agora. Verifique a conexão e tente novamente.'
    });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(
    req.url,
    `http://${req.headers.host || 'localhost'}`
  );

  if (req.method === 'POST' && url.pathname === '/api/chat') {
    return handleChat(req, res);
  }

  if (url.pathname.startsWith('/api/')) {
    return sendJson(res, 404, {
      error: 'Rota não encontrada.'
    });
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendJson(res, 405, {
      error: 'Método não permitido.'
    });
  }

  let pathname;

  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return sendJson(res, 400, {
      error: 'Endereço inválido.'
    });
  }

  if (pathname === '/') pathname = '/index.html';

  const filePath = path.resolve(ROOT, `.${pathname}`);

  if (
    filePath !== ROOT &&
    !filePath.startsWith(ROOT + path.sep)
  ) {
    return sendJson(res, 403, {
      error: 'Acesso negado.'
    });
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, {
        'Content-Type': 'text/plain; charset=utf-8'
      });

      return res.end('Página não encontrada.');
    }

    res.writeHead(200, {
      'Content-Type':
        MIME[path.extname(filePath).toLowerCase()] ||
        'application/octet-stream',
      'X-Content-Type-Options': 'nosniff'
    });

    if (req.method === 'HEAD') return res.end();

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(
    `Estudo Interativo Escolar disponível na porta ${PORT}`
  );
});
