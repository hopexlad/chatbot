const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

// API setup
const API_KEY = "AIzaSyCADv_XL-5b_dtS6kvSiqW1YV54WUMuv8U";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
const uri = "mongodb+srv://mithuneshrj61:ritika2005%40Rj@cluster0.seqw9.mongodb.net/test";  // Encoded @

// User data structure
const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
};

let chatHistory = [];  // Define chat history

// Dataset for responses
const dataset = {
    "hello": "Hi there! How can I help you?",
    "how are you?": "I'm just a bot, but I'm doing great! What about you?",
    "what is your name?": "I'm your chatbot assistant!",
    "bye": "Goodbye! Have a great day!"
};

// Generate bot response
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    if (!userData || !userData.message) {
        console.error("Error: userData is undefined or empty.");
        messageElement.innerText = "Something went wrong!";
        return;
    }

    const userMessageLower = userData.message.toLowerCase().trim();

    if (dataset[userMessageLower]) {
        messageElement.innerText = dataset[userMessageLower];
        return;
    }

    chatHistory.push({
        role: "user",
        parts: [{ text: userData.message }, ...(userData.file?.data ? [{ inline_data: userData.file }] : [])]
    });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: chatHistory })
        });

        if (!response.ok) throw new Error("API response error");

        const data = await response.json();
        if (!data?.candidates || data.candidates.length === 0) throw new Error("No response from API");

        const apiResponseText = data.candidates[0]?.content?.parts?.[0]?.text?.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        messageElement.innerText = apiResponseText || "No response from API";

        chatHistory.push({ role: "model", parts: [{ text: apiResponseText }] });

    } catch (error) {
        console.log(error);
        messageElement.innerText = "Error fetching response!";
        messageElement.style.color = "#ff0000";
    } finally {
        userData.file = {};
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }
};

// Handle outgoing user messages
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    if (!userData.message) return;

    fileUploadWrapper.classList.remove("file-uploaded");
    messageInput.dispatchEvent(new Event("input"));

    const messageContent = `<div class="message-text"></div> 
    ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment"/>` : ""}`;

    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    messageInput.value = ""; // Clear input after sending

    setTimeout(() => {
        const botMessageContent = `
            <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50">
                <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9z"></path>
            </svg>
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>`;

        const incomingMessageDiv = createMessageElement(botMessageContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        generateBotResponse(incomingMessageDiv);
    }, 600);
};

// Handle enter key press for sending messages
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.value.trim() && !e.shiftKey && window.innerWidth > 768) {
        handleOutgoingMessage(e);
    }
});

// Adjust input field height dynamically
messageInput.addEventListener("input", () => {
    messageInput.style.height = "auto";
    messageInput.style.height = `${messageInput.scrollHeight}px`;
});

// Handle file input change
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded");
        const base64String = e.target.result.split(",")[1];

        userData.file = {
            data: base64String,
            mime_type: file.type
        };
        fileInput.value = "";
    };

    reader.readAsDataURL(file);
});

// Cancel file upload
fileCancelButton.addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");
});

// Initialize chatbot toggler
sendMessageButton.addEventListener("click", handleOutgoingMessage);
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
