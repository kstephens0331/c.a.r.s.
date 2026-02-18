import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaYelp, FaGoogle } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-primary text-white text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-lg font-semibold mb-2">C.A.R.S Collision & Refinish Shop</h3>
          <p className="mb-1">2530 Old Louetta Loop #114</p>
          <p className="mb-1">Spring, TX 77388</p>
          <p className="mb-1">📞 832-885-3055</p>
          <p className="mb-1">✉️ carscollisionhouston@gmail.com</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1">
            <li><Link to="/" className="hover:text-brandRed">Home</Link></li>
            <li><Link to="/about" className="hover:text-brandRed">About</Link></li>
            <li><Link to="/collision-repair" className="hover:text-brandRed">Collision Repair</Link></li>
            <li><Link to="/contact" className="hover:text-brandRed">Contact</Link></li>
            <li><Link to="/trusted-partners" className="hover:text-brandRed">Partners</Link></li>
            <li><Link to="/financing" className="hover:text-brandRed">Financing</Link></li>
            <li><Link to="/login" className="hover:text-brandRed">Customer Login</Link></li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Business Hours</h3>
          <ul className="space-y-1">
            <li>Mon–Fri: 9:00 AM – 6:00 PM</li>
            <li>Saturday: 9:00 AM – 1:00 PM</li>
            <li>Sunday: Closed</li>
          </ul>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="flex justify-center space-x-6 py-4 text-xl">
        <a href="https://www.facebook.com/people/CARS-Collision-and-Refinish-Shop/61565873026881/" target="_blank" rel="noopener noreferrer" className="hover:text-brandRed" aria-label="Visit C.A.R.S on Facebook">
          <FaFacebook />
        </a>
        <a href="https://www.instagram.com/collisionandrefinishshop" target="_blank" rel="noopener noreferrer" className="hover:text-brandRed" aria-label="Follow C.A.R.S on Instagram">
          <FaInstagram />
        </a>
        <a href="https://www.google.com/search?sca_esv=8ff83a0cf2859f3b&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E4uMOPX7uMabRXTvbiHEpRK7rXyLpDQ7Fp3Zxfg0mxZ7Blb3s3mSWW0wHqyJPbxnDxmDHjFiTNKLi0ekh5sIdE4ecBHknW5S55PPntE8DRlhLo1izurpfaSlRyjnK4A9QPyWY9o%3D&q=C.A.R.S+Collision+and+Refinish+Shop+Reviews&sa=X&ved=2ahUKEwjMlqKX15qOAxXQ38kDHZBVMPgQ0bkNegQIJxAE&biw=1920&bih=945&dpr=1" target="_blank" rel="noopener noreferrer" className="hover:text-brandRed" aria-label="Read C.A.R.S reviews on Google">
          <FaGoogle />
        </a>
        <a href="https://www.yelp.com/biz/cars-collision-and-refinish-shop-spring" target="_blank" rel="noopener noreferrer" className="hover:text-brandRed" aria-label="Read C.A.R.S reviews on Yelp">
          <FaYelp />
        </a>
      </div>

      {/* Copyright */}
      <div className="bg-black text-center py-3 text-white">
        <p>
          &copy; {new Date().getFullYear()} C.A.R.S Collision & Refinish. All rights reserved. Built by{' '}
          <a
            href="https://stephenscode.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline text-inherit"
          >
            StephensCode LLC
          </a>.
        </p>
      </div>
    </footer>
  );
}