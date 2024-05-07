import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType, PermissionFlagsBits } from "discord-api-types/v9";

export default {
  data: new SlashCommandBuilder()
    .setName("vc")
    .setDescription("Voice channel commands.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a temporary voice channel for yourself.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete your temporary voice channel.")
    ),
  async execute({ interaction }) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "create":
        await createUserTemporaryVoiceChannel(interaction);
        break;
      case "delete":
        await deleteUserTemporaryVoiceChannel(interaction);
        break;
      default:
        await interaction.reply("Unknown subcommand.");
        break;
    }
  },
};

async function createUserTemporaryVoiceChannel(interaction) {
  const guild = interaction.member.guild;

  const tempVoiceChannelCategory = guild.channels.cache.find(
    (channel) =>
      channel.type === ChannelType.GuildCategory &&
      channel.name === "Temporary Voice Channels"
  );

  if (!tempVoiceChannelCategory)
    await guild.channels.create({
      name: "Temporary Voice Channels",
      type: ChannelType.GuildCategory,
    });

  const existingChannel = guild.channels.cache.find(
    (channel) =>
      channel.type === ChannelType.GuildVoice &&
      channel.parent.name === "Temporary Voice Channels" &&
      channel.name === `${interaction.member.user.tag}'s Channel`
  );

  if (existingChannel) {
    return await interaction.reply(
      "You already have a temporary voice channel."
    );
  } else {
    const newChannel = await guild.channels.create({
      name: `${interaction.member.user.tag}'s Channel`,
      type: ChannelType.GuildVoice,
      parent: tempVoiceChannelCategory,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: [PermissionFlagsBits.ViewChannel],
        },
      ],
    });

    return await interaction.reply(
      `Created temporary voice channel ${newChannel.toString()}. You can delete it with \`/vc delete\`. Don't worry if it disappears, you can always create a new one.`
    );
  }
}

async function deleteUserTemporaryVoiceChannel(interaction) {
  const guild = interaction.member.guild;

  const tempVoiceChannelCategory = guild.channels.cache.find(
    (channel) =>
      channel.type === ChannelType.GuildCategory &&
      channel.name === "Temporary Voice Channels"
  );

  if (!tempVoiceChannelCategory)
    return await interaction.reply("You don't have a temporary voice channel.");

  const existingChannel = guild.channels.cache.find(
    (channel) =>
      channel.type === ChannelType.GuildVoice &&
      channel.parent.name === "Temporary Voice Channels" &&
      channel.name === `${interaction.member.user.tag}'s Channel`
  );

  if (!existingChannel)
    return await interaction.reply("You don't have a temporary voice channel.");

  await existingChannel.delete();

  return await interaction.reply("Deleted your temporary voice channel.");
}
