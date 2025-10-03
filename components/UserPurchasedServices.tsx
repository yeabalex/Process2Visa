import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, CheckCircle, Calendar, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"

interface Service {
  _id: string
  name: string
  displayName?: string
  description?: string
  price: number
  currency: string
}

export default function UserPurchasedServices({ services }: { services: Service[] }) {
  const router = useRouter()
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(price)
  }

  return (
    <div className="space-y-8 p-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              My Purchased Services
            </h1>
            <p className="text-muted-foreground mt-1">Manage and view your active services</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            <CheckCircle className="h-4 w-4 mr-2" />
            {services.length} Active {services.length === 1 ? "Service" : "Services"}
          </Badge>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12">
          <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Services Yet</h3>
          <p className="text-muted-foreground">You haven't purchased any services yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {services.map((service) => (
            <Card
              key={service._id}
              className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 hover:from-primary/5 hover:to-primary/10 relative overflow-hidden cursor-pointer"
              onClick={() => router.push(`/${service._id}`)}
            >
              <div className="absolute inset-0 bg-grid-small-black/[0.02] dark:bg-grid-small-white/[0.02]" />

              <CardHeader className="relative pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-200 text-balance">
                      {service.displayName || service.name}
                    </CardTitle>
                    {service.description && (
                      <CardDescription className="text-sm leading-relaxed text-pretty">
                        {service.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-muted-foreground/10">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">Purchase Price</span>
                  </div>
                  <Badge variant="outline" className="text-lg font-bold px-4 py-2 bg-background/50">
                    {formatPrice(service.price, service.currency)}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Active since purchase</span>
                </div>
              </CardContent>

              <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/20 transition-colors duration-300 pointer-events-none" />
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
