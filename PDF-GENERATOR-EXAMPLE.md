# 📄 Professional PDF Generator - Usage Guide

## ✨ What's New

The PDF generator has been completely upgraded with:

- ✅ **Company Logo** at the top left (40x40px)
- ✅ **Professional Header** with company name "C.A.R.S" in large bold text
- ✅ **Brand Colors** - Dark gray text with red accents
- ✅ **Decorative Line** under header in brand red
- ✅ **Professional Footer** with tagline and contact info
- ✅ **Enhanced Layout** with gray section backgrounds
- ✅ **Better Typography** with proper sizing and hierarchy
- ✅ **Labor Cost Support** in invoices (optional parameter)

---

## 📋 How to Use

### Example 1: Generate Estimate PDF

```jsx
import { generateEstimatePDF } from '../utils/pdfGenerator';

// Example button in your component
<button
  onClick={() => generateEstimatePDF(workOrder, customer, vehicle, parts)}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  Download Estimate
</button>
```

**What the PDF includes:**
- Company logo and branding header
- Customer information (name, phone, email, address)
- Vehicle details (year, make, model, VIN, license plate, color)
- Scope of work description
- Parts breakdown table
- Parts subtotal + labor estimate (TBD)
- Terms & conditions
- Professional footer

**Generated filename:** `CARS-Estimate-WO12345.pdf`

---

### Example 2: Generate Invoice PDF

```jsx
import { generateInvoicePDF } from '../utils/pdfGenerator';

// Example button with labor cost
<button
  onClick={() => {
    const laborCost = 450.00; // Labor charges
    generateInvoicePDF(workOrder, customer, vehicle, parts, laborCost);
  }}
  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
>
  Download Invoice
</button>
```

**What the PDF includes:**
- Company logo and branding header
- "DUE" stamp in red (or "PAID" - can be customized)
- Bill To section with customer details
- Vehicle information
- Work performed description
- Parts AND labor table (if labor cost provided)
- Subtotal, Tax (8.25% TX), and TOTAL DUE
- Payment information section
- Thank you note
- Professional footer

**Parameters:**
- `workOrder` - Work order object
- `customer` - Customer object
- `vehicle` - Vehicle object
- `parts` - Array of parts
- `laborCost` - (Optional) Labor charges in dollars (default: 0)

**Generated filename:** `CARS-Invoice-WO12345.pdf`

---

### Example 3: Generate Work Order Summary

```jsx
import { generateWorkOrderSummaryPDF } from '../utils/pdfGenerator';

// Example button
<button
  onClick={() => generateWorkOrderSummaryPDF(workOrder, customer, vehicle)}
  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
>
  Download Work Order Summary
</button>
```

**What the PDF includes:**
- Company logo and branding header
- Color-coded status badge
- Customer & vehicle summary line
- Estimated completion date
- Work description
- Professional footer

**Generated filename:** `CARS-WorkOrder-WO12345.pdf`

---

## 🎨 Visual Layout

### Header Section (All PDFs)
```
┌─────────────────────────────────────────────────────────┐
│  [LOGO]  C.A.R.S                       ESTIMATE         │
│  (40x40) Collision & Refinish Shop     #: WO12345       │
│          Spring, TX 77388              Date: Nov 24     │
│          (832) 844-5458                                  │
│─────────────────────────────────────────────────────────│
```

### Footer Section (All PDFs)
```
│─────────────────────────────────────────────────────────│
│  Thank you for choosing C.A.R.S Collision & Refinish!   │
│  Quality Repairs • Professional Service • Satisfaction   │
│  (832) 844-5458 • Spring, TX 77388                       │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Complete Integration Example

Here's a complete example in a work order details page:

```jsx
import React from 'react';
import { generateEstimatePDF, generateInvoicePDF } from '../utils/pdfGenerator';
import { Download } from 'lucide-react';

const WorkOrderDetailsPage = ({ workOrder, customer, vehicle, parts }) => {
  const handleDownloadEstimate = async () => {
    await generateEstimatePDF(workOrder, customer, vehicle, parts);
  };

  const handleDownloadInvoice = async () => {
    // Calculate labor or get from database
    const laborCost = 550.00; // Example: $550 in labor

    await generateInvoicePDF(workOrder, customer, vehicle, parts, laborCost);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Work Order #{workOrder.work_order_number}
      </h1>

      {/* PDF Download Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleDownloadEstimate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download size={20} />
          Download Estimate
        </button>

        {workOrder.current_status === 'completed' && (
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            Download Invoice
          </button>
        )}
      </div>

      {/* Rest of your component */}
    </div>
  );
};

