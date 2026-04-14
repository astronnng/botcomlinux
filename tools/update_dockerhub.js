const https = require('https');

function postJson(url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const u = new URL(url);
    const options = {
      method: 'POST',
      hostname: u.hostname,
      path: u.pathname + (u.search || ''),
      headers: Object.assign({ 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }, headers),
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function patchJson(url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const u = new URL(url);
    const options = {
      method: 'PATCH',
      hostname: u.hostname,
      path: u.pathname + (u.search || ''),
      headers: Object.assign({ 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }, headers),
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const user = process.argv[2];
  const token = process.argv[3];
  if (!user || !token) {
    console.error('Usage: node update_dockerhub.js <username> <pat>');
    process.exit(1);
  }

  // Login to get JWT
  const loginUrl = 'https://hub.docker.com/v2/users/login/';
  const loginResp = await postJson(loginUrl, { username: user, password: token });
  if (loginResp.status !== 200) {
    console.error('Failed to login to Docker Hub:', loginResp.status, loginResp.body);
    process.exit(1);
  }
  const jwt = JSON.parse(loginResp.body).token;

  // Prepare payload
  const payload = {
    description: 'BotComLinux — bot de suporte com sistema de tickets e comandos úteis.',
    full_description: `# BotComLinux\n\nBot de suporte para Discord com sistema de tickets, respostas rápidas e um comando de limpeza de mensagens.\n\n**Funcionalidades**:\n- Sistema de tickets: /ticket e botão 🎫 Criar Ticket -> cria canal privado com permissões.\n- Fechar ticket via botão Fechar Ticket.\n- Comandos divertidos: /devops, /backend, /frontend, /delfito, /ping.\n- Comando de limpeza: /clear amount:<1-100> (requer permissão ManageMessages).\n\n**Como rodar**:\n- Imagem Docker: docker pull ${user}/botcomlinux:latest\n- Run: docker run -d --env-file .env --name botcomlinux ${user}/botcomlinux:latest\n\n**Repositório:** https://github.com/astronnng/botcomlinux\n\n_Imagem publicada no Docker Hub: ${user}/botcomlinux:latest_`,
  };

  const repoUrl = `https://hub.docker.com/v2/repositories/${user}/botcomlinux/`;
  const patchResp = await patchJson(repoUrl, payload, { Authorization: `JWT ${jwt}` });
  console.log('Patch status:', patchResp.status);
  console.log(patchResp.body);
}

main().catch((err) => { console.error(err); process.exit(1); });
