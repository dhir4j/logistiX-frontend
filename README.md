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

---

## ## Prompt to Recreate This Project

Below is a detailed prompt you can use with a generative AI to create a functional clone of this application with generic branding.

### **AI Prompt Begins**

"Hello! I want to build a full-featured, modern web application for a courier and logistics platform. Let's call the project 'Logistix'.

**1. Core Technology Stack:**
*   **Framework**: Next.js with the App Router.
*   **Language**: TypeScript.
*   **Styling**: Tailwind CSS for styling and utility classes.
*   **UI Components**: Use ShadCN UI as the primary component library. Use `lucide-react` for icons.
*   **Forms**: Use React Hook Form with Zod for robust validation.
*   **AI**: Set up Genkit for potential future AI integrations, but no specific AI features are needed initially.

**2. General Requirements:**
*   Create a clean, professional, and modern UI. Do not copy any specific brand's color scheme or layout.
*   Use a generic name like "Logistix" throughout the application.
*   All specific details like company addresses, contact emails, and phone numbers should be placeholders (e.g., `contact@logistix.com`, `123 Logistics Lane`, etc.).
*   The application must be fully responsive and work seamlessly on desktop and mobile devices.
*   Use placeholder images (`https://placehold.co/`) where needed.

**3. Feature Implementation:**

Please implement the following features:

**A. Public-Facing Pages (No Login Required):**
*   **Landing Page**: A professional marketing page that describes the service, shows key features, and has clear calls-to-action to "Sign Up" or "Login".
*   **Static Pages**: Create the following informational pages with placeholder text: About Us, Privacy Policy, Terms of Service, Shipping & Delivery Policy, and Refund & Cancellation Policy.
*   **Header & Footer**: A shared header for these pages with navigation to Login/Signup, and a shared footer with links to all the static pages.

**B. Authentication:**
*   **User Signup Page**: A form to register new users (First Name, Last Name, Email, Password).
*   **User Login Page**: A form for registered users to sign in.
*   **Admin Login Page**: A separate, secure login page at `/admin/login` for administrators.

**C. User Dashboard (Login Required):**
*   **Layout**: A dashboard layout with a collapsible sidebar for navigation and a header with a user profile menu (for logout).
*   **Main Dashboard Page**: A welcome page showing quick-access cards to major features.
*   **Book Shipment Page**: A multi-step form to book a new shipment. It should handle both "Domestic" and "International" types. The form should collect sender and receiver details (name, address, phone), and package details (weight, dimensions).
*   **Track Shipment Page**: A page with an input field where a user can enter a tracking ID to see the shipment's status and history.
*   **My Shipments Page**: A table view listing all of the user's past and current shipments, with options to search and filter.
*   **My Invoices Page**: A table listing all invoices for the user's shipments, with a link to view each invoice.
*   **Invoice View**: A page that displays a printable invoice for a specific shipment, including company details, sender/receiver info, and a breakdown of charges.
*   **Contact Page**: A page within the dashboard showing contact information and a simple contact form.

**D. Admin Dashboard (Admin Login Required):**
*   **Layout**: A separate layout for the admin section.
*   **Main Admin Dashboard Page**: Display key analytics in cards (e.g., Total Orders, Total Revenue, Total Users).
*   **Order Management Page**: A comprehensive table listing *all* user shipments. The admin must be able to search, filter by status, and, most importantly, update the status of any shipment (e.g., from "Booked" to "In Transit").

Build the application incrementally, starting with the core layouts and authentication, then moving to the dashboard features. Ensure the code is clean, well-organized, and follows modern React and Next.js best practices."

### **AI Prompt Ends**
