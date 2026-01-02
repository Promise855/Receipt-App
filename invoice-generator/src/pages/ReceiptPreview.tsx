import { useEffect, useState } from 'react';
import { numberToWords } from '../utils';

type ReceiptData = {
  customerName: string;
  phoneNumber: string;
  invoiceNumber: string;
  date: string;
  paymentMode: string;
  items: Array<{
    id: string;
    sn: number;
    name: string;
    description: string;
    details: {
      itemSN?: string;
      itemMN?: string;
      itemIMEI?: string;
    };
    qty: number;
    unitPrice: number;
    discount: number;
    amount: number;
  }>;
  itemQty: number;
  subTotal: number;
  total: number;
  amountInWords: string;
};

export default function ReceiptPreview() {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  useEffect(() => {
    // Try to get from localStorage (fallback)
    const data = localStorage.getItem('currentReceipt');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setReceipt(parsed);
        localStorage.removeItem('currentReceipt');
      } catch (e) {
        console.error('Failed to parse receipt data');
      }
    }
  }, []);

  // Safe auto-print: only after receipt is loaded
  useEffect(() => {
    if (!receipt) return; // Do nothing if no data yet

    const printTimer = setTimeout(() => {
      window.print();
    }, 2000); // 2 seconds delay for smooth rendering

    return () => {
      clearTimeout(printTimer);
    };
  }, [receipt]); // Triggers only when receipt becomes available

  // Loading state
  if (!receipt) {
    return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-spin">⚡</div>
        <h2 className="text-2xl font-bold text-[#022142] mb-4">Generating Receipt...</h2>
        <p className="text-gray-600">Please wait while we prepare your receipt.</p>
      </div>
    </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 print:p-4 print:max-w-full print:bg-white">
      {/* Success Toast */}
      <div className="print:hidden fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-xl shadow-2xl z-50 animate-toast">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <strong className="text-lg">Receipt Generated Successfully!</strong>
            <p className="text-sm opacity-90">
              Invoice #{receipt.invoiceNumber} • ₦{receipt.total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
      <div className="text-center mb-8">
        <img 
            src="/img/Octa-logo.png" 
            alt="Octavian Dynamics Logo" 
            className="mx-auto mb-4 w-80" 
        />
        <p className="text-sm font-bold mt-2">
          17 Chief Benjamin Wopara Plaza, Ogbum Nagbali, Eastern Bypass, Port Harcourt, Rivers State.
        </p>
        <p className="text-sm font-bold">
          <a href="https://wa.me/+2349155743615" className="text-[#041d4b]">+234 915 574 3615</a> | octaviandynamics@gmail.com
        </p>
      </div>

      {/* Invoice Info */}
      <div className="flex justify-between mb-8">
        <div>
          <p>Name: <strong>{receipt.customerName}</strong></p>
          <p>Phone: <strong>{receipt.phoneNumber}</strong></p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">INVOICE NO: <span className="text-red-700">{receipt.invoiceNumber}</span></h2>
          <p>Date: <strong>{receipt.date}</strong></p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black px-2 py-1 text-center">S/N</th>
            <th className="border border-black px-2 py-1 text-center">Name</th>
            <th className="border border-black px-2 py-1 text-center">Description</th>
            <th className="border border-black px-2 py-1 text-center">Item Details</th>
            <th className="border border-black px-2 py-1 text-center">Qty</th>
            <th className="border border-black px-2 py-1 text-center">Unit Price</th>
            <th className="border border-black px-2 py-1 text-center">Discount</th>
            <th className="border border-black px-2 py-1 text-center">Amount</th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((item: any) => (
            <tr key={item.id}>
              <td className="border border-black px-2 py-1 text-center">{item.sn}</td>
              <td className="border border-black px-2 py-1">{item.name}</td>
              <td className="border border-black px-2 py-1">{item.description}</td>
              <td className="border border-black px-2 py-1 text-xs">
                {item.details.itemSN && <div><strong>S/N:</strong> {item.details.itemSN}</div>}
                {item.details.itemMN && <div><strong>M/N:</strong> {item.details.itemMN}</div>}
                {item.details.itemIMEI && <div><strong>IMEI:</strong>   {item.details.itemIMEI}</div>}
                {!item.details.itemSN && !item.details.itemMN && !item.details.itemIMEI && '-'}
              </td>
              <td className="border border-black px-2 py-1 text-center">{item.qty}</td>
              <td className="border border-black px-2 py-1 text-right">{item.unitPrice.toLocaleString()}</td>
              <td className="border border-black px-2 py-1 text-center">{item.discount}%</td>
              <td className="border border-black px-2 py-1 text-right">{item.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="text-right mb-8">
        <p className="text-md">Item-Qty: <strong>{receipt.itemQty}</strong></p>
        <p className="text-md">Sub Total: <strong>₦{receipt.subTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</strong></p>
        <p className="text-xl font-bold text-[#021f3d]">Total: ₦{receipt.total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
        <p className="mt-4 italic">Amount in Words: <strong>{receipt.amountInWords || numberToWords(receipt.total)}</strong></p>
      </div>

      {/* Terms & Conditions */}
      <div className="mt-16 page-break-before">
        <h1 className="text-xl font-bold text-center uppercase mb-6">Terms & Conditions</h1>
        <p className="text-sm mb-4">
          New devices procured from OCTAVIAN DYNAMICS ENTERPRISES LTD fall under standard manufacturers warranty & conditions and are redeemable at manufacturer’s warranty/service centres in Nigeria.
        </p>
        <ol className="text-sm list-roman pl-8 space-y-3">
          <li><strong>i.</strong> All product and after-sales issues should be forwarded to manufacturers’ warranty centres for new devices or OCTAVIAN DYNAMICS ENTERPRISES LTD after-sales department for pre-owned devices.</li>
          <li><strong>ii.</strong> Ensure you retain the original packaging of the gadget as well as the customer pickup document as you will be required to produce these for warranty or exchange purposes.</li>
          <li><strong>iii.</strong> Prior to utilizing your device/gadget, it is advisable to first charge the battery for a given time period stipulated by the manufacturer. This will elongate the battery life.</li>
          <li><strong>iv.</strong> Warranty provided by the manufacturer does not cover non-mechanical, physical damage or liquid caused by negligent use of the device/gadget.</li>
          <li><strong>v.</strong> In the event that your device has a manufacturer fault and this is identified at the place and time of purchase, the devices can be returned for replacement.</li>
          <li><strong>vi.</strong> Unless otherwise stated, manufacturer warranty cover over 1 (1) year for new devices and battery utilized in conjunction with the device has a warranty cover of 6 months (depending on make and model) from date of purchase. Warranty provision can be found on the reverse of the invoice. By signing this document you acknowledge that you read and understood the terms and conditions on the reverse of the invoice and you accept them.</li>
          <li><strong>vii.</strong> OCTAVIAN DYNAMICS ENTERPRISES LTD offers 14days warranty on all UK used devices.</li>
          <li><strong>viii.</strong> Should you experience any problem with your devices you may either take it to the manufacturers closest technical service center or OCTAVIAN DYNAMICS ENTERPRISES LTD repair outlet for used devices.</li>
        </ol>
        <p className="mt-12 text-center font-bold italic text-sm">Our Partner in Tech Excellence</p>
        <p className="text-center font-bold italic text-sm">Thank you for contributing to the future!</p>
      </div>
      <div className="text-center mt-8 print:hidden">
      <button
        onClick={() => window.print()}
        className="px-8 py-3 bg-[#022142] text-white rounded-lg hover:bg-[#053f7c] transition shadow-md"
      >
        🖨️ Print Receipt
      </button>
    </div>
    </div>
  );
}