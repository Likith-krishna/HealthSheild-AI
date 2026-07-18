# HealthShield AI 🛡️

A comprehensive, proactive health management platform built with modern web technologies. HealthShield AI offers a secure, multilingual environment for users to register, authenticate, and manage their health profiles intelligently.

## ✨ Features

- **Robust Authentication**: Custom secure authentication system featuring JWT Access and Refresh Tokens, complete with login audit trails and history tracking.
- **Email OTP Verification**: Integrated SMTP functionality using Nodemailer for seamless, secure email verification during onboarding.
- **Multilingual Support**: Built-in support for multiple languages including English, Hindi, Tamil, Malayalam, and Kannada using `i18next`.
- **Intelligent Insights**: Powered by Google GenAI to analyze health data and provide proactive recommendations.
- **Modern UI/UX**: Designed with React 19, TailwindCSS, and Lucide Icons for a beautiful, responsive, and dynamic user interface.
- **Real-time Map Integration**: Integration with Google Maps Platform (`@vis.gl/react-google-maps`) for location-based health services.

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database / Auth**: Firebase Admin, Custom JSON-based DB Layer
- **AI & ML**: Google GenAI API
- **Tooling**: TypeScript, ESLint

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/healthshield-ai.git
   cd healthshield-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add your credentials:
   ```env
   GEMINI_API_KEY="your_google_genai_key"
   SMTP_EMAIL="your_email@gmail.com"
   SMTP_PASSWORD="your_app_password"
   GOOGLE_MAPS_PLATFORM_KEY="your_google_maps_key"
   ```

4. Run the Development Server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## 🔒 Security

HealthShield AI takes user security seriously. All passwords are encrypted using `bcryptjs`. The platform features brute-force mitigation, tracking of failed login attempts, and timed OTP expirations.

## 📄 License

This project is licensed under the MIT License.
 