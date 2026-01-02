import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInvoiceStore } from '../stores/useInvoiceStore'; // Use relative if alias issues persist

const invoiceHeaderSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z
    .string()
    .regex(/^(\+?\d{10,15})$/, 'Enter a valid phone number (e.g., +2349155743615)'),
  invoiceNumber: z
    .string()
    .min(5, 'Invoice number must be at least 5 characters')
    .max(20)
    .regex(/^[A-Z0-9-]+$/, 'Only uppercase letters, numbers, and hyphens allowed'),
  date: z.string().min(1, 'Date is required'),
  paymentMode: z.enum(['Bank Transfer', 'Cash', 'Card Payment', 'Not Paid']),
});

type InvoiceHeaderFormData = z.infer<typeof invoiceHeaderSchema>;

export default function InvoiceHeaderForm() {
  const { setCustomerDetails, setInvoiceMeta, date } = useInvoiceStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvoiceHeaderFormData>({
    resolver: zodResolver(invoiceHeaderSchema),
    defaultValues: {
      date: date,
    },
  });

  const onChange = handleSubmit((data) => {
    setCustomerDetails({
      customerName: data.customerName,
      phoneNumber: data.phoneNumber,
    });
    setInvoiceMeta({
      invoiceNumber: data.invoiceNumber,
      date: data.date,
      paymentMode: data.paymentMode,
    });
  });

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-center mb-8 text-3xl font-medium text-[#041a33]">
        Receipt Details
      </h2>

      <form onChange={onChange} className="space-y-6">
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-10'>  
          <div>
            <label className="block text-sm sm:text-base font-semibold mb-1.5">
              Customer Name:
            </label>
            <input
              {...register('customerName')}
              type="text"
              required
              className="w-full px-3 py-2.5 text-base border border-[#ced4da] rounded-md focus:border-[#50a5ff] focus:outline-none transition"
              placeholder="Enter customer's full name"
            />
            {errors.customerName && (
              <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold mb-1.5">
              Phone Number:
            </label>
            <input
              {...register('phoneNumber')}
              type="text"
              required
              className="w-full px-3 py-2.5 text-base border border-[#ced4da] rounded-md focus:border-[#50a5ff] focus:outline-none transition"
              placeholder="+2349155743615"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold mb-1.5">
              INVOICE NO:
            </label>
            <input
              {...register('invoiceNumber')}
              type="text"
              required
              className="w-full px-3 py-2.5 text-base border border-[#ced4da] rounded-md focus:border-[#50a5ff] focus:outline-none transition uppercase"
              placeholder="INV-001"
            />
            {errors.invoiceNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.invoiceNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold mb-1.5">
              Date:
            </label>
            <input
              {...register('date')}
              type="date"
              required
              className="w-full px-3 py-2.5 text-base border border-[#ced4da] rounded-md focus:border-[#50a5ff] focus:outline-none transition"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold mb-1.5">
              Payment Mode:
            </label>
            <select
              {...register('paymentMode')}
              required
              className="w-full px-3 py-2.5 text-base border border-[#ced4da] rounded-md focus:border-[#50a5ff] focus:outline-none transition"
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Card Payment">Card Payment</option>
              <option value="Not Paid">Not Paid</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}