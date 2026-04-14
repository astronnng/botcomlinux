const {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");

require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

// 🎫 Sistema de Tickets
const TICKET_CATEGORY_ID = "1425641855705677974";

client.once(Events.ClientReady, () => {
  console.log(`✅ Logado como ${client.user.tag}`);

  client.user.setPresence({
    activities: [
      {
        name: "Live do Delfito DevOps",
        type: 1,
        url: "https://www.twitch.tv/astroonng",
      },
    ],
    status: "online",
  });

  console.log("🎬 Status configurado: Vendo live!");
});

// Slash Commands
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pong!"),
  new SlashCommandBuilder()
    .setName("devops")
    .setDescription("Fala algo sobre DevOps"),
  new SlashCommandBuilder()
    .setName("backend")
    .setDescription("Fala algo sobre Backend"),
  new SlashCommandBuilder()
    .setName("frontend")
    .setDescription("Fala algo sobre Frontend"),
  new SlashCommandBuilder()
    .setName("delfito")
    .setDescription("Fala algo sobre o grande Delfito"),
  new SlashCommandBuilder()
    .setName("no")
    .setDescription("Retorna um no aleatório"),
  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Abre um ticket de suporte"),
  new SlashCommandBuilder()
    .setName("setup-ticket")
    .setDescription("Envia botão de criação de ticket (admin)"),
  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Remove mensagens recentes do canal")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Número de mensagens a apagar (1-100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100),
    ),
  // (comandos de música removidos)
].map((cmd) => cmd.toJSON());

// Função para criar o canal de ticket
async function criarTicket(interaction, user, guild) {
  const existingChannel = guild.channels.cache.find(
    (channel) => channel.name === `ticket-${user.username.toLowerCase()}`,
  );

  if (existingChannel) {
    await interaction.reply({
      content: `📬 Você já tem um ticket aberto: ${existingChannel}`,
      flags: 1 << 6,
    });
    return null;
  }

  const channel = await guild.channels.create({
    name: `ticket-${user.username}`,
    type: ChannelType.GuildText,
    parent: TICKET_CATEGORY_ID,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },
      {
        id: "1152596505765629992", // Cargo da equipe de suporte
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },
    ],
  });

  await interaction.reply({
    content: `🎫 Ticket criado: ${channel}`,
    flags: 1 << 6,
  });

  const closeButton = new ButtonBuilder()
    .setCustomId("fechar_ticket")
    .setLabel("Fechar Ticket")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(closeButton);

  await channel.send({
    content: `👋 Olá ${user}, em que posso ajudar?`,
    components: [row],
  });

  return channel;
}

// Tradução com fallbacks: LibreTranslate -> MyMemory -> Google translate endpoint
async function translateToPt(text) {
  // helper to check JSON content-type
  const isJson = (res) => {
    const ct = res.headers && (res.headers.get ? res.headers.get("content-type") : res.headers["content-type"]);
    return ct && ct.toLowerCase().includes("application/json");
  };

  // 1) LibreTranslate
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json", "User-Agent": "botcomlinux/1.0" },
      body: JSON.stringify({ q: text, source: "en", target: "pt", format: "text" }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`LibreTranslate HTTP ${res.status}`);
    // read as text first to avoid uncaught JSON parse errors; then try parse
    const raw = await res.text();
    try {
      const j = JSON.parse(raw);
      if (j && j.translatedText) return j.translatedText;
    } catch (pe) {
      throw new Error("LibreTranslate returned invalid JSON");
    }
  } catch (e) {
    console.warn("translateToPt: LibreTranslate failed:", e.message || e);
  }

  // 2) MyMemory
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|pt-BR`;
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json", "User-Agent": "botcomlinux/1.0" } });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);
    const raw = await res.text();
    try {
      const j = JSON.parse(raw);
      if (j && j.responseData && j.responseData.translatedText) return j.responseData.translatedText;
    } catch (pe) {
      throw new Error("MyMemory returned invalid JSON");
    }
  } catch (e) {
    console.warn("translateToPt: MyMemory failed:", e.message || e);
  }

  // 3) Google Translate public endpoint
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json", "User-Agent": "botcomlinux/1.0" } });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Google HTTP ${res.status}`);
    // parse as text and try JSON.parse to avoid undici parse exceptions
    const raw = await res.text();
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && Array.isArray(arr[0])) {
        let out = "";
        for (const seg of arr[0]) {
          if (Array.isArray(seg) && seg[0]) out += seg[0];
        }
        if (out) return out;
      }
    } catch (pe) {
      throw new Error("Google returned invalid JSON");
    }
  } catch (e) {
    console.warn("translateToPt: Google fallback failed:", e.message || e);
  }

  return null;
}

