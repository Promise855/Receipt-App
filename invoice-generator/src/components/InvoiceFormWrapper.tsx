// src/components/InvoiceFormWrapper.tsx

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import InvoiceHeaderForm from './InvoiceHeaderForm';
import ActionBar from './ActionBar';

const schema = z.object({
  customerName: z.string().min(2),
  phoneNumber: z.string().optional(),
  invoiceNumber: z.string().min(5),
  date: z.string(),
  paymentMode: z.enum(['Bank Transfer', 'Cash', 'Card Payment', 'Not Paid']),
});

export default function InvoiceFormWrapper() {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: '',
      phoneNumber: '',
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      paymentMode: 'Cash',
    },
  });

  return (
    <FormProvider {...methods}>
      <InvoiceHeaderForm />
      <ActionBar />
    </FormProvider>
  );
}