/**
 * RunAnywhere API Configuration
 * 
 * For testing the emergency chatbot feature with local LLM.
 * Make sure the RunAnywhere app is running on your Android device with a model loaded.
 */

export const RUNANYWHERE_CONFIG = {
  // Base URL for RunAnywhere HTTP API
  BASE_URL: 'http://localhost:8080',
  
  // Request settings
  REQUEST_TIMEOUT: 10000, // 10 seconds for initial request
  POLL_INTERVAL: 1000, // Poll every 1 second
  MAX_WAIT_TIME: 120000, // Maximum 2 minutes wait time
  
  // Default generation parameters
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 512,
};

export const RUNANYWHERE_ENDPOINTS = {
  STATUS: `${RUNANYWHERE_CONFIG.BASE_URL}/status`,
  PROMPT: `${RUNANYWHERE_CONFIG.BASE_URL}/prompt`,
  OUTPUT: `${RUNANYWHERE_CONFIG.BASE_URL}/output`,
  CLEAR: `${RUNANYWHERE_CONFIG.BASE_URL}/clear`,
};

export interface ServerStatus {
  server: string;
  modelLoaded: boolean;
  activeRequests: number;
  totalRequests: number;
}

export interface PromptRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface PromptResponse {
  requestId: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
}

export interface OutputResponse {
  status: 'pending' | 'generating' | 'completed' | 'error';
  output: string;
  error?: string;
}

/**
 * Check if the RunAnywhere server is running and a model is loaded
 */
export async function checkServerStatus(): Promise<ServerStatus | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RUNANYWHERE_CONFIG.REQUEST_TIMEOUT);
    
    const response = await fetch(RUNANYWHERE_ENDPOINTS.STATUS, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Failed to check server status:', error);
    return null;
  }
}

/**
 * Submit a prompt to the server
 */
export async function submitPrompt(
  prompt: string,
  temperature?: number,
  maxTokens?: number
): Promise<PromptResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RUNANYWHERE_CONFIG.REQUEST_TIMEOUT);
    
    const payload: PromptRequest = {
      prompt,
      temperature: temperature ?? RUNANYWHERE_CONFIG.DEFAULT_TEMPERATURE,
      maxTokens: maxTokens ?? RUNANYWHERE_CONFIG.DEFAULT_MAX_TOKENS,
    };
    
    const response = await fetch(RUNANYWHERE_ENDPOINTS.PROMPT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return await response.json();
    }
    
    if (response.status === 503) {
      throw new Error('No model loaded. Please load a model in the RunAnywhere app first.');
    }
    
    throw new Error(`Server returned status ${response.status}`);
  } catch (error) {
    console.error('Failed to submit prompt:', error);
    throw error;
  }
}

/**
 * Get the output for a request ID
 */
export async function getOutput(requestId: string): Promise<OutputResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RUNANYWHERE_CONFIG.REQUEST_TIMEOUT);
    
    const response = await fetch(`${RUNANYWHERE_ENDPOINTS.OUTPUT}/${requestId}`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return await response.json();
    }
    
    if (response.status === 404) {
      throw new Error('Request ID not found');
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get output:', error);
    throw error;
  }
}

/**
 * Poll for the output of a request until it's completed or errors
 */
export async function pollForOutput(
  requestId: string,
  onProgress?: (output: string, status: string) => void
): Promise<string> {
  const startTime = Date.now();
  
  while (true) {
    const elapsed = Date.now() - startTime;
    
    if (elapsed > RUNANYWHERE_CONFIG.MAX_WAIT_TIME) {
      throw new Error('Timeout waiting for response');
    }
    
    const result = await getOutput(requestId);
    
    if (!result) {
      throw new Error('Failed to get output');
    }
    
    if (result.status === 'completed') {
      return result.output;
    }
    
    if (result.status === 'error') {
      throw new Error(result.error || 'Unknown error during generation');
    }
    
    // Call progress callback for partial results
    if (onProgress && result.output) {
      onProgress(result.output, result.status);
    }
    
    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, RUNANYWHERE_CONFIG.POLL_INTERVAL));
  }
}

/**
 * Clear requests from server memory
 */
export async function clearRequests(requestId?: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RUNANYWHERE_CONFIG.REQUEST_TIMEOUT);
    
    const payload = requestId ? { requestId } : {};
    
    const response = await fetch(RUNANYWHERE_ENDPOINTS.CLEAR, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    return response.ok;
  } catch (error) {
    console.error('Failed to clear requests:', error);
    return false;
  }
}

/**
 * Complete chat function that handles the entire flow
 */
export async function sendChatMessage(
  message: string,
  onProgress?: (output: string, status: string) => void
): Promise<string> {
  // Check server status first
  const status = await checkServerStatus();
  if (!status) {
    throw new Error('Cannot connect to RunAnywhere server. Make sure the app is running.');
  }
  
  if (!status.modelLoaded) {
    throw new Error('No model loaded. Please load a model in the RunAnywhere app first.');
  }
  
  // Submit the prompt
  const response = await submitPrompt(message);
  if (!response) {
    throw new Error('Failed to submit message');
  }
  
  // Poll for the output
  return await pollForOutput(response.requestId, onProgress);
}
