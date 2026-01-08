// src/components/InvoiceHeaderForm.tsx

import { useFormContext } from 'react-hook-form';
import { Listbox, Transition } from '@headlessui/react';
import DatePicker from 'react-date-picker';
import { Fragment } from 'react';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

export default function InvoiceHeaderForm() {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const paymentMode = watch('paymentMode') || 'Bank Transfer';
  const dateValue = watch('date');

  const modes = ['Bank Transfer', 'Cash', 'Card Payment', 'Not Paid'];

  const handleDateChange = (date: any) => {
    if (!date) {
      setValue('date', '');
      return;
    }
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setValue('date', `${year}-${month}-${day}`);
  };

  return (
    <div className="py-10 border-b border-gray-100">
      <div className="mb-10">
        <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-1">
          Customer & Transaction Details
        </h3>
        <div className="h-1 w-12 bg-black"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
        {/* Customer Name */}
        <div className="relative group">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer Name</label>
          <input
            {...register('customerName', { required: 'Name is required' })}
            placeholder="ENTER FULL NAME"
            className={`w-full bg-transparent border-b-2 py-2 text-lg font-bold outline-none transition-all uppercase ${
              errors.customerName ? 'border-red-600' : 'border-gray-100 focus:border-black'
            }`}
          />
        </div>

        {/* Phone Number */}
        <div className="relative group">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone Number</label>
          <input
            {...register('phoneNumber')}
            type="tel"
            placeholder="+234..."
            className="w-full bg-transparent border-b-2 border-gray-100 focus:border-black py-2 text-lg font-bold outline-none transition-all"
          />
        </div>

        {/* Invoice Number */}
        <div className="relative group">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Invoice No.</label>
          <input
            {...register('invoiceNumber')}
            placeholder="INV-0000"
            className="w-full bg-transparent border-b-2 border-gray-100 focus:border-black py-2 text-lg font-mono font-bold outline-none transition-all uppercase"
          />
        </div>

        {/* Transaction Date */}
        <div className="relative group">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date of Issue</label>
          <div className="premium-datepicker">
            <DatePicker
              onChange={handleDateChange}
              value={dateValue ? new Date(dateValue) : new Date()}
              clearIcon={null}
              calendarIcon={
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              format="y-MM-dd"
              className="w-full"
            />
          </div>
        </div>

        {/* Payment Mode */}
        <div className="relative group">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Mode</label>
          <Listbox value={paymentMode} onChange={(val) => setValue('paymentMode', val)}>
            <div className="relative">
              <Listbox.Button className="w-full text-left bg-transparent border-b-2 border-gray-100 focus:border-black py-2 text-lg font-bold outline-none transition-all flex justify-between items-center">
                <span className="truncate uppercase">{paymentMode}</span>
                <span className="text-[8px] text-red-600">▼</span>
              </Listbox.Button>
              
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Listbox.Options className="absolute mt-2 w-full bg-white border-2 border-black rounded-xl shadow-2xl z-[100] overflow-y-auto max-h-60 outline-none">
                  {modes.map((mode) => (
                    <Listbox.Option
                      key={mode}
                      value={mode}
                      className={({ active, selected }) =>
                        `px-5 py-3 cursor-pointer text-xs font-black uppercase tracking-widest transition-all ${
                          active ? 'bg-black text-white' : selected ? 'text-red-600 bg-gray-50' : 'text-gray-600'
                        }`
                      }
                    >
                      {mode}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
      </div>

      <style>{`
        /* FIX FOR JUMPING UI & SCROLL LOCK */
        /* This prevents Headless UI from injecting styles into the body */
        :root {
          --scrollbar-width: 0px; 
        }

        html, body {
          overflow: auto !important;
          padding-right: 0 !important;
          margin-right: 0 !important;
          height: auto !important;
          position: relative !important;
        }

        /* --- CALENDAR POPUP BRANDING --- */
        .react-calendar {
          border: 2px solid #000 !important;
          border-radius: 1rem !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4) !important;
          padding: 8px !important;
          background: white !important;
          z-index: 1000 !important;
        }

        .react-calendar__tile--active {
          background: #dc2626 !important;
          color: white !important;
          border-radius: 8px !important;
        }

        .react-calendar__tile--now {
          background: #fef2f2 !important;
          color: #dc2626 !important;
          border-radius: 8px !important;
        }

        .react-calendar__navigation button:enabled:hover {
          background-color: #f3f4f6 !important;
          border-radius: 8px !important;
        }

        /* DatePicker Underline */
        .premium-datepicker .react-date-picker__wrapper {
          border: none !important;
          border-bottom: 2px solid #f3f4f6 !important;
          padding-bottom: 8px;
        }
        .premium-datepicker:focus-within .react-date-picker__wrapper {
          border-bottom-color: #000 !important;
        }
      `}</style>
    </div>
  );
}