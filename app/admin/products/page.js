'use client'

import { useEffect, useState } from 'react'
import { Package, Plus, Edit, Trash2, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import AddProductDialog from './components/AddProductDialog'
import EditProductDialog from './components/EditProductDialog'
import { useToast } from '@/hooks/use-toast'

export default function ProductsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete product')

      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      })

      fetchProducts()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#37322F] mb-2">Product & Pricing Management</h1>
          <p className="text-gray-600">Manage insurance products, pricing rules, and coverage terms</p>
        </div>
        <AddProductDialog onSuccess={fetchProducts} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#37322F]">{products.length}</div>
            <p className="text-xs text-gray-500 mt-1">Total Products</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {products.filter((p) => p.status === 'active').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Active</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              ₹{products.reduce((sum, p) => sum + (p.basePrice || 0), 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total Base Premium</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {products.filter((p) => p.status === 'draft').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Drafts</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="mt-2">{product.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <div>
                        <EditProductDialog
                          product={product}
                          onSuccess={fetchProducts}
                          trigger={
                            <div className="flex items-center w-full cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </div>
                          }
                        />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => deleteProduct(product.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pricing */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Base Premium:</span>
                <span className="text-lg font-bold text-[#37322F]">₹{product.basePrice}</span>
              </div>

              {/* Coverage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Min Coverage:</span>
                  <span className="font-medium">₹{(product.coverageMin / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Max Coverage:</span>
                  <span className="font-medium">₹{(product.coverageMax / 100000).toFixed(1)}L</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge
                  variant="outline"
                  className={
                    product.status === 'active'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }
                >
                  {product.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Yet</h3>
            <p className="text-gray-600 text-center max-w-md mb-4">
              Get started by creating your first insurance product
            </p>
            <AddProductDialog onSuccess={fetchProducts} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
