import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '48px', 
          margin: '0 0 16px 0', 
          color: '#2d5a5a',
          fontWeight: 'bold'
        }}>
          Sistema de Gestión de Meditaciones
        </h1>
        <p style={{ 
          fontSize: '20px', 
          color: '#666', 
          margin: '0 0 32px 0' 
        }}>
          Administre clientes, eventos, referidos y asistencias de manera eficiente
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '32px',
        marginBottom: '40px'
      }}>
        <div style={{ 
          border: '2px solid #e2e8f0', 
          borderRadius: '12px', 
          padding: '32px', 
          backgroundColor: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            color: '#2d5a5a', 
            marginBottom: '16px',
            fontWeight: 'bold'
          }}>
            👥 Clientes
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#666', 
            marginBottom: '24px',
            lineHeight: '1.5'
          }}>
            Gestione la información completa de sus clientes, incluyendo datos de contacto y historial
          </p>
          <RouterLink 
            to="/clients" 
            style={{ 
              display: 'inline-block',
              backgroundColor: '#2d5a5a',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              width: '100%',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
          >
            Gestionar Clientes
          </RouterLink>
        </div>

        <div style={{ 
          border: '2px solid #e2e8f0', 
          borderRadius: '12px', 
          padding: '32px', 
          backgroundColor: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            color: '#805ad5', 
            marginBottom: '16px',
            fontWeight: 'bold'
          }}>
            📅 Eventos
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#666', 
            marginBottom: '24px',
            lineHeight: '1.5'
          }}>
            Organice y administre sus eventos de meditación con control completo
          </p>
          <RouterLink 
            to="/events" 
            style={{ 
              display: 'inline-block',
              backgroundColor: '#805ad5',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              width: '100%',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
          >
            Gestionar Eventos
          </RouterLink>
        </div>

        <div style={{ 
          border: '2px solid #e2e8f0', 
          borderRadius: '12px', 
          padding: '32px', 
          backgroundColor: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            color: '#3182ce', 
            marginBottom: '16px',
            fontWeight: 'bold'
          }}>
            🤝 Referidos
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#666', 
            marginBottom: '24px',
            lineHeight: '1.5'
          }}>
            Seguimiento completo de referidos y sistema de recomendaciones
          </p>
          <RouterLink 
            to="/referrals" 
            style={{ 
              display: 'inline-block',
              backgroundColor: '#3182ce',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              width: '100%',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
          >
            Gestionar Referidos
          </RouterLink>
        </div>

        <div style={{ 
          border: '2px solid #e2e8f0', 
          borderRadius: '12px', 
          padding: '32px', 
          backgroundColor: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            color: '#dd6b20', 
            marginBottom: '16px',
            fontWeight: 'bold'
          }}>
            ✅ Asistencias
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#666', 
            marginBottom: '24px',
            lineHeight: '1.5'
          }}>
            Control detallado de asistencias y gestión de pagos
          </p>
          <RouterLink 
            to="/attendance" 
            style={{ 
              display: 'inline-block',
              backgroundColor: '#dd6b20',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              width: '100%',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
          >
            Gestionar Asistencias
          </RouterLink>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 