import { useInvoiceStore } from '../stores/useInvoiceStore';

export default function TotalsSection() {
  const { itemQty, subTotal, total, amountInWords } = useInvoiceStore();

  return (
    <div id="totals" className="mt-10 text-right text-sm sm:text-base">
      <p className=" font-semibold">
        Item-Qty: <span className="ml-4">{itemQty}</span>
      </p>
      <p className=" font-semibold">
        Sub Total: <span className="ml-4">₦{subTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
      </p>
      <p className="text-lg sm:text-xl font-bold text-[#022142] mt-2">
        Total: <span className="ml-4">₦{total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
      </p>
      <p className="mt-4 text-xs sm:text-sm italic text-gray-700 max-w-full sm:max-w-2xl ml-auto">
        Amount In Words: <span className="font-medium">{amountInWords || 'Zero Naira Only'}</span>
      </p>
    </div>
  );
}