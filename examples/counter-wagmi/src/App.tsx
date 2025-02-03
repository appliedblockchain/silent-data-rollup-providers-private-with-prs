import { useState } from 'react';
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { Plus, Minus, Calculator, LogIn } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config'
import { Toast } from './components/Toast';
import '@rainbow-me/rainbowkit/styles.css'

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const queryClient = new QueryClient()

function App() {
  const [count, setCount] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleIncrement = () => {
    setCount(prev => prev + 1);
    showToast('Counter increased', 'success');
  };

  const handleDecrement = () => {
    setCount(prev => prev - 1);
    showToast('Counter decreased', 'info');
  };

  const handleConnect = () => {
    showToast('Connection feature coming soon!', 'info');
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Toast Container - Now at bottom right */}
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
              {toasts.map(toast => (
                <Toast
                  key={toast.id}
                  message={toast.message}
                  type={toast.type}
                  onClose={() => removeToast(toast.id)}
                />
              ))}
            </div>

            {/* Header Bar */}
            <header className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-gray-700" />
                  <span className="text-lg font-semibold text-gray-800">Counter App</span>
                </div>
                <button 
                  onClick={handleConnect}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md transition-colors text-sm"
                >
                  <LogIn size={16} />
                  Connect
                </button>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">Counter</h1>
                
                <div className="flex items-center justify-center gap-6 mb-8">
                  <button
                    onClick={handleDecrement}
                    className="w-24 h-14 flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus size={20} />
                  </button>
                  
                  <div className="text-5xl font-bold text-gray-700 min-w-[120px] text-center">
                    {count}
                  </div>
                  
                  <button
                    onClick={handleIncrement}
                    className="w-24 h-14 flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white rounded-full transition-colors"
                    aria-label="Increase"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200">
              <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    © {new Date().getFullYear()} Counter App. All rights reserved.
                  </div>
                  <div className="flex gap-6">
                    <a href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Terms of Service
                    </a>
                    <a href="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Contact Us
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;