
const username = localStorage.getItem("username");
const useremail = localStorage.getItem("useremail");
const title = document.getElementById("hometitle");
const logoutButton = document.getElementById("logout-btn");
const chatHome = document.getElementById("chat-home");
const isLoggedIn = Boolean(username && useremail);

if (chatHome) {
  chatHome.hidden = !isLoggedIn;
}

if (title && isLoggedIn) {
  title.textContent = username
    ? `Welcome To Our MedGuide AI, ${username}`
    : "";
}

if (logoutButton) {
  logoutButton.hidden = !isLoggedIn;
}

function logout(){
  localStorage.removeItem("username");
  localStorage.removeItem("useremail");
  window.location.href="index.html";
}
//////////////////////////////////////////////////////////

//////////////the connection between the Ui and the chatbot///////////////////
document.addEventListener("DOMContentLoaded", () => {
  const chatBody = document.querySelector(".chat-body");
  const chatInput = document.querySelector(".chat-input-wrap input");
  const sendButton = document.querySelector(".chat-input-wrap button");

  const welcomeMessage = document.querySelector(".chat-body > .chat-message.assistant");
  const suggestions = document.querySelector(".message-suggestions");
  const sidebar = document.querySelector(".chat-sidebar");
  const newChatButton = document.querySelector(".new-chat-btn");
  const initialChatContent = chatBody.innerHTML;

  // =====================================================
  // PUT YOUR PYTHON API URL HERE
  // =====================================================

  const API_URL = window.MEDGUIDE_API_URL
    || "https://YOUR-RENDER-SERVICE.onrender.com/api/chat";

  // =====================================================


  let chatStarted = false;


  // -----------------------------------------------------
  // Start Chat
  // -----------------------------------------------------

  function startChat() {
    if (chatStarted) return;

    chatStarted = true;

    // Remove the demo conversation before showing the real conversation.
    if (chatBody) {
      chatBody.replaceChildren();
    }

    // Hide previous chats from sidebar
    if (sidebar) {
      sidebar.style.display = "none";
    }
  }


  // -----------------------------------------------------
  // Add Message To Chat
  // -----------------------------------------------------

  function addMessage(message, type) {
    const messageWrapper = document.createElement("div");

    messageWrapper.classList.add(
      "chat-message",
      type === "user" ? "user" : "assistant"
    );

    const bubble = document.createElement("div");

    bubble.classList.add("bubble");

    if (type === "user") {
      bubble.classList.add("user-bubble");
    }

    bubble.textContent = message;

    messageWrapper.appendChild(bubble);

    chatBody.appendChild(messageWrapper);

    // Scroll to latest message
    chatBody.scrollTop = chatBody.scrollHeight;

    return messageWrapper;
  }


  // -----------------------------------------------------
  // Send Question To Python Backend
  // -----------------------------------------------------

  async function sendQuestion() {
    const question = chatInput.value.trim();

    // Don't send empty messages
    if (!question) return;

    // Start the chat UI
    startChat();

    // Show user's question
    addMessage(question, "user");

    // Clear input
    chatInput.value = "";

    // Disable input while waiting
    chatInput.disabled = true;
    sendButton.disabled = true;

    // Show thinking message
    const thinkingMessage = addMessage("Thinking...", "assistant");

    try {

      // =================================================
      // SEND REQUEST TO YOUR PYTHON API
      // =================================================

      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("access_token")
            ? { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
            : {}),
        },

        body: JSON.stringify({
          message: question,
        }),
      });


      // =================================================
      // CHECK API RESPONSE
      // =================================================

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your login session is not authorized for the chat API.");
        }

        throw new Error(`Server error: ${response.status}`);
      }


      const data = await response.json();


      // Remove "Thinking..."
      thinkingMessage.remove();


      // =================================================
      // GET ANSWER FROM API
      // =================================================

      const answer =
        data.reply ||
        data.answer ||
        data.response ||
        "Sorry, I couldn't find an answer.";


      // Show AI answer
      addMessage(answer, "assistant");


      // =================================================
      // OPTIONAL SOURCE
      // =================================================

      if (data.source || data.sources) {
        addSources(data);
      }


    } catch (error) {

      console.error("Chat API Error:", error);

      // Remove "Thinking..."
      thinkingMessage.remove();

      // Show error message
      addMessage(
        error.message.includes("not authorized")
          ? "Your login session is not connected to the chat server. Please log in through the API-enabled login page."
          : "Sorry, something went wrong while connecting to the AI. Please try again.",
        "assistant",
      );

    } finally {

      // Enable input again
      chatInput.disabled = false;
      sendButton.disabled = false;

      chatInput.focus();
    }
  }


  // -----------------------------------------------------
  // Add Sources
  // -----------------------------------------------------

  function addSources(data) {

    const sourceBox = document.createElement("div");

    sourceBox.classList.add("source-list");

    const title = document.createElement("div");

    title.classList.add("source-title");

    title.innerHTML = `
      <span>Sources</span>
      <i class="fa-solid fa-arrow-up-right-from-square"></i>
    `;

    sourceBox.appendChild(title);


    let sources = data.sources || data.source;

    if (!Array.isArray(sources)) {
      sources = [sources];
    }


    sources.forEach(source => {

      const sourceItem = document.createElement("div");

      sourceItem.classList.add("source-item");

      sourceItem.textContent = `• ${source}`;

      sourceBox.appendChild(sourceItem);

    });


    chatBody.appendChild(sourceBox);

    chatBody.scrollTop = chatBody.scrollHeight;
  }


  // -----------------------------------------------------
  // Send Button
  // -----------------------------------------------------

  sendButton.addEventListener("click", sendQuestion);


  // -----------------------------------------------------
  // Press Enter To Send
  // -----------------------------------------------------

  chatInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter" && !event.shiftKey) {

      event.preventDefault();

      sendQuestion();

    }

  });


  // -----------------------------------------------------
  // Suggestion Buttons
  // -----------------------------------------------------

  const suggestionButtons = document.querySelectorAll(
    ".message-suggestions button"
  );


  suggestionButtons.forEach(button => {

    button.addEventListener("click", () => {

      chatInput.value = button.textContent.trim();

      sendQuestion();

    });

  });


  // -----------------------------------------------------
  // New Chat
  // -----------------------------------------------------

  newChatButton.addEventListener("click", () => {

    chatBody.innerHTML = initialChatContent;


    // Show welcome message
    if (welcomeMessage) {
      welcomeMessage.style.display = "";
    }


    // Show suggestions
    if (suggestions) {
      suggestions.style.display = "";
    }


    // Show sidebar chats
    if (sidebar) {
      sidebar.style.display = "";
    }


    chatStarted = false;

    chatInput.value = "";

    chatInput.disabled = false;

    sendButton.disabled = false;

    chatInput.focus();

  });

});