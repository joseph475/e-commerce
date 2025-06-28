import { h } from 'preact';

const Footer = () => {
  return (
    <footer class="bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="text-sm text-gray-600 mb-4 md:mb-0">
            © 2025 Boilerplate App. Built with Preact, Tailwind CSS, and Supabase.
          </div>
          
          <div class="flex space-x-6">
            <div class="text-sm text-gray-500">
              <span class="font-medium">Stack:</span> Node.js + Express + Supabase + Preact + Webpack + Tailwind
            </div>
          </div>
        </div>
        
        <div class="mt-4 pt-4 border-t border-gray-100">
          <div class="text-xs text-gray-500 text-center">
            This is a boilerplate template. Configure your environment variables to get started.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
