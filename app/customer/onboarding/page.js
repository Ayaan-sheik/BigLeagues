'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Building2, FileText, Phone, Upload, CheckCircle, 
  ArrowRight, ArrowLeft, Loader2, Shield, Check, LogOut 
} from 'lucide-react'

const STEPS = [
  { id: 1, name: 'Company Info', icon: Building2 },
  { id: 2, name: 'IRDAI License', icon: Shield },
  { id: 3, name: 'Contact & Bank', icon: Phone },
  { id: 4, name: 'Documents', icon: Upload },
  { id: 5, name: 'Review', icon: CheckCircle },
]

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Puducherry'
]

const COMPANY_TYPES = [
  'Insurance Carrier',
  'Insurance Broker', 
  'MGA',
  'Reinsurer'
]

const INSURANCE_PRODUCTS = [
  'Product Liability Insurance',
  'Warranty Liability Insurance',
  'Founder Risk Coverage',
  'Business Interruption',
  'E&O Coverage',
  'Performance Guarantee',
  'Refund Protection',
  'VC Portfolio Protection',
]

const TARGET_SEGMENTS = [
  'Early-stage Startups',
  'Growth-stage Startups',
  'SMEs',
  'Tech Companies',
  'D2C Brands',
]

export default function AdminOnboarding() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1: Company Information
    companyName: '',
    companyType: '',
    registrationNumber: '',
    yearsInBusiness: '',
    companyAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    
    // Step 2: IRDAI License
    irdaiLicense: {
      licenseNumber: '',
      issueDate: '',
      expiryDate: '',
      category: '',
      documentUrl: ''
    },
    productsOffered: [],
    targetSegments: [],
    estimatedPremiumVolume: '',
    
    // Step 3: Contact & Banking
    authorizedSignatory: {
      name: '',
      designation: '',
      email: '',
      phone: ''
    },
    contactDetails: {
      phone: '',
      alternatePhone: '',
      email: '',
      website: ''
    },
    bankDetails: {
      accountName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      bankName: '',
      branch: ''
    },
    
    // Step 4: Documents
    documents: []
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'customer') {
        router.push('/admin/onboarding')
      } else {
        // Fetch saved profile data and resume
        fetchSavedProfile()
      }
    }
  }, [status, session, router])

  const fetchSavedProfile = async () => {
    try {
      const res = await fetch('/api/customer/profile')
      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          // Deep merge saved data with initial formData structure
          const savedData = data.profile
          setFormData(prev => ({
            ...prev,
            companyName: savedData.companyName || prev.companyName,
            companyType: savedData.companyType || prev.companyType,
            registrationNumber: savedData.registrationNumber || prev.registrationNumber,
            yearsInBusiness: savedData.yearsInBusiness || prev.yearsInBusiness,
            companyAddress: savedData.companyAddress || prev.companyAddress,
            irdaiLicense: savedData.irdaiLicense || prev.irdaiLicense,
            productsOffered: savedData.productsOffered || prev.productsOffered,
            targetSegments: savedData.targetSegments || prev.targetSegments,
            estimatedPremiumVolume: savedData.estimatedPremiumVolume || prev.estimatedPremiumVolume,
            authorizedSignatory: savedData.authorizedSignatory || prev.authorizedSignatory,
            contactDetails: savedData.contactDetails || prev.contactDetails,
            bankDetails: savedData.bankDetails || prev.bankDetails,
            documents: savedData.documents || prev.documents,
          }))
        }
      }
      
      // Resume from saved step using session data
      const savedStep = session?.user?.onboardingStep || 0
      if (savedStep > 0 && savedStep < 5) {
        setCurrentStep(savedStep + 1) // Resume at next step
      }
    } catch (error) {
      console.error('Failed to fetch saved profile:', error)
    }
  }

  // Auto-save function
  const autoSave = async (step, data) => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, data, role: 'customer' })
      })
      
      if (response.ok) {
        setSaveMessage('Saved ✓')
        setTimeout(() => setSaveMessage(''), 2000)
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = async () => {
    // Validate current step before proceeding
    if (!validateStep(currentStep)) return
    
    // Auto-save before moving to next step
    await autoSave(currentStep, formData)
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/customer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // Redirect to customer dashboard
        router.push('/customer/dashboard')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to submit')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateStep = (step) => {
    // Add validation logic for each step
    return true // For now, allow progression
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F7F5F3] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F3]">
      {/* Header with account info */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">InsureInfra</h1>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-600">Customer Onboarding</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
              <div className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full">
                <span className="text-xs font-medium text-gray-700 capitalize">{session?.user?.role}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-gray-900 text-sm font-medium transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Progress Bar */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentStep > step.id 
                      ? 'bg-gray-900 text-white'
                      : currentStep === step.id
                      ? 'bg-gray-900 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs mt-2 text-gray-600 text-center hidden sm:block">
                    {step.name}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-gray-900' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
          </p>
          {saveMessage && (
            <p className="text-xs text-green-600 text-center mt-2">{saveMessage}</p>
          )}
        </div>

        {/* Step Content */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          {currentStep === 1 && (
            <Step1CompanyInfo 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 2 && (
            <Step2IRDAILicense 
              formData={formData} 
              updateFormData={updateFormData}
              fileToBase64={fileToBase64}
            />
          )}
          {currentStep === 3 && (
            <Step3ContactBank 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 4 && (
            <Step4Documents 
              formData={formData} 
              updateFormData={updateFormData}
              fileToBase64={fileToBase64}
            />
          )}
          {currentStep === 5 && (
            <Step5Review 
              formData={formData}
              setCurrentStep={setCurrentStep}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-gray-900 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              disabled={isSaving}
              className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Submit for Verification'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Step Components (I'll create these next)
function Step1CompanyInfo({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us about your insurance company</h2>
      
      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
        <input
          type="text"
          value={formData.companyName}
          onChange={(e) => updateFormData('companyName', e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="Enter company name"
        />
      </div>

      {/* Company Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Type *</label>
        <select
          value={formData.companyType}
          onChange={(e) => updateFormData('companyType', e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          <option value="">Select company type</option>
          {COMPANY_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Registration Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">IRDAI Registration Number *</label>
        <input
          type="text"
          value={formData.registrationNumber}
          onChange={(e) => updateFormData('registrationNumber', e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="Enter IRDAI registration number"
        />
      </div>

      {/* Years in Business */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Years in Business *</label>
        <input
          type="number"
          value={formData.yearsInBusiness}
          onChange={(e) => updateFormData('yearsInBusiness', e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="Enter years in business"
        />
      </div>

      {/* Address Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
          <input
            type="text"
            value={formData.companyAddress.street}
            onChange={(e) => updateFormData('companyAddress', { ...formData.companyAddress, street: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Enter street address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
          <input
            type="text"
            value={formData.companyAddress.city}
            onChange={(e) => updateFormData('companyAddress', { ...formData.companyAddress, city: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Enter city"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
          <select
            value={formData.companyAddress.state}
            onChange={(e) => updateFormData('companyAddress', { ...formData.companyAddress, state: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
          <input
            type="text"
            maxLength={6}
            value={formData.companyAddress.pincode}
            onChange={(e) => updateFormData('companyAddress', { ...formData.companyAddress, pincode: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="6-digit pincode"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <input
            type="text"
            value={formData.companyAddress.country}
            disabled
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-gray-600"
          />
        </div>
      </div>
    </div>
  )
}

function Step2IRDAILicense({ formData, updateFormData, fileToBase64 }) {
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      const base64 = await fileToBase64(file)
      updateFormData('irdaiLicense', {
        ...formData.irdaiLicense,
        documentUrl: base64
      })
    } else {
      alert('Please upload a PDF file')
    }
  }

  const toggleProduct = (product) => {
    const products = formData.productsOffered || []
    if (products.includes(product)) {
      updateFormData('productsOffered', products.filter(p => p !== product))
    } else {
      updateFormData('productsOffered', [...products, product])
    }
  }

  const toggleSegment = (segment) => {
    const segments = formData.targetSegments || []
    if (segments.includes(segment)) {
      updateFormData('targetSegments', segments.filter(s => s !== segment))
    } else {
      updateFormData('targetSegments', [...segments, segment])
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your IRDAI License Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
          <input
            type="text"
            value={formData.irdaiLicense.licenseNumber || formData.registrationNumber}
            onChange={(e) => updateFormData('irdaiLicense', { ...formData.irdaiLicense, licenseNumber: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date *</label>
          <input
            type="date"
            value={formData.irdaiLicense.issueDate}
            onChange={(e) => updateFormData('irdaiLicense', { ...formData.irdaiLicense, issueDate: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
          <input
            type="date"
            value={formData.irdaiLicense.expiryDate}
            onChange={(e) => updateFormData('irdaiLicense', { ...formData.irdaiLicense, expiryDate: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">License Category *</label>
          <input
            type="text"
            value={formData.irdaiLicense.category}
            onChange={(e) => updateFormData('irdaiLicense', { ...formData.irdaiLicense, category: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="e.g., General Insurance"
          />
        </div>
      </div>

      {/* License Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload License Document *</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="license-upload"
          />
          <label htmlFor="license-upload" className="cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500 mt-1">PDF only, max 10MB</p>
          </label>
          {formData.irdaiLicense.documentUrl && (
            <p className="text-xs text-green-600 mt-2">✓ License uploaded</p>
          )}
        </div>
      </div>

      {/* Products Offered */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Insurance Products You Offer *</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INSURANCE_PRODUCTS.map(product => (
            <label key={product} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.productsOffered?.includes(product)}
                onChange={() => toggleProduct(product)}
                className="w-4 h-4 text-gray-900 rounded focus:ring-2 focus:ring-gray-900"
              />
              <span className="text-sm text-gray-700">{product}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Target Segments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Target Segments *</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TARGET_SEGMENTS.map(segment => (
            <label key={segment} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.targetSegments?.includes(segment)}
                onChange={() => toggleSegment(segment)}
                className="w-4 h-4 text-gray-900 rounded focus:ring-2 focus:ring-gray-900"
              />
              <span className="text-sm text-gray-700">{segment}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Premium Volume */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Annual Premium Volume *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
          <input
            type="number"
            value={formData.estimatedPremiumVolume}
            onChange={(e) => updateFormData('estimatedPremiumVolume', e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg py-3 pl-8 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Enter estimated annual premium volume"
          />
        </div>
      </div>
    </div>
  )
}

// Continuing in next message due to length...
function Step3ContactBank({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact and Banking Details</h2>
      
      {/* Authorized Signatory */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Authorized Signatory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              value={formData.authorizedSignatory.name}
              onChange={(e) => updateFormData('authorizedSignatory', { ...formData.authorizedSignatory, name: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
            <input
              type="text"
              value={formData.authorizedSignatory.designation}
              onChange={(e) => updateFormData('authorizedSignatory', { ...formData.authorizedSignatory, designation: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              value={formData.authorizedSignatory.email}
              onChange={(e) => updateFormData('authorizedSignatory', { ...formData.authorizedSignatory, email: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
            <input
              type="tel"
              value={formData.authorizedSignatory.phone}
              onChange={(e) => updateFormData('authorizedSignatory', { ...formData.authorizedSignatory, phone: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="+91 XXXXXXXXXX"
            />
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Phone *</label>
            <input
              type="tel"
              value={formData.contactDetails.phone}
              onChange={(e) => updateFormData('contactDetails', { ...formData.contactDetails, phone: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="+91 XXXXXXXXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Phone</label>
            <input
              type="tel"
              value={formData.contactDetails.alternatePhone}
              onChange={(e) => updateFormData('contactDetails', { ...formData.contactDetails, alternatePhone: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="+91 XXXXXXXXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Official Email *</label>
            <input
              type="email"
              value={formData.contactDetails.email}
              onChange={(e) => updateFormData('contactDetails', { ...formData.contactDetails, email: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
            <input
              type="url"
              value={formData.contactDetails.website}
              onChange={(e) => updateFormData('contactDetails', { ...formData.contactDetails, website: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name *</label>
            <input
              type="text"
              value={formData.bankDetails.accountName}
              onChange={(e) => updateFormData('bankDetails', { ...formData.bankDetails, accountName: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
            <input
              type="text"
              value={formData.bankDetails.accountNumber}
              onChange={(e) => updateFormData('bankDetails', { ...formData.bankDetails, accountNumber: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Account Number *</label>
            <input
              type="text"
              value={formData.bankDetails.confirmAccountNumber}
              onChange={(e) => updateFormData('bankDetails', { ...formData.bankDetails, confirmAccountNumber: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code *</label>
            <input
              type="text"
              value={formData.bankDetails.ifscCode}
              onChange={(e) => updateFormData('bankDetails', { ...formData.bankDetails, ifscCode: e.target.value.toUpperCase() })}
              className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="SBIN0001234"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
            <input
              type="text"
              value={formData.bankDetails.bankName}
              onChange={(e) => updateFormData('bankDetails', { ...formData.bankDetails, bankName: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name *</label>
            <input
              type="text"
              value={formData.bankDetails.branch}
              onChange={(e) => updateFormData('bankDetails', { ...formData.bankDetails, branch: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Step4Documents({ formData, updateFormData, fileToBase64 }) {
  const handleDocumentUpload = async (e, docType) => {
    const file = e.target.files[0]
    if (file) {
      const base64 = await fileToBase64(file)
      const newDoc = {
        type: docType,
        url: base64,
        uploadedAt: new Date(),
        verified: false,
        fileName: file.name
      }
      updateFormData('documents', [...(formData.documents || []), newDoc])
    }
  }

  const removeDocument = (index) => {
    const docs = formData.documents.filter((_, i) => i !== index)
    updateFormData('documents', docs)
  }

  const getDocumentsByType = (type) => {
    return formData.documents?.filter(doc => doc.type === type) || []
  }

  const DocumentUploadCard = ({ title, docType, required }) => {
    const docs = getDocumentsByType(docType)
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          {title} {required && <span className="text-red-500">*</span>}
        </h4>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => handleDocumentUpload(e, docType)}
            className="hidden"
            id={`upload-${docType}`}
          />
          <label htmlFor={`upload-${docType}`} className="cursor-pointer">
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Click to upload</p>
            <p className="text-xs text-gray-500 mt-1">PDF or Image, max 10MB</p>
          </label>
        </div>
        {docs.map((doc, idx) => (
          <div key={idx} className="mt-2 flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-xs text-gray-700 truncate">{doc.fileName}</span>
            <button
              onClick={() => removeDocument(formData.documents.indexOf(doc))}
              className="text-red-500 hover:text-red-700 text-xs"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Required Documents</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DocumentUploadCard 
          title="Certificate of Incorporation"
          docType="incorporation_certificate"
          required
        />
        <DocumentUploadCard 
          title="Company PAN Card"
          docType="pan_card"
          required
        />
        <DocumentUploadCard 
          title="GST Registration Certificate"
          docType="gst_certificate"
          required
        />
        <DocumentUploadCard 
          title="Bank Account Proof"
          docType="bank_proof"
          required
        />
        <DocumentUploadCard 
          title="Additional Documents"
          docType="other"
        />
      </div>
    </div>
  )
}

function Step5Review({ formData, setCurrentStep }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Information</h2>
      
      {/* Company Info */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
          <button
            onClick={() => setCurrentStep(1)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Company Name:</p>
            <p className="text-gray-900 font-medium">{formData.companyName}</p>
          </div>
          <div>
            <p className="text-gray-500">Company Type:</p>
            <p className="text-gray-900 font-medium">{formData.companyType}</p>
          </div>
          <div>
            <p className="text-gray-500">Registration Number:</p>
            <p className="text-gray-900 font-medium">{formData.registrationNumber}</p>
          </div>
          <div>
            <p className="text-gray-500">Years in Business:</p>
            <p className="text-gray-900 font-medium">{formData.yearsInBusiness}</p>
          </div>
        </div>
      </div>

      {/* IRDAI License */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">IRDAI License</h3>
          <button
            onClick={() => setCurrentStep(2)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">License Number:</p>
            <p className="text-gray-900 font-medium">{formData.irdaiLicense.licenseNumber}</p>
          </div>
          <div>
            <p className="text-gray-500">Products Offered:</p>
            <p className="text-gray-900 font-medium">{formData.productsOffered?.length || 0} products</p>
          </div>
        </div>
      </div>

      {/* Contact & Banking */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Contact & Banking</h3>
          <button
            onClick={() => setCurrentStep(3)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Primary Contact:</p>
            <p className="text-gray-900 font-medium">{formData.contactDetails.phone}</p>
          </div>
          <div>
            <p className="text-gray-500">Bank:</p>
            <p className="text-gray-900 font-medium">{formData.bankDetails.bankName}</p>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
          <button
            onClick={() => setCurrentStep(4)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
        </div>
        <p className="text-sm text-gray-700">{formData.documents?.length || 0} documents uploaded</p>
      </div>

      {/* Terms */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 text-gray-900 rounded focus:ring-2 focus:ring-gray-900"
          />
          <span className="text-sm text-gray-700">
            I confirm that all information provided is accurate and complete. I agree to the Terms of Service and Privacy Policy.
          </span>
        </label>
      </div>
    </div>
  )
}
