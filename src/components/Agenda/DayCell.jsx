import React from 'react';
import EventItem from './EventItem';

export default function DayCell({ day, isCurrentMonth, events, onDayClick, onEventClick }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = day < today;

    const getBgColor = (hovered = false) => {
        if (isPast) return '#f0f0f0';
        if (!isCurrentMonth) return hovered ? '#ece9e4' : '#f8fafc';
        return hovered ? '#f0ede8' : '#ffffff';
    };

    return (
        <div 
            className={`border border-soft p-2 d-flex flex-column`}
            style={{ 
                minHeight: '120px', 
                backgroundColor: getBgColor(),
                color: isPast ? '#b0b0b0' : (isCurrentMonth ? '#1a1a1a' : '#6c757d'),
                cursor: isPast ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                opacity: isPast ? 0.6 : 1,
            }}
            onClick={() => !isPast && onDayClick && onDayClick(day)}
            onMouseEnter={(e) => !isPast && (e.currentTarget.style.backgroundColor = getBgColor(true))}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = getBgColor(false))}
        >
            <div className="fw-medium mb-1" style={{ color: isPast ? '#b0b0b0' : 'inherit' }}>
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
