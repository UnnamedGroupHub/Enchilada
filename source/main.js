import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Events,
  Partials,
  ActivityType,
  ChannelType,
  AuditLogEvent,
} from "discord.js";
import registerCommands from "./registerCommands.js";
import { upsert } from "#controllers/mongodb.js";

(async () => {
  const missingEnvVars = [
    "ENVIRONMENT",
    "DISCORD_BOT_TOKEN",
    "DISCORD_GUILD_ID",
    "MONGODB_URL",
  ].filter((envVar) => !process.env[envVar]);

  if (missingEnvVars.length)
    throw new Error(
      `Missing environment variables: ${missingEnvVars.join(", ")}`
    );

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

      if (tempVoiceChannelCategory?.children.cache.size > 0) {
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

  client.on(Events.MessageCreate, async (message) => {
    if (message.partial) message = await message.fetch();

    if (message.author.bot) return;

    // Member sends a message to a guild channel
    if (message?.guild?.id === process.env.DISCORD_GUILD_ID)
      await updateUserActivityPoints(message.author, 1, "sending a message");

    console.log(message.content);

    // birthday response
    if (message.author.id === "324031309447954433")
      if (message.content.includes("jigglepuppycat"))
        await message.reply(
          "https://media1.tenor.com/m/g2L2evYwj54AAAAd/puppycat-bee-and-puppycat.gif"
        );
  });

  client.on(Events.MessageDelete, async (message) => {
    // Partials are not possible for this event yet
    if (message.partial) return;

    if (message.author.bot) return;

    // Member's message is deleted from a guild channel
    if (message?.guild?.id === process.env.DISCORD_GUILD_ID)
      await updateUserActivityPoints(
        message.author,
        -1,
        "deleting their own message"
      );
  });

  client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (reaction.partial) reaction = await reaction.fetch();
    if (user.partial) user = await user.fetch();

    if (user.bot) return;

    // Member sends any reaction(s) to a message from another member in a guild channel
    if (
      reaction.message.guild?.id === process.env.DISCORD_GUILD_ID &&
      reaction.message.author.id !== user.id &&
      reaction.message.reactions.cache.filter((r) => r.users.cache.has(user.id))
        .size === 1
    )
      await updateUserActivityPoints(
        user,
        0.1,
        "reacting to a message for the first time"
      );

    // Member's message receives any reaction(s) from another member
    if (
      reaction.message.guild?.id === process.env.DISCORD_GUILD_ID &&
      reaction.message.author.id !== user.id &&
      reaction.message.reactions.cache.filter((r) => r.users.cache.has(user.id))
        .size === 1
    )
      await updateUserActivityPoints(
        reaction.message.author,
        0.25,
        "having another member react to their message"
      );
  });

  client.on(Events.MessageReactionRemove, async (reaction, user) => {
    if (reaction.partial) reaction = await reaction.fetch();
    if (user.partial) user = await user.fetch();

    if (user.bot) return;

    // Member removes all of their own reactions from another member's message in a guild channel
    if (
      reaction.message.guild?.id === process.env.DISCORD_GUILD_ID &&
      reaction.message.author.id !== user.id &&
      reaction.message.reactions.cache.filter((r) => r.users.cache.has(user.id))
        .size === 0
    )
      await updateUserActivityPoints(
        user,
        -0.1,
        "removing their last reaction from another member's message"
      );

    // Member's message loses all of its reactions from another member
    if (
      reaction.message.guild?.id === process.env.DISCORD_GUILD_ID &&
      reaction.message.author.id !== user.id &&
      reaction.message.reactions.cache.filter((r) => r.users.cache.has(user.id))
        .size === 0
    )
      await updateUserActivityPoints(
        reaction.message.author,
        -0.25,
        "losing the last reaction from another member on their message"
      );
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

async function updateUserActivityPoints(user, increment, reason) {
  const userId = user.id;

  const userActivityPoints = await upsert(
    "userActivityPoints",
    { id: userId },
    { $inc: { points: increment } }
  );

  console.log(
    `User ${user.tag} has ${increment > 0 ? "gained" : "lost"} ${Math.abs(
      increment
    )} activity points for ${reason}!`
  );

  return userActivityPoints.points;
}
