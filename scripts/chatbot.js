(function(){
'use strict';

const STORAGE_KEY = 'advikChatSessionId';
const ENDPOINT = '/.netlify/functions/chat';
const ERROR_MESSAGE = "Sorry, I had trouble connecting to Advik's chatbot. Please try again in a moment.";
const WELCOME_MESSAGE = "Hey, I'm Advik's digital twin 👋\nAsk me about his projects, coding journey, Good Plate, skills, goals, or how to contact him.";

const widget = document.querySelector('[data-chat-widget]');
if (!widget) return;

const toggle = widget.querySelector('[data-chat-toggle]');
const panel = widget.querySelector('[data-chat-panel]');
const close = widget.querySelector('[data-chat-close]');
const form = widget.querySelector('[data-chat-form]');
const input = widget.querySelector('[data-chat-input]');
const messages = widget.querySelector('[data-chat-messages]');
const sendButton = widget.querySelector('[data-chat-send]');

function getSessionId() {
  let sessionId = localStorage.getItem(STORAGE_KEY);
  if (!sessionId) {
    const cryptoId = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : String(Date.now());
    sessionId = `portfolio-${cryptoId}`;
    localStorage.setItem(STORAGE_KEY, sessionId);
  }
  return sessionId;
}

function appendMessage(text, type) {
  const message = document.createElement('div');
  message.className = `chat-message ${type}`;
  message.textContent = text;
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
  return message;
}

function setOpen(isOpen) {
  widget.classList.toggle('is-open', isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
  panel.setAttribute('aria-hidden', String(!isOpen));
  if (isOpen) window.setTimeout(() => input.focus(), 120);
}

function setLoading(isLoading) {
  widget.classList.toggle('is-loading', isLoading);
  input.disabled = isLoading;
  sendButton.disabled = isLoading;
}

toggle.addEventListener('click', () => setOpen(!widget.classList.contains('is-open')));
close.addEventListener('click', () => setOpen(false));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && widget.classList.contains('is-open')) setOpen(false);
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  appendMessage(text, 'user');
  input.value = '';
  setLoading(true);
  const thinking = appendMessage('Thinking...', 'bot thinking');

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        sessionId: getSessionId()
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.reply || data.error || 'Chat request failed');

    thinking.remove();
    appendMessage(data.reply || ERROR_MESSAGE, 'bot');
  } catch (error) {
    thinking.remove();
    appendMessage(ERROR_MESSAGE, 'bot error');
  } finally {
    setLoading(false);
    input.focus();
  }
});

appendMessage(WELCOME_MESSAGE, 'bot');
})();
