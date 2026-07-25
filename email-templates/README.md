# Email Templates Documentation

This folder contains the HTML templates for automated emails sent by CodeVerse. 

## Email Service Provider
These emails are sent dynamically from the frontend using **EmailJS** (https://www.emailjs.com/).

## Configuration Environment Variables
To connect EmailJS with your account and templates, configure the following keys in your `.env` or `.env.local` file:

```env
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_otp_template_id
VITE_EMAILJS_WELCOME_TEMPLATE_ID=your_emailjs_welcome_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

---

## Template Parameter Keys

When editing these templates inside the EmailJS dashboard, use the following variables matching our frontend integrations:

### 1. Verification OTP Email (`otp-email.html`)
* **Purpose:** Sent during sign-up to verify user's email address.
* **Template Placeholders:**
  * `{{to_name}}`: Recipient's display name.
  * `{{otp}}`: The 6-digit dynamically generated verification code.
* **Active Sender Function:** `sendOtpEmail()` inside `src/pages/AuthPage.jsx`.

### 2. Welcome Email (`welcome-email.html`)
* **Purpose:** Sent right after successful registration.
* **Template Placeholders:**
  * `{{to_name}}`: New user's display name.
* **Active Sender Function:** `sendWelcomeEmail()` inside `src/pages/AuthPage.jsx`.

---

## How to use inside EmailJS Dashboard
1. Log in to your **EmailJS Dashboard**.
2. Go to **Email Templates** and click **Create New Template**.
3. Toggle the editor to **HTML Source Code** mode (or edit the content block).
4. Copy the raw HTML contents from `otp-email.html` and `welcome-email.html` and paste them respectively.
5. Save the template and copy the **Template ID** to your `.env` configuration file.
