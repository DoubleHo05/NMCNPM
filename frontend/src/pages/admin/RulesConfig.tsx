import React from 'react';
import { Settings } from 'lucide-react';

// Placeholder component - đang phát triển
const RulesConfigPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Settings className="text-orange-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cấu hình quy định</h1>
          <p className="text-sm text-slate-500">Trang này đang được phát triển</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <p className="text-slate-500">Chức năng cấu hình quy định sẽ sớm được cập nhật.</p>
      </div>
    </div>
  );
};

export default RulesConfigPage;
