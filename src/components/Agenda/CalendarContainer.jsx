import React, { useState, useEffect } from 'react';
import { Button, Container } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import CalendarGrid from './CalendarGrid';
import { getAgendaForMonth } from '../../services/agents/agentAgendaService';
import Swal from 'sweetalert2';

export default function CalendarContainer() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleString('es-ES', { month: 'long' });
    const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    useEffect(() => {
        fetchEvents(year, month);
    }, [year, month]);

    const fetchEvents = async (yyyy, mm) => {
        setIsLoading(true);
        try {
            // Format YYYY-MM
            const mmString = String(mm + 1).padStart(2, '0');
            const result = await getAgendaForMonth(`${yyyy}-${mmString}`);
            setEvents(result.data || []);
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al cargar la agenda.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleCreateEvent = () => {
        // Mock action for creating an event
        Swal.fire({
            title: 'Crear Evento',
            text: 'Próximamente: Formulario para crear evento (Conexión al backend POST /agent-agenda)',
            icon: 'info'
        });
    };

    const handleDayClick = (day) => {
        console.log("Day clicked:", day);
    };

    const handleEventClick = (event) => {
        const escapeHtml = (str) => {
            if (!str) return '';
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };

        Swal.fire({
            title: escapeHtml(event.title),
            html: `
                <p><b>Tipo:</b> ${escapeHtml(event.eventType)}</p>
                <p><b>Hora:</b> ${new Date(event.startsAt).toUTCString()}</p>
                <p><b>Ubicación:</b> ${escapeHtml(event.location) || 'N/A'}</p>
                ${event.description ? `<p>${escapeHtml(event.description)}</p>` : ''}
                ${event.notes ? `<p><i>Notas:</i> ${escapeHtml(event.notes)}</p>` : ''}
            `,
            icon: 'info'
        });
    };

    return (
        <Container className="py-4">
            {/* Header section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h2 text-dark mb-0 fw-bold">Agenda</h1>
                <Button variant="primary" onClick={handleCreateEvent} className="radius-sm shadow-soft">
                    + Crear evento
                </Button>
            </div>

            {/* Navigation controls */}
            <div className="d-flex justify-content-between align-items-center bg-white p-3 radius-md shadow-soft mb-3">
                <div className="d-flex align-items-center gap-2">
                    <Button variant="light" className="p-2 border-soft radius-sm d-flex align-items-center" onClick={handlePrevMonth}>
                        <ChevronLeft />
                    </Button>
                    <div className="fw-semibold px-3 text-center" style={{ minWidth: '150px' }}>
                        {capitalizedMonthName} {year}
                    </div>
                    <Button variant="light" className="p-2 border-soft radius-sm d-flex align-items-center" onClick={handleNextMonth}>
                        <ChevronRight />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            {isLoading ? (
                <div className="text-center p-5 text-muted">Cargando agenda...</div>
            ) : (
                <CalendarGrid
                    currentDate={currentDate}
                    events={events}
                    onDayClick={handleDayClick}
                    onEventClick={handleEventClick}
                />
            )}
        </Container>
    );
}
