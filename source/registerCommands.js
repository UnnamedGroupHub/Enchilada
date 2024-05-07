import { readdirSync } from "fs";
import { Routes } from "discord-api-types/v9";

/**
 * Register all commands in the commands folder.
 */
export default async (client) => {
  const commands = [];

  const commandFiles = readdirSync("./source/commands").filter((file) =>
    file.endsWith(".js")
  );

  for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    commands.push(command.default.data);
  }

  await client.rest.put(Routes.applicationCommands(client.user.id), {
    body: null,
  });

  await client.rest.put(
    Routes.applicationGuildCommands(
      client.user.id,
      process.env.DISCORD_GUILD_ID
    ),
    {
      body: commands,
    }
  );
};
