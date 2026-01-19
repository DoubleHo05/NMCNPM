import React, { useState, useEffect } from 'react';
import { X, Printer, CheckCircle, AlertTriangle } from 'lucide-react';
import { Customer } from '../types';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    customer: Customer | undefined;
    onConfirmPayment: (amountPaid: number) => void;
    isProcessing: boolean;
    completedInvoiceId: string | null;
    lastSuccessData?: {
        invoiceId: string;
        customerName: string;
        totalAmount: number;
        amountPaid: number;
        remainingDebt: number;
    } | null;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    totalAmount,
    customer,
    onConfirmPayment,
    isProcessing,
    completedInvoiceId,
    lastSuccessData
}) => {
    const [amountReceived, setAmountReceived] = useState<string>('');
    const [showInvoice, setShowInvoice] = useState(false);

    const received = parseInt(amountReceived.replace(/\D/g, '') || '0');
    const change = received - totalAmount;
    const debtAmount = change < 0 ? Math.abs(change) : 0;

    useEffect(() => {
        if (isOpen) {
            setAmountReceived('');
            setShowInvoice(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        setAmountReceived(val);
    };

    const handlePayment = () => {
        // Allow partial payment - remaining will be added to debt
        onConfirmPayment(received);
        setShowInvoice(true);
    };

    const formatCurrency = (val: number) => val.toLocaleString('vi-VN');

    // Success / Print View
    if (completedInvoiceId && showInvoice && lastSuccessData) {
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
                            <span className="font-medium text-slate-900">{lastSuccessData.customerName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Tổng tiền</span>
                            <span className="font-bold text-slate-900">{formatCurrency(lastSuccessData.totalAmount)}đ</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Khách đưa</span>
                            <span className="font-medium text-slate-900">{formatCurrency(lastSuccessData.amountPaid)}đ</span>
                        </div>

                        <div className="border-t border-slate-200 pt-2">
                            {lastSuccessData.amountPaid >= lastSuccessData.totalAmount ? (
                                <div className="flex justify-between text-base">
                                    <span className="font-semibold text-slate-700">Tiền thừa</span>
                                    <span className="font-bold text-green-600">{formatCurrency(lastSuccessData.amountPaid - lastSuccessData.totalAmount)}đ</span>
                                </div>
                            ) : (
                                <div className="flex justify-between text-base">
                                    <span className="font-semibold text-red-600">Ghi nợ thêm</span>
                                    <span className="font-bold text-red-600">{formatCurrency(lastSuccessData.totalAmount - lastSuccessData.amountPaid)}đ</span>
                                </div>
                            )}
                        </div>

                        {/* Remaining Debt Display */}
                        <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-base">
                            <span className="font-semibold text-slate-700">Nợ sau thanh toán</span>
                            <span className="font-bold text-amber-600">{formatCurrency(lastSuccessData.remainingDebt)}đ</span>
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
                            <Printer size={20} />In hoá đơn
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
                                {customer && customer.currentDebt > 0 && (
                                    <span className="ml-2 text-xs text-red-500">(Nợ cũ: {formatCurrency(customer.currentDebt)}đ)</span>
                                )}
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
                                <button
                                    onClick={() => setAmountReceived('0')}
                                    className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-full hover:bg-red-200 whitespace-nowrap"
                                >
                                    Ghi nợ toàn bộ
                                </button>
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

                        {/* Change/Debt Display */}
                        {change >= 0 ? (
                            <div className="p-4 rounded-xl border bg-green-50 border-green-200">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-green-700">Tiền thừa trả khách:</span>
                                    <span className="text-xl font-bold text-green-700">{formatCurrency(change)}đ</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl border bg-amber-50 border-amber-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle size={18} className="text-amber-600" />
                                    <span className="font-semibold text-amber-700">Ghi nợ cho khách</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-amber-600">Số tiền ghi nợ:</span>
                                    <span className="text-xl font-bold text-amber-700">{formatCurrency(debtAmount)}đ</span>
                                </div>
                                {customer && (
                                    <div className="text-xs text-amber-600 mt-2 pt-2 border-t border-amber-200">
                                        Nợ sau giao dịch: <span className="font-bold">{formatCurrency(customer.currentDebt + debtAmount)}đ</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className={`w-full py-3.5 px-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.98]
              ${isProcessing
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                                : debtAmount > 0
                                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/30'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30'
                            }`}
                    >
                        {isProcessing ? 'Đang xử lý...' : debtAmount > 0 ? `Xác nhận & Ghi nợ ${formatCurrency(debtAmount)}đ` : 'Xác nhận thanh toán'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
