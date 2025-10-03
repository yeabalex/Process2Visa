"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { Phone, Mail, Clock, MapPin, Send, MessageCircle, HelpCircle, FileText } from 'lucide-react'

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    telegramUsername: '',
    category: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Basic validation
    if (!formData.name || !formData.phoneNumber || !formData.category || !formData.subject || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const response = await api.submitSupportTicket(formData)

      if (response.success) {
        toast({
          title: "Support Ticket Submitted",
          description: `Your ticket ID is ${response.data?.ticketId || 'TICKET-' + Date.now()}. We'll get back to you within 24 hours`,
        })

        // Reset form
        setFormData({
          name: '',
          phoneNumber: '',
          telegramUsername: '',
          category: '',
          subject: '',
          message: ''
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to submit support ticket. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit support ticket. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const faqItems = [
    {
      id: '1',
      question: 'How do I apply for a visa consultation?',
      answer: 'You can start by browsing our services page and selecting the consultation service that best fits your needs. Once purchased, you\'ll receive access to our expert consultation services.'
    },
    {
      id: '2',
      question: 'What documents do I need for visa application?',
      answer: 'The required documents vary by country and visa type. Generally, you\'ll need a valid passport, proof of financial means, travel itinerary, and purpose of visit documentation. Our consultants will provide you with a detailed checklist based on your specific situation.'
    },
    {
      id: '3',
      question: 'How long does the visa process take?',
      answer: 'Processing times vary by country and visa type. Typically, tourist visas take 2-4 weeks, while work or study visas may take 4-8 weeks. We\'ll provide you with accurate timelines based on your destination and visa category.'
    },
    {
      id: '4',
      question: 'Can you help with visa interview preparation?',
      answer: 'Yes! We offer comprehensive interview preparation services including mock interviews, common question practice, and tips for presenting your case effectively to visa officers.'
    },
    {
      id: '5',
      question: 'What if my visa application is rejected?',
      answer: 'In case of rejection, we\'ll help you understand the reasons and prepare a stronger reapplication. We offer appeal services and guidance on addressing the issues that led to the initial rejection.'
    },
    {
      id: '6',
      question: 'Do you offer refunds?',
      answer: 'We offer refunds for consultation services if you\'re not satisfied with the quality of service provided. Please refer to our refund policy for specific terms and conditions.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Support Center
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get help with your visa applications, consultations, and travel planning. Our expert team is here to assist you.
          </p>
        </div>

        {/* Support Form - Now at the top */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Ticket</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a message and we'll get back to you soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="telegramUsername">Telegram Username (optional)</Label>
                  <Input
                    id="telegramUsername"
                    value={formData.telegramUsername}
                    onChange={(e) => handleInputChange('telegramUsername', e.target.value)}
                    placeholder="@yourusername"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Support Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Questions</SelectItem>
                      <SelectItem value="visa">Visa Applications</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="booking">Consultation Booking</SelectItem>
                      <SelectItem value="billing">Billing & Refunds</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Please provide detailed information about your question or issue..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Support Ticket
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@process2visa.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">Business Hours</p>
                    <p className="text-sm text-muted-foreground">Mon-Fri: 9:00 AM - 6:00 PM EST</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">Response Time</p>
                    <p className="text-sm text-muted-foreground">Within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Support Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">General Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Visa Applications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Technical Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Consultation Booking</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find quick answers to common questions about our services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
