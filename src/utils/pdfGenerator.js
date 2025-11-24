import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * PDF Generation utilities for estimates and invoices
 * Creates professional PDF documents with company branding
 */

/**
 * Add professional company header with logo to PDF
 * @param {jsPDF} doc - jsPDF document instance
 * @param {string} documentType - Type of document (ESTIMATE, INVOICE, etc.)
 * @param {Object} metadata - Document metadata (number, date, etc.)
 */
const addCompanyHeader = async (doc, documentType, metadata = {}) => {
  // Load and add company logo
  try {
    const logoImg = new Image();
    logoImg.src = '/logo.png';

    // Wait for image to load
    await new Promise((resolve, reject) => {
      logoImg.onload = resolve;
      logoImg.onerror = reject;
    });

    // Add logo (40x40 size, positioned at top left)
    doc.addImage(logoImg, 'PNG', 15, 10, 40, 40);
  } catch (error) {
    console.warn('Could not load logo for PDF:', error);
  }

  // Company name and details (next to logo)
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 33, 33); // Dark gray (#212121)
  doc.text('C.A.R.S', 60, 20);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Collision & Refinish Shop', 60, 28);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Spring, TX 77388', 60, 35);
  doc.text('Phone: (832) 844-5458', 60, 40);
  doc.text('Email: info@carsautobody.com', 60, 45);

  // Document type and metadata (right side)
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(229, 57, 53); // Brand red (#e53935)
  doc.text(documentType, 200, 20, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  if (metadata.number) {
    doc.text(`${documentType} #: ${metadata.number}`, 200, 28, { align: 'right' });
  }
  if (metadata.date) {
    doc.text(`Date: ${metadata.date}`, 200, 34, { align: 'right' });
  }
  if (metadata.additionalInfo) {
    doc.text(metadata.additionalInfo, 200, 40, { align: 'right' });
  }

  // Decorative line under header
  doc.setDrawColor(229, 57, 53); // Brand red
  doc.setLineWidth(0.5);
  doc.line(15, 52, 195, 52);

  doc.setTextColor(0, 0, 0); // Reset to black
};

/**
 * Add professional footer to PDF
 * @param {jsPDF} doc - jsPDF document instance
 */
const addCompanyFooter = (doc) => {
  const pageHeight = doc.internal.pageSize.height;

  // Footer line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(15, pageHeight - 20, 195, pageHeight - 20);

  // Footer text
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);

  doc.text('Thank you for choosing C.A.R.S Collision & Refinish Shop!', 105, pageHeight - 14, { align: 'center' });
  doc.text('Quality Repairs • Professional Service • Customer Satisfaction Guaranteed', 105, pageHeight - 10, { align: 'center' });
  doc.text('(832) 844-5458 • Spring, TX 77388', 105, pageHeight - 6, { align: 'center' });

  doc.setTextColor(0, 0, 0); // Reset to black
};

/**
 * Generate estimate PDF for a work order
 * @param {Object} workOrder - Work order data
 * @param {Object} customer - Customer data
 * @param {Object} vehicle - Vehicle data
 * @param {Array} parts - Parts list
 */
