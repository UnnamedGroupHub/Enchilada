import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Events,
  Partials,
  ActivityType,
  ChannelType,
} from "discord.js";
import registerCommands from "./registerCommands.js";

(async () => {
  const client = new Client({
    intents: Object.values(GatewayIntentBits),
    partials: Object.values(Partials),
  });

  client.on(Events.ClientReady, async () => {
    client.user.setActivity({
      type: ActivityType.Watching,
      name: "my boot logs",
    });

    console.log(`Bot has started! Logged in as ${client.user.tag}.`);

    client.user.setActivity({
      type: ActivityType.Listening,
      name: "/help",
    });

    setInterval(async () => {
      // leave all guilds except the one specified in the environment variable
      for (const guild of client.guilds.cache.values()) {
        if (guild.id !== process.env.DISCORD_GUILD_ID) {
          await guild.leave();
          console.log(`Left guild ${guild.name}.`);
        }
      }

      // delete all temporary voice channels older than 5 minutes
      const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
      const tempVoiceChannelCategory = guild.channels.cache.find(
        (channel) =>
          channel.type === ChannelType.GuildCategory &&
          channel.name === "Temporary Voice Channels"
      );

      if (tempVoiceChannelCategory.children.cache.size > 0) {
        for (const channel of tempVoiceChannelCategory.children.cache.values()) {
          if (
            channel.createdAt.getTime() + 5 * 60 * 1000 < Date.now() &&
            channel.members.size === 0
          ) {
            await channel.delete();
            console.log(
              `Deleted channel ${channel.name} as it was empty for 5 minutes.`
            );
          } else {
            console.log(
              `Channel ${channel.name} seconds until deletion: ${
                (channel.createdAt.getTime() + 5 * 60 * 1000 - Date.now()) /
                1000
              }`
            );
          }
        }
      }
    }, 1000);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    try {
      (
        await import(`./commands/${interaction.commandName}.js`)
      ).default.execute({
        interaction,
      });
    } catch (error) {
      console.log(error);
      interaction.reply("I couldn't execute that command.");
    }
  });

  await client.login(process.env.DISCORD_BOT_TOKEN);

  console.log("Logged in, registering slash commands...");

  await registerCommands(client);
})();
