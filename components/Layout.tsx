import React, { ReactNode } from 'react';
import { LayoutDashboard, Upload, Users, Award, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Input / Upload Data', icon: Upload },
    { id: 'schools', label: 'Daftar Sekolah', icon: Users },
    { id: 'ranking', label: 'Ranking & Level', icon: Award },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#D0E6FD] bg-opacity-30 text-[#162660] font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#162660] text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-bold text-lg">Performa Sekolah</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#162660] text-white transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-[#2a3c7a]">
          <h1 className="text-2xl font-bold tracking-tight text-[#F1E4D1]">SIMONEV</h1>
          <p className="text-blue-200 text-xs mt-1">Performa Sekolah</p>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                activeTab === item.id 
                  ? 'bg-[#F1E4D1] text-[#162660] shadow-md font-bold' 
                  : 'text-blue-100 hover:bg-[#2a3c7a]'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 bg-[#0f1b45]">
          <p className="text-xs text-blue-300 text-center">© 2024 Ditjen Bimas Kristen</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;