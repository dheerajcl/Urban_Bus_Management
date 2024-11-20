# SwiftCommute

<p align="center">
  <strong>Streamline your bus management operations with SwiftCommute</strong>
</p>

<p align="center">
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-13.0%2B-black?style=flat-square&logo=next.js" alt="Next.js">
  </a>
  <a href="https://reactjs.org/">
    <img src="https://img.shields.io/badge/React-18.0%2B-61DAFB?style=flat-square&logo=react" alt="React">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-4.5%2B-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  </a>
  <a href="https://www.postgresql.org/">
    <img src="https://img.shields.io/badge/PostgreSQL-14.0%2B-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT">
  </a>
</p>

## Overview

SwiftCommute is a comprehensive bus management system designed to optimize route planning, bus assignments, and passenger bookings. With an intuitive dashboard and powerful features, SwiftCommute empowers transport companies to enhance their operations and improve customer satisfaction.

## Features

- **Route Management**: Create, edit, and delete bus routes
- **Bus Assignment**: Assign and reassign buses to routes with conflict checks
- **Staff Management**: Track driver availability and assignments
- **Booking System**: Allow users to book seats on scheduled routes
- **Real-time Dashboard**: Monitor key performance indicators
- **Analytics**: Calculate profitability index for route performance

## Tech Stack

- **Frontend**: React, Next.js, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS, shadcn/ui
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js (v14.0+)
- npm or yarn
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
   # or
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:
   Go to [Neon Serverless Postgres](https://neon.tech), create your project, copy your connection string(pooled) and paste it in your .env
   ```
   DATABASE_URL=postgresql://neondb_owner:password@aws.neon.tech/neondb?sslmode=require
   ```

5. Set up the database:
   ```bash
   npm run migrate
   # or
   yarn migrate
   ```

6. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.



## Future Improvements

- PDF report generation for dashboard data
- Email notification system for booking reminders and updates
- Mobile application for on-the-go management
- Integration with real-time GPS tracking for buses
- Advanced analytics and machine learning for route optimization

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [v0 by Vercel](https://v0.dev/)
- [Recharts](https://recharts.org/)

---
