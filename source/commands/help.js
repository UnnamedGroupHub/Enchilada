import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Replies with a help message."),
  async execute({ interaction }) {
    let message = "";
    message += "# Enchilada Bot Help\n";
    message +=
      "This bot helps moderate and run the Unnamed Group Discord server.\n";
    message += "\n";
    message +=
      "It mostly does things that are useful to the server mods, but we have some commands that you can use too! Such as:\n";
    message += "\n";
    message += "- `/ping` - Replies with pong!\n";
    message += "- `/vc` - Create, move, or delete voice channels with ease!\n";
    message += "- `/xp` - Check your XP.\n";
    message += "- `/help` - You're looking at it!\n";
    message += "\n";
    message +=
      "If you have any concerns about the bot, please contact `zuedev` here on Discord.\n";

    await interaction.reply(message);
  },
};
