import React from 'react';
import EventItem from './EventItem';

export default function DayCell({ day, isCurrentMonth, events, onDayClick, onEventClick }) {
    return (
        <div 
            className={`border border-soft p-2 d-flex flex-column`}
            style={{ 
                minHeight: '120px', 
                backgroundColor: isCurrentMonth ? '#ffffff' : '#f8fafc',
                color: isCurrentMonth ? '#1a1a1a' : '#6c757d',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
            }}
            onClick={() => onDayClick && onDayClick(day)}
            onMouseEnter={(e) => isCurrentMonth && (e.currentTarget.style.backgroundColor = '#f0ede8')}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isCurrentMonth ? '#ffffff' : '#f8fafc'}
        >
            <div className="fw-medium mb-1">
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
