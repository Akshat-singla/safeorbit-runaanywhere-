import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { sendChatMessage, checkServerStatus } from '@/lib/runanywhere-api';
import { AlertCircleIcon, SendIcon, MessageCircleIcon, BotIcon, UserIcon } from 'lucide-react-native';
import * as React from 'react';
import { 
  View, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Alert,
  Pressable
} from 'react-native';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const EMERGENCY_SYSTEM_PROMPT = `You are an emergency assistant AI. Your role is to provide quick, accurate, and helpful information during emergency situations. Be concise, clear, and prioritize safety. If the situation requires professional emergency services (police, fire, medical), immediately advise calling emergency services (911 in US, or local emergency number). You can help with:
- First aid guidance
- Emergency preparedness
- Safety tips during disasters
- General emergency information

Always prioritize safety and professional help when needed.`;

const QUICK_PROMPTS = [
  'First aid for burns',
  'CPR instructions',
  'Earthquake safety',
  'Fire escape plan',
  'Choking emergency',
  'Heart attack symptoms',
];

export default function EmergencyChatScreen() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputText, setInputText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverStatus, setServerStatus] = React.useState<string>('checking');
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Check server status on mount
  React.useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    try {
      const status = await checkServerStatus();
      if (status && status.modelLoaded) {
        setServerStatus('connected');
        // Add welcome message
        if (messages.length === 0) {
          setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: '🚨 Emergency AI Assistant Ready\n\nI can help with emergency guidance and safety information. How can I assist you today?\n\n⚠️ For life-threatening emergencies, call 911 immediately!',
            timestamp: new Date(),
          }]);
        }
      } else if (status) {
        setServerStatus('no-model');
      } else {
        setServerStatus('disconnected');
      }
    } catch (error) {
      setServerStatus('disconnected');
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;

    // Check if server is ready
    if (serverStatus !== 'connected') {
      Alert.alert(
        'Server Not Ready',
        'The RunAnywhere server is not connected or no model is loaded. Please check the app and try again.',
        [
          { text: 'Retry', onPress: checkServer },
          { text: 'OK' }
        ]
      );
      return;
    }

    // Clear input immediately
    setInputText('');

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Create placeholder for assistant response
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Build conversation context (last 3 exchanges for context)
      const recentMessages = messages.slice(-6);
      const conversationContext = recentMessages
        .map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
        .join('\n\n');
      
      const fullPrompt = conversationContext
        ? `${EMERGENCY_SYSTEM_PROMPT}\n\nConversation history:\n${conversationContext}\n\nHuman: ${messageText}\n\nAssistant:`
        : `${EMERGENCY_SYSTEM_PROMPT}\n\nHuman: ${messageText}\n\nAssistant:`;

      // Send message and stream response
      const response = await sendChatMessage(
        fullPrompt,
        (partialOutput, status) => {
          // Update message with streaming output
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId
              ? { ...msg, content: partialOutput, isStreaming: status === 'generating' }
              : msg
          ));
          
          // Auto-scroll to bottom
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      );

      // Update with final response
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId
          ? { ...msg, content: response, isStreaming: false }
          : msg
      ));

    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Remove the placeholder message and show error
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
      
      Alert.alert(
        'Error',
        error.message || 'Failed to get response from AI. Please try again.',
        [
          { text: 'OK' }
        ]
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
    handleSendMessage(prompt);
  };

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'connected': return 'bg-green-500';
      case 'no-model': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case 'connected': return 'AI Connected';
      case 'no-model': return 'No Model Loaded';
      case 'disconnected': return 'Server Offline';
      default: return 'Checking...';
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-black"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Header with Status */}
      <View className="bg-red-600 px-4 py-3 border-b border-red-700">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Icon as={AlertCircleIcon} size={20} color="#ffffff" />
            <Text className="text-white font-bold text-base">
              Emergency Assistant
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <Text className="text-white text-xs">
              {getStatusText()}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Prompts (show only when no messages or just welcome) */}
      {messages.length <= 1 && (
        <View className="px-4 py-3 border-b border-white/10">
          <Text className="text-white/60 text-xs mb-2">Quick Questions:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {QUICK_PROMPTS.map((prompt, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleQuickPrompt(prompt)}
                  className="bg-white/10 px-3 py-2 rounded-full active:bg-white/20"
                  disabled={isLoading || serverStatus !== 'connected'}
                >
                  <Text className="text-white text-xs">
                    {prompt}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            className={`mb-4 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <View
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600'
                  : 'bg-white/10 border border-white/20'
              }`}
            >
              <View className="flex-row items-center gap-2 mb-1">
                <Icon 
                  as={message.role === 'user' ? UserIcon : BotIcon} 
                  size={14} 
                  color={message.role === 'user' ? '#ffffff' : '#22c55e'}
                />
                <Text className="text-white/60 text-xs">
                  {message.role === 'user' ? 'You' : 'Emergency AI'}
                </Text>
              </View>
              <Text className="text-white text-base leading-6">
                {message.content}
              </Text>
              {message.isStreaming && (
                <View className="mt-2">
                  <ActivityIndicator size="small" color="#ffffff" />
                </View>
              )}
            </View>
            <Text className="text-white/40 text-xs mt-1 px-2">
              {message.timestamp.toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View className="bg-white/5 border-t border-white/10 px-4 py-3">
        <View className="flex-row items-end gap-2">
          <View className="flex-1">
            <Input
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about emergency help..."
              placeholderTextColor="#ffffff60"
              className="bg-white/10 border-white/20 text-white min-h-[44px] max-h-[100px]"
              multiline
              editable={!isLoading && serverStatus === 'connected'}
              onSubmitEditing={() => handleSendMessage()}
            />
          </View>
          <Button
            size="icon"
            className={`h-11 w-11 rounded-full ${
              isLoading || !inputText.trim() || serverStatus !== 'connected'
                ? 'bg-white/20'
                : 'bg-blue-600'
            }`}
            onPress={() => handleSendMessage()}
            disabled={isLoading || !inputText.trim() || serverStatus !== 'connected'}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Icon as={SendIcon} size={20} color="#ffffff" />
            )}
          </Button>
        </View>
        <Text className="text-white/40 text-xs mt-2 text-center">
          ⚠️ For life-threatening emergencies, call 911 immediately
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
