import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export function Counter() {
  const [count, setCount] = useState(0);
  const { showToast } = useToast();

  const handleIncrement = () => {
    setCount(prev => prev + 1);
    showToast('Counter increased', 'success');
  };

  const handleDecrement = () => {
    setCount(prev => prev - 1);
    showToast('Counter decreased', 'info');
  };

  return (
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
  );
} 