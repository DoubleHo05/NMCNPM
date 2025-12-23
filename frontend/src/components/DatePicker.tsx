import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD or YYYY-MM
  onChange: (date: string) => void;
  label?: string;
  className?: string;
  type?: 'date' | 'month'; // New prop to control selection mode
}

type ViewMode = 'date' | 'month' | 'year';

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label, className, type = 'date' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(type === 'month' ? 'month' : 'date');
  const [viewDate, setViewDate] = useState(new Date()); 
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      // Handle YYYY-MM format by appending -01
      const dateStr = value.length === 7 ? `${value}-01` : value;
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        setViewDate(date);
      }
    }
  }, [value]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset view based on type
        setViewMode(type === 'month' ? 'month' : 'date'); 
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [type]);

  const fullMonths = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const d = String(newDate.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${d}`);
    setIsOpen(false);
  };

  const handleMonthClick = (monthIndex: number) => {
    const newDate = new Date(viewDate.getFullYear(), monthIndex, 1);
    setViewDate(newDate);

    if (type === 'month') {
        // If in Month picker mode, select the value and close
        const year = newDate.getFullYear();
        const month = String(monthIndex + 1).padStart(2, '0');
        onChange(`${year}-${month}`);
        setIsOpen(false);
    } else {
        // If in Date picker mode, drill down to days
        setViewMode('date');
    }
  };

  const handleYearClick = (year: number) => {
    const newDate = new Date(year, viewDate.getMonth(), 1);
    setViewDate(newDate);
    // Go back to the relevant view
    setViewMode(type === 'month' ? 'month' : 'date'); 
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'date') {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    } else if (viewMode === 'year') {
        setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1));
    } else {
        // Month view
        setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
    }
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'date') {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    } else if (viewMode === 'year') {
        setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1));
    } else {
        // Month view
        setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
    }
  };

  // Helper to render Days View
  const renderDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Previous month padding
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const paddingDays = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      paddingDays.push(daysInPrevMonth - i);
    }

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const selectedDateObj = new Date(value);
    const isSelected = (day: number) => {
        if (!value) return false;
        return selectedDateObj.getDate() === day && 
               selectedDateObj.getMonth() === month && 
               selectedDateObj.getFullYear() === year;
    };

    return (
      <div className="animate-in fade-in zoom-in duration-200">
        <div className="grid grid-cols-7 mb-2">
          {daysOfWeek.map(d => (
            <div key={d} className="text-center text-xs font-bold text-slate-500 py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
            {paddingDays.map(day => (
                <div key={`pad-${day}`} className="h-9 flex items-center justify-center text-slate-300 text-sm">
                    {day}
                </div>
            ))}
            {days.map(day => (
                <div key={day} className="flex items-center justify-center">
                    <button
                        onClick={() => handleDateClick(day)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all
                            ${isSelected(day) 
                                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30' 
                                : 'text-slate-900 font-medium hover:bg-blue-50 hover:text-blue-600'
                            }`}
                    >
                        {day}
                    </button>
                </div>
            ))}
        </div>
      </div>
    );
  };

  // Helper to render Months View
  const renderMonths = () => {
    // Current selected month calculation
    const currentSelectedDate = value ? (value.length === 7 ? new Date(`${value}-01`) : new Date(value)) : null;
    
    return (
        <div className="grid grid-cols-2 gap-3 py-2 animate-in fade-in zoom-in duration-200">
            {fullMonths.map((m, index) => {
                const isSelected = type === 'month' && 
                                   currentSelectedDate && 
                                   currentSelectedDate.getMonth() === index && 
                                   currentSelectedDate.getFullYear() === viewDate.getFullYear();

                const isViewing = viewDate.getMonth() === index && type === 'date';

                return (
                    <button
                        key={m}
                        onClick={() => handleMonthClick(index)}
                        className={`py-3 px-2 rounded-lg text-sm font-semibold transition-colors border ${
                            isSelected || isViewing
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                            : 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                    >
                        {m}
                    </button>
                )
            })}
        </div>
    );
  };

  // Helper to render Years View
  const renderYears = () => {
    const startYear = viewDate.getFullYear() - 5;
    const years = Array.from({length: 12}, (_, i) => startYear + i);
    
    return (
        <div className="grid grid-cols-3 gap-3 py-2 animate-in fade-in zoom-in duration-200">
            {years.map(y => (
                <button
                    key={y}
                    onClick={() => handleYearClick(y)}
                    className={`py-3 rounded-lg text-sm font-semibold transition-colors border ${
                        viewDate.getFullYear() === y 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                >
                    {y}
                </button>
            ))}
        </div>
    );
  };

  // Format Display Value
  let displayValue = '';
  if (value) {
      if (type === 'month') {
          // YYYY-MM
          const [y, m] = value.split('-');
          displayValue = `Tháng ${m}, ${y}`;
      } else {
          // YYYY-MM-DD
          displayValue = value.split('-').reverse().join('/');
      }
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
        {label && <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>}
        
        {/* Input Trigger */}
        <div 
            className="flex items-center w-full px-4 py-3 bg-white border border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
            onClick={() => setIsOpen(!isOpen)}
        >
            <Calendar size={18} className="text-slate-500 mr-3" />
            <span className={`text-sm font-medium ${displayValue ? 'text-slate-900' : 'text-slate-400'}`}>
                {displayValue || (type === 'month' ? 'Chọn tháng...' : 'Chọn ngày...')}
            </span>
        </div>

        {/* Dropdown Panel */}
        {isOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-[100] w-[320px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 px-1 border-b border-slate-100 pb-3">
                    <button onClick={(e) => {
                        e.stopPropagation();
                        // If type is month, clicking header toggles between Month list and Year list
                        if (type === 'month') {
                            setViewMode(viewMode === 'month' ? 'year' : 'month');
                        } else {
                            // Standard date picker behavior
                            if (viewMode === 'month') setViewMode('date');
                            else if (viewMode === 'year') setViewMode('date');
                            else setViewMode('month');
                        }
                    }} className="flex items-center gap-1 font-bold text-slate-800 hover:text-blue-600 transition-colors text-base">
                        {viewMode === 'date' && (
                            <>
                                {fullMonths[viewDate.getMonth()]}, {viewDate.getFullYear()}
                            </>
                        )}
                        {viewMode === 'month' && (
                             <>
                                Năm {viewDate.getFullYear()}
                            </>
                        )}
                        {viewMode === 'year' && (
                            <>
                                {viewDate.getFullYear() - 5} - {viewDate.getFullYear() + 6}
                            </>
                        )}
                        <ChevronRight size={16} className="rotate-90 text-blue-500" />
                    </button>
                    
                    <div className="flex gap-1">
                        <button onClick={prev} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 hover:text-slate-900 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={next} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 hover:text-slate-900 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="min-h-[280px]">
                    {viewMode === 'date' && renderDays()}
                    {viewMode === 'month' && renderMonths()}
                    {viewMode === 'year' && renderYears()}
                </div>
            </div>
        )}
    </div>
  );
};

export default DatePicker;