// 💬 Tratamento de Interações
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    switch (interaction.commandName) {
      case "ping":
        await interaction.reply("🏓 Pong!");
        break;

      case "devops": {
        const respostas = [
          "⚙️ Automatizando tudo... menos o café ☕",
          "💻 Xandrex no setor do delfito é a melhor coisa que aconteceu na história da humanidade!",
          "🚀 DevOps é a arte de transformar café em código!",
          "💥 DevOps é a solução para todos os problemas do mundo!",
          "🧠 DevOps: unindo desenvolvedores e infraestrutura em um só caos controlado!",
        ];
        await interaction.reply(
          respostas[Math.floor(Math.random() * respostas.length)],
        );
        break;
      }

      case "backend": {
        const respostas = [
          "🧩 O Backend é o cérebro que ninguém vê, mas todo mundo precisa!",
          "⚡ Se o Front é bonito, é porque o Back está aguentando tudo!",
          "🔥 Backend: onde a mágica acontece e os bugs moram!",
          "🧠 Backend é amor em forma de API!",
        ];
        await interaction.reply(
          respostas[Math.floor(Math.random() * respostas.length)],
        );
        break;
      }

      case "frontend": {
        const respostas = [
          "🎨 O Frontend faz o mundo parecer mais bonito!",
          "✨ Sem frontend, ninguém veria o trabalho do backend!",
          "💅 CSS resolve tudo... até o humor!",
          "🖥️ Frontend: transformando código em experiência!",
        ];
        await interaction.reply(
          respostas[Math.floor(Math.random() * respostas.length)],
        );
        break;
      }

      case "delfito": {
        const respostas = [
          "👑 O Delfito é simplesmente lendário!",
          "💻 Delfito: o DevOps que o mundo precisa, mas não merece!",
          "🔥 Delfito está em todas as pipelines e nos corações dos devs!",
          "⚙️ Se deu certo, foi o Delfito que fez!",
        ];
        await interaction.reply(
          respostas[Math.floor(Math.random() * respostas.length)],
        );
        break;
      }

      case "no": {
        await interaction.deferReply();
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          const res = await fetch("https://naas.isalman.dev/no", { signal: controller.signal });
          clearTimeout(timeout);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const raw = await res.text();
          let data;
          try {
            data = JSON.parse(raw);
          } catch (pe) {
            throw new Error("Invalid JSON from source");
          }
          const english = data && data.reason ? data.reason : null;
          if (!english) {
            await interaction.editReply("❌ Não foi possível obter uma razão.");
            break;
          }

          // Tentar traduzir para PT-BR usando fallbacks
          try {
            const translated = await translateToPt(english);
            if (translated) {
              await interaction.editReply(translated);
            } else {
              await interaction.editReply(english);
            }
          } catch (tErr) {
            console.error("❌ Erro ao traduzir /no:", tErr);
            await interaction.editReply(english);
          }
        } catch (err) {
          console.error("❌ Erro ao obter /no:", err);
          const msg = err.name === "AbortError" ? "Tempo de resposta esgotado." : "Erro ao obter resposta.";
          await interaction.editReply(`❌ Não foi possível obter um 'no' agora. ${msg}`);
        }
        break;
      }

      // 🎫 Ticket
      case "ticket":
        await criarTicket(interaction, interaction.user, interaction.guild);
        break;

      case "setup-ticket":
        if (
          !interaction.memberPermissions.has(
            PermissionsBitField.Flags.Administrator,
          )
        ) {
          return await interaction.reply({
            content:
              "❌ Você precisa ser administrador para usar este comando.",
            flags: 1 << 6,
          });
        }

        const ticketButton = new ButtonBuilder()
          .setCustomId("criar_ticket")
          .setLabel("🎫 Criar Ticket")
          .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(ticketButton);

        await interaction.reply({
          content: "Clique no botão abaixo para abrir um ticket de suporte:",
          components: [row],
        });
        break;

      // comando: clear
      case "clear": {
        const amount = interaction.options.getInteger("amount");
        if (
          !interaction.memberPermissions.has(PermissionsBitField.Flags.ManageMessages)
        ) {
          return await interaction.reply({
            content:
              "❌ Você precisa da permissão `ManageMessages` para usar este comando.",
            flags: 1 << 6,
          });
        }

        const botMember = interaction.guild?.members?.me;
        if (
          !botMember ||
          !interaction.channel.permissionsFor(botMember).has(
            PermissionsBitField.Flags.ManageMessages,
          )
        ) {
          return await interaction.reply({
            content:
              "❌ Eu não tenho permissão para gerenciar mensagens neste canal.",
            flags: 1 << 6,
          });
        }

        await interaction.deferReply({ ephemeral: true });
        try {
          const deleted = await interaction.channel.bulkDelete(amount, true);
          const count = deleted ? deleted.size : 0;
          await interaction.editReply({ content: `🧹 Apaguei ${count} mensagens.` });
        } catch (err) {
          console.error("❌ Erro ao apagar mensagens:", err);
          await interaction.editReply({
            content:
              "❌ Erro ao apagar mensagens. Mensagens com mais de 14 dias não podem ser apagadas em massa, ou ocorreu um erro de API.",
          });
        }
        break;
      }

      default:
        await interaction.reply("❓ Comando não reconhecido!");
    }
  }

  // Botões
  if (interaction.isButton()) {
    if (interaction.customId === "criar_ticket") {
      await criarTicket(interaction, interaction.user, interaction.guild);
    }

    if (interaction.customId === "fechar_ticket") {
      const channel = interaction.channel;
      const member = interaction.member;

      await interaction.reply("🔒 Ticket fechado com sucesso.");
      await channel.setName(`fechado-${member.user.username}`);
      await channel.permissionOverwrites.edit(member.user.id, {
        ViewChannel: false,
        SendMessages: false,
      });
    }
  }
});


// 🔐 Login
client.login(process.env.TOKEN);

// 🧩 Registro de comandos
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID,
      ),
      { body: commands },
    );
    console.log("✅ Slash commands registrados com sucesso!");
  } catch (error) {
    console.error(error);
  }
})();
