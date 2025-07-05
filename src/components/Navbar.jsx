import { Link, NavLink } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Logo from '../assets/logo.png';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navClass = ({ isActive }) =>
    isActive ? 'text-brandRed font-semibold' : 'hover:text-brandRed transition-colors duration-200';

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-primary text-white shadow z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center relative">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src={Logo} alt="C.A.R.S Logo" className="w-10 h-auto" />
          <span className="text-2xl font-bold tracking-tight">C.A.R.S Collision & Refinish</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6 text-sm items-center">
          <NavLink to="/" className={navClass}>Home</NavLink>
          <NavLink to="/about" className={navClass}>About</NavLink>

          {/* Services Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="hover:text-brandRed transition-colors duration-200"
            >
              Services ▾
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white text-black shadow-lg rounded-md z-50">
                <NavLink to="/services" className="block px-4 py-2 hover:bg-gray-100">All Services</NavLink>
                <NavLink to="/services/collision-repair" className="block px-4 py-2 hover:bg-gray-100">Collision Repair</NavLink>
                <NavLink to="/services/paint-refinish" className="block px-4 py-2 hover:bg-gray-100">Paint & Refinish</NavLink>
                <NavLink to="/services/custom-paint" className="block px-4 py-2 hover:bg-gray-100">Custom Paint</NavLink>
                <NavLink to="/services/paintless-dent-repair" className="block px-4 py-2 hover:bg-gray-100">Paintless Dent Repair</NavLink>
                <NavLink to="/services/bedliners-accessories" className="block px-4 py-2 hover:bg-gray-100">Spray-In Bedliners</NavLink>
                <NavLink to="/services/light-mechanical" className="block px-4 py-2 hover:bg-gray-100">Light Mechanical</NavLink>
              </div>
            )}
          </div>

          <NavLink to="/contact" className={navClass}>Contact</NavLink>
          <NavLink to="/login" className={navClass}>Customer Login</NavLink>
          <NavLink to="/repair-gallery" className={navClass}>Repair Gallery</NavLink>
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none"
          aria-label="Toggle Menu"
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

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="md:hidden bg-primary text-white px-4 pb-4 space-y-2 text-sm">
          <NavLink to="/" onClick={() => setMenuOpen(false)} className={navClass}>Home</NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)} className={navClass}>About</NavLink>
          <NavLink to="/services" onClick={() => setMenuOpen(false)} className={navClass}>All Services</NavLink>
          <NavLink to="/services/collision-repair" onClick={() => setMenuOpen(false)} className={navClass}>Collision Repair</NavLink>
          <NavLink to="/services/paint-refinish" onClick={() => setMenuOpen(false)} className={navClass}>Paint & Refinish</NavLink>
          <NavLink to="/services/custom-paint" onClick={() => setMenuOpen(false)} className={navClass}>Custom Paint</NavLink>
          <NavLink to="/services/paintless-dent-repair" onClick={() => setMenuOpen(false)} className={navClass}>Paintless Dent Repair</NavLink>
          <NavLink to="/services/bedliners-accessories" onClick={() => setMenuOpen(false)} className={navClass}>Spray-In Bedliners</NavLink>
          <NavLink to="/services/light-mechanical" onClick={() => setMenuOpen(false)} className={navClass}>Light Mechanical</NavLink>
          <NavLink to="/contact" onClick={() => setMenuOpen(false)} className={navClass}>Contact</NavLink>
          <NavLink to="/login" onClick={() => setMenuOpen(false)} className={navClass}>Customer Login</NavLink>
          <NavLink to="/repair-gallery" onClick={() => setMenuOpen(false)} className={navClass}>Repair Gallery</NavLink>
        </nav>
      )}
    </header>
  );
}
