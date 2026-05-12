import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Plus, Trash, Download, FloppyDisk, ClockCounterClockwise, FilePdf } from '@phosphor-icons/react';

const defaultLogo = '/images/companylogo.jpeg';

const initialQuotationState = {
  id: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  validUntil: format(new Date(new Date().setDate(new Date().getDate() + 30)), 'yyyy-MM-dd'),
  quotationNumber: `QT-${format(new Date(), 'yyyyMMdd')}-001`,
  clientName: '',
  clientAddress: '',
  clientEmail: '',
  clientPhone: '',
  subject: 'Surveying Services Quotation',
  items: [
    { id: uuidv4(), description: 'Topographic & Boundary Survey', quantity: 1, unitType: 'Hectare', unitPrice: 150000, total: 150000 }
  ],
  terms: '1. Quotation valid for 30 days.\n2. 70% advance payment required for mobilization and field work.\n3. 30% balance due upon submission of final survey plans and digital data.\n4. Access to the site must be guaranteed by the client.\n5. Delays due to communal issues or weather may affect delivery timelines.',
  taxRate: 7.5,
  currency: '₦',
  pages: 1,
};

const QuotationBuilder = () => {
  const [quotation, setQuotation] = useState(initialQuotationState);
  const [logoUrl, setLogoUrl] = useState(defaultLogo);
  const [drafts, setDrafts] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const printRef = useRef(null);

  // Load drafts on mount
  useEffect(() => {
    const savedDrafts = localStorage.getItem('quotationDrafts');
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    }
  }, []);

  // Update item totals
  useEffect(() => {
    const updatedItems = quotation.items.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice
    }));
    
    // Only update if totals changed to prevent infinite loop
    const hasChanges = updatedItems.some((item, index) => item.total !== quotation.items[index].total);
    if (hasChanges) {
      setQuotation(prev => ({ ...prev, items: updatedItems }));
    }
  }, [quotation.items]);

  const handleInputChange = (e, field, itemId = null) => {
    const { value } = e.target;
    
    if (itemId) {
      setQuotation(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === itemId ? { ...item, [field]: value } : item
        )
      }));
    } else {
      setQuotation(prev => ({ ...prev, [field]: value }));
    }
  };

  const addItem = () => {
    setQuotation(prev => ({
      ...prev,
      items: [...prev.items, { id: uuidv4(), description: '', quantity: 1, unitType: 'Unit', unitPrice: 0, total: 0 }]
    }));
  };

  const removeItem = (id) => {
    setQuotation(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setLogoUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const saveDraft = () => {
    const currentDraft = { ...quotation, id: quotation.id || uuidv4(), savedAt: new Date().toISOString() };
    const updatedDrafts = [currentDraft, ...drafts.filter(d => d.id !== currentDraft.id)].slice(0, 10);
    setDrafts(updatedDrafts);
    localStorage.setItem('quotationDrafts', JSON.stringify(updatedDrafts));
    setQuotation(currentDraft);
    alert('Draft saved successfully!');
  };

  const loadDraft = (draft) => {
    setQuotation(draft);
    setShowHistory(false);
  };

  const deleteDraft = (id) => {
    const updatedDrafts = drafts.filter(d => d.id !== id);
    setDrafts(updatedDrafts);
    localStorage.setItem('quotationDrafts', JSON.stringify(updatedDrafts));
  };

  const calculateSubtotal = () => {
    return quotation.items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (quotation.taxRate / 100);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const generatePDF = async () => {
    if (!printRef.current) return;

    // We will render the document multiple times or slice it if multiple pages are requested.
    // For a simple implementation, we generate the full canvas, then split it into pages.
    const element = printRef.current;
    
    // Temporarily apply printing styles to the element
    element.classList.add('pdf-mode');
    
    // Hide scrollbars and fix width for consistent rendering
    const originalWidth = element.style.width;
    const originalHeight = element.style.height;
    element.style.width = '800px'; // Standard A4 width proportion
    element.style.height = 'auto';

    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      windowWidth: 800
    });
    
    element.style.width = originalWidth;
    element.style.height = originalHeight;
    element.classList.remove('pdf-mode');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Actual height of the rendered image mapped to PDF width
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Calculate how many pages we actually need based on content, or use requested pages
    const totalPagesToGenerate = Math.max(quotation.pages, Math.ceil(heightLeft / pdfHeight));

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Subsequent pages
    for (let i = 1; i < totalPagesToGenerate; i++) {
      if (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      } else if (i < quotation.pages) {
        // Just add empty pages if the user requested more pages than content
        pdf.addPage();
      }
    }

    // Add page numbers
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text(`Page ${i} of ${pageCount}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
    }

    pdf.save(`${quotation.quotationNumber}.pdf`);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quotation Generator</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ClockCounterClockwise className="mr-2 h-5 w-5" />
              History
            </button>
            <button
              onClick={saveDraft}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FloppyDisk className="mr-2 h-5 w-5" />
              Save Draft
            </button>
            <button
              onClick={generatePDF}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-md shadow-sm text-sm font-medium hover:bg-primary/90"
            >
              <Download className="mr-2 h-5 w-5" />
              Generate PDF
            </button>
          </div>
        </div>

        {showHistory && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-xl font-bold mb-4">Saved Drafts</h2>
            {drafts.length === 0 ? (
              <p className="text-gray-500">No saved drafts yet.</p>
            ) : (
              <div className="space-y-4">
                {drafts.map(draft => (
                  <div key={draft.id} className="flex justify-between items-center p-4 border rounded-md hover:bg-gray-50">
                    <div>
                      <p className="font-semibold">{draft.quotationNumber} - {draft.clientName || 'Unnamed Client'}</p>
                      <p className="text-sm text-gray-500">Saved: {new Date(draft.savedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => loadDraft(draft)} className="text-primary hover:text-primary/80 font-medium text-sm">Load</button>
                      <button onClick={() => deleteDraft(draft.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <h2 className="text-lg font-bold border-b pb-2">Document Settings</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Number</label>
                <input 
                  type="text" 
                  value={quotation.quotationNumber}
                  onChange={(e) => handleInputChange(e, 'quotationNumber')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={quotation.date}
                    onChange={(e) => handleInputChange(e, 'date')}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                  <input 
                    type="date" 
                    value={quotation.validUntil}
                    onChange={(e) => handleInputChange(e, 'validUntil')}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select 
                    value={quotation.currency}
                    onChange={(e) => handleInputChange(e, 'currency')}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  >
                    <option value="₦">NGN (₦)</option>
                    <option value="$">USD ($)</option>
                    <option value="€">EUR (€)</option>
                    <option value="£">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input 
                    type="number" 
                    value={quotation.taxRate}
                    onChange={(e) => handleInputChange(e, 'taxRate')}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Pages</label>
                <input 
                  type="number" 
                  min="1"
                  max="10"
                  value={quotation.pages}
                  onChange={(e) => handleInputChange(e, 'pages')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  title="Specify exact number of pages for the quotation document"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <h2 className="text-lg font-bold border-b pb-2">Client Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input 
                  type="text" 
                  value={quotation.clientName}
                  onChange={(e) => handleInputChange(e, 'clientName')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea 
                  value={quotation.clientAddress}
                  onChange={(e) => handleInputChange(e, 'clientAddress')}
                  rows="2"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={quotation.clientEmail}
                    onChange={(e) => handleInputChange(e, 'clientEmail')}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={quotation.clientPhone}
                    onChange={(e) => handleInputChange(e, 'clientPhone')}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-lg shadow-lg overflow-x-auto min-h-[800px]" ref={printRef}>
              <style>{`
                .pdf-mode { padding: 40px !important; }
                .pdf-mode input, .pdf-mode textarea { border-color: transparent !important; background: transparent !important; resize: none; overflow: hidden; }
                .pdf-mode .hide-on-print { display: none !important; }
              `}</style>
              
              {/* Header */}
              <div className="flex justify-between items-start mb-12 border-b pb-8">
                <div>
                  {logoUrl && <img src={logoUrl} alt="Company Logo" className="h-20 object-contain mb-4" />}
                  <div className="text-sm text-gray-600">
                    <h3 className="font-bold text-gray-900 text-lg">Sourceline Limited</h3>
                    <p>Lekki-Epe Expressway</p>
                    <p>Lagos, Nigeria</p>
                    <p>info@sourcelineng.com | +234 (0) 800 000 0000</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-4xl font-light text-primary mb-4 uppercase tracking-wider">Quotation</h2>
                  <div className="text-sm">
                    <p><span className="font-bold text-gray-700">Quotation No:</span> {quotation.quotationNumber}</p>
                    <p><span className="font-bold text-gray-700">Date:</span> {quotation.date}</p>
                    <p><span className="font-bold text-gray-700">Valid Until:</span> {quotation.validUntil}</p>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-900 border-b pb-2 mb-3">QUOTATION FOR:</h3>
                <div className="text-sm text-gray-800">
                  {quotation.clientName && <p className="font-bold text-lg">{quotation.clientName}</p>}
                  {quotation.clientAddress && <p className="whitespace-pre-line">{quotation.clientAddress}</p>}
                  {quotation.clientEmail && <p>{quotation.clientEmail}</p>}
                  {quotation.clientPhone && <p>{quotation.clientPhone}</p>}
                  {(!quotation.clientName && !quotation.clientAddress) && (
                    <p className="text-gray-400 italic">Client details will appear here</p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-900 mb-1">PROJECT / SUBJECT:</label>
                <input 
                  type="text" 
                  value={quotation.subject}
                  onChange={(e) => handleInputChange(e, 'subject')}
                  className="w-full text-lg border-b border-gray-300 focus:border-primary focus:ring-0 px-0 py-1"
                  placeholder="Enter project subject..."
                />
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="py-3 px-4 font-bold text-gray-700 text-sm">Service Description</th>
                      <th className="py-3 px-4 font-bold text-gray-700 text-sm w-24 text-center">Unit</th>
                      <th className="py-3 px-4 font-bold text-gray-700 text-sm w-24 text-center">Qty</th>
                      <th className="py-3 px-4 font-bold text-gray-700 text-sm w-32 text-right">Unit Price</th>
                      <th className="py-3 px-4 font-bold text-gray-700 text-sm w-32 text-right">Total</th>
                      <th className="py-3 px-2 w-10 hide-on-print"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.items.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 px-4">
                          <textarea 
                            value={item.description}
                            onChange={(e) => handleInputChange(e, 'description', item.id)}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm resize-none h-10"
                            placeholder="Service description..."
                          />
                        </td>
                        <td className="py-2 px-4 text-center">
                          <select 
                            value={item.unitType || 'Unit'}
                            onChange={(e) => handleInputChange(e, 'unitType', item.id)}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm text-center appearance-none cursor-pointer"
                          >
                            <option value="Hectare">Hectare</option>
                            <option value="Acre">Acre</option>
                            <option value="Plot">Plot</option>
                            <option value="Pillar">Pillar</option>
                            <option value="Km">Km</option>
                            <option value="Item">Item</option>
                            <option value="Unit">Unit</option>
                            <option value="Sum">Sum</option>
                            <option value="Day">Day</option>
                          </select>
                        </td>
                        <td className="py-2 px-4 text-center">
                          <input 
                            type="number" 
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleInputChange(e, 'quantity', item.id)}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm text-center"
                          />
                        </td>
                        <td className="py-2 px-4 text-right">
                          <div className="flex items-center justify-end">
                            <span className="text-gray-500 mr-1">{quotation.currency}</span>
                            <input 
                              type="number" 
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handleInputChange(e, 'unitPrice', item.id)}
                              className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm text-right"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-4 text-right font-medium text-gray-900">
                          {quotation.currency}{item.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                        <td className="py-2 px-2 hide-on-print text-center">
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            disabled={quotation.items.length === 1}
                          >
                            <Trash size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hide-on-print gap-4">
                  <button 
                    onClick={addItem}
                    className="flex items-center text-sm font-medium text-primary hover:text-primary/80"
                  >
                    <Plus className="mr-1" size={16} /> Add Custom Item
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Quick Add:</span>
                    <select 
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const [desc, price, qty, unitType] = e.target.value.split('|');
                        setQuotation(prev => ({
                          ...prev,
                          items: [...prev.items, { 
                            id: uuidv4(), 
                            description: desc, 
                            quantity: Number(qty), 
                            unitType: unitType || 'Unit',
                            unitPrice: Number(price), 
                            total: Number(qty) * Number(price) 
                          }]
                        }));
                        e.target.value = ''; // reset
                      }}
                      className="text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      defaultValue=""
                    >
                      <option value="" disabled>Select Surveying Preset</option>
                      <option value="Topographic Survey (per Hectare)|150000|1|Hectare">Topographic Survey</option>
                      <option value="Boundary & Perimeter Survey|250000|1|Hectare">Boundary Survey</option>
                      <option value="Processing of Surveyor General's Consent|300000|1|Item">Processing of Consent</option>
                      <option value="Instrument Mobilization & Logistics|50000|1|Sum">Mobilization</option>
                      <option value="Beacon Planting (per pillar)|10000|4|Pillar">Beacon Planting</option>
                      <option value="Professional Fees / Field Data Collection|100000|1|Sum">Professional Fees</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-12">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Subtotal:</span>
                    <span>{quotation.currency}{calculateSubtotal().toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  {quotation.taxRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Tax ({quotation.taxRate}%):</span>
                      <span>{quotation.currency}{calculateTax().toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t-2 border-gray-900 pt-3 text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span>{quotation.currency}{calculateGrandTotal().toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mt-16 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-2">TERMS & CONDITIONS</h3>
                <textarea 
                  value={quotation.terms}
                  onChange={(e) => handleInputChange(e, 'terms')}
                  rows="4"
                  className="w-full text-xs text-gray-600 bg-transparent border border-transparent focus:border-gray-300 rounded p-2"
                />
              </div>

              {/* Footer */}
              <div className="mt-16 text-center text-xs text-gray-400 hide-on-print">
                <p>This is a preview. The final PDF will be paginated and properly formatted.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationBuilder;
