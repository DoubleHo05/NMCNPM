import React, { useState, useEffect } from 'react';
import { X, Printer, CheckCircle, Calculator, banknotes } from 'lucide-react';
import { Customer } from '../types';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    customer: Customer | undefined;
    onConfirmPayment: (amountPaid: number) => void;
    isProcessing: boolean;
    completedInvoiceId: string | null;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    totalAmount,
    customer,
    onConfirmPayment,
    isProcessing,
    completedInvoiceId
}) => {
    const [amountReceived, setAmountReceived] = useState<string>('');
    const [change, setChange] = useState<number>(0);
    const [showInvoice, setShowInvoice] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAmountReceived('');
            setChange(0);
            setShowInvoice(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const received = parseInt(amountReceived.replace(/\D/g, '') || '0');
        setChange(received - totalAmount);
    }, [amountReceived, totalAmount]);

    if (!isOpen) return null;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        setAmountReceived(val);
    };

    const handlePayment = () => {
        const received = parseInt(amountReceived.replace(/\D/g, '') || '0');
        if (received < totalAmount) return; // Prevent partial payment for now if logic dictates full payment
        onConfirmPayment(received);
        setShowInvoice(true);
    };

    const formatCurrency = (val: number) => val.toLocaleString('vi-VN');

    // Success / Print View
    if (completedInvoiceId && showInvoice) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl transform transition-all scale-100">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-green-600" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Thanh toán thành công!</h3>
                        <p className="text-slate-500">Mã hoá đơn: {completedInvoiceId}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl space-y-3 mb-6 border border-slate-100">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Khách hàng</span>
                            <span className="font-medium text-slate-900">{customer?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Tổng tiền</span>
                            <span className="font-bold text-slate-900">{formatCurrency(totalAmount)}đ</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Khách đưa</span>
                            <span className="font-medium text-slate-900">{formatCurrency(parseInt(amountReceived) || 0)}đ</span>
                        </div>
                        <div className="border-t border-slate-200 pt-2 flex justify-between text-base">
                            <span className="font-semibold text-slate-700">Tiền thừa</span>
                            <span className="font-bold text-green-600">{formatCurrency(change)}đ</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            Đóng
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Printer size={20} /> In hoá đơn
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Payment Input View
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg p-0 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        Thanh toán đơn hàng
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* content */}
                <div className="p-6 space-y-6">
                    {/* Total Display */}
                    <div className="text-center py-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-600 font-medium uppercase tracking-wide">Tổng tiền phải thu</p>
                        <p className="text-4xl font-extrabold text-blue-700 mt-1">{formatCurrency(totalAmount)}đ</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Khách hàng</label>
                            <div className="px-4 py-3 bg-slate-100 rounded-lg text-slate-700 font-medium border border-transparent">
                                {customer?.name || 'Khách vãng lai'}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tiền khách đưa</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full pl-4 pr-12 py-3 text-lg font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="0"
                                    value={amountReceived ? parseInt(amountReceived).toLocaleString('vi-VN') : ''}
                                    onChange={handleAmountChange}
                                    autoFocus
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">VNĐ</span>
                            </div>

                            {/* Quick suggestions */}
                            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                                {[totalAmount, 100000, 200000, 500000].map(amt => (
                                    amt >= totalAmount && (
                                        <button
                                            key={amt}
                                            onClick={() => setAmountReceived(amt.toString())}
                                            className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 whitespace-nowrap"
                                        >
                                            {formatCurrency(amt)}
                                        </button>
                                    )
                                ))}
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl border transition-colors ${change >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                            }`}>
                            <div className="flex justify-between items-center">
                                <span className={`font-medium ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {change >= 0 ? 'Tiền thừa trả khách:' : 'Khách còn thiếu:'}
                                </span>
                                <span className={`text-xl font-bold ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {formatCurrency(Math.abs(change))}đ
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={handlePayment}
                        disabled={parseInt(amountReceived) < totalAmount || isProcessing}
                        className={`w-full py-3.5 px-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.98]
              ${parseInt(amountReceived) < totalAmount || isProcessing
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30'
                            }`}
                    >
                        {isProcessing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
