import React, { useRef } from 'react';
import { X, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  language?: string;
}

export function ReceiptModal({ transaction, onClose, language = 'en' }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!transaction) return null;

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_${transaction.id}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-earth-50 dark:bg-earth-900/20">
          <div>
            <h2 className="text-xl font-black text-foreground">Digital Receipt</h2>
            <p className="text-sm font-semibold text-earth-500">Transaction ID: {transaction.id}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-earth-200 dark:hover:bg-earth-800 text-earth-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="overflow-y-auto p-6 bg-earth-100 dark:bg-earth-900/10">
          <div 
            ref={receiptRef} 
            className="bg-white dark:bg-black rounded-2xl p-8 border border-border shadow-sm flex flex-col gap-6"
          >
            {/* Branding & Status */}
            <div className="flex items-start justify-between border-b border-border pb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-black text-xl">
                  A
                </div>
                <div>
                  <h3 className="font-black text-lg leading-tight text-foreground">AgroMart</h3>
                  <p className="text-xs font-semibold text-earth-500 tracking-widest uppercase">Verified Trade</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase">
                  <CheckCircle className="w-3.5 h-3.5" /> Completed
                </span>
                <span className="text-xs font-semibold text-earth-500">
                  {new Date(transaction.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-earth-50 dark:bg-earth-900/20 border border-border">
                <span className="text-[10px] font-black uppercase text-earth-500 tracking-wider">Farmer (Seller)</span>
                <span className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                  {transaction.farmerName}
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-earth-500 break-all">ID: {transaction.farmerId}</span>
              </div>
              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-earth-50 dark:bg-earth-900/20 border border-border">
                <span className="text-[10px] font-black uppercase text-earth-500 tracking-wider">Buyer</span>
                <span className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                  {transaction.buyerName}
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-earth-500 break-all">ID: {transaction.buyerId}</span>
              </div>
            </div>

            {/* Crop Details */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-black uppercase text-earth-500 tracking-wider border-b border-border pb-2">Trade Details</h4>
              <div className="flex justify-between items-center py-2">
                <div className="flex flex-col gap-1">
                  <span className="font-extrabold text-base text-foreground">{transaction.cropName}</span>
                  <span className="text-xs font-semibold text-earth-500">Qty: {transaction.quantity} {transaction.unit}</span>
                </div>
                <div className="text-right flex flex-col gap-1">
                  <span className="font-extrabold text-base text-foreground">₹{transaction.totalAmount.toLocaleString('en-IN')}</span>
                  <span className="text-xs font-semibold text-earth-500">@ ₹{transaction.pricePerUnit.toLocaleString('en-IN')}/{transaction.unit}</span>
                </div>
              </div>
            </div>

            {/* Total Footer */}
            <div className="mt-4 pt-4 border-t-2 border-dashed border-border flex justify-between items-center">
              <span className="text-sm font-black uppercase text-earth-500 tracking-wider">Total Amount Paid</span>
              <span className="text-2xl font-black text-primary-600 dark:text-primary-500">₹{transaction.totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="mt-6 text-center text-[10px] font-semibold text-earth-400">
              This is a digitally generated receipt and serves as proof of transaction on the AgroMart platform.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border flex justify-end gap-3 bg-earth-50 dark:bg-earth-900/20">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-border bg-background hover:bg-earth-100 dark:hover:bg-earth-800 font-extrabold text-sm text-foreground transition-all"
          >
            Close
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm shadow-md shadow-primary-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
