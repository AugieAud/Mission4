//add event listener for when the page loads
window.addEventListener("load", async () => {
  const chatDisplay = document.getElementById("chatDisplay");

  //add the opt-in question to the chat display
  const optInMessage = document.createElement("p");
  optInMessage.innerHTML = `<strong>Tina:</strong> I’m Tina. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?`;
  chatDisplay.appendChild(optInMessage);
});

//set up event listener for submit button
//once clicked it triggers the function that follows
//async keyword means we can use await inside the function to handle asynchronous operations like network requests
document.getElementById("submitButton").addEventListener("click", async () => {
  const userResponse = document.getElementById("userResponse").value;
  const chatDisplay = document.getElementById("chatDisplay");

  // Update chat display with user input
  chatDisplay.innerHTML += `<p><strong>You:</strong> ${userResponse}</p>`;
  document.getElementById("userResponse").value = ""; // Clear input field after user submits their response

  // creates array of conversation history, determining the speaker based on the presence of the word "You"
  const conversationHistory = Array.from(chatDisplay.children).map((el) => {
    const role = el.querySelector("strong").textContent.includes("You")
      ? "user"
      : "model";
    return {
      role,
      parts: [{ text: el.textContent.replace(/^.*?:/, "").trim() }],
    };
  });

  //sends HTTP POST request to the server with the job title, user response, and conversation history
  try {
    const response = await fetch("http://localhost:3000/insurance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userResponse, conversationHistory }),
    });

    //handles the response from the server, if processed successfully, the AI response is displayed in the chat display
    const data = await response.json();

    //replace ** with bold text in AI response
    const formattedResponse = data.aiResponse.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );

    //append formatted AI response to the chat display
    const aiMessage = document.createElement("p");
    aiMessage.innerHTML = `<strong>Tina:</strong> ${formattedResponse}`;
    chatDisplay.appendChild(aiMessage);

    // Auto-scroll the chat display
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
  } catch (error) {
    //handle errors, show the error message in the chat display
    chatDisplay.innerHTML += `<p style="color: red;"><strong>Error:</strong> Unable to connect to AI.</p>`;
  }
});
