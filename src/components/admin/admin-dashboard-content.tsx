
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, DollarSign, Users, Truck, CheckCircle, Clock } from "lucide-react";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Legend as RechartsLegend, Tooltip as RechartsTooltip } from 'recharts'; // Updated import for Legend
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const shipmentsData = [
  { month: "Jan", shipments: Math.floor(Math.random() * 500) + 100, revenue: Math.floor(Math.random() * 20000) + 5000 },
  { month: "Feb", shipments: Math.floor(Math.random() * 500) + 100, revenue: Math.floor(Math.random() * 20000) + 5000 },
  { month: "Mar", shipments: Math.floor(Math.random() * 500) + 100, revenue: Math.floor(Math.random() * 20000) + 5000 },
  { month: "Apr", shipments: Math.floor(Math.random() * 500) + 100, revenue: Math.floor(Math.random() * 20000) + 5000 },
  { month: "May", shipments: Math.floor(Math.random() * 500) + 100, revenue: Math.floor(Math.random() * 20000) + 5000 },
  { month: "Jun", shipments: Math.floor(Math.random() * 500) + 100, revenue: Math.floor(Math.random() * 20000) + 5000 },
];

const recentShipments = [
  { id: "RS738291", customer: "Amit Patel", status: "Delivered", date: "2024-07-28", value: 2500 },
  { id: "RS239847", customer: "Priya Sharma", status: "In Transit", date: "2024-07-29", value: 1200 },
  { id: "RS873625", customer: "Rajesh Kumar", status: "Out for Delivery", date: "2024-07-30", value: 350 },
  { id: "RS109384", customer: "Sneha Singh", status: "Booked", date: "2024-07-30", value: 8000 },
  { id: "RS502938", customer: "Vikram Reddy", status: "Delivered", date: "2024-07-27", value: 500 },
];

const statusColors: { [key: string]: string } = {
  Booked: "bg-blue-100 text-blue-700 border-blue-300",
  "In Transit": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Out for Delivery": "bg-orange-100 text-orange-700 border-orange-300",
  Delivered: "bg-green-100 text-green-700 border-green-300",
  Cancelled: "bg-red-100 text-red-700 border-red-300",
};


export function AdminDashboardContent() {
  const totalShipments = shipmentsData.reduce((sum, item) => sum + item.shipments, 0);
  const totalRevenue = shipmentsData.reduce((sum, item) => sum + item.revenue, 0);
  const activeUsers = 250; // Dummy data
  const shipmentsInTransit = 75; // Dummy data

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShipments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+10% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{activeUsers}</div>
            <p className="text-xs text-muted-foreground">+5 since last hour</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipments In Transit</CardTitle>
            <Truck className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shipmentsInTransit}</div>
            <p className="text-xs text-muted-foreground">Live Updates</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Shipments & Revenue Overview</CardTitle>
            <CardDescription>Monthly performance for the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] sm:h-[350px] p-0">
            <ChartContainer config={{
                shipments: { label: "Shipments", color: "hsl(var(--chart-1))" },
                revenue: { label: "Revenue (Rs.)", color: "hsl(var(--chart-2))" },
            }} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={shipmentsData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis yAxisId="left" orientation="left" stroke="var(--color-shipments)" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--color-revenue)" tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <RechartsLegend />
                  <Bar yAxisId="left" dataKey="shipments" fill="var(--color-shipments)" radius={[4, 4, 0, 0]} name="Shipments" />
                  <Bar yAxisId="right" dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} name="Revenue (Rs.)" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Recent Shipments</CardTitle>
            <CardDescription>A quick look at the latest shipment activity.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Value (Rs.)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium text-primary">{shipment.id}</TableCell>
                    <TableCell>{shipment.customer}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusColors[shipment.status] || "bg-gray-100 text-gray-700 border-gray-300")}>
                        {shipment.status === "Booked" && <Clock className="mr-1 h-3 w-3" />}
                        {shipment.status === "In Transit" && <Truck className="mr-1 h-3 w-3" />}
                        {shipment.status === "Out for Delivery" && <Package className="mr-1 h-3 w-3" />}
                        {shipment.status === "Delivered" && <CheckCircle className="mr-1 h-3 w-3" />}
                        {shipment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">Rs. {shipment.value.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

