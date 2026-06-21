import type {
  ProbeModelMeta,
  ProbeResult,
  ProviderProbe,
  ProbeContext,
} from "./types";
import { LOG_PREFIX } from "../constants";
import {
  buildHeaders,
  probeFetchJson,
  EMPTY_RESULT,
  isFiniteNumber,
} from "./util";

interface LlamaSwapArchitecture {
  input_modalities: string[];
  modality: string;
  output_modalities: string[];
}

interface LlamaSwapCapabilities {
  function_calling?: boolean;
  vision?: boolean;
  embedding?: boolean;
}

interface LlamaSwapModel {
  id: string;
  object: string;
  created: number;
  owned_by?: string;
  architecture?: LlamaSwapArchitecture;
  capabilities?: LlamaSwapCapabilities;
  supported_parameters?: string[];
  context_length?: number;
}

export const probeLlamaSwap: ProviderProbe = async (
  baseURL: string,
  apiKey?: string,
  _context?: ProbeContext,
): Promise<ProbeResult> => {
  try {
    const headers = buildHeaders(apiKey);

    const data = await probeFetchJson<LlamaSwapModel[]>(
      `${baseURL}/v1/models`,
      "llama-swap probe",
      { headers },
    );
    if (!Array.isArray(data)) return EMPTY_RESULT;

    const models: Record<string, ProbeModelMeta> = {};

    for (const entry of data) {
      const meta: ProbeModelMeta = {};

      if (isFiniteNumber(entry.context_length)) {
        meta.context = entry.context_length;
      }

      // Model type
      meta.modelType = "llm";

      // Capabilities
      if (entry.capabilities?.embedding) {
        meta.modelType = "embedding";
      }

      if (entry.capabilities?.vision) {
        meta.vision = true;
        meta.modelType = "vlm";
      }

      if (entry.capabilities?.function_calling) {
        meta.toolCall = true;
      }

      meta.loaded = true;

      // Use `key` as model identifier — this is what LM Studio uses
      models[entry.id] = meta;
    }

    return { models };
  } catch (error) {
    console.warn(`${LOG_PREFIX} llama-swap probe failed:`, error);
    return EMPTY_RESULT;
  }
};
