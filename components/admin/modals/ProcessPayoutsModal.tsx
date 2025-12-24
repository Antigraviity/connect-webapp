'use client';

import { useState } from 'react';
import { X, CreditCard, AlertTriangle, CheckCircle, DollarSign, Calendar, User, Building, Info } from 'lucide-react';

interface ProcessPayoutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcess: (payoutData: any) => void;
}

export default function ProcessPayoutsModal({ isOpen, onClose, onProcess }: ProcessPayoutsModalProps) {
  const [payoutConfig, setPayoutConfig] = useState({
    // Payout Criteria
    payoutType: 'selective',
    minimumAmount: '1000',
    providers: [],
    categories: [],
    
    // Date Range
    fromDate: '',
    toDate: '',
    
    // Processing Options
    processingMethod: 'bank-transfer',
    scheduledDate: '',
    immediateProcessing: false,
    
    // Notifications
    sendNotifications: true,
    emailNotification: true,
    smsNotification: false,
    
    // Advanced Options
    includeBonus: false,
    deductTds: true,
    tdsPercentage: '10',
    processingFee: '25',
    
    // Approval Settings
    requireApproval: true,
    approverEmail: '',
    
    // Notes
    internalNotes: '',
    providerMessage: ''
  });

  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Mock data for providers with pending payouts
  const providersWithPayouts = [
    {
      id: 'PRV-001234',
      name: 'Sarah Johnson',
      business: 'CleanPro Services',
      category: 'Home Services',
      totalEarnings: 245600,
      pending: 12500,
      withdrawn: 233100,
      platformFee: 24560,
      gross: 270160,
      orders: 156,
      rating: 4.8,
      joined: '2024-01-15',
      lastPayout: '2024-11-20',
      nextPayout: '2024-11-30',
      paymentMethod: 'Bank Transfer',
      status: 'Active',
      verified: true
    },
    {
      id: 'PRV-001235',
      name: 'Mike Rodriguez',
      business: 'Rodriguez Plumbing',
      category: 'Maintenance',
      totalEarnings: 167800,
      pending: 8900,
      withdrawn: 158900,
      platformFee: 16780,
      gross: 184580,
      orders: 89,
      rating: 4.6,
      joined: '2024-02-01',
      lastPayout: '2024-11-18',
      nextPayout: '2024-11-28',
      paymentMethod: 'UPI',
      status: 'Active',
      verified: true
    },
    {
      id: 'PRV-001236',
      name: 'Lisa Chen',
      business: 'TechFix Solutions',
      category: 'Electronics',
      totalEarnings: 89000,
      pending: 15600,
      withdrawn: 73400,
      platformFee: 8900,
      gross: 97900,
      orders: 67,
      rating: 4.9,
      joined: '2024-03-10',
      lastPayout: '2024-11-15',
      nextPayout: '2024-11-25',
      paymentMethod: 'Bank Transfer',
      status: 'Active',
      verified: true
    }
  ];

  const categories = ['Home Services', 'Maintenance', 'Electronics', 'Beauty & Wellness', 'Appliance Repair', 'Others'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setPayoutConfig(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setPayoutConfig(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProviderSelection = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProviders.length === providersWithPayouts.length) {
      setSelectedProviders([]);
    } else {
      setSelectedProviders(providersWithPayouts.map(p => p.id));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Validate minimum amount
    if (!payoutConfig.minimumAmount || parseFloat(payoutConfig.minimumAmount) < 0) {
      newErrors.minimumAmount = 'Minimum amount must be greater than 0';
    }

    // Validate date range
    if (payoutConfig.fromDate && payoutConfig.toDate) {
      if (new Date(payoutConfig.fromDate) >= new Date(payoutConfig.toDate)) {
        newErrors.toDate = 'To date must be after from date';
      }
    }

    // Validate scheduled date
    if (!payoutConfig.immediateProcessing && !payoutConfig.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required when not processing immediately';
    }

    // Validate TDS percentage
    if (payoutConfig.deductTds && (!payoutConfig.tdsPercentage || parseFloat(payoutConfig.tdsPercentage) < 0)) {
      newErrors.tdsPercentage = 'TDS percentage must be 0 or greater';
    }

    // Validate approver email
    if (payoutConfig.requireApproval && !payoutConfig.approverEmail.trim()) {
      newErrors.approverEmail = 'Approver email is required when approval is required';
    } else if (payoutConfig.approverEmail && !/\S+@\S+\.\S+/.test(payoutConfig.approverEmail)) {
      newErrors.approverEmail = 'Invalid email format';
    }

    // Validate provider selection for selective payouts
    if (payoutConfig.payoutType === 'selective' && selectedProviders.length === 0) {
      newErrors.providers = 'Please select at least one provider for selective payouts';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalPayout = () => {
    let total = 0;
    let count = 0;

    if (payoutConfig.payoutType === 'all') {
      total = providersWithPayouts.reduce((sum, provider) => sum + provider.pending, 0);
      count = providersWithPayouts.length;
    } else if (payoutConfig.payoutType === 'selective') {
      const selected = providersWithPayouts.filter(p => selectedProviders.includes(p.id));
      total = selected.reduce((sum, provider) => sum + provider.pending, 0);
      count = selected.length;
    } else if (payoutConfig.payoutType === 'threshold') {
      const eligible = providersWithPayouts.filter(p => p.pending >= parseFloat(payoutConfig.minimumAmount));
      total = eligible.reduce((sum, provider) => sum + provider.pending, 0);
      count = eligible.length;
    }

    // Deduct TDS and processing fees
    if (payoutConfig.deductTds) {
      total = total * (1 - parseFloat(payoutConfig.tdsPercentage) / 100);
    }

    const processingFeeTotal = count * parseFloat(payoutConfig.processingFee);
    total = total - processingFeeTotal;

    return { total: Math.max(0, total), count, processingFeeTotal };
  };

  const handleProcess = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { total, count } = calculateTotalPayout();
      
      const payoutData = {
        ...payoutConfig,
        selectedProviders: payoutConfig.payoutType === 'selective' ? selectedProviders : [],
        totalAmount: total,
        providerCount: count,
        payoutId: `PAYOUT-${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdBy: 'Admin User',
        status: payoutConfig.requireApproval ? 'Pending Approval' : 'Processing'
      };
      
      onProcess(payoutData);
      onClose();
    } catch (error) {
      console.error('Error processing payouts:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const { total, count, processingFeeTotal } = calculateTotalPayout();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-green-600" />
              Process Provider Payouts
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Payout Summary */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Payout Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">₹{(total / 100000).toFixed(1)}L</div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-sm text-gray-600">Providers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">₹{processingFeeTotal}</div>
                  <div className="text-sm text-gray-600">Processing Fees</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {payoutConfig.deductTds ? `${payoutConfig.tdsPercentage}%` : '0%'}
                  </div>
                  <div className="text-sm text-gray-600">TDS Deducted</div>
                </div>
              </div>
            </div>

            {/* Payout Configuration */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Payout Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payout Type</label>
                  <select
                    name="payoutType"
                    value={payoutConfig.payoutType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Providers</option>
                    <option value="selective">Selected Providers</option>
                    <option value="threshold">Above Threshold</option>
                    <option value="category">By Category</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Processing Method</label>
                  <select
                    name="processingMethod"
                    value={payoutConfig.processingMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="upi">UPI Payment</option>
                    <option value="wallet">Digital Wallet</option>
                    <option value="check">Check Payment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Amount (₹)</label>
                  <input
                    type="number"
                    name="minimumAmount"
                    value={payoutConfig.minimumAmount}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.minimumAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1000"
                  />
                  {errors.minimumAmount && <p className="text-red-500 text-xs mt-1">{errors.minimumAmount}</p>}
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Date Range & Scheduling</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    name="fromDate"
                    value={payoutConfig.fromDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    name="toDate"
                    value={payoutConfig.toDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.toDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.toDate && <p className="text-red-500 text-xs mt-1">{errors.toDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={payoutConfig.scheduledDate}
                    onChange={handleInputChange}
                    disabled={payoutConfig.immediateProcessing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.scheduledDate ? 'border-red-500' : 'border-gray-300'
                    } ${payoutConfig.immediateProcessing ? 'bg-gray-100' : ''}`}
                  />
                  {errors.scheduledDate && <p className="text-red-500 text-xs mt-1">{errors.scheduledDate}</p>}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="immediateProcessing"
                    checked={payoutConfig.immediateProcessing}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Process immediately</label>
                </div>
              </div>
            </div>

            {/* Provider Selection */}
            {payoutConfig.payoutType === 'selective' && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Provider Selection</h4>
                {errors.providers && <p className="text-red-500 text-sm mb-2">{errors.providers}</p>}
                
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                  >
                    {selectedProviders.length === providersWithPayouts.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {providersWithPayouts.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedProviders.includes(provider.id)}
                          onChange={() => handleProviderSelection(provider.id)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                          <div className="text-xs text-gray-500">{provider.business} • {provider.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">₹{provider.pending.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{provider.orders} orders</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Options */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Advanced Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TDS Percentage (%)</label>
                  <input
                    type="number"
                    name="tdsPercentage"
                    value={payoutConfig.tdsPercentage}
                    onChange={handleInputChange}
                    disabled={!payoutConfig.deductTds}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                      errors.tdsPercentage ? 'border-red-500' : 'border-gray-300'
                    } ${!payoutConfig.deductTds ? 'bg-gray-100' : ''}`}
                    placeholder="10"
                  />
                  {errors.tdsPercentage && <p className="text-red-500 text-xs mt-1">{errors.tdsPercentage}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Processing Fee (₹)</label>
                  <input
                    type="number"
                    name="processingFee"
                    value={payoutConfig.processingFee}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Approver Email</label>
                  <input
                    type="email"
                    name="approverEmail"
                    value={payoutConfig.approverEmail}
                    onChange={handleInputChange}
                    disabled={!payoutConfig.requireApproval}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                      errors.approverEmail ? 'border-red-500' : 'border-gray-300'
                    } ${!payoutConfig.requireApproval ? 'bg-gray-100' : ''}`}
                    placeholder="approver@company.com"
                  />
                  {errors.approverEmail && <p className="text-red-500 text-xs mt-1">{errors.approverEmail}</p>}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="deductTds"
                    checked={payoutConfig.deductTds}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Deduct TDS from payouts</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="requireApproval"
                    checked={payoutConfig.requireApproval}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Require approval before processing</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="sendNotifications"
                    checked={payoutConfig.sendNotifications}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Send notifications to providers</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="includeBonus"
                    checked={payoutConfig.includeBonus}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Include performance bonuses</label>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Notes & Messages</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
                  <textarea
                    name="internalNotes"
                    value={payoutConfig.internalNotes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Internal notes for this payout batch..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message to Providers</label>
                  <textarea
                    name="providerMessage"
                    value={payoutConfig.providerMessage}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Message that will be sent to providers..."
                  />
                </div>
              </div>
            </div>

            {/* Confirmation */}
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-2">Important Notice</h4>
                  <p className="text-sm text-red-700">
                    This action will process {count} payout(s) totaling ₹{(total / 100000).toFixed(1)}L. 
                    {payoutConfig.requireApproval 
                      ? ' Payouts will be queued for approval before processing.'
                      : ' This action cannot be undone once processed.'
                    }
                  </p>
                </div>
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
                onClick={handleProcess}
                disabled={isProcessing || count === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    {payoutConfig.requireApproval ? 'Queue for Approval' : 'Process Payouts'}
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