export const generateEstimatePDF = async (workOrder, customer, vehicle, parts) => {
  const doc = new jsPDF();

  // Add professional header with logo
  await addCompanyHeader(doc, 'ESTIMATE', {
    number: workOrder.work_order_number,
    date: format(new Date(workOrder.created_at), 'MMMM dd, yyyy'),
    additionalInfo: workOrder.estimated_completion_date
      ? `Est. Completion: ${format(new Date(workOrder.estimated_completion_date), 'MMM dd, yyyy')}`
      : null
  });

  // Bill To section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 245, 245); // Light gray background
  doc.rect(15, 60, 85, 8, 'F');
  doc.text('BILL TO', 17, 65);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.name, 17, 73);
  doc.text(customer.phone, 17, 78);
  doc.text(customer.email, 17, 83);
  if (customer.address) {
    const addressLines = doc.splitTextToSize(customer.address, 80);
    doc.text(addressLines, 17, 88);
  }

  // Vehicle Information section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 245, 245);
  doc.rect(110, 60, 85, 8, 'F');
  doc.text('VEHICLE', 112, 65);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${vehicle.year} ${vehicle.make} ${vehicle.model}`, 112, 73);
  doc.text(`VIN: ${vehicle.vin}`, 112, 78);
  doc.text(`License: ${vehicle.license_plate || 'N/A'}`, 112, 83);
  if (vehicle.color) {
    doc.text(`Color: ${vehicle.color}`, 112, 88);
  }

  // Description of Work
  const descriptionY = customer.address ? 100 : 95;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 245, 245);
  doc.rect(15, descriptionY, 180, 8, 'F');
  doc.text('SCOPE OF WORK', 17, descriptionY + 5);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const descriptionText = workOrder.description || 'Collision repair and refinishing services as discussed.';
  const splitDescription = doc.splitTextToSize(descriptionText, 170);
  doc.text(splitDescription, 17, descriptionY + 12);

  // Parts and Labor table
  const tableStartY = descriptionY + 12 + (splitDescription.length * 5) + 8;

  const partsTableData = parts.map((part) => [
    part.part_number,
    part.description,
    part.quantity.toString(),
    `$${part.unit_price.toFixed(2)}`,
    `$${(part.quantity * part.unit_price).toFixed(2)}`,
  ]);

  const partsSubtotal = parts.reduce((sum, part) => sum + part.quantity * part.unit_price, 0);

  doc.autoTable({
    startY: tableStartY,
    head: [['Part Number', 'Description', 'Qty', 'Unit Price', 'Total']],
    body: partsTableData,
    theme: 'grid',
    headStyles: {
      fillColor: [33, 33, 33], // Dark gray
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 75 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    }
  });

  // Totals section
  const finalY = doc.lastAutoTable.finalY + 10;
  const rightAlign = 165;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Parts Subtotal:', rightAlign, finalY, { align: 'right' });
  doc.text(`$${partsSubtotal.toFixed(2)}`, 190, finalY, { align: 'right' });

  doc.text('Labor (estimate):', rightAlign, finalY + 6, { align: 'right' });
  doc.text('TBD', 190, finalY + 6, { align: 'right' });

  // Draw line above total
  doc.setDrawColor(33, 33, 33);
  doc.setLineWidth(0.5);
  doc.line(140, finalY + 10, 190, finalY + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('ESTIMATED TOTAL:', rightAlign, finalY + 16, { align: 'right' });
  doc.text(`$${partsSubtotal.toFixed(2)}+`, 190, finalY + 16, { align: 'right' });

  // Terms and conditions
  const termsY = finalY + 26;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions:', 17, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const terms = [
    '• This estimate is valid for 30 days from the date issued.',
    '• Final pricing may vary based on additional repairs discovered during disassembly and inspection.',
    '• Labor charges will be calculated based on actual work performed.',
    '• Payment is due upon completion of work.',
    '• We accept cash, check, and major credit cards (Visa, Mastercard, Discover, Amex).',
    '• A 50% deposit may be required for extensive repairs.',
  ];
  terms.forEach((term, index) => {
    doc.text(term, 17, termsY + 6 + (index * 4));
  });

  // Professional footer
  addCompanyFooter(doc);

  // Save the PDF
  doc.save(`CARS-Estimate-${workOrder.work_order_number}.pdf`);
};

/**
 * Generate invoice PDF for a completed work order
 * @param {Object} workOrder - Work order data
 * @param {Object} customer - Customer data
 * @param {Object} vehicle - Vehicle data
 * @param {Array} parts - Parts list
 * @param {number} laborCost - Labor cost (optional)
 */
export const generateInvoicePDF = async (workOrder, customer, vehicle, parts, laborCost = 0) => {
  const doc = new jsPDF();

  // Add professional header with logo
  await addCompanyHeader(doc, 'INVOICE', {
    number: workOrder.work_order_number,
    date: format(new Date(), 'MMMM dd, yyyy'),
    additionalInfo: workOrder.updated_at
      ? `Completed: ${format(new Date(workOrder.updated_at), 'MMM dd, yyyy')}`
      : null
  });

  // "PAID" or "DUE" stamp
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69); // Red
  doc.setDrawColor(220, 53, 69);
  doc.setLineWidth(2);
  doc.rect(155, 54, 35, 12);
  doc.text('DUE', 172.5, 62, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Bill To section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 245, 245);
  doc.rect(15, 72, 85, 8, 'F');
  doc.text('BILL TO', 17, 77);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.name, 17, 85);
  doc.text(customer.phone, 17, 90);
  doc.text(customer.email, 17, 95);
  if (customer.address) {
    const addressLines = doc.splitTextToSize(customer.address, 80);
    doc.text(addressLines, 17, 100);
  }

  // Vehicle Information section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 245, 245);
  doc.rect(110, 72, 85, 8, 'F');
  doc.text('VEHICLE', 112, 77);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${vehicle.year} ${vehicle.make} ${vehicle.model}`, 112, 85);
  doc.text(`VIN: ${vehicle.vin}`, 112, 90);
  doc.text(`License: ${vehicle.license_plate || 'N/A'}`, 112, 95);
  if (vehicle.color) {
    doc.text(`Color: ${vehicle.color}`, 112, 100);
  }

  // Work Performed
  const workY = customer.address ? 112 : 107;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 245, 245);
  doc.rect(15, workY, 180, 8, 'F');
  doc.text('WORK PERFORMED', 17, workY + 5);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const workDescription = workOrder.description || 'Collision repair and refinishing services.';
  const splitWork = doc.splitTextToSize(workDescription, 170);
  doc.text(splitWork, 17, workY + 12);

  // Parts and Labor table
  const tableStartY = workY + 12 + (splitWork.length * 5) + 8;

  const tableData = [
    ...parts.map((part) => [
      part.part_number,
      part.description,
      part.quantity.toString(),
      `$${part.unit_price.toFixed(2)}`,
      `$${(part.quantity * part.unit_price).toFixed(2)}`,
    ])
  ];

  // Add labor row if provided
  if (laborCost > 0) {
    tableData.push([
      'LABOR',
      'Labor charges for repair work',
      '1',
      `$${laborCost.toFixed(2)}`,
      `$${laborCost.toFixed(2)}`,
    ]);
  }

  const subtotal = parts.reduce((sum, part) => sum + part.quantity * part.unit_price, 0) + laborCost;
  const taxRate = 0.0825; // 8.25% Texas sales tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  doc.autoTable({
    startY: tableStartY,
    head: [['Item', 'Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [33, 33, 33],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 75 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    }
  });

  // Totals section with professional styling
  const finalY = doc.lastAutoTable.finalY + 10;
  const rightAlign = 165;

  // Totals box
  doc.setFillColor(245, 245, 245);
  doc.rect(130, finalY - 5, 65, 30, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', rightAlign, finalY, { align: 'right' });
  doc.text(`$${subtotal.toFixed(2)}`, 190, finalY, { align: 'right' });

  doc.text('Tax (8.25%):', rightAlign, finalY + 6, { align: 'right' });
  doc.text(`$${tax.toFixed(2)}`, 190, finalY + 6, { align: 'right' });

  // Draw line above total
  doc.setDrawColor(33, 33, 33);
  doc.setLineWidth(0.5);
  doc.line(135, finalY + 10, 190, finalY + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(229, 57, 53); // Brand red
  doc.text('TOTAL DUE:', rightAlign, finalY + 18, { align: 'right' });
  doc.text(`$${total.toFixed(2)}`, 190, finalY + 18, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // Payment information
  const paymentY = finalY + 32;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 245, 245);
  doc.rect(15, paymentY - 3, 180, 8, 'F');
  doc.text('PAYMENT INFORMATION', 17, paymentY + 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('• Payment is due upon receipt of this invoice.', 17, paymentY + 9);
  doc.text('• We accept: Cash, Check, Visa, Mastercard, Discover, American Express', 17, paymentY + 13);
  doc.text('• Make checks payable to: C.A.R.S Collision & Refinish Shop', 17, paymentY + 17);
  doc.text('• For questions regarding this invoice, please call (832) 844-5458', 17, paymentY + 21);

  // Thank you note
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Thank you for your business!', 17, paymentY + 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('We appreciate the opportunity to serve you and look forward to your next visit.', 17, paymentY + 35);

  // Professional footer
  addCompanyFooter(doc);

  // Save the PDF
  doc.save(`CARS-Invoice-${workOrder.work_order_number}.pdf`);
};

/**
 * Generate work order summary PDF
 * @param {Object} workOrder - Work order data
 * @param {Object} customer - Customer data
 * @param {Object} vehicle - Vehicle data
 */
export const generateWorkOrderSummaryPDF = async (workOrder, customer, vehicle) => {
  const doc = new jsPDF();

  // Add professional header with logo
  await addCompanyHeader(doc, 'WORK ORDER', {
    number: workOrder.work_order_number,
    date: format(new Date(workOrder.created_at), 'MMMM dd, yyyy'),
  });

  // Status badge
  const statusColors = {
    'pending': [251, 191, 36],
    'in-progress': [59, 130, 246],
    'awaiting-parts': [249, 115, 22],
    'ready-for-pickup': [16, 185, 129],
    'completed': [5, 150, 105],
    'cancelled': [239, 68, 68],
  };
  const statusColor = statusColors[workOrder.current_status] || [107, 114, 128];

  doc.setFillColor(...statusColor);
  doc.rect(150, 58, 45, 10, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(workOrder.current_status.toUpperCase().replace(/-/g, ' '), 172.5, 64, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Customer & Vehicle Info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer:', 17, 75);
  doc.setFont('helvetica', 'normal');
  doc.text(`${customer.name} | ${customer.phone} | ${customer.email}`, 45, 75);

  doc.setFont('helvetica', 'bold');
  doc.text('Vehicle:', 17, 82);
  doc.setFont('helvetica', 'normal');
  doc.text(`${vehicle.year} ${vehicle.make} ${vehicle.model} (VIN: ${vehicle.vin})`, 45, 82);

  if (workOrder.estimated_completion_date) {
    doc.setFont('helvetica', 'bold');
    doc.text('Est. Completion:', 17, 89);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(workOrder.estimated_completion_date), 'MMMM dd, yyyy'), 55, 89);
  }

  // Description
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 245, 245);
  doc.rect(15, 97, 180, 8, 'F');
  doc.text('WORK DESCRIPTION', 17, 102);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const description = doc.splitTextToSize(workOrder.description || 'N/A', 170);
  doc.text(description, 17, 110);

  // Footer
  addCompanyFooter(doc);

  // Save
  doc.save(`CARS-WorkOrder-${workOrder.work_order_number}.pdf`);
};
