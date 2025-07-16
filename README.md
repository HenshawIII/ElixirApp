# Social App - Project Documentation

## Overview
This is a minimalistic social app built with Next.js and TypeScript where users can create profiles, create communities, and join communities created by other users. The creator of a community is automatically assigned as the admin.

## Features

### User Management
- User registration and login
- Profile viewing and editing
- Secure authentication flow

### Community Features
- Browse available communities
- Create new communities (creator becomes admin)
- Join and leave communities
- View community details
- Admin controls for community management

## Technical Implementation

### Tech Stack
- Next.js 14+ with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Client-side state management with React Context

### Project Structure
- `/src/app` - Main application code
- `/src/app/components` - Reusable UI components
- `/src/app/context` - Authentication and community state management
- `/src/app/types` - TypeScript interfaces
- `/src/app/auth` - Authentication pages (login/signup)
- `/src/app/profile` - User profile pages
- `/src/app/communities` - Community-related pages

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
1. Clone the repository
2. Install dependencies:
   ```
   cd social-app
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Guide

### Creating an Account
1. Click "Login" in the navigation bar
2. Click "Sign up" to create a new account
3. Fill in the required information and submit

### Creating a Community
1. Navigate to the Communities page
2. Click "Create Community"
3. Fill in the community name and description
4. Submit to create the community and become its admin

### Joining Communities
1. Browse the communities on the Communities page
2. Click "Join" on any community you want to join
3. View your joined communities on your profile page

## Future Enhancements
- Add post creation within communities
- Implement comment functionality
- Add direct messaging between users
- Enhance admin controls for community management
- Add image upload for profiles and communities
