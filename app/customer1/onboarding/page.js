'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Building2, Users, Briefcase, AlertTriangle, Shield, 
  Upload, CheckCircle, ArrowRight, ArrowLeft, Loader2, 
  Check, LogOut, X, Plus, FileText
} from 'lucide-react'

const STEPS = [
  { id: 1, name: 'Company', icon: Building2 },
  { id: 2, name: 'Founders', icon: Users },
  { id: 3, name: 'Business', icon: Briefcase },
  { id: 4, name: 'Risk', icon: AlertTriangle },
  { id: 5, name: 'Insurance', icon: Shield },
  { id: 6, name: 'Documents', icon: Upload },
  { id: 7, name: 'Review', icon: CheckCircle },
]

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Puducherry'
]

const INDUSTRIES = [
  'Technology', 'Fintech', 'Healthtech', 'E-commerce', 'SaaS',
  'IoT/Hardware', 'Mobility', 'Edtech', 'Agritech', 'Other'
]

const BUSINESS_MODELS = ['B2B', 'B2C', 'B2B2C', 'Marketplace', 'Other']
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+']
const FUNDING_STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Bootstrapped']
const CERTIFICATIONS = ['ISO Certified', 'SOC 2', 'GDPR Compliant', 'PCI DSS', 'HIPAA', 'None']

const INSURANCE_PRODUCTS = [
  { name: 'Product Liability Insurance', description: 'Covers claims from defective products' },
  { name: 'Warranty Coverage', description: 'Protection against warranty claims' },
  { name: 'Founder Risk Protection', description: 'Key person insurance coverage' },
  { name: 'Business Interruption', description: 'Loss of income during disruptions' },
  { name: 'E&O Coverage', description: 'Professional liability protection' },
  { name: 'Performance Guarantee', description: 'Contract performance obligations' },
  { name: 'Refund Protection', description: 'Customer refund coverage' },
]

