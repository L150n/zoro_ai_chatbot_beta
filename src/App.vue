<template>
  <div class="chat-header">
    <h2>Zoro</h2>
  </div>
  <div class="chat-container">
    <div class="chat-messages-container">
      <div class="chat-messages" :style="{ padding: '8px 0' }"> <!-- Added small top and bottom padding -->
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['chat-message', message.sender === 'user' ? 'user' : 'bot']"
        >
          <div class="message-header">{{ message.sender }}</div>
          <div class="message-content">{{ message.text }}</div>
        </div>
      </div>
    </div>
    <div class="chat-input-container">
      <div class="chat-input">
        <InputText v-model="userInput" placeholder="Type your message..." @keydown.enter="sendMessage" />
        <Button label="Send" @click="sendMessage" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_API_KEY;
const userInput = ref('');
const messages = ref([]);

const anyscale = new OpenAI({
  baseURL: 'https://api.endpoints.anyscale.com/v1',
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
});

const requestOptions = {
  model: 'mistralai/Mistral-7B-Instruct-v0.1',
  messages: []
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

      // Update messages in the requestOptions data object
      requestOptions.messages = [
        { role: 'system', content: 'You are a helpful assistant with name Zoro.' },
        { role: 'user', content: newMessage.text }
      ];

      const completion = await anyscale.chat.completions.create(requestOptions);
      const assistantMessage = completion.choices[0]?.message?.content;
      const botMessage = {
        id: messages.value.length + 1,
        text: assistantMessage,
        sender: 'bot'
      };
      messages.value.push(botMessage);
    }
  } catch (error) {
    console.error(error);
    messages.value.push({ // Display error message
      id: messages.value.length + 1,
      text: 'Try again Later',
      sender: 'bot'
    });
  }
};
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
  color: #FFFFFF; /* White */
  padding: 16px;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Adding a shadow effect */
  font-size: 24px; /* Increasing font size */
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

.chat-input input {
  margin-right: 0;
  margin-bottom: 12px;
}

.chat-input button {
  width: 100%;
}
}
</style>