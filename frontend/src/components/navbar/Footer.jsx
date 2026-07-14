const Footer = () => (
  <footer id="contact" className="bg-ink-900 text-slate-300">
    <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
      <div>
        <p className="text-lg font-bold text-white">💊 PharmaCare</p>
        <p className="mt-3 text-sm text-slate-400">
          Connecting pharmacies and patients with real-time inventory, ordering, and delivery tracking.
        </p>
      </div>

      <div>
        <p className="mb-3 font-semibold text-white">Product</p>
        <ul className="space-y-2 text-sm text-slate-400">
          <li>Features</li>
          <li>How it Works</li>
          <li>Pricing</li>
        </ul>
      </div>

      <div>
        <p className="mb-3 font-semibold text-white">Company</p>
        <ul className="space-y-2 text-sm text-slate-400">
          <li>About Us</li>
          <li>Careers</li>
          <li>Privacy Policy</li>
        </ul>
      </div>

      <div>
        <p className="mb-3 font-semibold text-white">Contact</p>
        <ul className="space-y-2 text-sm text-slate-400">
          <li>support@pharmacare.com</li>
          <li>+91 90349 84481</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
      © {new Date().getFullYear()} PharmaCare. All rights reserved.
    </div>
  </footer>
);

export default Footer;
