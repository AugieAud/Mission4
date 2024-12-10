//set up event listener for submit button
//once clicked it triggers the function that follows
//async keyword means we can use await inside the function to handle asynchronous operations like network requests
document.getElementById("submitButton").addEventListener("click", async () => {
  const userResponse = document.getElementById("userResponse").value;
  const chatDisplay = document.getElementById("chatDisplay");

  // Update chat display with user input
  chatDisplay.innerHTML += `<p><strong>You:</strong> ${userResponse}</p>`;
  document.getElementById("userResponse").value = ""; // Clear input field after user submits tehur response

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
    chatDisplay.innerHTML += `<p><strong>Tina:</strong> ${data.aiResponse}</p>`;
    chatDisplay.scrollTop = chatDisplay.scrollHeight; // Auto-scroll the chat display
  } catch (error) {
    //handle errors, show the error message in the chat display
    chatDisplay.innerHTML += `<p style="color: red;"><strong>Error:</strong> Unable to connect to AI.</p>`;
  }
});
