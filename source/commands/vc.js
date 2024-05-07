import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("vc")
    .setDescription("Voice channel commands."),
  async execute({ interaction }) {
    await interaction.reply("VC!");
  },
};
