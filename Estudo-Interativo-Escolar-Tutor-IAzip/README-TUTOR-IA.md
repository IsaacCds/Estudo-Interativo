# Ativar o Tutor IA com Groq no Replit

Esta atualização conecta a página `ia.html` à API de chat do Groq através do servidor Node.js. A chave da API fica no servidor e não é enviada ao navegador.

## 1. Arquivos

Substitua no seu projeto do Replit o arquivo `server.js` pelo deste pacote. Se preferir, substitua também `package.json` e este README. Não precisa substituir o restante das páginas do site.

## 2. Secret

No painel Secrets do Replit, crie ou confira:

- **Key:** `GROQ_API_KEY`
- **Value:** a chave criada na sua conta GroqCloud

Não coloque a chave no HTML, no JavaScript do navegador, em repositórios públicos ou em mensagens. Se você já tinha salvo a chave com esse nome, não precisa cadastrá-la novamente.

## 3. Executar

O `package.json` usa `node server.js` como comando de inicialização. Clique em Run. O servidor precisa ficar em execução para que `/api/chat` funcione; hospedar somente arquivos estáticos não é suficiente para essa integração.

## 4. Testar

Abra `ia.html` pelo preview do Replit e envie uma pergunta simples, por exemplo: “Explique o que é uma equação do segundo grau”. Se der erro, confira o console/logs do servidor e os limites disponíveis no painel GroqCloud.

## Observações

- O uso está sujeito aos limites e às condições da conta Groq. Não há garantia de uso gratuito ilimitado.
- O modelo padrão é `llama-3.3-70b-versatile`. Se a conta indicar que ele não está disponível, confira a lista atual de modelos em https://console.groq.com/docs/models e configure `GROQ_MODEL` nos Secrets com um ID disponível para sua conta.
- Não compartilhe sua chave secreta.
