"use client";

import { useState, useEffect } from "react";
import {
  FiBriefcase,
  FiSearch,
  FiPlus,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiGrid,
  FiList,
  FiUsers,
  FiX,
  FiFileText,
  FiGlobe,
  FiHome,
  FiMonitor,
  FiStar,
  FiAlertCircle,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string;
  category: string;
  salary: string;
  experience: string;
  location: string;
  workMode: string;
  jobType: string;
  applications: number;
  views: number;
  status: string;
  featured: boolean;
  urgent: boolean;
  postedDate: string;
  expiryDate: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
}

const initialJobsData: Job[] = [
  { id: "JOB-001", title: "Senior React Developer", company: "TechCorp Solutions", companyId: "CMP-001", category: "IT & Software", salary: "₹18-25 LPA", experience: "5+ years", location: "Bangalore", workMode: "Remote", jobType: "Full-time", applications: 89, views: 456, status: "ACTIVE", featured: true, urgent: true, postedDate: "Nov 20, 2025", expiryDate: "Dec 20, 2025" },
  { id: "JOB-002", title: "UI/UX Designer", company: "DesignHub Inc", companyId: "CMP-002", category: "Design", salary: "₹10-18 LPA", experience: "3+ years", location: "Mumbai", workMode: "Hybrid", jobType: "Full-time", applications: 67, views: 389, status: "ACTIVE", featured: true, urgent: false, postedDate: "Nov 18, 2025", expiryDate: "Dec 18, 2025" },
  { id: "JOB-003", title: "Product Manager", company: "InnovateLabs", companyId: "CMP-003", category: "Product", salary: "₹20-30 LPA", experience: "6+ years", location: "Pune", workMode: "On-site", jobType: "Full-time", applications: 54, views: 312, status: "ACTIVE", featured: false, urgent: true, postedDate: "Nov 15, 2025", expiryDate: "Dec 15, 2025" },
  { id: "JOB-004", title: "Data Analyst", company: "DataDriven Co", companyId: "CMP-004", category: "Analytics", salary: "₹8-15 LPA", experience: "2+ years", location: "Hyderabad", workMode: "Remote", jobType: "Full-time", applications: 48, views: 287, status: "PENDING", featured: false, urgent: false, postedDate: "Nov 22, 2025", expiryDate: "Dec 22, 2025" },
  { id: "JOB-005", title: "Marketing Lead", company: "GrowthMax Agency", companyId: "CMP-005", category: "Marketing", salary: "₹12-20 LPA", experience: "4+ years", location: "Delhi NCR", workMode: "Hybrid", jobType: "Full-time", applications: 35, views: 234, status: "CLOSED", featured: false, urgent: false, postedDate: "Nov 1, 2025", expiryDate: "Nov 30, 2025" },
  { id: "JOB-006", title: "Backend Developer", company: "CloudTech Systems", companyId: "CMP-006", category: "IT & Software", salary: "₹12-18 LPA", experience: "3+ years", location: "Bangalore", workMode: "Remote", jobType: "Full-time", applications: 42, views: 298, status: "ACTIVE", featured: true, urgent: false, postedDate: "Nov 19, 2025", expiryDate: "Dec 19, 2025" },
];

const categories = ["IT & Software", "Design", "Product", "Marketing", "Sales", "Analytics", "Finance", "HR", "Operations", "Customer Support"];
const companies = ["TechCorp Solutions", "DesignHub Inc", "InnovateLabs", "DataDriven Co", "GrowthMax Agency", "CloudTech Systems", "NewTech Startup", "FinanceFirst Corp"];
const locations = ["Bangalore", "Mumbai", "Delhi NCR", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad"];
const experienceLevels = ["0-1 years", "1-2 years", "2-3 years", "3-5 years", "5+ years", "6+ years", "8+ years", "10+ years"];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE": return { bg: "bg-green-100", text: "text-green-700", label: "Active" };
    case "PENDING": return { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" };
    case "CLOSED": return { bg: "bg-gray-100", text: "text-gray-800", label: "Closed" };
    case "PAUSED": return { bg: "bg-amber-100", text: "text-amber-800", label: "Paused" };
    default: return { bg: "bg-gray-100", text: "text-gray-800", label: status };
  }
};

const getWorkModeIcon = (mode: string) => {
  switch (mode) {
    case "Remote": return FiGlobe;
    case "Hybrid": return FiMonitor;
    case "On-site": return FiHome;
    default: return FiMapPin;
  }
};

function AddJobModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (job: Job) => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "", company: "", companyId: "", category: "", location: "", workMode: "Remote", jobType: "Full-time",
    experience: "", salaryMin: "", salaryMax: "", description: "", requirements: "", benefits: "",
    featured: false, urgent: false, status: "ACTIVE",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employers, setEmployers] = useState<Array<{ id: string, name: string, email: string }>>([]);

  // Fetch employers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchEmployers();
    }
  }, [isOpen]);

  const fetchEmployers = async () => {
    try {
      console.log('🔍 Fetching employers from API...');
      const response = await fetch('/api/employers');
      const data = await response.json();
      console.log('📥 Employers response:', data);
      if (data.success && data.employers) {
        setEmployers(data.employers);
        console.log('✅ Loaded employers:', data.employers.length, 'employers');
        data.employers.forEach((emp: any) => {
          console.log(`  - ${emp.name} (ID: ${emp.id})`);
        });
      } else {
        console.error('❌ No employers found in response');
        // Fallback: Add a test employer if none found
        const testEmployer = {
          id: 'cmifq6ezk0001d9w709h174iw',
          name: 'Test Company',
          email: 'test@company.com'
        };
        setEmployers([testEmployer]);
        console.log('⚠️ Using fallback test employer:', testEmployer);
      }
    } catch (error) {
      console.error('❌ Error fetching employers:', error);
      // Fallback: Add a test employer on error
      const testEmployer = {
        id: 'cmifq6ezk0001d9w709h174iw',
        name: 'Test Company',
        email: 'test@company.com'
      };
      setEmployers([testEmployer]);
      console.log('⚠️ API failed, using fallback test employer:', testEmployer);
    }
  };

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      // If company is selected, also set the companyId
      if (name === 'company') {
        const selected = employers.find(emp => emp.name === value);
        setFormData((prev) => ({ ...prev, company: value, companyId: selected?.id || '' }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Job title is required";
      if (!formData.company) newErrors.company = "Company is required";
      if (!formData.category) newErrors.category = "Category is required";
      if (!formData.location) newErrors.location = "Location is required";
    } else if (step === 2) {
      if (!formData.experience) newErrors.experience = "Experience is required";
      if (!formData.salaryMin.trim()) newErrors.salaryMin = "Minimum salary is required";
      if (!formData.salaryMax.trim()) newErrors.salaryMax = "Maximum salary is required";
    } else if (step === 3) {
      if (!formData.description.trim()) newErrors.description = "Job description is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => { if (validateStep(currentStep)) setCurrentStep((prev) => prev + 1); };
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setIsSubmitting(true);

    try {
      // Convert job type to API format (e.g., "Full-time" -> "FULL_TIME")
      const jobTypeMap: Record<string, string> = {
        "Full-time": "FULL_TIME",
        "Part-time": "PART_TIME",
        "Contract": "CONTRACT",
        "Internship": "INTERNSHIP",
        "Freelance": "FREELANCE"
      };

      // Prepare the API payload
      const payload = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: '',
        benefits: formData.benefits,
        jobType: jobTypeMap[formData.jobType] || 'FULL_TIME',
        category: formData.category,
        experienceLevel: formData.experience,
        minExperience: parseInt(formData.experience.split(/[-+]/)[0]) || 0,
        maxExperience: formData.experience.includes('+') ? 20 : parseInt(formData.experience.split('-')[1]) || 0,
        skills: formData.requirements,
        education: '',
        salaryMin: parseFloat(formData.salaryMin) * 100000,
        salaryMax: parseFloat(formData.salaryMax) * 100000,
        salaryPeriod: 'YEAR',
        showSalary: true,
        location: `${formData.location}, India`,
        city: formData.location,
        state: '',
        country: 'India',
        zipCode: '',
        isRemote: formData.workMode === 'Remote',
        status: formData.status,
        featured: formData.featured,
        urgent: formData.urgent,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        employerId: formData.companyId, // Use selected company's ID
        companyName: formData.company,
        companyLogo: null,
      };

      // Validate we have an employer ID
      if (!payload.employerId) {
        alert('❌ Error: Please select a company with a valid employer ID');
        setIsSubmitting(false);
        return;
      }

      console.log('📤 Sending job data to API:', payload);
      console.log('🏢 Company ID being used:', payload.employerId);

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('📥 API Response:', data);

      if (data.success && data.job) {
        const newJob: Job = {
          id: data.job.id,
          title: data.job.title,
          company: data.job.companyName,
          companyId: data.job.employerId,
          category: data.job.jobType,
          salary: `₹${formData.salaryMin}-${formData.salaryMax} LPA`,
          experience: formData.experience,
          location: formData.location,
          workMode: formData.workMode,
          jobType: formData.jobType,
          applications: 0,
          views: 0,
          status: data.job.status,
          featured: data.job.featured,
          urgent: data.job.urgent,
          postedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          expiryDate: new Date(data.job.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          description: data.job.description,
          requirements: formData.requirements.split("\n").filter(r => r.trim()),
          benefits: formData.benefits.split("\n").filter(b => b.trim()),
        };

        onAdd(newJob);
        alert('✅ Job created successfully and saved to database!');
        resetAndClose();
      } else {
        console.error('❌ API Error:', data);
        alert('❌ Error: ' + (data.message || 'Failed to create job'));
      }
    } catch (error) {
      console.error('❌ Network Error:', error);
      alert('❌ Failed to create job. Please check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setFormData({ title: "", company: "", companyId: "", category: "", location: "", workMode: "Remote", jobType: "Full-time", experience: "", salaryMin: "", salaryMax: "", description: "", requirements: "", benefits: "", featured: false, urgent: false, status: "ACTIVE" });
    setErrors({});
    setCurrentStep(1);
    onClose();
  };

  const steps = [
    { number: 1, title: "Basic Info", icon: FiBriefcase },
    { number: 2, title: "Requirements", icon: FiFileText },
    { number: 3, title: "Details", icon: FiCheckCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={resetAndClose} />
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur rounded-lg"><FiPlus className="w-5 h-5 text-white" /></div>
                <div><h3 className="text-lg font-semibold text-white">Add New Job</h3><p className="text-sm text-primary-100">Create a new job posting</p></div>
              </div>
              <button onClick={resetAndClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"><FiX className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="px-6 pt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.number ? "bg-primary-600 border-primary-600 text-white" : "border-gray-300 text-gray-400"}`}>
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <p className={`text-sm font-medium ${currentStep >= step.number ? "text-primary-600" : "text-gray-500"}`}>{step.title}</p>
                    </div>
                    {index < steps.length - 1 && <div className={`w-12 sm:w-24 h-1 mx-4 rounded ${currentStep > step.number ? "bg-primary-600" : "bg-gray-200"}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Senior React Developer"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.title ? "border-red-500" : "border-gray-300"}`} />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                    <select name="company" value={formData.company} onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.company ? "border-red-500" : "border-gray-300"}`}>
                      <option value="">Select Company</option>
                      {employers.map((emp) => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
                    </select>
                    {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select name="category" value={formData.category} onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.category ? "border-red-500" : "border-gray-300"}`}>
                      <option value="">Select Category</option>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <select name="location" value={formData.location} onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.location ? "border-red-500" : "border-gray-300"}`}>
                      <option value="">Select Location</option>
                      {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
                    <select name="workMode" value={formData.workMode} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="Remote">Remote</option><option value="Hybrid">Hybrid</option><option value="On-site">On-site</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <select name="jobType" value={formData.jobType} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Contract">Contract</option><option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required *</label>
                  <select name="experience" value={formData.experience} onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.experience ? "border-red-500" : "border-gray-300"}`}>
                    <option value="">Select Experience</option>
                    {experienceLevels.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                  {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary (LPA) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input type="number" name="salaryMin" value={formData.salaryMin} onChange={handleInputChange} placeholder="e.g., 10"
                        className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.salaryMin ? "border-red-500" : "border-gray-300"}`} />
                    </div>
                    {errors.salaryMin && <p className="text-red-500 text-xs mt-1">{errors.salaryMin}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary (LPA) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input type="number" name="salaryMax" value={formData.salaryMax} onChange={handleInputChange} placeholder="e.g., 20"
                        className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.salaryMax ? "border-red-500" : "border-gray-300"}`} />
                    </div>
                    {errors.salaryMax && <p className="text-red-500 text-xs mt-1">{errors.salaryMax}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                  <textarea name="requirements" value={formData.requirements} onChange={handleInputChange} rows={4}
                    placeholder="Enter requirements (one per line)&#10;e.g., 5+ years experience in React&#10;Strong knowledge of TypeScript"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  <p className="text-xs text-gray-500 mt-1">Enter each requirement on a new line</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.description ? "border-red-500" : "border-gray-300"}`} />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                  <textarea name="benefits" value={formData.benefits} onChange={handleInputChange} rows={3}
                    placeholder="Enter benefits (one per line)&#10;e.g., Health Insurance&#10;Flexible working hours"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  <p className="text-xs text-gray-500 mt-1">Enter each benefit on a new line</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="ACTIVE">Active</option><option value="PENDING">Pending Review</option>
                  </select>
                </div>
                <div className="flex gap-6 p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                    <FiStar className="w-4 h-4 text-yellow-500" /><span className="text-sm text-gray-700">Featured Job</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="urgent" checked={formData.urgent} onChange={handleInputChange}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                    <FiAlertCircle className="w-4 h-4 text-red-500" /><span className="text-sm text-gray-700">Urgent Hiring</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <button onClick={currentStep === 1 ? resetAndClose : handleBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              {currentStep === 1 ? "Cancel" : "Back"}
            </button>
            {currentStep < 3 ? (
              <button onClick={handleNext} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">Next</button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:bg-primary-400 disabled:cursor-not-allowed">
                {isSubmitting ? (<><LoadingSpinner size="sm" color="white" />Posting...</>) : (<><FiCheckCircle className="w-4 h-4" />Post Job</>)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterWorkMode, setFilterWorkMode] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
      const data = await response.json();
      console.log('Fetched jobs data:', data); // Debug log
      if (data.success && data.jobs) {
        // Transform API data to match Job interface
        const transformedJobs: Job[] = data.jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          company: job.companyName || 'Unknown',
          companyId: job.employerId,
          category: job.category || 'Other',
          salary: job.salaryMin && job.salaryMax
            ? `₹${(job.salaryMin / 100000).toFixed(0)}-${(job.salaryMax / 100000).toFixed(0)} LPA`
            : 'Not specified',
          experience: job.experienceRequired || job.experienceLevel || 'Not specified',
          location: job.city || job.state || job.location || 'Remote',
          workMode: job.workMode || (job.isRemote ? 'Remote' : 'On-site'),
          jobType: job.employmentType || job.jobType || 'Full-time',
          applications: job._count?.applications || 0,
          views: job.views || 0,
          status: job.status,
          featured: job.featured || false,
          urgent: job.urgent || false,
          postedDate: job.postedAt || job.createdAt ? new Date(job.postedAt || job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : 'N/A',
          expiryDate: job.deadline ? new Date(job.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : 'N/A',
          description: job.description,
          requirements: [],
          benefits: [],
        }));
        console.log('Transformed jobs:', transformedJobs); // Debug log
        setJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Fallback to empty array on error to show "no jobs" message
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleActionMenu = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    if (showActionMenu === id) {
      setShowActionMenu(null);
      setMenuPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 5, right: window.innerWidth - rect.right });
      setShowActionMenu(id);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All Categories" || job.category === filterCategory;
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    const matchesWorkMode = filterWorkMode === "all" || job.workMode === filterWorkMode;
    return matchesSearch && matchesCategory && matchesStatus && matchesWorkMode;
  });

  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => j.status === "ACTIVE").length,
    pending: jobs.filter((j) => j.status === "PENDING").length,
    applications: jobs.reduce((sum, j) => sum + j.applications, 0),
  };

  const toggleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) setSelectedJobs([]);
    else setSelectedJobs(filteredJobs.map((j) => j.id));
  };

  const handleAddJob = (newJob: Job) => setJobs((prev) => [newJob, ...prev]);

  return (
    <div className="p-6 space-y-6">
      <AddJobModal isOpen={showAddJobModal} onClose={() => setShowAddJobModal(false)} onAdd={handleAddJob} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Jobs</h1>
          <p className="text-gray-600 mt-1">Manage all job postings across the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <FiDownload className="w-4 h-4" />Export
          </button>
          <button onClick={() => setShowAddJobModal(true)} className="flex items-center gap-2 bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold">
            <FiPlus className="w-4 h-4" />Add Job
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center"><FiBriefcase className="w-5 h-5 text-primary-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-xs text-gray-500">Total Jobs</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center"><FiCheckCircle className="w-5 h-5 text-primary-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.active}</p><p className="text-xs text-gray-500">Active</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center"><FiClock className="w-5 h-5 text-amber-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.pending}</p><p className="text-xs text-gray-500">Pending</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center"><FiUsers className="w-5 h-5 text-primary-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{stats.applications}</p><p className="text-xs text-gray-500">Applications</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search jobs or companies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer">
              <option value="All Categories">All Categories</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select value={filterWorkMode} onChange={(e) => setFilterWorkMode(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer">
              <option value="all">All Work Modes</option>
              <option value="Remote">Remote</option><option value="Hybrid">Hybrid</option><option value="On-site">On-site</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer">
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option><option value="PENDING">Pending</option><option value="PAUSED">Paused</option><option value="CLOSED">Closed</option>
            </select>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode("table")} className={`p-2.5 ${viewMode === "table" ? "bg-primary-50 text-primary-600" : "text-gray-500 hover:bg-gray-50"}`}><FiList className="w-5 h-5" /></button>
              <button onClick={() => setViewMode("grid")} className={`p-2.5 ${viewMode === "grid" ? "bg-primary-50 text-primary-600" : "text-gray-500 hover:bg-gray-50"}`}><FiGrid className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <LoadingSpinner size="lg" color="admin" />
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <FiBriefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No jobs found</p>
          <p className="text-sm text-gray-400">Try adjusting your filters or add a new job</p>
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input type="checkbox" checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0} onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Job</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applications</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Work Mode</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredJobs.map((job) => {
                  const statusBadge = getStatusBadge(job.status);
                  const WorkModeIcon = getWorkModeIcon(job.workMode);
                  return (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input type="checkbox" checked={selectedJobs.includes(job.id)}
                          onChange={() => setSelectedJobs((prev) => prev.includes(job.id) ? prev.filter((id) => id !== job.id) : [...prev, job.id])}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{job.title}</p>
                            {job.urgent && <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded border border-red-100">URGENT</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {job.featured && <span className="text-xs text-primary-600 font-medium">⭐ Featured</span>}
                            <span className="text-xs text-gray-500">{job.experience}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{job.company}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1"><FiMapPin className="w-3 h-3" />{job.location}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">{job.category}</span></td>
                      <td className="px-6 py-4"><p className="text-sm font-bold text-gray-900">{job.salary}</p></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2"><FiUsers className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium text-gray-900">{job.applications}</span></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600"><WorkModeIcon className="w-4 h-4 text-gray-400" />{job.workMode}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>{statusBadge.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button onClick={(e) => toggleActionMenu(e, job.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <FiMoreVertical className="w-4 h-4" />
                          </button>
                          {showActionMenu === job.id && menuPosition && (
                            <div
                              className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[100]"
                              style={{ top: menuPosition.top, right: menuPosition.right }}
                            >
                              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><FiEye className="w-4 h-4" />View Details</button>
                              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><FiEdit2 className="w-4 h-4" />Edit Job</button>
                              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><FiUsers className="w-4 h-4" />View Applications</button>
                              <hr className="my-1" />
                              {job.status === "ACTIVE" ? (
                                <>
                                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"><FiClock className="w-4 h-4" />Pause Job</button>
                                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"><FiXCircle className="w-4 h-4" />Close Job</button>
                                </>
                              ) : job.status === "PAUSED" ? (
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"><FiCheckCircle className="w-4 h-4" />Resume Job</button>
                              ) : (
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"><FiCheckCircle className="w-4 h-4" />Reopen Job</button>
                              )}
                              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><FiTrash2 className="w-4 h-4" />Delete</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">Showing {filteredJobs.length} of {jobs.length} jobs</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm">1</button>
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const statusBadge = getStatusBadge(job.status);
            const WorkModeIcon = getWorkModeIcon(job.workMode);
            return (
              <div key={job.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {job.urgent && <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded border border-red-100">URGENT</span>}
                    {job.featured && <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">Featured</span>}
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>{statusBadge.label}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{job.company}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded">{job.category}</span>
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded"><WorkModeIcon className="w-3 h-3" />{job.workMode}</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">{job.jobType}</span>
                </div>
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5" />{job.location}</div>
                  <div className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" />{job.experience}</div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-lg font-bold text-primary-600">{job.salary}</p>
                    <p className="text-xs text-gray-500">{job.applications} applications</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><FiEye className="w-4 h-4" /></button>
                    <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
