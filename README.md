# VoidNote-Backend

VoidNote is a multi-purpose note-taking application that allows users to create and manage various types of notes and analyze them. This repository contains the backend of the application, built with Node.js and Express, using MongoDB as the database.

## Features

- **API Endpoints:** Provides API endpoints to manage different types of notes (normal notes, tree notes, calendar notes, to-do lists) and variables.
- **Authentication:** Supports Google OAuth and email/password authentication.
- **Database Integration:** Uses MongoDB to store notes and user data.
- **Graph Generation:** Generates graphs based on user-defined variables and note data.

## Getting Started

Follow these instructions to set up and run the backend server locally.

### Prerequisites

- Node.js (version 14 or above)
- npm (version 6 or above) or yarn
- MongoDB (local instance or cloud-based)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/HasancanCakicioglu/VoidNote-Backend.git
    cd VoidNote-Backend
    ```

2. Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

### Configuration

1. Create a `.env` file in the root directory and add the following environment variables:

    ```env
    MONGO_URI=your_mongodb_uri
    PORT=port number
    JWT_SECRET=your_jwt_secret
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    EMAIL_USER=your_email_user
    EMAIL_PASS=your_email_password
    ```

### Running the Server

Start the development server:

```bash
npm run dev
# or
yarn dev
