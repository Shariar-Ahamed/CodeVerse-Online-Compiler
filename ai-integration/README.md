# AI Chat Assistant Integration Documentation

This folder documents the AI integration and chatbot functionalities configured in CodeVerse.

## AI Service Provider
CodeVerse uses **Groq Cloud Console** (https://console.groq.com/) to handle high-speed AI inference for our developer chatbot panel.

## Configuration Environment Variable
To connect to the Groq API, you must configure the following key in your `.env` or `.env.local` file:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

---

## How to Get Your API Key from Groq
1. Go to the **Groq Console**: [https://console.groq.com/](https://console.groq.com/).
2. Create an account or sign in with your GitHub/Google account.
3. In the left-hand navigation sidebar, click on **API Keys**.
4. Click the **Create API Key** button.
5. Provide a name (e.g., `CodeVerse-AI`), click create, and copy the generated key (`gsk_...`).
6. Paste the copied key into your `.env` file as the value for `VITE_GROQ_API_KEY`.

---

## Technical Details & Integration

### 1. Active Frontend Component
* **Component Path:** `src/components/AIPanel.jsx`
* **Trigger Mechanism:** When a user types a message or requests code assistance, the component fetches Groq's OpenAI-compatible completions endpoint:
  * **Endpoint:** `https://api.groq.com/openai/v1/chat/completions`
  * **Authorization Header:** `Bearer VITE_GROQ_API_KEY`

### 2. Active AI Model
* **Model ID:** `llama-3.3-70b-versatile` (Llama 3.3 70B model optimized by Groq for high-speed chat interactions).
* **System Prompt:** Configured in `AIPanel.jsx` to guide the AI assistant's persona as an expert programming assistant that formats code answers in clean, copyable markdown blocks.
