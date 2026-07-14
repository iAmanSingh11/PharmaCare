const PDFDocument = require('pdfkit');

/*
 * Streams a simple, clean invoice PDF for the given order directly to `res`.
   Kept deliberately plain (no external assets/fonts) so it renders
   identically in any environment without extra setup.
 */
const streamInvoicePdf = (order, res) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(20).fillColor('#1e66f5').text('PharmaCare', { continued: false });
  doc.fontSize(10).fillColor('#64748b').text('Invoice / Order Receipt');
  doc.moveDown(1.5);

  doc.fontSize(12).fillColor('#0f172a').text(`Invoice for Order ${order.orderNumber}`, { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(10).fillColor('#334155');
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleString()}`);
  doc.text(`Status: ${order.status.toUpperCase()}`);
  doc.text(`Payment: ${order.paymentMethod.toUpperCase()} (${order.paymentStatus})`);
  doc.moveDown();

  doc.fontSize(11).fillColor('#0f172a').text('Billed To', { underline: true });
  doc.fontSize(10).fillColor('#334155');
  doc.text(order.customer?.name || 'Customer');
  if (order.customer?.phone) doc.text(order.customer.phone);
  if (order.deliveryAddress?.line1) {
    doc.text(
      `${order.deliveryAddress.line1}, ${order.deliveryAddress.city || ''} ${order.deliveryAddress.pincode || ''}`
    );
  }
  doc.moveDown();

  doc.fontSize(11).fillColor('#0f172a').text('Fulfilled By', { underline: true });
  doc.fontSize(10).fillColor('#334155');
  doc.text(order.chemist?.shopDetails?.shopName || order.chemist?.name || 'Pharmacy');
  doc.moveDown();

  // Items table
  const tableTop = doc.y + 10;
  doc.fontSize(10).fillColor('#0f172a');
  doc.text('Item', 50, tableTop);
  doc.text('Qty', 320, tableTop);
  doc.text('Price', 380, tableTop);
  doc.text('Subtotal', 460, tableTop);
  doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor('#e2e8f0').stroke();

  let y = tableTop + 25;
  doc.fillColor('#334155');
  order.items.forEach((item) => {
    doc.text(item.name, 50, y, { width: 260 });
    doc.text(String(item.quantity), 320, y);
    doc.text(`Rs. ${item.price.toFixed(2)}`, 380, y);
    doc.text(`Rs. ${(item.price * item.quantity).toFixed(2)}`, 460, y);
    y += 20;
  });

  doc.moveTo(50, y + 5).lineTo(545, y + 5).strokeColor('#e2e8f0').stroke();
  y += 20;

  doc.fontSize(10).fillColor('#334155').text('Subtotal', 380, y);
  doc.text(`Rs. ${order.subtotal.toFixed(2)}`, 460, y);
  y += 18;

  if (order.discount) {
    doc.text('Discount', 380, y);
    doc.text(`- Rs. ${order.discount.toFixed(2)}`, 460, y);
    y += 18;
  }

  doc.fontSize(12).fillColor('#0f172a').text('Total', 380, y, { bold: true });
  doc.text(`Rs. ${order.total.toFixed(2)}`, 460, y);

  doc.moveDown(3);
  doc.fontSize(9).fillColor('#94a3b8').text('Thank you for choosing PharmaCare.', 50, doc.y, { align: 'center' });

  doc.end();
};

module.exports = { streamInvoicePdf };
