// src/components/UserManagement/CreateUserForm.tsx
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

interface CreateUserFormProps {
  isOpen: boolean
  onClose: () => void
  onUserCreated: () => void
}

const CreateUserForm = ({
  isOpen,
  onClose,
  onUserCreated,
}: CreateUserFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    designation: '',
  })

  const availableRoles = ['Field Officer', 'Office Staff', 'Admin']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // --- 1) Validate inputs ---
      if (
        !formData.fullName ||
        !formData.phoneNumber ||
        !formData.password ||
        !formData.designation
      ) {
        throw new Error('Please fill in all fields.')
      }
      if (!/^\d{10}$/.test(formData.phoneNumber)) {
        throw new Error('Enter a valid 10-digit phone number.')
      }

      // --- 2) Sign up via Supabase Auth ---
      const { data, error: authError } = await supabase.auth.signUp({
        phone: formData.phoneNumber,
        password: formData.password,
      })
      if (authError) throw authError
      const user = data.user
      if (!user) throw new Error('No user returned from signUp.')

      // --- 3) Insert into your “users” profile table ---
      //    Make sure to include EVERY required column in your schema!
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,                         // FK to auth.users.id
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          password_hash: '',                   // or hash if you want, else blank
          designation: formData.designation,
          active_role: formData.designation,
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: JSON.parse(
            localStorage.getItem('govardhini_user') || '{}'
          ).id,
        })
      if (profileError) throw profileError

      // --- 4) Record the role assignment in your join table ---
      const { error: roleError } = await supabase
        .from('user_role_assignments')
        .insert({
          user_id: user.id,
          assigned_by: JSON.parse(
            localStorage.getItem('govardhini_user') || '{}'
          ).id,
          role_assigned: formData.designation,
        })
      if (roleError) throw roleError

      toast({ title: 'Success', description: 'User created!' })
      onUserCreated()
      onClose()
      setFormData({
        fullName: '',
        phoneNumber: '',
        password: '',
        designation: '',
      })
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generatePassword = () => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let pwd = ''
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData((f) => ({ ...f, password: pwd }))
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="glass-card w-[90vw] max-w-md bg-slate-800 text-white">
        <SheetHeader>
          <SheetTitle>Create New User</SheetTitle>
          <SheetDescription>Fill out and submit below</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Full Name */}
          <div>
            <Label>Full Name</Label>
            <Input
              value={formData.fullName}
              onChange={(e) =>
                setFormData((f) => ({ ...f, fullName: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

          {/* Phone */}
          <div>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              maxLength={10}
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  phoneNumber: e.target.value.replace(/\D/, ''),
                }))
              }
              disabled={isLoading}
            />
          </div>

          {/* Designation */}
          <div>
            <Label>Designation</Label>
            <Select
              value={formData.designation}
              onValueChange={(val) =>
                setFormData((f) => ({ ...f, designation: val }))
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Password */}
          <div className="relative">
            <Label>Password</Label>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) =>
                setFormData((f) => ({ ...f, password: e.target.value }))
              }
              disabled={isLoading}
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-2"
              onClick={() => setShowPassword((s) => !s)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={generatePassword}
            disabled={isLoading}
          >
            Generate Password
          </Button>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating…' : 'Create User'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default CreateUserForm
