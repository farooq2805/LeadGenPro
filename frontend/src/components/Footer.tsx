import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">P</div>
              <span className="text-lg font-bold gradient-text">ProspectPro</span>
            </div>
            <p className="text-gray-500 text-sm">AI-powered lead generation for modern businesses.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Product</h4>
            <div className="space-y-2 text-sm">
              <Link to="/pricing" className="block text-gray-400 hover:text-white">Pricing</Link>
              <Link to="/generate" className="block text-gray-400 hover:text-white">Generate Leads</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <div className="space-y-2 text-sm">
              <span className="block text-gray-400">About</span>
              <span className="block text-gray-400">Blog</span>
              <span className="block text-gray-400">Contact</span>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <div className="space-y-2 text-sm">
              <span className="block text-gray-400">Privacy Policy</span>
              <span className="block text-gray-400">Terms of Service</span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} ProspectPro. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
