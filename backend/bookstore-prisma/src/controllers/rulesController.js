const prisma = require('../utils/prisma');

// Mapping từ tên quy định trong database sang tên trường trong frontend
const RULE_MAPPING = {
  'SoLuongNhapToiThieu': 'minImportQuantity',
  'TonKhoToiThieu': 'maxStockBeforeImport', 
  'NoCuoiToiDa': 'maxCustomerDebt',
  'TonKhoSauBanToiThieu': 'minStockAfterSale',
  'SuDungQuyDinhThuTien': 'usePaymentRule',
};

const REVERSE_RULE_MAPPING = Object.fromEntries(
  Object.entries(RULE_MAPPING).map(([k, v]) => [v, k])
);

// Lấy tất cả quy định
const getAllRules = async (req, res) => {
  try {
    const rules = await prisma.quyDinh.findMany();

    // Transform to frontend format
    const transformedRules = {
      minImportQuantity: 150, // default values
      maxStockBeforeImport: 300,
      maxCustomerDebt: 20000,
      minStockAfterSale: 20,
      usePaymentRule: true,
    };

    rules.forEach((rule) => {
      const frontendKey = RULE_MAPPING[rule.tenQuyDinh];
      if (frontendKey) {
        if (frontendKey === 'usePaymentRule') {
          transformedRules[frontendKey] = rule.giaTri === 'true' || rule.giaTri === '1';
        } else {
          transformedRules[frontendKey] = parseInt(rule.giaTri) || 0;
        }
      }
    });

    res.json({
      success: true,
      data: transformedRules,
      rawRules: rules.map(r => ({
        id: r.maQuyDinh,
        name: r.tenQuyDinh,
        value: r.giaTri,
        description: r.moTa,
        updatedAt: r.ngayCapNhat,
      })),
      message: 'Lấy quy định thành công',
    });
  } catch (error) {
    console.error('Error getting rules:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy quy định',
      error: error.message,
    });
  }
};

// Cập nhật quy định
const updateRules = async (req, res) => {
  try {
    const { minImportQuantity, maxStockBeforeImport, maxCustomerDebt, minStockAfterSale, usePaymentRule } = req.body;

    const updates = [];

    if (minImportQuantity !== undefined) {
      updates.push(
        prisma.quyDinh.upsert({
          where: { tenQuyDinh: 'SoLuongNhapToiThieu' },
          update: { giaTri: minImportQuantity.toString(), ngayCapNhat: new Date() },
          create: { tenQuyDinh: 'SoLuongNhapToiThieu', giaTri: minImportQuantity.toString(), moTa: 'Số lượng nhập tối thiểu' },
        })
      );
    }

    if (maxStockBeforeImport !== undefined) {
      updates.push(
        prisma.quyDinh.upsert({
          where: { tenQuyDinh: 'TonKhoToiThieu' },
          update: { giaTri: maxStockBeforeImport.toString(), ngayCapNhat: new Date() },
          create: { tenQuyDinh: 'TonKhoToiThieu', giaTri: maxStockBeforeImport.toString(), moTa: 'Chỉ nhập khi tồn kho ít hơn' },
        })
      );
    }

    if (maxCustomerDebt !== undefined) {
      updates.push(
        prisma.quyDinh.upsert({
          where: { tenQuyDinh: 'NoCuoiToiDa' },
          update: { giaTri: maxCustomerDebt.toString(), ngayCapNhat: new Date() },
          create: { tenQuyDinh: 'NoCuoiToiDa', giaTri: maxCustomerDebt.toString(), moTa: 'Nợ tối đa của khách hàng' },
        })
      );
    }

    if (minStockAfterSale !== undefined) {
      updates.push(
        prisma.quyDinh.upsert({
          where: { tenQuyDinh: 'TonKhoSauBanToiThieu' },
          update: { giaTri: minStockAfterSale.toString(), ngayCapNhat: new Date() },
          create: { tenQuyDinh: 'TonKhoSauBanToiThieu', giaTri: minStockAfterSale.toString(), moTa: 'Tồn kho tối thiểu sau khi bán' },
        })
      );
    }

    if (usePaymentRule !== undefined) {
      updates.push(
        prisma.quyDinh.upsert({
          where: { tenQuyDinh: 'SuDungQuyDinhThuTien' },
          update: { giaTri: usePaymentRule ? 'true' : 'false', ngayCapNhat: new Date() },
          create: { tenQuyDinh: 'SuDungQuyDinhThuTien', giaTri: usePaymentRule ? 'true' : 'false', moTa: 'Sử dụng quy định thu tiền không vượt quá nợ' },
        })
      );
    }

    await prisma.$transaction(updates);

    // Fetch updated rules
    const allRules = await prisma.quyDinh.findMany();
    const transformedRules = {
      minImportQuantity: 150,
      maxStockBeforeImport: 300,
      maxCustomerDebt: 20000,
      minStockAfterSale: 20,
      usePaymentRule: true,
    };

    allRules.forEach((rule) => {
      const frontendKey = RULE_MAPPING[rule.tenQuyDinh];
      if (frontendKey) {
        if (frontendKey === 'usePaymentRule') {
          transformedRules[frontendKey] = rule.giaTri === 'true' || rule.giaTri === '1';
        } else {
          transformedRules[frontendKey] = parseInt(rule.giaTri) || 0;
        }
      }
    });

    res.json({
      success: true,
      data: transformedRules,
      message: 'Cập nhật quy định thành công',
    });
  } catch (error) {
    console.error('Error updating rules:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật quy định',
      error: error.message,
    });
  }
};

// Cập nhật một quy định cụ thể
const updateSingleRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { giaTri, moTa } = req.body;

    const existingRule = await prisma.quyDinh.findUnique({
      where: { maQuyDinh: parseInt(id) },
    });

    if (!existingRule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy quy định',
      });
    }

    const updatedRule = await prisma.quyDinh.update({
      where: { maQuyDinh: parseInt(id) },
      data: {
        giaTri: giaTri !== undefined ? giaTri.toString() : existingRule.giaTri,
        moTa: moTa !== undefined ? moTa : existingRule.moTa,
        ngayCapNhat: new Date(),
      },
    });

    res.json({
      success: true,
      data: {
        id: updatedRule.maQuyDinh,
        name: updatedRule.tenQuyDinh,
        value: updatedRule.giaTri,
        description: updatedRule.moTa,
        updatedAt: updatedRule.ngayCapNhat,
      },
      message: 'Cập nhật quy định thành công',
    });
  } catch (error) {
    console.error('Error updating rule:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật quy định',
      error: error.message,
    });
  }
};

module.exports = {
  getAllRules,
  updateRules,
  updateSingleRule,
};
