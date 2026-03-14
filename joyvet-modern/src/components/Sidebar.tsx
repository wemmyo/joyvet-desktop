import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  Package,
  FileText,
  CreditCard,
  ShoppingCart,
  Truck,
  Receipt,
  DollarSign,
  Settings,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Products", href: "/products", icon: Package },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Purchases", href: "/purchases", icon: ShoppingCart },
  { name: "Suppliers", href: "/suppliers", icon: Truck },
  { name: "Receipts", href: "/receipts", icon: Receipt },
  { name: "Expenses", href: "/expenses", icon: DollarSign },
  { name: "Sales Report", href: "/sales", icon: BarChart3 },
  { name: "All Purchases", href: "/all-purchases", icon: ShoppingCart },
  { name: "Users", href: "/users", icon: Users },
  { name: "Store Info", href: "/store-info", icon: Settings },
];

const Sidebar: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">JoyVet</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      )
                    }
                  >
                    <Icon
                      aria-hidden
                      className={({ isActive }) =>
                        cn(
                          "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                          isActive
                            ? "text-blue-700"
                            : "text-gray-400 group-hover:text-gray-500",
                        )
                      }
                    />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
