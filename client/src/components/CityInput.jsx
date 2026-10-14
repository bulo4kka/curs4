import { useState } from 'react';
import CITIES from '../cities';

export default function CityInput({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const norm = s => s.trim().toLowerCase().replace(/ё/g, 'е');
  const suggestions = Object.keys(CITIES).filter(c => norm(c).includes(norm(value)));

  return (
    <div className="relative">
      <input
        value={value}
        placeholder={placeholder}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
        className="h-12 bg-black/40 border border-white/10 rounded-lg px-4 w-full outline-none focus:border-red-600/50 text-white placeholder:text-gray-500"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-[#121214]/95 backdrop-blur-xl border border-white/10 rounded-lg max-h-48 overflow-auto">
          {suggestions.map(c => (
            <li key={c}>
              <button type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-white/10"
                onMouseDown={() => { onChange(c); setOpen(false); }}>{c}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}