import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-navy-950">
      <Sidebar />
      <div className="ml-[240px] transition-all duration-300">
        <Navbar />
        <main className="p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
