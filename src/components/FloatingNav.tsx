import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Disc3, Home, Upload, User } from "lucide-react";

const FloatingNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/albums", icon: Disc3, label: "Albums" },
    { path: "/admin", icon: Upload, label: "Admin" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="floating-nav px-2 py-2 flex items-center gap-1">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 mr-2"
        >
          <div className="w-8 h-8 rounded-full bg-neon-gradient flex items-center justify-center">
            <span className="text-xs font-black text-white">OOR</span>
          </div>
          <span className="font-bold text-foreground hidden sm:block">
            Archive
          </span>
        </Link>

        {/* Separator */}
        <div className="w-px h-6 bg-border/50" />

        {/* Nav Items */}
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative"
            >
              <motion.div
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-300 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:block">
                  {item.label}
                </span>
              </motion.div>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-full bg-primary/10 border border-primary/20"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default FloatingNav;
