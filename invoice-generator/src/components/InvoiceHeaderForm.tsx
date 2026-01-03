// src/components/InvoiceHeaderForm.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInvoiceStore } from '../stores/useInvoiceStore';
import { Listbox } from '@headlessui/react';
import { useEffect, useState } from 'react';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

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

const paymentModes = [
  'Bank Transfer',
  'Cash',
  'Card Payment',
  'Not Paid',
] as const;

export default function InvoiceHeaderForm() {
  const { setCustomerDetails, setInvoiceMeta } = useInvoiceStore();

  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'Bank Transfer' | 'Cash' | 'Card Payment' | 'Not Paid'>('Cash');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Define today inside the component
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<InvoiceHeaderFormData>({
    resolver: zodResolver(invoiceHeaderSchema),
    defaultValues: {
      date: today,
      paymentMode: 'Cash',
    },
  });

  // Sync all fields to store on change
  const onChange = handleSubmit((data) => {
    setCustomerDetails({
      customerName: data.customerName ?? '',
      phoneNumber: data.phoneNumber ?? '',
    });
    setInvoiceMeta({
      invoiceNumber: data.invoiceNumber ?? '',
      date: data.date ?? today,
      paymentMode: data.paymentMode ?? 'Cash',
    });
  });

  // Sync payment mode from Listbox
  useEffect(() => {
    setInvoiceMeta((prev) => ({
      ...prev,
      paymentMode: selectedPaymentMode,
    }));
  }, [selectedPaymentMode, setInvoiceMeta]);

  // Handle date change from react-date-picker
  const handleDateChange = (value: Date | null) => {
    if (value instanceof Date && !isNaN(value.getTime())) {
      setSelectedDate(value);
      const formatted = value.toISOString().split('T')[0];
      setValue('date', formatted, { shouldValidate: true });
      setInvoiceMeta((prev) => ({ ...prev, date: formatted }));
    } else {
      // Fallback if cleared
      setValue('date', today, { shouldValidate: true });
      setInvoiceMeta((prev) => ({ ...prev, date: today }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-center mb-8 text-3xl font-medium text-[#041a33]">
        Receipt Details
      </h2>

      <form onChange={onChange} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {/* Customer Name */}
          <div>
            <label className="block text-base sm:text-lg font-bold text-[#022142] mb-2">
              Customer Name:
            </label>
            <input
              {...register('customerName')}
              type="text"
              required
              className="w-full px-5 py-4 text-base sm:text-lg bg-white border-2 border-[#ced4da] rounded-xl focus:border-[#022142] focus:outline-none transition"
              placeholder="Enter customer's full name"
            />
            {errors.customerName && (
              <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-base sm:text-lg font-bold text-[#022142] mb-2">
              Phone Number:
            </label>
            <input
              {...register('phoneNumber')}
              type="text"
              required
              className="w-full px-5 py-4 text-base sm:text-lg bg-white border-2 border-[#ced4da] rounded-xl focus:border-[#022142] focus:outline-none transition"
              placeholder="+2349155743615"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Invoice Number */}
          <div>
            <label className="block text-base sm:text-lg font-bold text-[#022142] mb-2">
              INVOICE NO:
            </label>
            <input
              {...register('invoiceNumber')}
              type="text"
              required
              className="w-full px-5 py-4 text-base sm:text-lg bg-white border-2 border-[#ced4da] rounded-xl focus:border-[#022142] focus:outline-none transition uppercase"
              placeholder="INV-001"
            />
            {errors.invoiceNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.invoiceNumber.message}</p>
            )}
          </div>

          {/* Date - react-date-picker */}
          <div>
            <label className="block text-base sm:text-lg font-bold text-[#022142] mb-2">
              Date:
            </label>
            <DatePicker
              onChange={handleDateChange}
              value={selectedDate}
              format="dd/MM/yyyy"
              clearIcon={null}
              calendarIcon={
                <svg className="w-6 h-6 text-[#022142]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              className="w-full custom-datepicker"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          {/* Payment Mode - Headless UI Listbox */}
          <div>
            <label className="block text-base sm:text-lg font-bold text-[#022142] mb-2">
              Payment Mode:
            </label>

            <Listbox value={selectedPaymentMode} onChange={setSelectedPaymentMode}>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white px-5 py-4 pr-12 text-left text-base sm:text-lg border-2 border-[#ced4da] focus:border-[#022142] focus:outline-none focus:ring-4 focus:ring-[#022142]/20 transition-all duration-200 hover:border-[#022142]/70">
                  <span className="block truncate">{selectedPaymentMode}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5">
                    <svg className="h-6 w-6 text-[#022142]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </Listbox.Button>

                <Listbox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white py-2 text-base shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  {paymentModes.map((mode) => (
                    <Listbox.Option
                      key={mode}
                      value={mode}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-3 pl-10 pr-4 transition-all ${
                          active ? 'bg-[#022142] text-white' : 'text-gray-900'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                            {mode}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">
                              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        </div>
      </form>
    </div>
  );
}