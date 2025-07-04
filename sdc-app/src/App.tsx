import React from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';

// Página de inicio simple
const HomePage = () => (
  <div style={{ padding: '20px' }}>
    <h1 style={{ color: '#2d5a5a', fontSize: '36px', marginBottom: '20px' }}>
      Sistema de Gestión de Meditaciones
    </h1>
    <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
      Administre clientes, eventos, referidos y asistencias de manera eficiente
    </p>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: 'white' }}>
        <h3 style={{ color: '#2d5a5a' }}>👥 Clientes</h3>
        <p>Gestione la información de sus clientes</p>
        <RouterLink to="/clients" style={{ color: '#2d5a5a', textDecoration: 'none', fontWeight: 'bold' }}>
          Ir a Clientes →
        </RouterLink>
      </div>
      
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: 'white' }}>
        <h3 style={{ color: '#805ad5' }}>📅 Eventos</h3>
        <p>Organice sus eventos de meditación</p>
        <RouterLink to="/events" style={{ color: '#805ad5', textDecoration: 'none', fontWeight: 'bold' }}>
          Ir a Eventos →
        </RouterLink>
      </div>
      
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: 'white' }}>
        <h3 style={{ color: '#3182ce' }}>🤝 Referidos</h3>
        <p>Sistema de referidos y recomendaciones</p>
        <RouterLink to="/referrals" style={{ color: '#3182ce', textDecoration: 'none', fontWeight: 'bold' }}>
          Ir a Referidos →
        </RouterLink>
      </div>
      
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: 'white' }}>
        <h3 style={{ color: '#dd6b20' }}>✅ Asistencias</h3>
        <p>Control de asistencias y pagos</p>
        <RouterLink to="/attendance" style={{ color: '#dd6b20', textDecoration: 'none', fontWeight: 'bold' }}>
          Ir a Asistencias →
        </RouterLink>
      </div>
    </div>
  </div>
);

// Páginas simples
const ClientsPage = () => (
  <div style={{ padding: '20px' }}>
    <h1 style={{ color: '#2d5a5a' }}>👥 Gestión de Clientes</h1>
    <p>Aquí podrás gestionar todos tus clientes.</p>
    <p style={{ color: '#666', fontStyle: 'italic' }}>Funcionalidad en desarrollo...</p>
    <RouterLink to="/" style={{ color: '#2d5a5a', textDecoration: 'none' }}>← Volver al inicio</RouterLink>
  </div>
);

const EventsPage = () => (
  <div style={{ padding: '20px' }}>
    <h1 style={{ color: '#805ad5' }}>📅 Gestión de Eventos</h1>
    <p>Aquí podrás organizar tus eventos de meditación.</p>
    <p style={{ color: '#666', fontStyle: 'italic' }}>Funcionalidad en desarrollo...</p>
    <RouterLink to="/" style={{ color: '#805ad5', textDecoration: 'none' }}>← Volver al inicio</RouterLink>
  </div>
);

const ReferralsPage = () => (
  <div style={{ padding: '20px' }}>
    <h1 style={{ color: '#3182ce' }}>🤝 Gestión de Referidos</h1>
    <p>Aquí podrás gestionar el sistema de referidos.</p>
    <p style={{ color: '#666', fontStyle: 'italic' }}>Funcionalidad en desarrollo...</p>
    <RouterLink to="/" style={{ color: '#3182ce', textDecoration: 'none' }}>← Volver al inicio</RouterLink>
  </div>
);

const AttendancePage = () => (
  <div style={{ padding: '20px' }}>
    <h1 style={{ color: '#dd6b20' }}>✅ Gestión de Asistencias</h1>
    <p>Aquí podrás controlar asistencias y pagos.</p>
    <p style={{ color: '#666', fontStyle: 'italic' }}>Funcionalidad en desarrollo...</p>
    <RouterLink to="/" style={{ color: '#dd6b20', textDecoration: 'none' }}>← Volver al inicio</RouterLink>
  </div>
);

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Navegación */}
      <nav style={{ 
        backgroundColor: 'white', 
        padding: '15px 20px', 
        borderBottom: '2px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <RouterLink to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ margin: 0, color: '#2d5a5a', fontSize: '24px' }}>
              SDC Meditaciones
            </h1>
          </RouterLink>
          <div style={{ display: 'flex', gap: '20px' }}>
            <RouterLink to="/" style={{ color: '#666', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px' }}>
              Inicio
            </RouterLink>
            <RouterLink to="/clients" style={{ color: '#666', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px' }}>
              Clientes
            </RouterLink>
            <RouterLink to="/events" style={{ color: '#666', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px' }}>
              Eventos
            </RouterLink>
            <RouterLink to="/referrals" style={{ color: '#666', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px' }}>
              Referidos
            </RouterLink>
            <RouterLink to="/attendance" style={{ color: '#666', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px' }}>
              Asistencias
            </RouterLink>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/referrals" element={<ReferralsPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
