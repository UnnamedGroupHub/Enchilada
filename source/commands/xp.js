import { SlashCommandBuilder } from "@discordjs/builders";
import { find } from "#controllers/mongodb.js";

export default {
  data: new SlashCommandBuilder()
    .setName("xp")
    .setDescription("Check your XP."),
  async execute({ interaction }) {
    const user = interaction.user;

    const userActivityPointsDoc = await find("userActivityPoints", {
      id: user.id,
    });

    const xp = userActivityPointsDoc
      ? userActivityPointsDoc[0].points.toFixed(0)
      : 0;

    await interaction.reply(`You have ${xp} XP.`);
  },
};
