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
 - `no`: 🚫 Retorna um "no" aleatório (texto traduzido para Pt-BR quando possível)
- `ticket`: 🎫 Abre um ticket de suporte (cria canal privado)
- `setup-ticket`: 🛠️ Envia o botão de criação de ticket (requer permissão de administrador)
- `clear amount:<1-100>`: 🧹 Apaga mensagens recentes do canal (requer `ManageMessages`)

**Botões**
- `criar_ticket`: abre ticket via mensagem com botão 🎫
- `fechar_ticket`: fecha ticket e revoga permissões 🔒

**Notas**
- O bot registra comandos usando as variáveis `CLIENT_ID` e `GUILD_ID` no arquivo `index.js`.
- Evite commitar o `.env` (contém o token). Adicione `.env` ao `.gitignore` se necessário.

**Comando `/no`**
- **O que faz:** consulta o serviço público `https://naas.isalman.dev/no` e retorna uma razão aleatória (em inglês).
- **Tradução para Pt-BR:** o bot tenta traduzir automaticamente a razão para Português-Brasil usando uma cadeia de provedores (LibreTranslate → MyMemory → Google Translate). Se todas as tentativas de tradução falharem, o texto em inglês é retornado.
- **Limitações e privacidade:** a chamada usa serviços externos (API do `no-as-a-service` e provedores de tradução). A API pública pode impor rate-limits (por exemplo, ~120 req/min por IP). Não use o comando para dados sensíveis; para produção considere vendorizar `reasons.json` localmente ou hospedar o serviço em container próprio.

**Exemplos de uso**

- Teste rápido com `curl` (retorna JSON do serviço original):

```bash
curl -s https://naas.isalman.dev/no
# => { "reason": "Some English reason." }
```

- Teste em Node (Node 18+ com `fetch` global):

```js
const res = await fetch('https://naas.isalman.dev/no');
const { reason } = await res.json();
console.log(reason);
```

- Exemplo simples de handler (já integrado ao `index.js`, apenas para referência):

```js
// dentro do seu listener de interações (discord.js v14)
if (interaction.isChatInputCommand() && interaction.commandName === 'no') {
	await interaction.deferReply();
	const r = await fetch('https://naas.isalman.dev/no');
	const data = await r.json();
	await interaction.editReply(data.reason); // o bot já tenta traduzir para pt-BR automaticamente
}
```

Observação: o bot atualmente tenta traduzir o texto retornado; se a tradução não estiver disponível por falha externa, ele retornará o texto em inglês.

**Docker / docker-compose**
- Atenção: se você usa `docker compose` com bind-mount do diretório do projeto, o mount pode sobrescrever `node_modules` presentes na imagem. Em ambiente de desenvolvimento, ou remova o bind-mount, ou adicione um volume anônimo para `/usr/src/app/node_modules`, ou instale dependências no host antes de rodar o container.

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

