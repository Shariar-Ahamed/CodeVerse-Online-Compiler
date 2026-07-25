# Code Execution / Compiler API Documentation

This folder documents the compiler architecture and code execution subsystem integrated in CodeVerse.

## Default Compiler Engine
CodeVerse uses **Judge0** (https://judge0.com/), a robust, open-source online code execution system, to compile and run code in multiple programming languages.

* **Default Free API Endpoint:** `https://ce.judge0.com` (Judge0 Community Edition).
* No `.env` keys are required for the default compiler configuration; it works out-of-the-box.

---

## Custom / Private Compiler Settings
Developers or administrators can override the default free compiler engine in the frontend settings to use a paid/private instance of Judge0 (e.g., hosted on RapidAPI or private servers).

These settings are configured via the UI (Editor Settings Modal) and are stored in the browser's **Local Storage**:

1. **`codeverse_api_url`**: Stores the custom Judge0 API endpoint URL.
2. **`codeverse_api_key`**: Stores the authentication API key (e.g., `X-RapidAPI-Key` if using RapidAPI).

---

## Code Execution Lifecycle (How it works under the hood)

When a user clicks the **Run Code** button:

1. **Encoding:** The source code written in the editor is encoded into **Base64** format (UTF-8 safe) using helper functions to prevent special character parsing issues during network transmission.
2. **Submission:** A `POST` request is sent to the compiler endpoint:
   * **Endpoint:** `${apiEndpoint}/submissions?base64_encoded=true&wait=false`
   * The server compiles the code in a isolated sandbox and returns a unique **submission token**.
3. **Polling:** The frontend polls the server with a `GET` request every few hundred milliseconds to check compilation status:
   * **Endpoint:** `${apiEndpoint}/submissions/${token}?base64_encoded=true`
4. **Output Decoding:** Once compilation is complete, the API returns the result (stdout, stderr, execution time, and memory usage) in Base64. The frontend decodes this output and prints it on the console panel.

---

## Code References

* **Compiler settings state initialization:** `src/pages/EditorPage.jsx` (L306) and `src/pages/ChallengeWorkspacePage.jsx` (L46).
* **Base64 Encoding/Decoding helpers:** `src/pages/EditorPage.jsx` (L1590).
* **Code compilation trigger (`runCode`):** `src/pages/EditorPage.jsx` (L1626) and `src/pages/ChallengeWorkspacePage.jsx` (L180).
* **Supported Languages Metadata List:** `src/utils/languages.js`.
