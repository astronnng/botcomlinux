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

// 🧩 Adiciona o FFmpeg manualmente
const ffmpeg = require("ffmpeg-static");
process.env.FFMPEG_PATH = ffmpeg;

const { Player } = require("discord-player");
const { DefaultExtractors } = require("@discord-player/extractor");
const playdl = require("play-dl");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

// 🪩 Sistema de música
const player = new Player(client, {
  ytdlOptions: {
    quality: "highestaudio",
    highWaterMark: 1 << 25,
  },
});

// ✅ Atualização obrigatória (v7)
(async () => {
  try {
    await player.extractors.loadMulti(DefaultExtractors);
    console.log("🎧 Extractors carregados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao carregar extractors:", error);
  }
})();

// Eventos do player
player.events.on("playerStart", (queue, track) => {
  queue.metadata.send(`🎵 Tocando agora: **${track.title}**`);
});
player.events.on("error", (queue, error) => {
  console.error("❌ Erro no player:", error);
  if (queue?.metadata) {
    queue.metadata.send(
      "⚠️ Ocorreu um erro ao tocar a música. Tente novamente!",
    );
  }
});
player.events.on("playerError", (queue, error) => {
  console.error("🎧 Erro de reprodução:", error);
});
player.events.on("playerSkip", (queue, track) => {
  queue.metadata.send(`⏭️ Pulando: **${track.title}**`);
});
player.events.on("disconnect", (queue) => {
  queue.metadata.send("👋 Saí do canal de voz!");
});
player.events.on("emptyChannel", (queue) => {
  queue.metadata.send("🔇 Canal de voz vazio, saindo...");
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
    .setDescription("Replies with Pong!"),
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
    .setName("ticket")
    .setDescription("Abre um ticket de suporte"),
  new SlashCommandBuilder()
    .setName("setup-ticket")
    .setDescription("Envia botão de criação de ticket (admin)"),

  // 🎵 Comandos de música
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("Toca uma música do YouTube, Spotify, etc.")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Nome ou link da música")
        .setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Pula a música atual"),
  new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Para a reprodução e limpa a fila"),
  new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Mostra a fila atual"),
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

      // 🎵 MÚSICA
      case "play": {
        const query = interaction.options.getString("query");
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel)
          return interaction.reply({
            content: "🎧 Você precisa estar em um canal de voz!",
            ephemeral: true,
          });

        // Defer a interação para evitar erro 10062
        await interaction.deferReply();

        // Buscar música
        let result;
        try {
          result = await player.search(query, {
            requestedBy: interaction.user,
          });
        } catch (err) {
          console.error("❌ Erro ao buscar música:", err);
          return interaction.editReply(
            "⚠️ Ocorreu um erro ao buscar a música.",
          );
        }

        if (!result || !result.tracks.length)
          return interaction.editReply("❌ Nenhum resultado encontrado.");

        // Criar fila
        const queue = await player.nodes.create(interaction.guild, {
          metadata: interaction.channel,
        });

        // Conectar ao canal de voz
        if (!queue.connection) {
          try {
            await queue.connect(voiceChannel);
          } catch (err) {
            console.error("❌ Erro ao conectar ao canal de voz:", err);
            return interaction.editReply(
              "⚠️ Não foi possível conectar ao canal de voz.",
            );
          }
        }

        // Adicionar música à fila
        try {
          result.playlist
            ? queue.addTrack(result.tracks)
            : queue.addTrack(result.tracks[0]);
        } catch (err) {
          console.error("❌ Erro ao adicionar música à fila:", err);
          return interaction.editReply(
            "⚠️ Não foi possível adicionar a música à fila.",
          );
        }

        // Tocar música com tratamento de abort
        try {
          if (!queue.node.isPlaying()) await queue.node.play();
        } catch (err) {
          console.error("❌ Erro ao iniciar a música:", err);
          return interaction.editReply(
            "⚠️ Não foi possível tocar a música. Talvez o link seja inválido ou a conexão falhou.",
          );
        }

        // Mensagem final
        await interaction.editReply(
          `🎶 Tocando agora: **${result.tracks[0].title}**`,
        );

        break;
      }

      case "skip": {
        await interaction.deferReply();

        const queue = player.nodes.get(interaction.guildId);
        if (!queue || !queue.node.isPlaying())
          return interaction.editReply({
            content: "🚫 Nenhuma música tocando.",
            ephemeral: true,
          });

        await queue.node.skip();
        await interaction.editReply("⏭️ Música pulada!");
        break;
      }

      case "stop": {
        await interaction.deferReply();

        const queue = player.nodes.get(interaction.guildId);
        if (!queue || !queue.node.isPlaying())
          return interaction.editReply({
            content: "🚫 Nenhuma música tocando.",
            ephemeral: true,
          });

        queue.delete();
        await interaction.editReply("🛑 Música parada e fila limpa!");
        break;
      }

      case "queue": {
        await interaction.deferReply();

        const queue = player.nodes.get(interaction.guildId);
        if (!queue || !queue.tracks.toArray().length)
          return interaction.editReply({
            content: "📭 Fila vazia.",
            ephemeral: true,
          });

        const tracks = queue.tracks
          .toArray()
          .map((t, i) => `${i + 1}. ${t.title}`)
          .join("\n");

        await interaction.editReply(`🎶 **Fila atual:**\n${tracks}`);
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
