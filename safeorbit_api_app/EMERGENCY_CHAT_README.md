# Emergency Chat Assistant

## Overview

The Emergency Chat Assistant is a new feature in SafeOrbit that provides real-time AI-powered
assistance for emergency situations. It connects to a local LLM running on your device via the
RunAnywhere HTTP API, allowing you to get quick answers about first aid, emergency procedures, and
safety information - all without requiring an internet connection.

## Features

- **Real-time AI Responses**: Get immediate answers to emergency questions
- **Streaming Output**: See the AI response as it's being generated
- **Conversation History**: Maintains context across multiple questions
- **Quick Prompts**: Pre-configured emergency questions for faster access
- **Offline Capable**: Works completely offline when using a local LLM
- **Server Status Indicator**: Visual feedback on connection status

## Setup

### 1. Install RunAnywhere App

The Emergency Chat feature requires the RunAnywhere app to be running on your Android device:

1. Install the RunAnywhere app on your Android device
2. Load a compatible LLM model (recommended: Phi-3, Gemma, or similar small models)
3. Enable the HTTP API server in RunAnywhere settings
4. The server will run on `localhost:8080` by default

### 2. Configure the App

The API configuration is located in `expo/lib/runanywhere-api.ts`:

```typescript
export const RUNANYWHERE_CONFIG = {
  BASE_URL: 'http://localhost:8080',  // Default RunAnywhere API endpoint
  REQUEST_TIMEOUT: 10000,             // Request timeout in ms
  POLL_INTERVAL: 1000,                // How often to poll for updates
  MAX_WAIT_TIME: 120000,              // Maximum wait time for response
  DEFAULT_TEMPERATURE: 0.7,           // LLM temperature setting
  DEFAULT_MAX_TOKENS: 512,            // Maximum tokens to generate
};
```

### 3. Test the Connection

When you open the Emergency Chat screen:

- The app will automatically check the server status
- A status indicator at the top shows:
    - 🟢 **AI Connected**: Server is running and model is loaded
    - 🟡 **No Model Loaded**: Server is running but no model loaded
    - 🔴 **Server Offline**: Cannot connect to RunAnywhere

## Usage

### Accessing Emergency Chat

1. **From Home Screen**: Tap the "🚨 Emergency Chat Assistant" button
2. **From Tabs**: Navigate to the "Emergency" tab at the bottom

### Asking Questions

1. Type your emergency question in the input field
2. Tap the send button or press enter
3. Watch the AI response stream in real-time
4. Continue the conversation with follow-up questions

### Quick Prompts

For faster access, use the pre-configured quick prompts:

- First aid for burns
- CPR instructions
- Earthquake safety
- Fire escape plan
- Choking emergency
- Heart attack symptoms

Simply tap any quick prompt to instantly ask that question.

## API Reference

### Key Functions in `runanywhere-api.ts`

#### `checkServerStatus()`

Checks if the RunAnywhere server is running and has a model loaded.

```typescript
const status = await checkServerStatus();
// Returns: { server: string, modelLoaded: boolean, activeRequests: number, totalRequests: number }
```

#### `submitPrompt(prompt, temperature?, maxTokens?)`

Submits a prompt to the LLM for processing.

```typescript
const response = await submitPrompt("How to treat a burn?", 0.7, 512);
// Returns: { requestId: string, status: string }
```

#### `pollForOutput(requestId, onProgress?)`

Polls for the output of a submitted request with optional progress callback.

```typescript
const output = await pollForOutput(requestId, (partialOutput, status) => {
  console.log('Progress:', partialOutput);
});
```

#### `sendChatMessage(message, onProgress?)`

Complete function that handles the entire chat flow (status check, submit, poll).

```typescript
const response = await sendChatMessage(
  "What should I do for a burn?",
  (partial, status) => updateUI(partial)
);
```

## Architecture

### File Structure

```
expo/
├── lib/
│   └── runanywhere-api.ts       # API client for RunAnywhere
└── app/(tabs)/
    └── emergency-chat.tsx       # Emergency chat screen component
```

### Components

**Emergency Chat Screen** (`emergency-chat.tsx`):

- Full-featured chat interface with message history
- Real-time streaming responses
- Server status monitoring
- Quick prompt shortcuts
- Error handling and retry logic

**RunAnywhere API** (`runanywhere-api.ts`):

- Complete API client implementation
- Timeout and abort handling
- Progress streaming support
- Status checking and error handling

## Troubleshooting

### "Server Not Ready" Error

**Solution**:

1. Make sure RunAnywhere app is installed and running
2. Load a model in the RunAnywhere app
3. Enable HTTP API in settings
4. Tap "Retry" to check connection again

### Slow Responses

**Possible Causes**:

- Model is too large for device
- Temperature setting too high
- Max tokens setting too high

**Solutions**:

- Use a smaller model (e.g., Phi-3-mini, Gemma-2B)
- Reduce `DEFAULT_TEMPERATURE` to 0.5
- Reduce `DEFAULT_MAX_TOKENS` to 256

### Timeout Errors

**Solution**:

- Increase `REQUEST_TIMEOUT` in `runanywhere-api.ts`
- Increase `MAX_WAIT_TIME` for longer responses
- Use a smaller model for faster inference

### Connection Refused

**Solution**:

- Verify RunAnywhere is running on port 8080
- Check device firewall settings
- Ensure both apps are on the same device

## Safety Notes

⚠️ **IMPORTANT**: This feature is designed to provide general emergency information and guidance. It
is NOT a replacement for professional emergency services.

**Always call emergency services (911 in US) for life-threatening situations:**

- Severe bleeding or wounds
- Difficulty breathing
- Chest pain or heart attack symptoms
- Stroke symptoms
- Severe burns
- Loss of consciousness
- Poisoning
- Severe allergic reactions

The AI assistant will remind users to call emergency services when appropriate, but users should
always prioritize professional medical help in serious situations.

## Future Enhancements

Potential improvements for future versions:

- [ ] Voice input for hands-free operation
- [ ] Multilingual support
- [ ] Offline mode indicator
- [ ] Chat history persistence
- [ ] Export chat transcripts
- [ ] Integration with emergency contacts
- [ ] Location-based emergency services info
- [ ] Specialized modes (medical, natural disaster, etc.)

## Technical Details

### API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/status` | GET | Check server and model status |
| `/prompt` | POST | Submit a prompt for processing |
| `/output/{id}` | GET | Get output for a request |
| `/clear` | POST | Clear request history |

### Request/Response Format

**Submit Prompt**:

```json
{
  "prompt": "How to perform CPR?",
  "temperature": 0.7,
  "maxTokens": 512
}
```

**Response**:

```json
{
  "requestId": "uuid-here",
  "status": "pending"
}
```

**Get Output**:

```json
{
  "status": "completed",
  "output": "To perform CPR: 1. Check responsiveness..."
}
```

## License

This feature is part of SafeOrbit and follows the same license as the main project.

## Support

For issues or questions about the Emergency Chat feature:

1. Check the troubleshooting section above
2. Review the RunAnywhere app documentation
3. Open an issue in the SafeOrbit repository
