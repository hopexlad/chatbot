const chatBody =document.querySelector(".chat-body");
const messageInput =document.querySelector(".message-input");
const sendMessageButton =document.querySelector("#send-message");
const fileInput =document.querySelector("#file-input");
const fileUploadWrapper =document.querySelector(".file-upload-wrapper");
const fileCancelButton =document.querySelector("#file-cancel");
const chatbotToggler =document.querySelector("#chatbot-toggler");
const closeChatbot =document.querySelector("#close-chatbot");

// API setup
const API_KEY ="AIzaSyCADv_XL-5b_dtS6kvSiqW1YV54WUMuv8U";
const API_URL =`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY} `;
const uri = "mongodb+srv://mithuneshrj61:ritika2005@Rj@cluster0.seqw9.mongodb.net/test";


const userData ={
    message: null,
    file: {
        data: null,
        mime_type: null
    }
}
const dataset = {
    "what is your name?": "I'm your chatbot assistant!",
    "bye": "Goodbye! Have a great day!",
    "how can you help me?": "I can assist with study tips, explanations, and practice questions!",
    "what is the best way to study?": "Active recall and spaced repetition are great techniques for learning.",
    "how do I stay focused?": "Try the Pomodoro technique—study for 25 minutes, then take a 5-minute break.",
    "can you help me with math?": "Of course! What math problem are you working on?",
    "how do I improve my writing skills?": "Practice regularly and read a lot. Writing outlines also help!",
    "what is a good way to memorize facts?": "Using mnemonics and visualization can make memorization easier.",
    "how do I prepare for exams?": "Start early, use practice tests, and review consistently!",
    "what are some good study habits?": "Stay organized, take breaks, and review your notes frequently.",
    "can you quiz me?": "Sure! What subject would you like a quiz on?",
    "how do I take good notes?": "Try the Cornell Method—divide your notes into key points, summaries, and details.",
    "how do I manage my time while studying?": "Create a study schedule and stick to it!",
    "what are some good study apps?": "Apps like Anki, Quizlet, and Notion can help you study efficiently.",
    "can you explain the scientific method?": "Sure! It involves observation, hypothesis, experimentation, and conclusion.",
    "how do I learn a new language?": "Practice daily, use flashcards, and immerse yourself in the language!",
    "how do I get better at problem-solving?": "Break problems into smaller parts and practice logical thinking.",
    "what is an effective way to read textbooks?": "Use the SQ3R method—Survey, Question, Read, Recite, Review.",
    "how do I avoid procrastination?": "Set small goals, remove distractions, and use timers to stay on track.",
    "what are some good memory techniques?": "Try chunking, association, and spaced repetition for better retention.",
    "how do I improve my critical thinking?": "Ask questions, analyze arguments, and consider different perspectives.",
    "can you help me with history?": "Of course! What historical topic do you need help with?",
    "dai":"sollu mapla",
    "soldra":"enna da soldradhu",
    "yedhachi soldra":"yedhachina enna da..theliva soldra!!",
    "seri vidu vidu":"rytdra",
    "what is active learning?": "It’s engaging with the material by discussing, summarizing, or teaching it to someone else.",
    "how do I stay motivated to study?": "Set clear goals, reward yourself, and remind yourself why learning is important!",
    "how do I write a strong thesis statement?": "Make it clear, concise, and arguable—summarize your main argument in one sentence.",
    "how do I improve my reading comprehension?": "Take notes, highlight key points, and summarize what you read.",
    "what are some common grammar mistakes?": "Misusing their/there/they’re, its/it’s, and subject-verb agreement are common errors.",
    "how do I improve my vocabulary?": "Read more books and articles, and use flashcards to learn new words.",
    "how do I cite sources properly?": "Use citation styles like APA, MLA, or Chicago—always credit your sources!",
    "what’s the best way to learn math?": "Practice regularly and focus on understanding the concepts, not just memorizing formulas.",
    "how do I write a research paper?": "Start with an outline, find credible sources, and structure your arguments clearly.",
    "how can I study more efficiently?": "Use active recall, summarization, and avoid passive reading.",
    "how do I improve my presentation skills?": "Practice out loud, make eye contact, and structure your speech clearly.",
    "what is a good way to review for a test?": "Use past exams, summarize notes, and teach the material to someone else.",
    "how do I improve my listening skills?": "Take notes while listening and summarize what you heard afterward.",
    "how do I stay organized with schoolwork?": "Use a planner, set reminders, and keep your materials sorted.",
    "how can I boost my concentration?": "Limit distractions, take breaks, and create a focused study environment.",
    "what is a mnemonic device?": "A technique to help remember information, like ‘PEMDAS’ for math operations.",
    "how do I prepare for a presentation?": "Know your topic well, practice speaking, and engage your audience.",
    "what is spaced repetition?": "Reviewing information over increasing intervals to strengthen memory retention.",
    "how do I improve my essay writing?": "Plan your ideas, write clearly, and proofread before submitting.",
    "how can I understand complex concepts?": "Break them down into simpler parts and relate them to things you already know.",
    "how do I develop better study discipline?": "Set goals, create a routine, and track your progress.",
    "what is the best way to take breaks while studying?": "Use the 5-10 minute rule every hour to refresh your mind.",
    "how do I stay engaged in online classes?": "Take notes, participate in discussions, and avoid multitasking.",
    "how can I overcome test anxiety?": "Prepare well, practice relaxation techniques, and stay positive.",
    "how do I organize my study materials?": "Use folders, digital notes, and color-coded systems for easy access.",
    "what is the Feynman technique?": "A method where you explain a concept in simple terms to check your understanding.",
    "how do I analyze literature?": "Look at themes, characters, symbols, and the author’s intent."
    
};