export default function CustomerOnboarding() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    businessModel: '',
    incorporationDate: '',
    companySize: '',
    companyAddress: { street: '', city: '', state: '', pincode: '', country: 'India' },
    contactDetails: { phone: '', alternatePhone: '', email: '', website: '' },
    founders: [{ name: '', email: '', role: '', experience: '' }],
    businessDescription: '',
    productsServices: [''],
    customerBase: '',
    monthlyRevenue: '',
    expectedGrowth: '',
    fundingStage: '',
    totalFunding: '',
    previousInsurance: false,
    previousInsuranceDetails: '',
    claimsHistory: '',
    qualityControlProcesses: '',
    certifications: [],
    complianceStatus: '',
    interestedProducts: [],
    estimatedTransactionVolume: '',
    averageOrderValue: '',
    bankDetails: { accountName: '', accountNumber: '', confirmAccountNumber: '', ifscCode: '', bankName: '', branch: '' },
    documents: []
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'customer') {
        router.push('/admin1/onboarding')
      } else {
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
          const saved = data.profile
          setFormData(prev => ({
            ...prev,
            companyName: saved.companyName || prev.companyName,
            industry: saved.industry || prev.industry,
            businessModel: saved.businessModel || prev.businessModel,
            incorporationDate: saved.incorporationDate || prev.incorporationDate,
            companySize: saved.companySize || prev.companySize,
            companyAddress: saved.companyAddress || prev.companyAddress,
            contactDetails: saved.contactDetails || prev.contactDetails,
            founders: saved.founders || prev.founders,
            businessDescription: saved.businessDescription || prev.businessDescription,
            productsServices: saved.productsServices || prev.productsServices,
            customerBase: saved.customerBase || prev.customerBase,
            monthlyRevenue: saved.monthlyRevenue || prev.monthlyRevenue,
            expectedGrowth: saved.expectedGrowth || prev.expectedGrowth,
            fundingStage: saved.fundingStage || prev.fundingStage,
            totalFunding: saved.totalFunding || prev.totalFunding,
            previousInsurance: saved.previousInsurance || prev.previousInsurance,
            previousInsuranceDetails: saved.previousInsuranceDetails || prev.previousInsuranceDetails,
            claimsHistory: saved.claimsHistory || prev.claimsHistory,
            qualityControlProcesses: saved.qualityControlProcesses || prev.qualityControlProcesses,
            certifications: saved.certifications || prev.certifications,
            complianceStatus: saved.complianceStatus || prev.complianceStatus,
            interestedProducts: saved.interestedProducts || prev.interestedProducts,
            estimatedTransactionVolume: saved.estimatedTransactionVolume || prev.estimatedTransactionVolume,
            averageOrderValue: saved.averageOrderValue || prev.averageOrderValue,
            bankDetails: saved.bankDetails || prev.bankDetails,
            documents: saved.documents || prev.documents,
          }))
        }
      }
      const savedStep = session?.user?.onboardingStep || 0
      if (savedStep > 0 && savedStep < 7) {
        setCurrentStep(savedStep + 1)
      }
    } catch (error) {
      console.error('Failed to fetch saved profile:', error)
    }
  }

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
    await autoSave(currentStep, formData)
    if (currentStep < 7) {
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
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentStep > step.id ? 'bg-gray-900 text-white' : currentStep === step.id ? 'bg-gray-900 text-white animate-pulse' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <span className="text-xs mt-2 text-gray-600 text-center hidden sm:block">{step.name}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? 'bg-gray-900' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center">Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}</p>
          {saveMessage && <p className="text-xs text-green-600 text-center mt-2">{saveMessage}</p>}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          {currentStep === 1 && <Step1Company formData={formData} updateFormData={updateFormData} />}
          {currentStep === 2 && <Step2Founders formData={formData} updateFormData={updateFormData} />}
          {currentStep === 3 && <Step3Business formData={formData} updateFormData={updateFormData} />}
          {currentStep === 4 && <Step4Risk formData={formData} updateFormData={updateFormData} />}
          {currentStep === 5 && <Step5Insurance formData={formData} updateFormData={updateFormData} />}
          {currentStep === 6 && <Step6Documents formData={formData} updateFormData={updateFormData} fileToBase64={fileToBase64} />}
          {currentStep === 7 && <Step7Review formData={formData} setCurrentStep={setCurrentStep} />}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-gray-900 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          {currentStep < 7 ? (
            <button onClick={handleNext} disabled={isSaving} className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Step1Company({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Let's start with your company basics</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company/Startup Name *</label>
        <input type="text" value={formData.companyName} onChange={(e) => updateFormData('companyName', e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Enter company name" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Industry/Sector *</label>
          <select value={formData.industry} onChange={(e) => updateFormData('industry', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900">
            <option value="">Select industry</option>
            {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Model *</label>
          <select value={formData.businessModel} onChange={(e) => updateFormData('businessModel', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900">
            <option value="">Select model</option>
            {BUSINESS_MODELS.map(model => <option key={model} value={model}>{model}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Incorporation *</label>
          <input type="date" value={formData.incorporationDate} onChange={(e) => updateFormData('incorporationDate', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Size *</label>
          <select value={formData.companySize} onChange={(e) => updateFormData('companySize', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900">
            <option value="">Select size</option>
            {COMPANY_SIZES.map(size => <option key={size} value={size}>{size} employees</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
          <input type="text" value={formData.companyAddress.street} onChange={(e) => updateFormData('companyAddress', { ...formData.companyAddress, street: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
          <input type="text" value={formData.companyAddress.city} onChange={(e) => updateFormData('companyAddress', { ...formData.companyAddress, city: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
          <select value={formData.companyAddress.state} onChange={(e) => updateFormData('companyAddress', { ...formData.companyAddress, state: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900">
            <option value="">Select state</option>
            {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
          <input type="text" maxLength={6} value={formData.companyAddress.pincode} onChange={(e) => updateFormData('companyAddress', { ...formData.companyAddress, pincode: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Phone *</label>
          <input type="tel" value={formData.contactDetails.phone} onChange={(e) => updateFormData('contactDetails', { ...formData.contactDetails, phone: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="+91 XXXXXXXXXX" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Official Email *</label>
          <input type="email" value={formData.contactDetails.email} onChange={(e) => updateFormData('contactDetails', { ...formData.contactDetails, email: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website (optional)</label>
          <input type="url" value={formData.contactDetails.website} onChange={(e) => updateFormData('contactDetails', { ...formData.contactDetails, website: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="https://example.com" />
        </div>
      </div>
    </div>
  )
}

function Step2Founders({ formData, updateFormData }) {
  const addFounder = () => {
    const founders = [...formData.founders, { name: '', email: '', role: '', experience: '' }]
    updateFormData('founders', founders)
  }
  const removeFounder = (index) => {
    const founders = formData.founders.filter((_, i) => i !== index)
    updateFormData('founders', founders)
  }
  const updateFounder = (index, field, value) => {
    const founders = [...formData.founders]
    founders[index][field] = value
    updateFormData('founders', founders)
  }
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us about your founding team</h2>
      {formData.founders.map((founder, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
          {index > 0 && <button onClick={() => removeFounder(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><X className="w-5 h-5" /></button>}
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Founder {index + 1}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input type="text" value={founder.name} onChange={(e) => updateFounder(index, 'name', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input type="email" value={founder.email} onChange={(e) => updateFounder(index, 'email', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role/Designation *</label>
              <input type="text" value={founder.role} onChange={(e) => updateFounder(index, 'role', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="e.g., CEO, CTO" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
              <input type="number" value={founder.experience} onChange={(e) => updateFounder(index, 'experience', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>
        </div>
      ))}
      {formData.founders.length < 5 && (
        <button onClick={addFounder} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-gray-900 font-medium transition-all">
          <Plus className="w-4 h-4" />Add Another Founder
        </button>
      )}
    </div>
  )
}

function Step3Business({ formData, updateFormData }) {
  const addProduct = () => {
    const products = [...formData.productsServices, '']
    updateFormData('productsServices', products)
  }
  const removeProduct = (index) => {
    const products = formData.productsServices.filter((_, i) => i !== index)
    updateFormData('productsServices', products)
  }
  const updateProduct = (index, value) => {
    const products = [...formData.productsServices]
    products[index] = value
    updateFormData('productsServices', products)
  }
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Help us understand your business</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Description *</label>
        <p className="text-xs text-gray-500 mb-2">Describe what your startup does (min 50 characters)</p>
        <textarea value={formData.businessDescription} onChange={(e) => updateFormData('businessDescription', e.target.value)} rows={4} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Tell us about your business..." />
        <p className="text-xs text-gray-500 mt-1">{formData.businessDescription.length} characters</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Products/Services Offered *</label>
        {formData.productsServices.map((product, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input type="text" value={product} onChange={(e) => updateProduct(index, e.target.value)} className="flex-1 bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder={`Product/Service ${index + 1}`} />
            {index > 0 && <button onClick={() => removeProduct(index)} className="px-3 py-2 text-red-500 hover:text-red-700"><X className="w-5 h-5" /></button>}
          </div>
        ))}
        {formData.productsServices.length < 10 && (
          <button onClick={addProduct} className="mt-2 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-gray-900 text-sm font-medium transition-all">
            <Plus className="w-4 h-4" />Add Product/Service
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer Base</label>
          <input type="number" value={formData.customerBase} onChange={(e) => updateFormData('customerBase', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Number of active customers" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Revenue (₹)</label>
          <input type="number" value={formData.monthlyRevenue} onChange={(e) => updateFormData('monthlyRevenue', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Average monthly revenue" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Funding Stage *</label>
          <select value={formData.fundingStage} onChange={(e) => updateFormData('fundingStage', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900">
            <option value="">Select stage</option>
            {FUNDING_STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
          </select>
        </div>
        {formData.fundingStage && formData.fundingStage !== 'Bootstrapped' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Funding (₹)</label>
            <input type="number" value={formData.totalFunding} onChange={(e) => updateFormData('totalFunding', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Expected Growth Rate</label>
        <input type="text" value={formData.expectedGrowth} onChange={(e) => updateFormData('expectedGrowth', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="e.g., 20% month-on-month" />
      </div>
    </div>
  )
}

function Step4Risk({ formData, updateFormData }) {
  const toggleCert = (cert) => {
    const certs = formData.certifications || []
    if (certs.includes(cert)) {
      updateFormData('certifications', certs.filter(c => c !== cert))
    } else {
      updateFormData('certifications', [...certs, cert])
    }
  }
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Let's assess your risk profile</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Previous Insurance *</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2"><input type="radio" checked={formData.previousInsurance === true} onChange={() => updateFormData('previousInsurance', true)} className="w-4 h-4" /><span className="text-sm">Yes</span></label>
          <label className="flex items-center gap-2"><input type="radio" checked={formData.previousInsurance === false} onChange={() => updateFormData('previousInsurance', false)} className="w-4 h-4" /><span className="text-sm">No</span></label>
        </div>
        {formData.previousInsurance && (
          <textarea value={formData.previousInsuranceDetails} onChange={(e) => updateFormData('previousInsuranceDetails', e.target.value)} rows={3} className="mt-3 w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Provide details" />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Claims History *</label>
        <textarea value={formData.claimsHistory} onChange={(e) => updateFormData('claimsHistory', e.target.value)} rows={3} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Have you filed claims?" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quality Control *</label>
        <textarea value={formData.qualityControlProcesses} onChange={(e) => updateFormData('qualityControlProcesses', e.target.value)} rows={3} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Describe your QC processes" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Certifications *</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CERTIFICATIONS.map(cert => (
            <label key={cert} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={formData.certifications?.includes(cert)} onChange={() => toggleCert(cert)} className="w-4 h-4 rounded" />
              <span className="text-sm">{cert}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Status *</label>
        <textarea value={formData.complianceStatus} onChange={(e) => updateFormData('complianceStatus', e.target.value)} rows={3} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Regulatory compliance" />
      </div>
    </div>
  )
}

function Step5Insurance({ formData, updateFormData }) {
  const toggleProduct = (name) => {
    const products = formData.interestedProducts || []
    if (products.includes(name)) {
      updateFormData('interestedProducts', products.filter(p => p !== name))
    } else {
      updateFormData('interestedProducts', [...products, name])
    }
  }
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">What coverage do you need?</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Select Products *</label>
        <div className="grid grid-cols-1 gap-3">
          {INSURANCE_PRODUCTS.map(product => (
            <button key={product.name} onClick={() => toggleProduct(product.name)} className={`text-left p-4 border-2 rounded-lg transition-all ${formData.interestedProducts?.includes(product.name) ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${formData.interestedProducts?.includes(product.name) ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
                  {formData.interestedProducts?.includes(product.name) && <Check className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Volume (Monthly) *</label>
          <input type="number" value={formData.estimatedTransactionVolume} onChange={(e) => updateFormData('estimatedTransactionVolume', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Number per month" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Average Order Value (₹) *</label>
          <input type="number" value={formData.averageOrderValue} onChange={(e) => updateFormData('averageOrderValue', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Value per transaction" />
        </div>
      </div>
    </div>
  )
}

function Step6Documents({ formData, updateFormData, fileToBase64 }) {
  const handleUpload = async (e, type) => {
    const file = e.target.files[0]
    if (file) {
      const base64 = await fileToBase64(file)
      const newDoc = { type, url: base64, uploadedAt: new Date(), verified: false, fileName: file.name }
      updateFormData('documents', [...(formData.documents || []), newDoc])
    }
  }
  const removeDoc = (index) => {
    const docs = formData.documents.filter((_, i) => i !== index)
    updateFormData('documents', docs)
  }
  const getDocsByType = (type) => formData.documents?.filter(doc => doc.type === type) || []
  const DocCard = ({ title, type, required }) => {
    const docs = getDocsByType(type)
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">{title} {required && <span className="text-red-500">*</span>}</h4>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
          <input type="file" accept="application/pdf,image/*" onChange={(e) => handleUpload(e, type)} className="hidden" id={`upload-${type}`} />
          <label htmlFor={`upload-${type}`} className="cursor-pointer">
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Click to upload</p>
          </label>
        </div>
        {docs.map((doc, idx) => (
          <div key={idx} className="mt-2 flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-xs text-gray-700 truncate flex items-center gap-2"><FileText className="w-4 h-4" />{doc.fileName}</span>
            <button onClick={() => removeDoc(formData.documents.indexOf(doc))} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Banking & Documents</h2>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Name *</label>
            <input type="text" value={formData.bankDetails.accountName} onChange={(e) => updateFormData('bankDetails', { ...formData.bankDetails, accountName: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
            <input type="text" value={formData.bankDetails.accountNumber} onChange={(e) => updateFormData('bankDetails', { ...formData.bankDetails, accountNumber: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Account *</label>
            <input type="text" value={formData.bankDetails.confirmAccountNumber} onChange={(e) => updateFormData('bankDetails', { ...formData.bankDetails, confirmAccountNumber: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code *</label>
            <input type="text" value={formData.bankDetails.ifscCode} onChange={(e) => updateFormData('bankDetails', { ...formData.bankDetails, ifscCode: e.target.value.toUpperCase() })} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="SBIN0001234" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
            <input type="text" value={formData.bankDetails.bankName} onChange={(e) => updateFormData('bankDetails', { ...formData.bankDetails, bankName: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branch *</label>
            <input type="text" value={formData.bankDetails.branch} onChange={(e) => updateFormData('bankDetails', { ...formData.bankDetails, branch: e.target.value })} className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DocCard title="Incorporation Certificate" type="incorporation_certificate" required />
          <DocCard title="PAN Card" type="pan_card" required />
          <DocCard title="GST Certificate" type="gst_certificate" required />
          <DocCard title="Bank Proof" type="bank_proof" required />
          <DocCard title="Pitch Deck" type="pitch_deck" />
          <DocCard title="Financial Statements" type="financial_statements" />
        </div>
      </div>
    </div>
  )
}

function Step7Review({ formData, setCurrentStep }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review your application</h2>
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Company</h3>
            <button onClick={() => setCurrentStep(1)} className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
          </div>
          <p className="text-sm text-gray-700">{formData.companyName} • {formData.industry}</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Founders</h3>
            <button onClick={() => setCurrentStep(2)} className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
          </div>
          <p className="text-sm text-gray-700">{formData.founders?.length || 0} founders</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Business</h3>
            <button onClick={() => setCurrentStep(3)} className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
          </div>
          <p className="text-sm text-gray-700">{formData.fundingStage} stage</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Risk</h3>
            <button onClick={() => setCurrentStep(4)} className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
          </div>
          <p className="text-sm text-gray-700">{formData.certifications?.length || 0} certifications</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Insurance</h3>
            <button onClick={() => setCurrentStep(5)} className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
          </div>
          <p className="text-sm text-gray-700">{formData.interestedProducts?.length || 0} products</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
            <button onClick={() => setCurrentStep(6)} className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
          </div>
          <p className="text-sm text-gray-700">{formData.documents?.length || 0} docs</p>
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="mt-1 w-4 h-4 rounded" />
          <span className="text-sm text-gray-700">I confirm all information is accurate. I agree to Terms, Privacy Policy, and consent to risk assessment.</span>
        </label>
      </div>
    </div>
  )
}
