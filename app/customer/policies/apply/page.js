'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export default function ApplyForPolicyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // Step 1: Search, Step 2: Form
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    founderName: '',
    founderEmail: '',
    productPrice: '',
    requestedCoverage: '',
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  async function fetchProducts() {
    try {
      setLoading(true)
      const res = await fetch('/api/customer/products/search')
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(data.products || [])
      setFilteredProducts(data.products || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleProductSelect(product) {
    setSelectedProduct(product)
    setStep(2)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/customer/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          companyName: formData.companyName,
          industry: formData.industry,
          founderName: formData.founderName,
          founderEmail: formData.founderEmail,
          productPrice: parseFloat(formData.productPrice),
          requestedCoverage: formData.requestedCoverage,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit application')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/customer/policies')
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-4">Your policy application has been sent for review.</p>
            <p className="text-sm text-gray-500">Redirecting to policies...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => step === 2 ? setStep(1) : router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Apply for Policy</h1>
          <p className="text-gray-600 mt-1">
            {step === 1 ? 'Search and select a policy' : 'Fill in your application details'}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Step 1: Search and Select Product */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Search Bar */}
          <Card>
            <CardHeader>
              <CardTitle>Search Available Policies</CardTitle>
              <CardDescription>Find the right insurance coverage for your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by name, category, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Products List */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No products found matching your search.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        {product.category && (
                          <Badge variant="outline" className="mt-2">
                            {product.category}
                          </Badge>
                        )}
                      </div>
                      <Badge variant={product.status === 'active' ? 'success' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{product.description}</p>
                    <div className="text-sm">
                      <p className="text-gray-500">Coverage Range</p>
                      <p className="font-semibold text-lg">₹{(product.coverageMin/100000).toFixed(1)}L - ₹{(product.coverageMax/100000).toFixed(1)}L</p>
                    </div>
                    <Button 
                      onClick={() => handleProductSelect(product)}
                      className="w-full"
                    >
                      Select This Policy
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Application Form */}
      {step === 2 && selectedProduct && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Selected Product Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-lg">{selectedProduct.name}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedProduct.description}</p>
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500">Base Premium</p>
                <p className="text-lg font-bold">₹{selectedProduct.basePrice} per ₹10,000</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Coverage Range</p>
                <p className="text-sm font-semibold">
                  ₹{(selectedProduct.coverageMin/100000).toFixed(1)}L - ₹{(selectedProduct.coverageMax/100000).toFixed(1)}L
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Application Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
              <CardDescription>Provide your company information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Your Company Ltd."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry *</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="e.g., SaaS, E-commerce"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="founderName">Founder Name *</Label>
                    <Input
                      id="founderName"
                      value={formData.founderName}
                      onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="founderEmail">Founder Email *</Label>
                    <Input
                      id="founderEmail"
                      type="email"
                      value={formData.founderEmail}
                      onChange={(e) => setFormData({ ...formData, founderEmail: e.target.value })}
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="productPrice">Your Product Price (₹) *</Label>
                    <Input
                      id="productPrice"
                      type="number"
                      value={formData.productPrice}
                      onChange={(e) => setFormData({ ...formData, productPrice: e.target.value })}
                      placeholder="50000"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Average price of your product/service</p>
                  </div>
                  <div>
                    <Label htmlFor="requestedCoverage">Requested Coverage (₹)</Label>
                    <Input
                      id="requestedCoverage"
                      type="number"
                      value={formData.requestedCoverage}
                      onChange={(e) => setFormData({ ...formData, requestedCoverage: e.target.value })}
                      placeholder="1000000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank for recommended amount</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={submitting}
                    className="flex-1"
                  >
                    Back to Products
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
