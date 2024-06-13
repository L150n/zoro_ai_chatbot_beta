<template>
  <div class="chat-header">
    <h2>Zoro</h2>
    <i class="pi pi-refresh new-chat-icon" @click="startNewChat"></i>
  </div>
  <div class="chat-container">
    <div class="chat-messages-container">
      <div class="chat-messages" :style="{ padding: '8px 0' }">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['chat-message', message.sender === 'user' ? 'user' : 'bot']"
        >
          <div class="message-header">{{ message.sender }}</div>
          <div class="message-content" v-html="message.text"></div>
        </div>
      </div>
    </div>
    <div class="chat-input-container">
      <div class="chat-input">
        <InputText v-model="userInput" placeholder="Type your message..." @keydown.enter="sendMessage" />
        <Button :disabled="!userInput.trim()" label="Send" @click="sendMessage" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue';
import OpenAI from 'openai';
import 'primeicons/primeicons.css'; // PrimeIcons CSS

const userInput = ref('');
const messages = ref([]);

const anyscale = new OpenAI({
  baseURL: 'https://api.endpoints.anyscale.com/v1',
  apiKey: 'esecret_zbhlwl6qyh716ywxl8x3y5szgb',
  dangerouslyAllowBrowser: true
});

const systemMessage = { role: 'assistant', content: 'You are a helpful assistant with name Zoro.' };

const scrollToBottom = () => {
  const container = document.querySelector('.chat-messages-container');
  container.scrollTop = container.scrollHeight;
};

const sendMessage = async () => {
  try {
    if (userInput.value.trim() !== '') {
      const newMessage = {
        id: messages.value.length + 1,
        text: userInput.value,
        sender: 'user'
      };
      messages.value.push(newMessage);
      userInput.value = '';

      await nextTick();
      scrollToBottom();

      const requestOptions = {
        model: 'meta-llama/Meta-Llama-3-70B-Instruct',
        messages: [
          systemMessage,
          ...messages.value.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text }))
        ],
        temperature: 1,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0
      };

      const completion = await anyscale.chat.completions.create(requestOptions);
      const assistantMessage = completion.choices[0]?.message?.content.replace(/\n/g, '<br/>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      const botMessage = {
        id: messages.value.length + 1,
        text: assistantMessage,
        sender: 'bot'
      };
      messages.value.push(botMessage);

      await nextTick();
      scrollToBottom();
    }
  } catch (error) {
    console.error(error);
    messages.value.push({
      id: messages.value.length + 1,
      text: 'Try again later',
      sender: 'bot'
    });

    await nextTick();
    scrollToBottom();
  }
};

const startNewChat = () => {
  messages.value = [];
  localStorage.removeItem('chatMessages');
};

onMounted(() => {
  const savedMessages = localStorage.getItem('chatMessages');
  if (savedMessages) {
    messages.value = JSON.parse(savedMessages);
  }
});

watch(messages, (newMessages) => {
  localStorage.setItem('chatMessages', JSON.stringify(newMessages));
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f0f0;
}

.chat-header {
  background-image: url('https://giffiles.alphacoders.com/221/221829.gif');
  background-size: cover;
  background-position: center;
  color: #FFFFFF;
  padding: 16px;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  font-size: 24px;
  position: relative;
}

.new-chat-icon {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 24px;
  cursor: pointer;
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

.chat-message.user {
  background-color: #059669;
  color: #fff;
  align-self: flex-end;
}

.chat-message.bot {
  background-color: #fff;
  color: #333;
  align-self: flex-start;
}

.chat-input-container {
  background-color: #fff;
  border-top: 1px solid #ddd;
  padding: 16px;
}

.chat-input {
  display: flex;
  align-items: center;
}

.chat-input input {
  flex-grow: 1;
  margin-right: 12px;
}

.chat-input button {
  min-width: 80px;
}

.chat-input input:focus {
  border-color: #059669;
  outline: none;
}

.chat-input button:hover {
  background-color: #047857;
  color: #fff;
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
