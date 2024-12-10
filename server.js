//load environment variables from a .env file into process.env
const dotenv = require("dotenv");
dotenv.config();
// Load the required libraries
const express = require("express"); //web framework used to build APIS and web applications
const bodyParser = require("body-parser"); //middleware to parse incoming JSON request bodies
const path = require("path"); //Node.js module for handling file and directory paths
const { GoogleGenerativeAI } = require("@google/generative-ai"); //library for interacting with Google Generative AI

//if the api key is not found, log an error and exit the process
if (!process.env.GEMINI_API_KEY) {
  console.error(
    "Error: GEMINI_API_KEY is not set in the environment variables."
  );
  process.exit(1);
}

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//initialize the express app
const app = express();

//middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Tina's configuration prompt
const geminiPrompt = {
  system:
    "You are Tina, an AI insurance consultant. Your goal is to help users choose the right insurance policy by asking relevant questions and considering their answers. Use the following details to guide your recommendations:",
  userContext: "", // This will hold dynamic input from the user.
  rules: [
    "Only ask further questions if the user consents.",
    "Your questions must uncover details relevant to the insurance policy, e.g., vehicle type, age, or usage, but do not directly ask which insurance product they want.",
    "Consider the following insurance products and their descriptions:",
    "- Mechanical Breakdown Insurance (MBI): Covers repair costs for mechanical failures. Not available for trucks and racing cars.",
    "- Comprehensive Car Insurance: Covers damage to the vehicle and third parties. Available only for vehicles less than 10 years old.",
    "- Third Party Car Insurance: Covers damage caused to other vehicles or property but not to the insured vehicle.",
    "Make recommendations based on the user’s answers and clearly explain your reasoning.",
    "Maintain a friendly and professional tone throughout.",
  ],
};

// Defines a POST endpoint at /insurance
app.post("/insurance", async (req, res) => {
  const { userResponse, conversationHistory: clientHistory } = req.body;

  // If no conversation history is provided, initialize an empty array
  const conversationHistory = clientHistory || [];

  // Add the user's response to the conversation history
  conversationHistory.push({
    role: "user",
    parts: [{ text: userResponse }],
  });

  // Construct the prompt dynamically based on the conversation history
  const prompt = `${geminiPrompt.system}\n\nRules:\n${geminiPrompt.rules.join(
    "\n"
  )}\n\nThe conversation history so far is as follows:\n${conversationHistory
    .map((msg) => `${msg.role}: ${msg.parts[0].text}`)
    .join("\n")}`;

  try {
    // Use the `gemini-1.5-flash` model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content using the model and based on the prompt
    const result = await model.generateContent(prompt);

    // Extract AI's response
    const aiResponse = result.response.text();

    // Add the AI's response to the conversation history
    conversationHistory.push({
      role: "model",
      parts: [{ text: aiResponse }],
    });

    // Send back the AI's response and updated conversation history
    res.json({ aiResponse, conversationHistory });
  } catch (error) {
    console.error("Error occurred during API call:", error.message);
    res.status(500).json({
      error: "An error occurred while processing your request.",
    });
  }
});

// Start the server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
