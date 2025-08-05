import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIconColorful,
  BookOpenIconColorful,
  UsersIconColorful,
  CogIconColorful,
} from './icons/Icons';

const NavItem: React.FC<{ to: string; label: string; icon: React.ReactNode; }> = ({ to, label, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <NavLink 
      to={to} 
      className={`flex flex-col items-center justify-center w-1/4 h-full transition-colors duration-200 focus:outline-none ${isActive ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'}`}
    >
      <div className={`transition-transform duration-300 transform ${isActive ? 'scale-110' : 'scale-100'}`}>
        {icon}
      </div>
      <span className={`text-xs mt-1 font-bold`}>
        {label}
      </span>
    </NavLink>
  );
};


const BottomNav: React.FC = () => {
  return (
    <nav className="w-full max-w-md bg-white/90 backdrop-blur-lg sticky bottom-0 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.06)] border-t border-gray-200/50">
      <div className="flex justify-around items-center h-20 px-2">
        <NavItem to="/" label="Home" icon={<HomeIconColorful />} />
        <NavItem to="/history" label="My Stories" icon={<BookOpenIconColorful />} />
        <NavItem to="/characters" label="Characters" icon={<UsersIconColorful />} />
        <NavItem to="/settings" label="Settings" icon={<CogIconColorful />} />
      </div>
    </nav>
  );
};

export default BottomNav;