# HopperHelps

## Inspiration
Being a student, it's easy to get caught up in your work. Deadlines and expectations can eat up a lot of your focus, but it's important to remember that your journey is far more than a checklist of assignments. Taking the time to pause and reflect is an invaluable opportunity to reconnect with your feelings and rediscover your passions.

## What it does
HopperHelps is a daily journaling app with a cute and supportive AI companion, Hopper!
Hopper makes journaling feel like less of a chore and more like a chat with a supportive friend.
Users log their daily journal entries, and Hopper offers feedback and encouragement. Sentiment analysis is used to detect and log the user's mood for that day, so it also serves as a way to see patterns in your day-to-day mood at a glance.

## How we built it
We used Firebase for authentication and data storage, Firebase Auth to manage user sessions, and Firestore to store journal entries and mood data associated with users. Next.js provided a framework for building the UI and API routes for fetching and updating user data. We used Zustand to manage global state, ensuring smooth updates across the calendar and journal. Together, these technologies created a responsive real-time journaling experience.

## Challenges we ran into
Delegating tasks was difficult for us to do at the beginning of development. We have worked as solo devs for most of our time learning CS, so figuring out build a project from multiple angles at once and meet in the middle had a bit of a learning curve for us.

## Accomplishments that we're proud of
We're proud of the 

## What we learned
Developing as part of a group is something we have not done much of before.
We have all been long familiar with GitHub, but dealing with merge conflicts and push/pull requests is something we had little experience with before working on this project. Developing HopperHelps together has been an invaluable learning experience for us.
We have also become far more comfortable using the OpenAI models and Vercel SDKs.

## What's next for HopperHelps
The next step for HopperHelps would be to expand upon the Hopper AI companion, allowing it to give feedback on long term patterns over the course of many days; remembering things about the user and learning how to better interpret their journal entries.
The UI element for Hopper could be expanded to be more engaging, with a wider range of emotions it can visually display and animations as they change.


## Setup Instructions
1. Clone the repository:
```bash
git clone https://github.com/Algoltea/hopperhacksx.git
cd hopperhelps
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```bash
# OpenAI API Key (Required for Hopper AI)
OPENAI_API_KEY=your_openai_api_key

# Firebase Configuration (Required for authentication and database)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Getting API Keys

1. **OpenAI API Key**:
   - Visit [OpenAI's platform](https://platform.openai.com/)
   - Sign up or log in
   - Navigate to API keys section
   - Create a new secret key

2. **Firebase Configuration**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing
   - Navigate to Project Settings
   - Under "Your apps", select Web app (<//>)
   - Register app and copy configuration values

Note: Never commit your `.env.local` file or expose your API keys publicly.
