# coHabit

**coHabit** is a modern, mobile-first application designed to help users find the perfect roommate. Think of it as Tinder, but for matching with suitable roommates instead of romantic partners. With its swipeable card interface, chat functionality, and map-based location preferences, coHabit ensures you connect with people who align with your living preferences.

---

## Features

### User Authentication
- Built-in authentication powered by `@clerk/clerk-expo`.
- User profiles managed dynamically based on Firebase data.

### Profile Setup
- Multi-step onboarding form to collect essential user details like:
  - Name, age, gender, and languages.
  - Occupation, personal introduction, and profile picture.
- Map interface for selecting preferred regions.

### Swipe and Match
- Swipeable card interface for user profiles.
- Matching system: connect when both users like each other.

### Chat and Notifications
- Real-time chat powered by Firebase Firestore.
- Push notifications for new messages using Expo Notifications.

### Map-Based Preferences
- Interactive map for users to set their preferred location.
- Draggable markers to fine-tune choices.

---

## Screens and Components

### 1. **HomeScreen**
- Swipeable card interface using `react-native-deck-swiper`.
- Displays user profile details like profile picture, bio, and occupation.

### 2. **Details Screen**
- A multi-step form for user profile completion.
- Dynamically fetches and saves data to Firebase.

### 3. **MapScreen**
- Integrated with `react-native-maps` to let users select a preferred roommate search area.
- Saves selected coordinates to Firebase.

### 4. **ChatScreen**
- Displays user matches.
- Includes real-time messaging and unread message count badges.

### 5. **Messages Screen**
- One-on-one chat with matches.
- Displays message history and allows users to send texts.

---

## Technology Stack

### Frontend
- **React Native** for UI development.
- **Expo Go** for streamlined development and testing.

### Backend
- **Firebase Firestore** for real-time database and chat management.
- **Firebase Authentication** for user login and profile handling.

### Notifications
- **Expo Notifications** for push notifications.

---

## Installation and Setup

### Prerequisites
- Ensure you have Node.js and npm installed.
- Install Expo CLI:  
  ```bash
  npm install -g expo-cli
