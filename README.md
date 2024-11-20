# 🚌 SwiftCommute

[![Next.js](https://img.shields.io/badge/Next.js-13.0%2B-blue?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.0%2B-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.5%2B-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14.0%2B-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

SwiftCommute is a comprehensive bus management system designed to streamline route planning, bus assignments, and passenger bookings. With real-time analytics and an intuitive dashboard, SwiftCommute empowers transport companies to optimize their operations and enhance customer satisfaction.

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

## 🚀 Features

- 🗺️ Route Management: Create, edit, and delete bus routes
- 🚌 Bus Assignment: Assign and reassign buses to routes with conflict checks
- 👥 Staff Management: Track driver availability and assignments
- 🎟️ Booking System: Allow users to book seats on scheduled routes
- 📊 Real-time Dashboard: Monitor revenue, fuel usage, route performance, and maintenance alerts
- 📈 Analytics: Calculate profitability index for route performance analysis
- 📄 PDF Reports: Generate comprehensive reports from the dashboard
- 📧 Email Reminders: Automated notifications for upcoming bookings

## 💻 Tech Stack

- **Frontend**: React, Next.js, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS, shadcn/ui
- **Charts**: Recharts

## 🏁 Getting Started

### Prerequisites

- Node.js (v14.0+)
- npm or yarn or pnpm
- PostgreSQL (v14.0+)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/swiftcommute.git
   cd swiftcommute
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## ⚙️ Configuration

1. Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/swiftcommute
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_username
   SMTP_PASSWORD=your_smtp_password
   ```

2. Update the values with your specific configuration.

## 🗄️ Database Setup

1. Create a new PostgreSQL database:
   ```sql
   CREATE DATABASE swiftcommute;
   ```

2. Run the database migrations:
   ```bash
   npm run migrate
   # or
   yarn migrate
   ```

3. (Optional) Seed the database with sample data:
   ```bash
   npm run seed
   # or
   yarn seed
   ```

## 🚀 Running the Application

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 API Documentation

API endpoints are documented using Swagger. After starting the development server, visit [http://localhost:3000/api-docs](http://localhost:3000/api-docs) to view the API documentation.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
- [jsPDF](https://github.com/MrRio/jsPDF)
- [html2canvas](https://html2canvas.hertzen.com/)
- [NodeMailer](https://nodemailer.com/)

---

Made with ❤️ by [Dheeraj](https://github.com/dheerajcl)