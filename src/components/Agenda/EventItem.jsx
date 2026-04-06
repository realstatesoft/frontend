import React from 'react';
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';

const EVENT_COLORS = {
    VISIT: 'success',     // Verde
    OTHER: 'warning',     // Amarillo (Tareas)
    BLOCKED: 'danger',    // Rojo (Llamadas / urgentes)
    MEETING: 'info'       // Violeta/Info (Reuniones)
};

export default function EventItem({ event, onClick }) {
    const color = EVENT_COLORS[event.eventType] || 'secondary';
    
    // Format start time
    const startDate = new Date(event.startsAt);
    const timeString = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const handleEventClick = (e) => {
        e.stopPropagation(); // Prevent clicking on day cell
        if (onClick) onClick(event);
    };

    return (
        <OverlayTrigger
            placement="top"
            overlay={
                <Tooltip id={`tooltip-${event.id}`}>
                    {timeString} - {event.title}
                </Tooltip>
            }
        >
            <div 
                className={`bg-${color} bg-opacity-25 text-dark p-1 mb-1 radius-sm shadow-sm cursor-pointer`}
                style={{ fontSize: '0.75rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', cursor: 'pointer' }}
                onClick={handleEventClick}
            >
                <span className="fw-bold me-1">{timeString}</span>
                {event.title}
            </div>
        </OverlayTrigger>
    );
}
