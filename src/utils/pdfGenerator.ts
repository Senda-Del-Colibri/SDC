import jsPDF from 'jspdf';
import type { Cliente } from '../types';

interface DatosCartaResponsiva {
  nombre: string;
  celular?: string;
}

export const generarPDFResponsiva = (datos: DatosCartaResponsiva): jsPDF => {
  const pdf = new jsPDF();
  
  // Configuración inicial
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const lineHeight = 6;
  let currentY = margin;
  
  // Función auxiliar para agregar texto con salto de línea automático
  const addTextWithWrapping = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12): number => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string, index: number) => {
      pdf.text(line, x, y + (index * lineHeight));
    });
    
    return y + (lines.length * lineHeight);
  };
  
  // Título principal
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('¡Bienvenido a Senda del Colibrí!', pageWidth / 2, currentY, { align: 'center' });
  currentY += lineHeight * 2;
  
  // Texto introductorio
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const textoIntro = 'Nos sentimos honrados de acompañarte en este viaje de sanación y transformación. Estamos comprometidos con tu bienestar y con brindarte una experiencia segura y enriquecedora. Por favor, lee detenidamente esta responsiva antes de participar.';
  currentY = addTextWithWrapping(textoIntro, margin, currentY, pageWidth - (margin * 2)) + lineHeight;
  
  // Declaración de aceptación
  pdf.setFont('helvetica', 'bold');
  const textoAceptacion = `Yo, ${datos.nombre.toUpperCase()}, ACEPTO TOMAR ESTA EXPERIENCIA DE MEDICINAS ANCESTRALES BAJO MI PROPIA RESPONSABILIDAD Y CON MI TOTAL CONSENTIMIENTO. DESLINDO DE TODA RESPONSABILIDAD A TERCERAS PERSONAS Y AL ESTABLECIMIENTO DONDE SE LLEVARÁ A CABO LA EXPERIENCIA.`;
  currentY = addTextWithWrapping(textoAceptacion, margin, currentY, pageWidth - (margin * 2), 12) + lineHeight;
  
  // Nota
  pdf.setFont('helvetica', 'bold');
  pdf.text('NOTA:', margin, currentY);
  currentY += lineHeight;
  
  pdf.setFont('helvetica', 'normal');
  const textoNota = 'Las medicinas ancestrales son extractos de raíces y plantas naturales heredadas por nuestros ancestros y transmitidas de generación en generación hasta llegar a nuestros días. Se busca que estas herramientas beneficien al cuerpo, sanen el alma y ayuden en la curación de enfermedades, adicciones, y en la elevación de la conciencia a un nivel superior.';
  currentY = addTextWithWrapping(textoNota, margin, currentY, pageWidth - (margin * 2)) + lineHeight;
  
  // Declaración de salud
  const textoDeclaracion = 'Declaro que mi estado de salud física y mental es óptimo para participar en esta experiencia. Entiendo que la ingesta de estas medicinas es responsabilidad exclusiva de quien las consume, y reconozco que esta práctica no sustituye tratamientos médicos o psicológicos.';
  currentY = addTextWithWrapping(textoDeclaracion, margin, currentY, pageWidth - (margin * 2)) + lineHeight * 2;
  
  // Campos de firma
  pdf.setFont('helvetica', 'normal');
  pdf.text('Firma: ___________________________', margin, currentY);
  currentY += lineHeight * 2;
  
  pdf.text('Fecha: ___________________________', margin, currentY);
  currentY += lineHeight * 2;
  
  pdf.text(`Celular: ${datos.celular || '___________________________'}`, margin, currentY);
  currentY += lineHeight * 2;
  
  // Preguntas de salud
  pdf.setFont('helvetica', 'bold');
  const pregunta1 = '¿Sufre o sospecha sufrir de algún trastorno psicológico como esquizofrenia, bipolaridad u otros problemas de salud mental?';
  currentY = addTextWithWrapping(pregunta1, margin, currentY, pageWidth - (margin * 2), 12) + lineHeight;
  
  pdf.setFont('helvetica', 'normal');
  pdf.text('Sí [ ]', margin, currentY);
  pdf.text('No [ ]', margin + 30, currentY);
  currentY += lineHeight * 2;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('¿Está actualmente embarazada o sospecha que podría estarlo?', margin, currentY);
  currentY += lineHeight;
  
  pdf.setFont('helvetica', 'normal');
  pdf.text('Sí [ ]', margin, currentY);
  pdf.text('No [ ]', margin + 30, currentY);
  currentY += lineHeight * 2;
  
  pdf.setFont('helvetica', 'bold');
  const pregunta3 = '¿Ha tomado medicamentos controlados (ansiolíticos, antidepresivos, antipsicóticos, entre otros) en las últimas 24 horas?';
  currentY = addTextWithWrapping(pregunta3, margin, currentY, pageWidth - (margin * 2), 12) + lineHeight;
  
  pdf.setFont('helvetica', 'normal');
  pdf.text('Sí [ ]', margin, currentY);
  pdf.text('No [ ]', margin + 30, currentY);
  
  return pdf;
};

export const generarCartaResponsivaCliente = (cliente: Cliente): void => {
  const pdf = generarPDFResponsiva({
    nombre: `${cliente.nombre} ${cliente.apellidos}`,
    celular: cliente.celular
  });
  
  const filename = `carta_responsiva_${cliente.nombre}_${cliente.apellidos}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};

export const generarCartasResponsivasMasivas = (clientes: Cliente[]): void => {
  // Para descargas masivas, usaremos JSZip
  import('jszip').then(JSZip => {
    const zip = new JSZip.default();
    
    clientes.forEach(cliente => {
      const pdf = generarPDFResponsiva({
        nombre: `${cliente.nombre} ${cliente.apellidos}`,
        celular: cliente.celular
      });
      
      const filename = `carta_responsiva_${cliente.nombre}_${cliente.apellidos}.pdf`;
      zip.file(filename, pdf.output('blob'));
    });
    
    zip.generateAsync({ type: 'blob' }).then(content => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `cartas_responsivas_${new Date().toISOString().split('T')[0]}.zip`;
      link.click();
    });
  });
}; 