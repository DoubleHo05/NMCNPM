import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { FileBarChart, CreditCard, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import DatePicker from '../components/DatePicker';

// Pagination Control Component
const PaginationControl = ({ currentPage, totalPages, onPageChange, totalItems, indexOfFirstItem, indexOfLastItem }: any) => {
    if (totalItems === 0) return null;
    return (
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 mt-auto">
            <span className="text-xs text-slate-500">
                {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} / {totalItems}
            </span>
            <div className="flex gap-1">
                <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-slate-300 bg-white rounded text-slate-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={14} />
                </button>

                <span className="flex items-center px-2 font-medium text-xs text-slate-700">
                    {currentPage}/{totalPages || 1}
                </span>

                <button
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 border border-slate-300 bg-white rounded text-slate-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

const ReportInventory = ({ date }: { date: string }) => {
    const { books } = useStore();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(books.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = books.slice(indexOfFirstItem, indexOfLastItem);

    // Create a seed based on the selected date to mock changing data
    // date input is YYYY-MM
    const dateObj = new Date(`${date}-01`);
    const dateSeed = dateObj.getFullYear() + dateObj.getMonth();

    return (
        <div className="flex flex-col h-full w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 text-blue-800 font-bold">
                    <FileBarChart size={20} />
                    <h3>Báo cáo tồn (BM5.1)</h3>
                </div>
            </div>
            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                            <th className="px-4 py-3 w-12 text-center">STT</th>
                            <th className="px-4 py-3">Sách</th>
                            <th className="px-4 py-3 text-center">Đầu</th>
                            <th className="px-4 py-3 text-center">PS</th>
                            <th className="px-4 py-3 text-center">Cuối</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentItems.map((book, idx) => {
                            // Tính dữ liệu báo cáo dựa trên ngày chọn
                            // PS = Cuối - Đầu (âm khi giảm, dương khi tăng)
                            const modifier = (idx + dateSeed) % 10;
                            const initial = book.stock + modifier * 5; // Tồn đầu kỳ
                            const incurred = book.stock - initial; // PS = Cuối - Đầu (âm khi giảm)

                            return (
                                <tr key={book.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-center text-slate-500 text-sm">{indexOfFirstItem + idx + 1}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900 text-sm">{book.title}</div>
                                        <div className="text-xs text-slate-500">{book.author}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center text-slate-600 text-sm">{initial}</td>
                                    <td className="px-4 py-3 text-center text-sm">
                                        <span className={incurred > 0 ? 'text-green-600' : incurred < 0 ? 'text-red-500' : 'text-slate-400'}>
                                            {incurred > 0 ? `+${incurred}` : incurred}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold text-blue-600 text-sm">{book.stock}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={books.length}
                indexOfFirstItem={indexOfFirstItem}
                indexOfLastItem={indexOfLastItem}
            />
        </div>
    );
};

const ReportDebt = ({ date }: { date: string }) => {
    const { customers } = useStore();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(customers.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = customers.slice(indexOfFirstItem, indexOfLastItem);

    // Create a seed based on the selected date to mock changing data
    const dateObj = new Date(`${date}-01`);
    const dateSeed = dateObj.getFullYear() + dateObj.getMonth();

    return (
        <div className="flex flex-col h-full w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 text-indigo-800 font-bold">
                    <CreditCard size={20} />
                    <h3>Báo cáo công nợ (BM5.2)</h3>
                </div>
            </div>
            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                            <th className="px-4 py-3 w-12 text-center">STT</th>
                            <th className="px-4 py-3">Khách hàng</th>
                            <th className="px-4 py-3 text-right">Nợ đầu</th>
                            <th className="px-4 py-3 text-right">Phát sinh</th>
                            <th className="px-4 py-3 text-right">Nợ cuối</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentItems.map((cust, idx) => {
                            // Mocking dynamic report data
                            const modifier = (idx + dateSeed) % 50000;
                            const initial = Math.max(0, cust.currentDebt - modifier);
                            const incurred = cust.currentDebt - initial;

                            return (
                                <tr key={cust.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-center text-slate-500 text-sm">{indexOfFirstItem + idx + 1}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900 text-sm">{cust.name}</div>
                                        <div className="text-xs text-slate-500">{cust.phone}</div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-600 text-sm">{initial.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <span className={incurred > 0 ? 'text-red-500' : 'text-slate-400'}>
                                            {incurred > 0 ? `+${incurred.toLocaleString()}` : 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-red-600 text-sm">{cust.currentDebt.toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={customers.length}
                indexOfFirstItem={indexOfFirstItem}
                indexOfLastItem={indexOfLastItem}
            />
        </div>
    );
};

const Reports: React.FC = () => {
    // Init with YYYY-MM
    const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 7));

    // Format Month Year for display title



    return (
        <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Báo Cáo Tháng</h2>
                    <div className="text-sm text-slate-500 mt-1">
                        Dashboard <span className="mx-2">›</span> Báo cáo
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-[240px]">
                        {/* Use the new 'type="month"' prop */}
                        <DatePicker
                            value={reportDate}
                            onChange={setReportDate}
                            className="w-full"
                            type="month"
                            label="Chọn tháng báo cáo"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 mt-5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm shadow-sm transition-colors">
                        <Download size={18} />
                        Xuất Excel
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <ReportInventory date={reportDate} />
                <ReportDebt date={reportDate} />
            </div>
        </div>
    );
};

export default Reports;