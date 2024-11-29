# 🚌 SwiftCommute

<div align="center">

![SwiftCommute Logo](./public/images/system_integration.png)

### Streamline your bus management operations with SwiftCommute

[![Next.js](https://img.shields.io/badge/Next.js-13.0+-000000?style=for-the-badge&logo=next.js&logoColor=white&labelColor=black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=black&labelColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=3178C6)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14.0+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white&labelColor=4169E1)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F7DF1E?style=for-the-badge&logo=opensourceinitiative&logoColor=black&labelColor=F7DF1E)](https://opensource.org/licenses/MIT)

</div>

## 📋 Overview

SwiftCommute is a comprehensive bus management system designed to optimize route planning, bus assignments, and passenger bookings. With an intuitive dashboard and powerful features, SwiftCommute empowers transport companies to enhance their operations and improve customer satisfaction.

## ✨ Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🗺️ **Route Management** | Create, edit, and delete bus routes |
| 🚍 **Bus Assignment** | Assign and reassign buses to routes with conflict checks |
| 👥 **Staff Management** | Track driver availability and assignments |
| 🎟️ **Booking System** | Allow users to book seats on scheduled routes |
| 📊 **Real-time Dashboard** | Monitor key performance indicators |
| 📈 **Analytics** | Calculate profitability index for route performance |

</div>

## 🛠️ Tech Stack

<div align="center">

| Category | Technologies |
|----------|-------------|
| Frontend | React, Next.js, TypeScript |
| Backend | Next.js API Routes |
| Database | PostgreSQL |
| Styling | Tailwind CSS, shadcn/ui |
| Charts | Recharts |

</div>

## 🚀 Getting Started

### Prerequisites

- Node.js (v14.0+)
- npm or yarn
- PostgreSQL (v14.0+)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/swiftcommute.git
   cd swiftcommute
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory and add the following:
   Go to [Neon Serverless Postgres](https://neon.tech), create your project, copy your connection string(pooled) and paste it in your .env
   ```
   DATABASE_URL=postgresql://neondb_owner:password@aws.neon.tech/neondb?sslmode=require
   ```

4. **Set up the database**:
   Make sure to see the SQL files uploaded and create the database, tables, functions, and triggers accordingly before running your application

6. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔮 Future Improvements

- PDF report generation for dashboard data
- Email notification system for booking reminders and updates
- Mobile application for on-the-go management
- Integration with real-time GPS tracking for buses
- Advanced analytics and machine learning for route optimization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [v0 by Vercel](https://v0.dev/)

<div align="center">

Made with ❤️ by SwiftCommute Team

</div>
