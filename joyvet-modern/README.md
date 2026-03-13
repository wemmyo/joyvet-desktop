# JoyVet Modern - Veterinary Sales Management System

A modern, production-grade veterinary sales management system built with the latest technologies.

## 🚀 Features

- **Customer Management** - Store customer info, balances, price levels
- **Product Management** - Inventory tracking, pricing, stock levels
- **Sales/Invoicing** - Create invoices, track sales, calculate profits
- **Purchase Management** - Track supplier purchases
- **Payment Tracking** - Customer payments and supplier payments
- **Receipt Management** - Sales receipts
- **Expense Tracking** - Business expenses
- **User Management** - User accounts and authentication
- **Store Information** - Business details
- **Offline Database** - SQLite database for offline use

## 🛠️ Technology Stack

- **Electron** v28.0.0 - Cross-platform desktop application framework
- **React** v18.2.0 - Modern UI library
- **TypeScript** v5.3.3 - Type-safe JavaScript
- **Tailwind CSS** v3.3.6 - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Redux Toolkit** - State management
- **React Router** v6.20.1 - Client-side routing
- **Sequelize** v6.35.2 - Database ORM
- **SQLite** - Offline database
- **Vite** v5.0.8 - Fast build tool
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## 📁 Project Structure

```
joyvet-modern/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Layout.tsx      # Main layout component
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   └── Header.tsx      # Top header
│   ├── pages/              # Application pages
│   │   ├── Login.tsx       # Authentication page
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── Customers.tsx   # Customer management
│   │   ├── Products.tsx    # Product management
│   │   └── ...             # Other pages
│   ├── store/              # Redux store and slices
│   ├── types/              # TypeScript type definitions
│   ├── lib/                # Utility functions
│   └── main.tsx            # React entry point
├── src/main/               # Electron main process
│   ├── main.ts             # Main process entry point
│   ├── preload.ts          # Preload script
│   ├── database.ts         # Database configuration
│   └── models/             # Database models
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── vite.config.ts          # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd joyvet-modern
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Development mode**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Package the application**
   ```bash
   npm run package
   ```

## 📱 Available Scripts

- `npm run dev` - Start development mode (both main and renderer)
- `npm run build` - Build for production
- `npm run package` - Package the application for distribution
- `npm run package:mac` - Package for macOS
- `npm run package:win` - Package for Windows
- `npm run package:linux` - Package for Linux
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔐 Authentication

The system uses a simple authentication system for development:
- **Username**: `admin`
- **Password**: `admin`

In production, this should be replaced with proper authentication against the database.

## 🗄️ Database

The application uses SQLite as the offline database, stored in the user's application data directory. The database is automatically created and managed by Sequelize ORM.

### Database Models

- **Customer** - Customer information and balances
- **Product** - Product inventory and pricing
- **Invoice** - Sales invoices
- **InvoiceItem** - Individual items in invoices
- **Payment** - Customer and supplier payments
- **Purchase** - Supplier purchases
- **PurchaseItem** - Individual items in purchases
- **Supplier** - Supplier information
- **Receipt** - Sales receipts
- **Expense** - Business expenses
- **ExpenseType** - Expense categories
- **User** - System users
- **StoreInfo** - Business information

## 🎨 UI Components

The application uses shadcn/ui components built on top of Radix UI primitives:

- **Button** - Various button styles and sizes
- **Input** - Form input fields
- **Card** - Content containers
- **Table** - Data tables
- **Dialog** - Modal dialogs
- **Dropdown Menu** - Context menus
- **Alert** - Status messages
- **Avatar** - User avatars

## 🔧 Configuration

### Tailwind CSS
Custom CSS variables are defined for consistent theming across light and dark modes.

### Electron
- Context isolation enabled for security
- Preload script for safe IPC communication
- Automatic database initialization

## 📦 Distribution

The application can be packaged for different platforms:

- **macOS**: DMG installer
- **Windows**: NSIS installer and MSI package
- **Linux**: AppImage, DEB, and RPM packages

## 🔒 Security Features

- Context isolation enabled
- Preload script for safe IPC
- No direct Node.js access from renderer
- Secure database operations

## 🚧 Development Status

- ✅ Core application structure
- ✅ Authentication system
- ✅ Customer management (CRUD)
- ✅ Product management (CRUD)
- ✅ Dashboard with statistics
- ✅ Modern UI components
- ✅ Database models and relationships
- 🚧 Invoice management
- 🚧 Payment tracking
- 🚧 Purchase management
- 🚧 Reporting and analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

**Note**: This is a modern rebuild of the original JoyVet application, maintaining all functionality while using the latest technologies and best practices.