export default WorkOrderDetailsPage;
```

---

## 📊 Data Structure Required

### Work Order Object
```javascript
{
  id: "uuid",
  work_order_number: "WO12345",
  description: "Front bumper replacement and paint",
  current_status: "completed",
  estimated_completion_date: "2025-12-01T00:00:00Z",
  created_at: "2025-11-20T00:00:00Z",
  updated_at: "2025-11-24T00:00:00Z"
}
```

### Customer Object
```javascript
{
  name: "John Smith",
  phone: "(832) 555-1234",
  email: "john.smith@example.com",
  address: "123 Main St, Spring, TX 77388" // Optional
}
```

### Vehicle Object
```javascript
{
  year: 2020,
  make: "Honda",
  model: "Civic",
  vin: "1HGBH41JXMN109186",
  license_plate: "ABC123",
  color: "Silver" // Optional
}
```

### Parts Array
```javascript
[
  {
    part_number: "BP-001",
    description: "Front Bumper Cover",
    quantity: 1,
    unit_price: 450.00
  },
  {
    part_number: "PT-050",
    description: "Paint (Silver Metallic)",
    quantity: 2,
    unit_price: 85.00
  }
]
```

---

## 🔧 Customization Options

### Change Logo
Replace `/public/logo.png` with your own logo (recommended size: 200x200px)

### Change Company Info
Edit in `src/utils/pdfGenerator.js`:
```javascript
doc.text('C.A.R.S', 60, 20); // Line 38
doc.text('Collision & Refinish Shop', 60, 28); // Line 43
doc.text('Spring, TX 77388', 60, 35); // Line 47
doc.text('Phone: (832) 844-5458', 60, 40); // Line 48
doc.text('Email: info@carsautobody.com', 60, 45); // Line 49
```

### Change Tax Rate
Edit in `src/utils/pdfGenerator.js`:
```javascript
const taxRate = 0.0825; // Line 360 - Change to your state's tax rate
```

### Change Brand Colors
```javascript
// Header line color
doc.setDrawColor(229, 57, 53); // Line 72 - Brand red

// Document type color
doc.setTextColor(229, 57, 53); // Line 54 - Brand red
```

---

## ✅ Features Summary

### Estimate PDF
- Professional header with logo
- Customer billing information
- Vehicle details with color
- Scope of work section
- Parts breakdown table
- Labor estimate (TBD)
- Terms & conditions
- Professional footer
- **No tax** (estimate only)

### Invoice PDF
- Professional header with logo
- "DUE" stamp (customizable to "PAID")
- Customer billing information
- Vehicle details with color
- Work performed section
- Parts + Labor table
- Subtotal, Tax (8.25%), Total Due
- Payment information
- Thank you message
- Professional footer

### Work Order Summary
- Professional header with logo
- Color-coded status badge
- Customer & vehicle one-liner
- Estimated completion date
- Work description
- Professional footer
- Minimal design for quick reference

---

## 🎯 Pro Tips

1. **Always await** the functions since they load the logo asynchronously:
   ```javascript
   await generateEstimatePDF(...);
   ```

2. **Add loading state** while PDF generates:
   ```javascript
   const [generating, setGenerating] = useState(false);

   const handleDownload = async () => {
     setGenerating(true);
     await generateEstimatePDF(workOrder, customer, vehicle, parts);
     setGenerating(false);
   };
   ```

3. **Error handling**:
   ```javascript
   try {
     await generateInvoicePDF(workOrder, customer, vehicle, parts, laborCost);
   } catch (error) {
     console.error('Failed to generate PDF:', error);
     alert('Failed to generate PDF. Please try again.');
   }
   ```

4. **Validate data** before generating:
   ```javascript
   if (!workOrder || !customer || !vehicle || !parts?.length) {
     alert('Missing required data for PDF generation');
     return;
   }
   ```

---

## 📱 Mobile Compatibility

PDFs are generated client-side and work on:
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Tablets

The download will trigger automatically on all devices.

---

## 🚀 Next Steps

1. Add the download buttons to your work order details page
2. Test with real data
3. Customize the company info and logo if needed
4. Consider adding a "Preview" button that opens PDF in new tab:
   ```javascript
   // Instead of saving, open in new window
   const pdfBlob = doc.output('blob');
   const pdfUrl = URL.createObjectURL(pdfBlob);
   window.open(pdfUrl, '_blank');
   ```

---

**Your PDFs now look professional and include your branding! 🎉**
