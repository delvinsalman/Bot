let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#send-btn");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let image = document.querySelector("#image img");
let imageinput = document.querySelector("#file-upload");
let attachBtn = document.querySelector("#attach-btn");

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


let userSound = new Audio("/static/S2.mp3");
let botSound = new Audio("/static/S1.mp3");

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
    botSound.play();  
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

function createChatBox(html, classes) {
  let div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(classes);
  return div;
}

function handlechatResponse(userMessage) {
  user.message = userMessage;

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

  userSound.play();  

  setTimeout(() => {
    let html = `<div class="chat-row bot-row">
      <div class="ai-chat-area">
        <img src="/static/Loading.webp" alt="Loading" class="load" width="50px">
      </div>
      <img src="${botIcon}" alt="Bot Icon" class="chat-icon">
    </div>`;
    let aiChatBox = createChatBox(html, "ai-chat-box");
    chatContainer.appendChild(aiChatBox);
    generateResponse(aiChatBox);
  }, 600);
}

prompt.addEventListener("keydown", (e) => {
  if (e.key == "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (prompt.value.trim()) {
      handlechatResponse(prompt.value);
    }
  }
});

submitbtn.addEventListener("click", () => {
  let message = prompt.value.trim();
  if (message || user.file.data) {
    handlechatResponse(message);
  }
});

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

attachBtn.addEventListener("click", () => {
  imageinput.click();
});
