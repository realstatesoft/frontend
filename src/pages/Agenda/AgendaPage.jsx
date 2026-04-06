import React from 'react';
import CalendarContainer from '../../components/Agenda/CalendarContainer';
import styles from './AgendaPage.module.scss';

export default function AgendaPage() {
    return (
        <div className={styles.page}>
            <div className={styles.page__header}>
                <div>
                    <h1 className={styles.page__title}>Agenda</h1>
                    <p className={styles.page__subtitle}>Gestiona tus visitas y reuniones</p>
                </div>
            </div>
            
            <div className={styles.page__calendar}>
                <CalendarContainer />
            </div>
        </div>
    );
}