const chatHistory =[];
const initialInputheight = messageInput.scrollHeight;

// Create message element with dynamic classes ans return it
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message",...classes);
    div.innerHTML = content;
    return div;
}

const generateBotResponse = async (incomeingMessageDiv) => {
    const messageElement = incomeingMessageDiv.querySelector(".message-text");

    // Check if the message exists in the dataset
    const userMessageLower = userData.message.toLowerCase();
    if (dataset[userMessageLower]) {
        messageElement.innerText = dataset[userMessageLower]; // Use dataset answer
        return;
    }

    // If not found in dataset, proceed with API call
    chatHistory.push({
        role: "user",
        parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])]
    });

    // API request options
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: chatHistory })
    };

    try {
        // Fetch user message from API
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        // Extract and display bot's response text
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        messageElement.innerText = apiResponseText;

        // Add bot response to chat history
        chatHistory.push({ role: "model", parts: [{ text: apiResponseText }] });

    } catch (error) {
        console.log(error);
        messageElement.innerText = error.message;
        messageElement.style.color = "#ff0000";
    } finally {
        // Reset user's file data, remove thinking indicator, and scroll chat to bottom
        userData.file = {};
        incomeingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }
};

//Handle outgoing user messages
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value ="";
    fileUploadWrapper.classList.remove("file-uploaded");
    messageInput.dispatchEvent(new Event("input"));

    //create and display user message
    const messageContent =` <div class="message-text"></div>
     ${userData.file.data ? `<img src ="data:${userData.file.mime_type} ;base64,${userData.file.data}" class="attachment"/>` :"" }`;

    const outgoingMessageDiv = createMessageElement(messageContent,"user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth"});

    //simulate bot response with thinking indicator after a delay 
    setTimeout(() => {
        const messageContent =` <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
            </svg>
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>`;

        const incomeingMessageDiv = createMessageElement(messageContent,"bot-message", "thinking");
        chatBody.appendChild(incomeingMessageDiv);
        chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth"});
        generateBotResponse(incomeingMessageDiv);
    }, 600);
}

//Handle enter key press for sending messages
messageInput.addEventListener("keydown",(e) => {
const userMessage = e.target.value.trim();
if(e.key === "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768 ){
    handleOutgoingMessage(e);
}
});

//adjust input field height dynamically
messageInput.addEventListener("input", () => {
    messageInput.style.height =`${initialInputheight}px`;
    messageInput.style.height =`${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputheight ? "15px" : "32px";

});

// Handle file input change and preview the selected file 
fileInput.addEventListener("change",() => {
    const file = fileInput.files[0];
    if(!file) return;

  const reader =new FileReader();
  reader.onload =(e) => {
    fileUploadWrapper.querySelector("img").src = e.target.result;
    fileUploadWrapper.classList.add("file-uploaded");
    const base64String =e.target.result.split(",")[1];

// store file data in userdata
    userData.file = {
        data: base64String,
        mime_type: file.type
    }
fileInput.value = "";
  }

  reader.readAsDataURL(file);
})

// Cancel file upload 
fileCancelButton.addEventListener("click", () => {
    userData.file ={};
    fileUploadWrapper.classList.remove("file-uploaded");
});

// Initialize emoji picker and handle emoji selection
const picker = new EmojiMart.Picker({
    theme: "light", 
    skinTonePostion: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
        const { selectionStart: start, selectionEnd: end } =messageInput;
        messageInput.setRangeText(emoji.native, start, end ,"end");
        messageInput.focus();
    },
    onClickOutside: (e) => {
        if(e.target.id === "emoji-picker") {
            document.body.classList.toggle("show-emoji-picker");
        } else {
            document.body.classList.remove("show-emoji-picker");

        }
    }
});

document.querySelector(".chat-form").appendChild(picker);


sendMessageButton.addEventListener("click",(e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
