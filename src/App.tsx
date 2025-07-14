import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { Home } from './pages/Home';

// Cliente pages
import { AltaClientes } from './pages/clientes/AltaClientes';
import { BusquedaClientes } from './pages/clientes/BusquedaClientes';

// Evento pages
import { AltaEventos } from './pages/eventos/AltaEventos';
import { BusquedaEventos } from './pages/eventos/BusquedaEventos';

// Referido pages
import { AltaReferidos } from './pages/referidos/AltaReferidos';
import { ConsultaReferidos } from './pages/referidos/ConsultaReferidos';

// Asistencia pages
import { AltaAsistencias } from './pages/asistencias/AltaAsistencias';
import { ApartarLugar } from './pages/asistencias/ApartarLugar';
import { ConfirmarAsistencia } from './pages/asistencias/ConfirmarAsistencia';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Cliente routes */}
            <Route path="/clientes/alta" element={
              <ProtectedRoute>
                <Layout>
                  <AltaClientes />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/clientes/busqueda" element={
              <ProtectedRoute>
                <Layout>
                  <BusquedaClientes />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Evento routes */}
            <Route path="/eventos/alta" element={
              <ProtectedRoute>
                <Layout>
                  <AltaEventos />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/eventos/busqueda" element={
              <ProtectedRoute>
                <Layout>
                  <BusquedaEventos />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Referido routes */}
            <Route path="/referidos/alta" element={
              <ProtectedRoute>
                <Layout>
                  <AltaReferidos />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/referidos/consulta" element={
              <ProtectedRoute>
                <Layout>
                  <ConsultaReferidos />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Asistencia routes */}
            <Route path="/asistencias/alta" element={
              <ProtectedRoute>
                <Layout>
                  <AltaAsistencias />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/asistencias/apartar" element={
              <ProtectedRoute>
                <Layout>
                  <ApartarLugar />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/asistencias/confirmar" element={
              <ProtectedRoute>
                <Layout>
                  <ConfirmarAsistencia />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={
              <ProtectedRoute>
                <Layout>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Página no encontrada
                    </h1>
                    <p className="text-gray-600 mb-6">
                      La página que buscas no existe.
                    </p>
                    <a 
                      href="/" 
                      className="text-primary-600 hover:text-primary-500 font-medium"
                    >
                      Volver al inicio
                    </a>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
          
          {/* Toast notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
