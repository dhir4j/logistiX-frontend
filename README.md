# Logistix: A Modern Courier & Logistics Platform

Logistix is a full-featured, modern web application designed to streamline courier and logistics operations. It provides a seamless experience for both customers and administrators, from booking and tracking shipments to managing all operations from a central dashboard.

Built with a robust, modern tech stack, this application serves as a powerful foundation for any logistics business.

## ✨ Core Features

### Customer-Facing Features
-   **User Authentication**: Secure sign-up and login functionality for customers.
-   **Dashboard**: A personalized hub for users to get an overview of their activities.
-   **Book Shipment**: An intuitive, multi-step form to book both domestic and international shipments, with dynamic pricing.
-   **Real-Time Tracking**: A dedicated page for users to track their shipments using a unique ID.
-   **Shipment History**: A comprehensive table view of all past and current shipments with filtering capabilities.
-   **Invoice Management**: Users can view and print detailed invoices for their shipments.
-   **Responsive Design**: A seamless experience across desktop and mobile devices.

### Administrative Features
-   **Admin Dashboard**: A powerful control center displaying key analytics like total orders, revenue, and user counts.
-   **Order Management**: A complete table of all user shipments, with capabilities to search, filter, and update shipment statuses.
-   **Admin-Specific Login**: A separate, secure login portal for administrators.

### Informational Pages
-   About Us
-   Contact Us
-   Privacy Policy
-   Terms of Service
-   Shipping & Delivery Policy
-   Refund & Cancellation Policy

## 🛠 Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Form Management**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation
-   **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) (for potential generative AI features)

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 20.x or higher recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

## 🏃 Running the Application

### Development Mode

To run the application in development mode with hot-reloading:

```bash
npm run dev
```

The application will be available at `http://localhost:9002` (or another port if specified).

### Production Build

To build the application for production:

```bash
npm run build
```

To run the production build locally:

```bash
npm run start
```

## 📁 Project Structure

The project follows a standard Next.js App Router structure:

```
.
├── src/
│   ├── app/                    # Main application routes (App Router)
│   │   ├── (static)/           # Routes for static pages (About, Privacy, etc.)
│   │   ├── admin/              # Admin-specific routes
│   │   ├── dashboard/          # User dashboard routes
│   │   ├── api/                # (Optional) API routes handled by Next.js
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main landing page
│   ├── components/             # Reusable React components
│   │   ├── auth/               # Authentication-related components (Login/Signup forms)
│   │   ├── shared/             # Components shared across different sections
│   │   └── ui/                 # Core UI components from ShadCN
│   ├── contexts/               # React Context providers (Auth, Shipments, etc.)
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions, constants, and type definitions
│   └── public/                 # Static assets (images, favicon, etc.)
├── tailwind.config.ts        # Tailwind CSS configuration
└── next.config.ts            # Next.js configuration
```

## 🔐 Authentication

-   **User Login**: Regular users can sign up and log in via the `/login` and `/signup` pages.
-   **Admin Login**: Administrators must use the `/admin/login` portal. Access to `/admin/dashboard` is protected and requires admin privileges.
