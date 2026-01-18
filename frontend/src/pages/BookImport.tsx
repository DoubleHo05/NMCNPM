import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Book, ImportTicket } from '../types';
import { Search, Plus, UploadCloud, X, Save, AlertCircle } from 'lucide-react';

const BookImport: React.FC = () => {
    const navigate = useNavigate();
    const { books, importBooks } = useStore();

    // Mode Selection: 'EXISTING' or 'NEW'
    const [mode, setMode] = useState<'EXISTING' | 'NEW'>('EXISTING');

    // --- EXISTING BOOK STATE ---
    const [selectedBookId, setSelectedBookId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [importQuantity, setImportQuantity] = useState<number>(10);
    const [importPrice, setImportPrice] = useState<number>(0);

    // --- NEW BOOK STATE ---
    const [newBookData, setNewBookData] = useState<Partial<Book>>({
        title: '',
        author: '',
        category: '',
        publisher: '',
        publishYear: new Date().getFullYear(),
        price: 0,
        stock: 0,
        description: '',
        imageUrl: '', // Will store JSON string
        weight: 300,
        pages: 200,
        dimensions: '20 x 13 cm'
    });

    // Multiple Images State
    const [images, setImages] = useState<string[]>([]);
    const [imageUrlInput, setImageUrlInput] = useState('');

    // --- HANDLERS ---

    // Filter books for autocomplete
    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectBook = (book: Book) => {
        setSelectedBookId(book.id);
        setSearchQuery(book.title); // Set display text
        setImportPrice(book.price * 0.8); // Suggest import price (e.g. 80% of sell price)
    };

    const handleAddImage = () => {
        if (!imageUrlInput) return;
        if (images.length >= 4) {
            alert('Chỉ được phép nhập tối đa 4 ảnh (1 ảnh bìa + 3 ảnh chi tiết)');
            return;
        }
        setImages([...images, imageUrlInput]);
        setImageUrlInput('');
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (mode === 'EXISTING') {
                if (!selectedBookId) {
                    alert('Vui lòng chọn sách để nhập!');
                    return;
                }
                const book = books.find(b => b.id === selectedBookId);
                if (!book) return;

                const result = await importBooks([{
                    bookDetails: { ...book, price: importPrice }, // Pass updated price if needed
                    quantity: importQuantity
                }]);

                if (result.success) {
                    alert('Nhập sách thành công!');
                    navigate('/books');
                } else {
                    alert('Lỗi: ' + result.message);
                }

            } else {
                // NEW BOOK MODE
                if (!newBookData.title || !newBookData.author || !newBookData.price) {
                    alert('Vui lòng điền đầy đủ thông tin bắt buộc (Tên sách, Tác giả, Giá bán)');
                    return;
                }

                // Construct Book Object
                // Use JSON string for images if multiple, or single string if 1, or empty
                let finalImageUrl = '';
                if (images.length > 0) {
                    finalImageUrl = JSON.stringify(images);
                }

                const bookToCreate: Book = {
                    id: `B${Math.floor(Math.random() * 100000)}`, // Temp ID, backend should handle or ignored
                    ...newBookData as Book,
                    imageUrl: finalImageUrl,
                    stock: 0 // Will be incremented by import
                };

                const result = await importBooks([{
                    bookDetails: bookToCreate,
                    quantity: importQuantity
                }]);

                if (result.success) {
                    alert('Thêm và nhập sách mới thành công!');
                    navigate('/books');
                } else {
                    alert('Lỗi: ' + result.message);
                }
            }
        } catch (error) {
            console.error(error);
            alert('Đã xảy ra lỗi khi nhập sách.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Nhập Sách</h1>
                <p className="text-slate-500">Tạo phiếu nhập sách cho kho hàng (Sách cũ hoặc Sách mới)</p>
            </div>

            {/* Mode Switcher */}
            <div className="bg-slate-100 p-1 rounded-lg inline-flex">
                <button
                    onClick={() => { setMode('EXISTING'); setImages([]); }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'EXISTING'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Sách đã có (Tái bản)
                </button>
                <button
                    onClick={() => { setMode('NEW'); setImages([]); }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'NEW'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Sách mới hoàn toàn
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">

                {/* --- EXISTING BOOK FORM --- */}
                {mode === 'EXISTING' && (
                    <div className="space-y-6">
                        <div className="relative">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tìm kiếm sách</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Nhập tên sách hoặc tác giả..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (selectedBookId && e.target.value !== books.find(b => b.id === selectedBookId)?.title) {
                                            setSelectedBookId(''); // Clear selection if typing new
                                        }
                                    }}
                                />
                                <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            </div>

                            {/* Dropdown Results */}
                            {searchQuery && !selectedBookId && filteredBooks.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {filteredBooks.map(book => (
                                        <div
                                            key={book.id}
                                            onClick={() => handleSelectBook(book)}
                                            className="p-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0"
                                        >
                                            <div className="w-10 h-14 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                                                <img
                                                    src={(book.imageUrl && book.imageUrl.startsWith('['))
                                                        ? JSON.parse(book.imageUrl)[0]
                                                        : (book.imageUrl || 'https://placehold.co/40x60')}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{book.title}</p>
                                                <p className="text-xs text-slate-500">{book.author} • Tồn: {book.stock}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedBookId && (
                            <div className="flex items-start gap-4 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium">Đã chọn: {books.find(b => b.id === selectedBookId)?.title}</p>
                                    <p className="text-sm opacity-80">Thông tin sách sẽ được giữ nguyên. Chỉ cập nhật số lượng tồn và giá nhập mới.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {/* --- NEW BOOK FORM --- */}
                {mode === 'NEW' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <h3 className="font-semibold text-slate-900 border-b pb-2 mb-4">Thông tin sách mới</h3>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tên sách <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="text"
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newBookData.title}
                                onChange={e => setNewBookData({ ...newBookData, title: e.target.value })}
                                placeholder="Ví dụ: Dế Mèn Phiêu Lưu Ký"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tác giả <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="text"
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newBookData.author}
                                onChange={e => setNewBookData({ ...newBookData, author: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Thể loại</label>
                            <select
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newBookData.category}
                                onChange={e => setNewBookData({ ...newBookData, category: e.target.value })}
                            >
                                <option value="">Chọn thể loại</option>
                                <option value="Văn học">Văn học</option>
                                <option value="Kinh tế">Kinh tế</option>
                                <option value="Thiếu nhi">Thiếu nhi</option>
                                <option value="Kỹ năng">Kỹ năng</option>
                                <option value="Giáo khoa">Giáo khoa</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nhà xuất bản</label>
                            <input
                                type="text"
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newBookData.publisher}
                                onChange={e => setNewBookData({ ...newBookData, publisher: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Năm xuất bản</label>
                            <input
                                type="number"
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newBookData.publishYear}
                                onChange={e => setNewBookData({ ...newBookData, publishYear: parseInt(e.target.value) || 2024 })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Giá bán lẻ (VNĐ) <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="number"
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newBookData.price}
                                onChange={e => setNewBookData({ ...newBookData, price: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        {/* --- IMAGE UPLOAD SECTION --- */}
                        <div className="md:col-span-2 space-y-4 pt-4 border-t">
                            <h3 className="font-semibold text-slate-900">Hình ảnh sản phẩm (Tối đa 4 ảnh)</h3>
                            <p className="text-xs text-slate-500">Ảnh đầu tiên sẽ được dùng làm ảnh bìa.</p>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 p-2.5 border rounded-lg text-sm bg-slate-50"
                                    placeholder="Paste URL hình ảnh vào đây..."
                                    value={imageUrlInput}
                                    onChange={e => setImageUrlInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddImage();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddImage}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium text-sm disabled:opacity-50"
                                    disabled={images.length >= 4}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            {/* Image Preview Grid */}
                            <div className="grid grid-cols-4 gap-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-[3/4] group bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(idx)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                        {idx === 0 && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-1">
                                                Ảnh bìa
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {images.length < 4 && (
                                    <div className="aspect-[3/4] bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                        <UploadCloud size={24} className="mb-2" />
                                        <span className="text-xs">Trống</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- COMMON FIELDS --- */}
                <div className="pt-6 border-t border-slate-100">
                    <h3 className="font-semibold text-slate-900 mb-4">Thông tin nhập kho</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng nhập <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="number"
                                min="1"
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-lg"
                                value={importQuantity}
                                onChange={e => setImportQuantity(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Giá nhập (VNĐ) <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="number"
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={importPrice}
                                onChange={e => setImportPrice(parseInt(e.target.value) || 0)}
                            />
                            <p className="text-xs text-slate-500 mt-1">Giá vốn để tính lợi nhuận.</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all"
                    >
                        <Save size={20} />
                        Xác nhận nhập sách
                    </button>
                </div>

            </form>
        </div>
    );
};

export default BookImport;
