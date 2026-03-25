import React from 'react';
import CustomNavbar from '../../components/Landing/Navbar';
import Footer from '../../components/Landing/Footer';
import CalendarContainer from '../../components/Agenda/CalendarContainer';

export default function AgendaPage() {
    return (
        <div className="bg-neutral-soft min-vh-100 d-flex flex-column">
            <CustomNavbar />
            
            <div className="flex-grow-1">
                <CalendarContainer />
            </div>
            
            <Footer />
        </div>
    );
}
