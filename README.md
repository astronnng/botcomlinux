**BotComLinux**

Um bot simples para Discord focado em tickets e respostas rápidas, com um comando de limpeza de mensagens.

**Descrição curta:**
- Bot de suporte com sistema de tickets e alguns comandos divertidos.

**Como rodar**
- Instale dependências: `npm install`
- Crie um arquivo `.env` com `TOKEN`, `CLIENT_ID`, `GUILD_ID` (não commite `.env`).
- Inicie: `node index.js`

**Comandos (slash)**
- `ping`: 🏓 Responde Pong!
- `devops`: ⚙️ Respostas divertidas sobre DevOps
- `backend`: 🧩 Frases sobre Backend
- `frontend`: 🎨 Frases sobre Frontend
- `delfito`: 👑 Mensagens sobre o Delfito
- `ticket`: 🎫 Abre um ticket de suporte (cria canal privado)
- `setup-ticket`: 🛠️ Envia o botão de criação de ticket (requer permissão de administrador)
- `clear amount:<1-100>`: 🧹 Apaga mensagens recentes do canal (requer `ManageMessages`)

**Botões**
- `criar_ticket`: abre ticket via mensagem com botão 🎫
- `fechar_ticket`: fecha ticket e revoga permissões 🔒

**Notas**
- O bot registra comandos usando as variáveis `CLIENT_ID` e `GUILD_ID` no arquivo `index.js`.
- Evite commitar o `.env` (contém o token). Adicione `.env` ao `.gitignore` se necessário.

Se quiser, eu comito este README no repositório por você.
