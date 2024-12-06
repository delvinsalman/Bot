let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#send-btn");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let image = document.querySelector("#image img");
let imageinput = document.querySelector("#file-upload"); // Updated to match the file input ID
let attachBtn = document.querySelector("#attach-btn");  // Button to trigger file input

// Retrieve user and bot icon URLs from data attributes in HTML
let chatAppContainer = document.querySelector('.chat-app');
let userIcon = chatAppContainer.dataset.userIcon;
let botIcon = chatAppContainer.dataset.botIcon;

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDTjpGqvnZhccBMMPle2-7D_K2XzGFQJA0";

let user = {
  message: null,
  file: {
    mime_type: null,
    data: null
  }
};

// Function to generate a response from the API
async function generateResponse(aiChatBox) {
  let text = aiChatBox.querySelector(".ai-chat-area");
  let RequestOption = {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      "contents": [
        {
          "parts": [
            { text: user.message },
            (user.file.data ? [{ inline_data: user.file }] : [])
          ]
        }
      ]
    })
  };

  try {
    let response = await fetch(Api_Url, RequestOption);
    let data = await response.json();
    let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
    text.innerHTML = apiResponse;
  } catch (error) {
    console.log(error);
    text.innerHTML = "Sorry, something went wrong!";
  } finally {
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
    image.src = `img.svg`;
    image.classList.remove("choose");
    user.file = {};
  }
}

// Function to create a new chat box (user or AI)
function createChatBox(html, classes) {
  let div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(classes);
  return div;
}

// Function to handle chat response
function handlechatResponse(userMessage) {
  user.message = userMessage;

  // User chat box with green bubble
  let html = `<div class="chat-row user-row">
    <img src="${userIcon}" alt="User Icon" class="chat-icon">
    <div class="user-chat-area">
      ${user.message}
      ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
    </div>
  </div>`;
  prompt.value = "";
  let userChatBox = createChatBox(html, "user-chat-box");
  chatContainer.appendChild(userChatBox);

  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

  setTimeout(() => {
    // Bot chat box with blue bubble and loading icon
    let html = `<div class="chat-row bot-row">
      <div class="ai-chat-area">
        <img src="/static/Loading.webp" alt="Loading" class="load" width="50px"> <!-- Loading icon -->
      </div>
      <img src="${botIcon}" alt="Bot Icon" class="chat-icon">
    </div>`;
    let aiChatBox = createChatBox(html, "ai-chat-box");
    chatContainer.appendChild(aiChatBox);
    generateResponse(aiChatBox);
  }, 600);
}

// Handle "Enter" key event for sending a message
prompt.addEventListener("keydown", (e) => {
  if (e.key == "Enter" && !e.shiftKey) {
    e.preventDefault();  // Prevents the default Enter key behavior (new line)
    if (prompt.value.trim()) {  // Ensure the message is not empty
      handlechatResponse(prompt.value);
    }
  }
});

// Submit button click event
submitbtn.addEventListener("click", () => {
  let message = prompt.value.trim();
  if (message || user.file.data) {  // Ensure the message or image is not empty
    handlechatResponse(message);
  }
});

// Image input change event (for file attachment)
imageinput.addEventListener("change", () => {
  const file = imageinput.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = (e) => {
    let base64string = e.target.result.split(",")[1];
    user.file = {
      mime_type: file.type,
      data: base64string
    };
    image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
    image.classList.add("choose");
  };

  reader.readAsDataURL(file);
});

// Image button click event to open file input dialog
attachBtn.addEventListener("click", () => {
  imageinput.click();  // Triggers the file input when the button is clicked
});
