import { TestPromptResponseDTO } from "../../dtos/DevDTO";

/**
 * Interface for developer-focused diagnostic services.
 */
export interface IDevService {
  /**
   * Executes a supervised AI prompt with full tracing and internal log capture.
   *
   * @param prompt - The user's input prompt.
   * @returns A promise resolving to the diagnostic results.
   */
  testAiPrompt(prompt: string): Promise<TestPromptResponseDTO>;

  /**
   * Retrieves the currently registered AI tool definitions.
   *
   * @returns List of tool definitions.
   */
  getRegisteredTools(): Promise<Array<Record<string, unknown>>>;

  /**
   * Retrieves calendar events for a diagnostic range.
   *
   * @returns List of calendar events.
   */
  getCalendarDiagnostics(): Promise<Array<Record<string, unknown>>>;
}
