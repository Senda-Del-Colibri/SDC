-- =====================================================
-- Sistema de Gestión Senda del Colibrí - Setup SQL
-- =====================================================

-- Secuencias personalizadas para IDs
CREATE SEQUENCE clientes_id_seq START 100000 INCREMENT 1;
CREATE SEQUENCE eventos_id_seq START 1 INCREMENT 1;
CREATE SEQUENCE referidos_id_seq START 1 INCREMENT 1;
CREATE SEQUENCE asistencias_id_seq START 1 INCREMENT 1;

-- Tabla Clientes
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY DEFAULT nextval('clientes_id_seq'),
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(200) NOT NULL,
  celular VARCHAR(15),
  comentarios TEXT,
  visitas INTEGER DEFAULT 0 CHECK (visitas >= 0),
  monto_acumulado DECIMAL(10,2) DEFAULT 0 CHECK (monto_acumulado >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla Eventos
CREATE TABLE eventos (
  id INTEGER PRIMARY KEY DEFAULT nextval('eventos_id_seq'),
  nombre VARCHAR(200) NOT NULL,
  ubicacion VARCHAR(300) NOT NULL,
  gasto DECIMAL(10,2) DEFAULT 0 CHECK (gasto >= 0),
  total_cobrado DECIMAL(10,2) DEFAULT 0 CHECK (total_cobrado >= 0),
  cantidad_personas INTEGER DEFAULT 0 CHECK (cantidad_personas >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla Referidos
CREATE TABLE referidos (
  id INTEGER PRIMARY KEY DEFAULT nextval('referidos_id_seq'),
  cliente_id INTEGER REFERENCES clientes(id) NOT NULL,
  referido_id INTEGER REFERENCES clientes(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(cliente_id, referido_id),
  CHECK (cliente_id != referido_id)
);

-- Tabla Asistencias
CREATE TABLE asistencias (
  id INTEGER PRIMARY KEY DEFAULT nextval('asistencias_id_seq'),
  cliente_id INTEGER REFERENCES clientes(id) NOT NULL,
  evento_id INTEGER REFERENCES eventos(id) NOT NULL,
  monto_pagado DECIMAL(10,2) NOT NULL CHECK (monto_pagado >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(cliente_id, evento_id)
);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_clientes_updated_at 
    BEFORE UPDATE ON clientes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at 
    BEFORE UPDATE ON eventos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar estadísticas de cliente
CREATE OR REPLACE FUNCTION update_cliente_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE clientes 
        SET 
            visitas = visitas + 1,
            monto_acumulado = monto_acumulado + NEW.monto_pagado
        WHERE id = NEW.cliente_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Función para actualizar estadísticas de evento
CREATE OR REPLACE FUNCTION update_evento_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE eventos 
        SET 
            cantidad_personas = cantidad_personas + 1,
            total_cobrado = total_cobrado + NEW.monto_pagado
        WHERE id = NEW.evento_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers para actualización automática
CREATE TRIGGER trigger_update_cliente_stats
    AFTER INSERT ON asistencias
    FOR EACH ROW EXECUTE FUNCTION update_cliente_stats();

CREATE TRIGGER trigger_update_evento_stats
    AFTER INSERT ON asistencias
    FOR EACH ROW EXECUTE FUNCTION update_evento_stats();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE referidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios autenticados
CREATE POLICY "Allow all operations for authenticated users" ON clientes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON eventos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON referidos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON asistencias
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_clientes_nombre ON clientes(nombre);
CREATE INDEX idx_clientes_apellidos ON clientes(apellidos);
CREATE INDEX idx_clientes_celular ON clientes(celular);
CREATE INDEX idx_eventos_nombre ON eventos(nombre);
CREATE INDEX idx_eventos_ubicacion ON eventos(ubicacion);
CREATE INDEX idx_referidos_cliente_id ON referidos(cliente_id);
CREATE INDEX idx_asistencias_cliente_id ON asistencias(cliente_id);
CREATE INDEX idx_asistencias_evento_id ON asistencias(evento_id);

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================

-- Insertar algunos clientes de ejemplo
-- INSERT INTO clientes (nombre, apellidos, celular, comentarios) VALUES
-- ('María', 'González López', '+52 55 1234 5678', 'Cliente frecuente, prefiere sesiones matutinas'),
-- ('Carlos', 'Rodríguez Martín', '+52 55 8765 4321', 'Nuevo en meditación, muy entusiasta'),
-- ('Ana', 'Fernández Silva', '+52 55 5555 0000', 'Practica yoga hace 5 años');

-- Insertar algunos eventos de ejemplo
-- INSERT INTO eventos (nombre, ubicacion, gasto) VALUES
-- ('Meditación Mindfulness Básica', 'Sala Principal - Centro Senda', 500.00),
-- ('Retiro de Fin de Semana', 'Casa de Retiros - Tepoztlán', 2000.00),
-- ('Círculo de Meditación Nocturna', 'Jardín Exterior - Centro Senda', 200.00);

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

-- Este script configura completamente la base de datos para el
-- Sistema de Gestión Senda del Colibrí con:
-- 
-- 1. Tablas principales con IDs numéricos personalizados:
--    - Clientes: IDs de 6 dígitos comenzando en 100000
--    - Eventos: IDs comenzando en 1
--    - Referidos y Asistencias: IDs secuenciales desde 1
-- 2. Triggers automáticos para estadísticas
-- 3. Row Level Security habilitado
-- 4. Índices para optimización de consultas
-- 5. Datos de ejemplo comentados
--
-- Ejecutar este script en el SQL Editor de Supabase
-- después de crear el proyecto. 