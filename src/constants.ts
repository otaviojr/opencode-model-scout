/** Plugin name — used in package.json, README, error messages. */
export const PLUGIN_NAME = "opencode-model-scout";

/** Log prefix for all console.warn/error calls. */
export const LOG_PREFIX = `[${PLUGIN_NAME}]`;

/**
 * Slash command name (without leading slash). Registered in the TUI process via
 * `api.command.register` (`slash.name`), so `/modelscout` opens a dialog with no
 * model turn.
 */
export const COMMAND_NAME = "modelscout";
