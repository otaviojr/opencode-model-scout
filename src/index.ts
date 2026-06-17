import type { Plugin, PluginInput, Hooks } from "@opencode-ai/plugin";
import { discoverModels } from "./discover";
import { fetchModelsDevIndex } from "./models-dev";

// eslint-disable-next-line @typescript-eslint/require-await
const plugin: Plugin = async (input: PluginInput) => {
  const { client } = input;

  if (!client || typeof client !== "object") {
    return {
      config: async () => {},
    };
  }

  const hooks: Hooks = {
    config: async (config) => {
      const configRecord = config as unknown as Record<string, unknown>;
      const modelsDevIndex = await fetchModelsDevIndex();

      // Run discovery with 5-second timeout.
      // AbortSignal.timeout handles both unblocking the caller and
      // cancelling in-flight HTTP work (via probeFetch signal composition).
      try {
        await discoverModels(
          configRecord,
          modelsDevIndex,
          AbortSignal.timeout(5000),
        );
      } catch {
        // timeout or error — opencode starts normally
      }
    },
  };

  return hooks;
};

export default plugin;
