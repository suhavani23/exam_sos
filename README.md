# EXAMSOS - Personalized AI Study Architect

EXAMSOS is a premium, AI-powered study planning application designed to transform complex syllabi into actionable, gamified study roadmaps. Built with Next.js, Supabase, and Google Gemini AI, it helps students master their subjects through personalized scheduling and spaced repetition.

## 🔗 Live Demo

Check out the live application: [EXAMSOS Live](https://examsos-shruti777000-3532s-projects.vercel.app/)

## 🚀 Key Features

- **AI Roadmap Generation**: Instantly converts syllabus text or files into structured modules and topics using Google Gemini-1.5-Flash.
- **Personalized Scheduling**: Tailors study plans based on your exam date and available daily hours.
- **Smart Revision**: Automates spaced repetition (1-day, 7-day, and final reviews) to maximize long-term retention.
- **Gamified Dashboard**: Track your study streaks, hours completed, and mastered topics with a premium UI.
- **Cross-Device Sync**: Powered by Supabase for real-time data persistence and secure authentication.
- **Responsive Design**: Stunning, dark-mode focused aesthetics that work perfectly on desktop and mobile.

## 🛠 Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)
- **AI Engine**: [Google Gemini AI](https://ai.google.dev/) via [Vercel AI SDK](https://sdk.vercel.ai/)
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **State Management**: Custom React Context and Async Store hooks

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Supabase Project
- A Google AI Studio API Key (Gemini)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/suhavani23/exam_sos.git
   cd exam_sos
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your keys:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable UI components (Dashboard, Auth, Layout).
- `lib/`: Core logic including Supabase client, Auth context, and AI roadmap generator.
- `public/`: Static assets and icons.

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for students everywhere.