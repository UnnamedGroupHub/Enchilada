import { SlashCommandBuilder } from "@discordjs/builders";
import { find } from "#controllers/mongodb.js";

export default {
  data: new SlashCommandBuilder()
    .setName("xp")
    .setDescription("XP commands.")
    .addSubcommand((subcommand) =>
      subcommand.setName("get").setDescription("Check your XP.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("leaderboard")
        .setDescription("Check the XP leaderboard.")
    ),
  async execute({ interaction }) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "get":
        await get(interaction);
        break;
      case "leaderboard":
        await leaderboard(interaction);
        break;
      default:
        await interaction.reply("Unknown subcommand.");
        break;
    }
  },
};

async function get(interaction) {
  const user = interaction.user;

  const userActivityPointsDoc = await find("userActivityPoints", {
    id: user.id,
  });

  const xp = userActivityPointsDoc[0]
    ? userActivityPointsDoc[0].points.toFixed(0)
    : 0;

  await interaction.reply(`You have ${xp} XP.`);
}

async function leaderboard(interaction) {
  const userActivityPointsDocs = await find("userActivityPoints", {});

  const leaderboard = userActivityPointsDocs
    .sort((a, b) => b.points - a.points)
    .slice(0, 10)
    .map((userActivityPointsDoc, index) => {
      const user = interaction.guild.members.cache.get(
        userActivityPointsDoc.id
      );

      return `${index + 1}. ${
        user ? user.user.tag : "Unknown"
      }: ${userActivityPointsDoc.points.toFixed(0)} XP`;
    });

  await interaction.reply(`# XP Leaderboard\n${leaderboard.join("\n")}`);
}
