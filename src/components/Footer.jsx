import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary text-white text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Collision & Refinish Shop</h3>
          <p className="mb-1">2530 Old Louetta Loop #114</p>
          <p className="mb-1">Spring, TX 77388</p>
          <p className="mb-1">📞 832-885-3055</p>
          <p className="mb-1">✉️ collisionandrefinishshop@gmail.com</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1">
            <li><Link to="/" className="hover:text-brandRed">Home</Link></li>
            <li><Link to="/about" className="hover:text-brandRed">About</Link></li>
            <li><Link to="/collision-repair" className="hover:text-brandRed">Collision Repair</Link></li>
            <li><Link to="/contact" className="hover:text-brandRed">Contact</Link></li>
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

      <div className="bg-black text-center py-3">
        <p>&copy; {new Date().getFullYear()} Collision & Refinish Shop. All rights reserved.</p>
      </div>
    </footer>
  );
}
