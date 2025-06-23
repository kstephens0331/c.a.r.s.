import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../assets/logo.png';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navClass = ({ isActive }) =>
    isActive
      ? 'text-brandRed font-semibold'
      : 'hover:text-brandRed transition-colors duration-200';

  return (
    <header className="bg-primary text-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo / Title */}
        <Link to="/" className="flex items-center space-x-2">
  <img src={Logo} alt="C.A.R.S Logo" className="w-10 h-auto" />
  <span className="text-2xl font-bold tracking-tight">C.A.R.S Collision & Refinish</span>
</Link>


        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6 text-sm">
          <NavLink to="/" className={navClass}>Home</NavLink>
          <NavLink to="/about" className={navClass}>About</NavLink>
          <NavLink to="/collision-repair" className={navClass}>Collision Repair</NavLink>
          <NavLink to="/contact" className={navClass}>Contact</NavLink>
          <NavLink to="/login" className={navClass}>Customer Login</NavLink>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          class="md:hidden focus:outline-none" aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Nav Menu */}
      {menuOpen && (
        <nav className="md:hidden bg-primary text-white px-4 pb-4 space-y-2 text-sm">
          <NavLink to="/" onClick={() => setMenuOpen(false)} className={navClass}>Home</NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)} className={navClass}>About</NavLink>
          <NavLink to="/collision-repair" onClick={() => setMenuOpen(false)} className={navClass}>Collision Repair</NavLink>
          <NavLink to="/contact" onClick={() => setMenuOpen(false)} className={navClass}>Contact</NavLink>
          <NavLink to="/login" onClick={() => setMenuOpen(false)} className={navClass}>Customer Login</NavLink>
        </nav>
      )}
    </header>
  );
}
