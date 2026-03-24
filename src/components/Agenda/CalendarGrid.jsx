import React from 'react';
import DayCell from './DayCell';
import { Row, Col } from 'react-bootstrap';

const DAYS_OF_WEEK = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SAB"];

export default function CalendarGrid({ currentDate, events, onDayClick, onEventClick }) {
    
    // Calculate calendar days
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0-6
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarDays = [];

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, daysInPrevMonth - i);
        calendarDays.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        calendarDays.push({ date: d, isCurrentMonth: true });
    }

    // Next month days to fill the rest of the 7-week grid
    const remainingSlots = 42 - calendarDays.length; // 6 rows * 7 cols
    for (let i = 1; i <= remainingSlots; i++) {
        const d = new Date(year, month + 1, i);
        calendarDays.push({ date: d, isCurrentMonth: false });
    }

    // Helper to get events for a particular day
    const getEventsForDay = (dateObj) => {
        return events.filter(e => {
            const evDate = new Date(e.startsAt);
            return evDate.getDate() === dateObj.getDate() &&
                   evDate.getMonth() === dateObj.getMonth() &&
                   evDate.getFullYear() === dateObj.getFullYear();
        });
    };

    return (
        <div className="bg-white p-3 radius-md shadow-soft">
            {/* Header: Days of the week */}
            <Row className="mb-2 gx-0 border-soft border-bottom">
                {DAYS_OF_WEEK.map((day, idx) => (
                    <Col key={idx} className="text-secondary fw-semibold ps-2 p-1" style={{ fontSize: '0.85rem' }}>
                        {day}
                    </Col>
                ))}
            </Row>

            {/* Grid */}
            <div 
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0px'
                }}
            >
                {calendarDays.map((calDay, idx) => (
                    <DayCell 
                        key={idx}
                        day={calDay.date}
                        isCurrentMonth={calDay.isCurrentMonth}
                        events={getEventsForDay(calDay.date)}
                        onDayClick={onDayClick}
                        onEventClick={onEventClick}
                    />
                ))}
            </div>
        </div>
    );
}
