import React, { useMemo } from 'react';
import EventItem from './EventItem';

export default function DayCell({ day, isCurrentMonth, events, onDayClick, onEventClick }) {
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const maxDate = useMemo(() => {
        const d = new Date(today);
        d.setFullYear(d.getFullYear() + 1);
        d.setHours(23, 59, 59, 999);
        return d;
    }, [today]);

    const isPast       = useMemo(() => day < today,   [day, today]);
    const isBeyondMax  = useMemo(() => day > maxDate, [day, maxDate]);
    const isDisabled   = isPast || isBeyondMax;

    const getBgColor = useMemo(() => (hovered = false) => {
        if (isDisabled) return '#f0f0f0';
        if (!isCurrentMonth) return hovered ? '#ece9e4' : '#f8fafc';
        return hovered ? '#f0ede8' : '#ffffff';
    }, [isDisabled, isCurrentMonth]);

    return (
        <div 
            className={`border border-soft p-2 d-flex flex-column`}
            style={{ 
                minHeight: '120px', 
                backgroundColor: getBgColor(),
                color: isDisabled ? '#b0b0b0' : (isCurrentMonth ? '#1a1a1a' : '#6c757d'),
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                opacity: isDisabled ? 0.55 : 1,
            }}
            onClick={() => !isDisabled && onDayClick && onDayClick(day)}
            onMouseEnter={(e) => !isDisabled && (e.currentTarget.style.backgroundColor = getBgColor(true))}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = getBgColor(false))}
            title={isBeyondMax ? 'No se pueden agendar eventos con más de 1 año de anticipación' : undefined}
        >
            <div className="fw-medium mb-1" style={{ color: isDisabled ? '#b0b0b0' : 'inherit' }}>
                {day.getDate()}
            </div>
            
            <div className="flex-grow-1 overflow-auto" style={{ maxHeight: '80px' }}>
                {events && events.map(event => (
                    <EventItem 
                        key={event.id} 
                        event={event} 
                        onClick={onEventClick} 
                    />
                ))}
            </div>
        </div>
    );
}
