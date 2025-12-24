'use client';

import { useState } from 'react';
import { X, FileBarChart, Calendar, Download, Filter, Users, DollarSign, BarChart3, PieChart, TrendingUp } from 'lucide-react';

interface ReportConfig {
  reportType: string;
  dateRange: string;
  customStartDate: string;
  customEndDate: string;
  paymentMethods: string[];
  transactionTypes: string[];
  status: string[];
  amountRange: {
    min: string;
    max: string;
  };
  format: string;
  includeCharts: boolean;
  includeDetails: boolean;
  includeSummary: boolean;
  groupBy: string;
  analysisType: string;
  sendEmail: boolean;
  emailRecipients: string;
  compareWithPrevious: boolean;
  showProjections: boolean;
  includeBreakdown: boolean;
}

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (reportData: any) => void;
}

export default function GenerateReportModal({ isOpen, onClose, onGenerate }: GenerateReportModalProps) {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    // Report Type
    reportType: 'payment-summary',
    
    // Date Range
    dateRange: 'last-30-days',
    customStartDate: '',
    customEndDate: '',
    
    // Filters
    paymentMethods: [],
    transactionTypes: [],
    status: [],
    amountRange: {
      min: '',
      max: ''
    },
    
    // Report Format
    format: 'pdf',
    includeCharts: true,
    includeDetails: true,
    includeSummary: true,
    
    // Grouping & Analysis
    groupBy: 'date',
    analysisType: 'trends',
    
    // Recipients
    sendEmail: false,
    emailRecipients: '',
    
    // Advanced Options
    compareWithPrevious: false,
    showProjections: false,
    includeBreakdown: true
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const reportTypes = [
    { 
      value: 'payment-summary', 
      label: 'Payment Summary Report',
      description: 'Overall payment statistics and trends'
    },
    { 
      value: 'transaction-details', 
      label: 'Transaction Details Report',
      description: 'Detailed list of all transactions'
    },
    { 
      value: 'payment-methods', 
      label: 'Payment Methods Analysis',
      description: 'Analysis by payment method usage'
    },
    { 
      value: 'revenue-analysis', 
      label: 'Revenue Analysis Report',
      description: 'Revenue trends and forecasting'
    },
    { 
      value: 'failed-payments', 
      label: 'Failed Payments Report',
      description: 'Analysis of failed transactions'
    },
    { 
      value: 'settlement-report', 
      label: 'Settlement Report',
      description: 'Settlement status and timing analysis'
    },
    { 
      value: 'custom', 
      label: 'Custom Report',
      description: 'Build your own custom report'
    }
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last-7-days', label: 'Last 7 Days' },
    { value: 'last-30-days', label: 'Last 30 Days' },
    { value: 'last-90-days', label: 'Last 90 Days' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'this-quarter', label: 'This Quarter' },
    { value: 'last-quarter', label: 'Last Quarter' },
    { value: 'this-year', label: 'This Year' },
    { value: 'last-year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const paymentMethodOptions = [
    'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'Bank Transfer'
  ];

  const transactionTypeOptions = [
    'Service Payment', 'Job Posting Fee', 'Commission', 'Refund', 'Payout', 'Subscription'
  ];

  const statusOptions = [
    'Completed', 'Pending', 'Failed', 'Refunded', 'Cancelled'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setReportConfig(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setReportConfig(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMultiSelectChange = (field: keyof ReportConfig, value: string) => {
    setReportConfig(prev => {
      const currentValue = prev[field];
      if (Array.isArray(currentValue)) {
        return {
          ...prev,
          [field]: currentValue.includes(value)
            ? currentValue.filter((item: string) => item !== value)
            : [...currentValue, value]
        };
      }
      return prev;
    });
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (reportConfig.dateRange === 'custom') {
      if (!reportConfig.customStartDate) newErrors.customStartDate = 'Start date is required';
      if (!reportConfig.customEndDate) newErrors.customEndDate = 'End date is required';
      if (reportConfig.customStartDate && reportConfig.customEndDate && 
          new Date(reportConfig.customStartDate) >= new Date(reportConfig.customEndDate)) {
        newErrors.customEndDate = 'End date must be after start date';
      }
    }

    if (reportConfig.sendEmail && !reportConfig.emailRecipients.trim()) {
      newErrors.emailRecipients = 'Email recipients are required';
    }

    if (reportConfig.amountRange.min && reportConfig.amountRange.max &&
        parseFloat(reportConfig.amountRange.min) >= parseFloat(reportConfig.amountRange.max)) {
      newErrors.amountRange = 'Maximum amount must be greater than minimum amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onGenerate({
        ...reportConfig,
        generatedAt: new Date().toISOString(),
        reportId: `RPT-${Date.now()}`,
        estimatedSize: '2.4 MB'
      });
      
      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FileBarChart className="h-5 w-5 mr-2 text-green-600" />
              Generate Payment Report
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Report Type Selection */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Report Type</h4>
              <div className="grid grid-cols-1 gap-3">
                {reportTypes.map((type) => (
                  <div key={type.value}>
                    <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="reportType"
                        value={type.value}
                        checked={reportConfig.reportType === type.value}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Date Range</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {dateRangeOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="dateRange"
                      value={option.value}
                      checked={reportConfig.dateRange === option.value}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
              
              {reportConfig.dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="customStartDate"
                      value={reportConfig.customStartDate}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.customStartDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.customStartDate && <p className="text-red-500 text-xs mt-1">{errors.customStartDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      name="customEndDate"
                      value={reportConfig.customEndDate}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.customEndDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.customEndDate && <p className="text-red-500 text-xs mt-1">{errors.customEndDate}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Filters & Criteria</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Methods</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {paymentMethodOptions.map((method) => (
                      <label key={method} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={reportConfig.paymentMethods.includes(method)}
                          onChange={() => handleMultiSelectChange('paymentMethods', method)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Transaction Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Types</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {transactionTypeOptions.map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={reportConfig.transactionTypes.includes(type)}
                          onChange={() => handleMultiSelectChange('transactionTypes', type)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Status</label>
                  <div className="space-y-2">
                    {statusOptions.map((status) => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={reportConfig.status.includes(status)}
                          onChange={() => handleMultiSelectChange('status', status)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amount Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="amountMin"
                      placeholder="Min amount"
                      value={reportConfig.amountRange.min}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        amountRange: { ...prev.amountRange, min: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="number"
                      name="amountMax"
                      placeholder="Max amount"
                      value={reportConfig.amountRange.max}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        amountRange: { ...prev.amountRange, max: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  {errors.amountRange && <p className="text-red-500 text-xs mt-1">{errors.amountRange}</p>}
                </div>
              </div>
            </div>

            {/* Report Configuration */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Report Configuration</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
                  <select
                    name="format"
                    value={reportConfig.format}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="excel">Excel Spreadsheet</option>
                    <option value="csv">CSV File</option>
                    <option value="html">HTML Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
                  <select
                    name="groupBy"
                    value={reportConfig.groupBy}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="date">Date</option>
                    <option value="payment-method">Payment Method</option>
                    <option value="transaction-type">Transaction Type</option>
                    <option value="status">Status</option>
                    <option value="amount-range">Amount Range</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="includeCharts"
                    checked={reportConfig.includeCharts}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Include charts and graphs</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="includeDetails"
                    checked={reportConfig.includeDetails}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Include detailed transaction list</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="includeSummary"
                    checked={reportConfig.includeSummary}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Include executive summary</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="compareWithPrevious"
                    checked={reportConfig.compareWithPrevious}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Compare with previous period</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="showProjections"
                    checked={reportConfig.showProjections}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Show future projections</label>
                </div>
              </div>
            </div>

            {/* Email Configuration */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Email Configuration</h4>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="sendEmail"
                    checked={reportConfig.sendEmail}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Send report via email</label>
                </div>

                {reportConfig.sendEmail && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Recipients</label>
                    <textarea
                      name="emailRecipients"
                      value={reportConfig.emailRecipients}
                      onChange={handleInputChange}
                      rows={2}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                        errors.emailRecipients ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter email addresses separated by commas"
                    />
                    {errors.emailRecipients && <p className="text-red-500 text-xs mt-1">{errors.emailRecipients}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileBarChart className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
