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

**Rodando com Docker** 🐳

- Build da imagem:

```bash
docker build -t botcomlinux:latest .
```

- Ou com docker-compose:

```bash
docker compose up --build -d
```

- O container lê variáveis de ambiente do arquivo `.env` (não commite esse arquivo!).

Parar o container:

```bash
docker compose down
```

**Imagem pública (Docker Hub)** 🏷️

Você também pode usar a imagem publicada em Docker Hub (tag `latest`):

- Pull:

```bash
docker pull biod1/botcomlinux:latest
```

- Rodar diretamente (usa o arquivo `.env` no diretório atual):

```bash
docker run -d --env-file .env --name botcomlinux biod1/botcomlinux:latest
```

- Exemplo de comando para logs:

```bash
docker logs -f botcomlinux
```

Imagem digest: `sha256:8bb260a348a48d3cbdee30c40097306bde6489d63d9e7864aaf61603f3d6191e`

