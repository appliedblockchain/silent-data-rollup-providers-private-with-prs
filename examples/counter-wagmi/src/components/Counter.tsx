import { useEffect, useState } from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useCount, useCounter } from '../hooks/useCounter';

export function Counter() {
  const [count, setCount] = useState(0);
  const { showToast } = useToast();
  const { increment: incrementChain, decrement: decrementChain, reset: resetChain } = useCounter();
  const countChain = useCount({ watch: true });

  const handleIncrement = () => {
    setCount(prev => prev + 1);
    showToast('Counter increased', 'success');
    incrementChain().then(() => { console.log('incremented chain') });
  };

  const handleDecrement = () => {
    setCount(prev => prev - 1);
    showToast('Counter decreased', 'info');
    decrementChain().then(() => { console.log('decremented chain') });
  };

  const handleReset = () => {
    setCount(0);
    showToast('Counter reset', 'info');
    if (countChain !== '0') {
      resetChain().then(() => { console.log('reset chain') });
    }
  };

  useEffect(() => {
    if (countChain && countChain !== '-') {
      setCount(Number(countChain));
    } else {
      setCount(0);
    }
  }, [countChain]);

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
          {count}/{countChain}
        </div>
        
        <button
          onClick={handleIncrement}
          className="w-24 h-14 flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white rounded-full transition-colors"
          aria-label="Increase"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleReset}
          className="px-4 py-2 flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md transition-colors"
          aria-label="Reset"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </div>
  );
} 