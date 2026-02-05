import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-dark-lighter/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Rapper Toon Sheet</span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/create" className="hover:text-primary transition-colors">
              Create
            </Link>
            <Link to="/history" className="hover:text-primary transition-colors">
              History
            </Link>
            <Link to="/create" className="btn-primary">
              Get Started
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
