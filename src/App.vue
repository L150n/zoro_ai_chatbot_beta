<template>
  <div class="chat-header" :class="{ 'dark': theme === 'dark' }">
    <h2>Zoro</h2>
    <div class="header-buttons">
  <Button 
    :icon="theme === 'light' ? 'pi pi-moon' : 'pi pi-sun'" 
    @click="toggleTheme" 
    aria-label="Toggle theme" 
  />
  <Button label="New Chat"  icon="pi pi-plus" @click="startNewChat" class="p-button" />
</div>
  </div>
  <div class="chat-container" :class="{ 'dark': theme === 'dark' }">
    <div class="chat-messages-container" role="log" aria-live="polite">
      <div class="chat-messages" :style="{ padding: '8px 0' }">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['chat-message', message.sender === 'user' ? 'user' : 'bot']"
        >
          <div class="message-header">{{ message.sender }}</div>
          <div class="message-content" v-html="message.text"></div>
          <div class="message-timestamp">{{ formatTimestamp(message.timestamp) }}</div>
        </div>
        <div v-if="loading" class="chat-message bot">
          <div class="message-header">bot</div>
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"
            animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        </div>
      </div>
    </div>
    <div class="chat-input-container">
      <div class="chat-input">
        <InputText v-model="userInput" placeholder="Type your message..." @keydown.enter="sendMessage" aria-label="Message input" class="p-inputtext" />
        <Button :disabled="!userInput.trim()" label="Send" @click="sendMessage" class="p-button" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue';
import OpenAI from 'openai';
import 'primeicons/primeicons.css';

const userInput = ref('');
const messages = ref([]);
const loading = ref(false);
const theme = ref('dark');

const anyscale = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

const systemMessage = { role: 'assistant', content: 'You are a helpful assistant with name Zoro.' };

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', theme.value);
};

const scrollToBottom = () => {
  const container = document.querySelector('.chat-messages-container');
  container.scrollTop = container.scrollHeight;
};

const addUserMessage = () => {
  if (userInput.value.trim() !== '') {
    const newMessage = {
      id: Date.now(),
      text: userInput.value,
      sender: 'user',
      timestamp: new Date()
    };
    messages.value.push(newMessage);
    userInput.value = '';
    nextTick(scrollToBottom);
  }
};

const fetchBotResponse = async () => {
  loading.value = true;
  try {
    const requestOptions = {
      messages: [
        systemMessage,
        ...messages.value.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text }))
      ],
    model: "gpt-4o",
    temperature: 1,
    max_tokens: 1000,
    top_p: 1
    };

    const completion = await anyscale.chat.completions.create(requestOptions);
    const assistantMessage = completion.choices[0]?.message?.content.replace(/\n/g, '<br/>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    const botMessage = {
      id: Date.now(),
      text: assistantMessage,
      sender: 'bot',
      timestamp: new Date()
    };
    messages.value.push(botMessage);
  } catch (error) {
    console.error(error);
    messages.value.push({
      id: Date.now(),
      text: 'Try again later',
      sender: 'bot',
      timestamp: new Date()
    });
  } finally {
    loading.value = false;
    nextTick(scrollToBottom);
  }
};

const sendMessage = async () => {
  addUserMessage();
  if (messages.value.length > 0) {
    await fetchBotResponse();
  }
};

const startNewChat = () => {
  messages.value = [];
  sessionStorage.removeItem('chatMessages');
};

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    theme.value = savedTheme;
  }
  const savedMessages = sessionStorage.getItem('chatMessages');
  if (savedMessages) {
    messages.value = JSON.parse(savedMessages);
  }
  // Clear messages on refresh
  messages.value = [];
  sessionStorage.removeItem('chatMessages');
});

watch(messages, (newMessages) => {
  sessionStorage.setItem('chatMessages', JSON.stringify(newMessages));
}, { deep: true });
</script>

<style scoped>
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-image: url('https://giffiles.alphacoders.com/221/221829.gif');
  background-size: cover;
  background-position: center;
  color: var(--header-text-color);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  font-size: 24px;
}

.chat-header h2 {
  color: #ffffff;
}

.header-buttons {
  display: flex;
  gap: 8px;
}

.header-buttons .p-button {
  font-size: 16px; 
  padding: 8px; 
}

:root {
  --bg-color: #f0f0f0;
  --text-color: #333;
  --user-bg: #059669;
  --user-text: #fff;
  --bot-bg: #fff;
  --bot-text: #333;
  --header-text-color: #ffffff;
  --input-bg: #fff;
  --input-border: #ddd;
  --button-bg: #059669;
  --button-text: #fff;
  --timestamp-color: #888;
  --focus-border-color: #059669;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.chat-messages-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 8px 16px;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.chat-message {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 16px;
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.chat-message .message-header {
  font-weight: bold;
  margin-bottom: 4px;
}

.chat-message .message-content {
  word-break: break-word;
}

.chat-message .message-timestamp {
  font-size: 0.8em;
  color: var(--timestamp-color);
  margin-top: 4px;
  align-self: flex-end;
}

.chat-message.user {
  background-color: var(--user-bg);
  color: var(--user-text);
  align-self: flex-end;
}

.chat-message.bot {
  background-color: var(--bot-bg);
  color: var(--bot-text);
  align-self: flex-start;
}

.chat-input-container {
  background-color: var(--input-bg);
  border-top: 1px solid var(--input-border);
  padding: 16px;
}

.chat-input {
  display: flex;
  align-items: center;
}

.p-inputtext {
  flex-grow: 1;
  margin-right: 12px;
  background-color: var(--input-bg);
  color: var(--text-color);
  border: 1px solid var(--input-border);
}

.p-inputtext:focus {
  border-color: var(--focus-border-color);
  outline: none;
}

.p-button {
  min-width: 80px;
  background-color: var(--button-bg) !important;
  color: var(--button-text) !important;
  border: none;
  transition: background 0.3s ease;
}

.p-button:not(:disabled):hover {
  background: linear-gradient(270deg, 
    #ff0000, /* Red */
    #ff7f00, /* Orange */
    #ffff00, /* Yellow */
    #00ff00, /* Green */
    #0000ff, /* Blue */
    #4b0082, /* Indigo */
    #8b00ff  /* Violet */
  );
  background-size: 400% 400%;
  animation: rainbowAnimation 5s ease infinite;
}

@keyframes rainbowAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}


.chat-container.dark {
  --bg-color: #333;
  --text-color: #fff;
  --user-bg: #047857;
  --user-text: #fff;
  --bot-bg: #444;
  --bot-text: #fff;
  --header-text-color: #dddddd;
  --input-bg: #444;
  --input-border: #555;
  --button-bg: #047857;
  --button-text: #fff;
  --timestamp-color: #aaa;
  --focus-border-color: #047857;
}

@media (max-width: 768px) {
  .chat-container {
    height: auto;
    display: grid;
    grid-template-rows: 1fr auto;
  }

  .chat-messages-container {
    overflow-y: auto;
    max-height: 70vh;
  }

  .chat-input-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px;
  }

  .chat-input {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
