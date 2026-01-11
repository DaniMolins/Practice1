/**
 * AI Chat - Gemini API Integration
 * Provides trip suggestions using Google's Gemini API
 */

(function () {
  // DOM Elements
  const chatBtn = document.getElementById("ai-chat-btn");
  const chatOverlay = document.getElementById("ai-chat-overlay");
  const chatClose = document.getElementById("ai-chat-close");
  const chatForm = document.getElementById("ai-chat-form");
  const chatInput = document.getElementById("ai-chat-input");
  const chatMessages = document.getElementById("ai-chat-messages");

  // Gemini API config
  const GEMINI_API_KEY = CONFIG.GEMINI_API_KEY;
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  // System prompt for travel suggestions
  const SYSTEM_PROMPT = `You are a friendly travel assistant for TripPlanner+. Your role is to:
- Suggest travel destinations based on user preferences
- Recommend activities and things to do at destinations
- Provide brief travel tips and advice
- Keep responses concise and helpful (2-3 short paragraphs max)
- Be enthusiastic but not overwhelming
- Focus only on travel-related suggestions

Do NOT provide:
- Booking services or prices
- Personal advice unrelated to travel
- Long detailed itineraries (keep it brief)

Always be friendly and encouraging about travel, 
and keep in mind that the text formatting it not supported(that includes bold, italic and so on), so answer in plain text`;

  // Conversation history for context
  let conversationHistory = [];

  /**
   * Open chat popup
   */
  function openChat() {
    chatOverlay.classList.add("active");
    chatInput.focus();
  }

  /**
   * Open chat and send a message immediately
   */
  async function openChatWithMessage(message) {
    openChat();
    if (message && message.trim()) {
      chatInput.value = message;
      // Trigger submit
      chatForm.dispatchEvent(new Event("submit"));
    }
  }

  // Expose for home page button
  window.openAIChat = openChat;
  window.openAIChatWithMessage = openChatWithMessage;

  /**
   * Close chat popup
   */
  function closeChat() {
    chatOverlay.classList.remove("active");
  }

  /**
   * Add message to chat
   */
  function addMessage(text, type) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `ai-message ${type}`;
    msgDiv.innerHTML = `<p>${escapeHtml(text)}</p>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgDiv;
  }

  /**
   * Show typing indicator
   */
  function showTyping() {
    const typing = document.createElement("div");
    typing.className = "ai-message incoming typing";
    typing.id = "typing-indicator";
    typing.innerHTML = "<span></span><span></span><span></span>";
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /**
   * Hide typing indicator
   */
  function hideTyping() {
    const typing = document.getElementById("typing-indicator");
    if (typing) typing.remove();
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Send message to Gemini API
   */
  async function sendToGemini(userMessage) {
    // Add to conversation history
    conversationHistory.push({ role: "user", parts: [{ text: userMessage }] });

    // Build request with system prompt and history
    const requestBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: conversationHistory,
    };

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response. Please try again.";

      // Add AI response to history
      conversationHistory.push({
        role: "model",
        parts: [{ text: aiResponse }],
      });

      return aiResponse;
    } catch (error) {
      console.error("Gemini API error:", error);
      return "Sorry, I'm having trouble connecting right now. Please try again later.";
    }
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(e) {
    e.preventDefault();

    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, "outgoing");
    chatInput.value = "";
    chatInput.disabled = true;

    // Show typing indicator
    showTyping();

    // Get AI response
    const response = await sendToGemini(message);

    // Hide typing and show response
    hideTyping();
    addMessage(response, "incoming");

    chatInput.disabled = false;
    chatInput.focus();
  }

  // Event listeners
  chatBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openChat();
  });

  chatClose.addEventListener("click", closeChat);

  chatOverlay.addEventListener("click", (e) => {
    if (e.target === chatOverlay) closeChat();
  });

  chatForm.addEventListener("submit", handleSubmit);

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && chatOverlay.classList.contains("active")) {
      closeChat();
    }
  });
})();
