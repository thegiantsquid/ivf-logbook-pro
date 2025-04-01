
import React from 'react';
import { Link } from 'react-router-dom';
import { useRecords } from '@/hooks/useRecords';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, FilePlus, FileText, BarChart2 } from 'lucide-react';
import { TrialBanner } from '@/components/subscription/TrialBanner';
import { SubscriptionDetails } from '@/components/subscription/SubscriptionDetails';

const Dashboard = () => {
  const { recordCount, isLoading } = useRecords();

  const recentActivityItems = [
    {
      action: "Added record",
      description: "IVF Procedure at City Hospital",
      date: "3 days ago"
    },
    {
      action: "Updated record",
      description: "Embryo Transfer Operation",
      date: "1 week ago"
    }
  ];

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your IVF Logbook Pro dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <TrialBanner />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Total Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoading ? '...' : recordCount}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  IVF procedures logged
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Latest Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recordCount > 0 ? (
                  <div className="text-sm">
                    <div className="flex items-center justify-between">
                      <p>Last record added</p>
                      <Badge variant="outline" className="text-xs">
                        3 days ago
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No records yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest IVF record updates</CardDescription>
            </CardHeader>
            <CardContent>
              {recordCount > 0 ? (
                <div className="space-y-4">
                  {recentActivityItems.map((item, i) => (
                    <div key={i} className="flex justify-between items-start border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{item.action}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.date}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No records found</p>
                  <Button asChild>
                    <Link to="/add-record">
                      <FilePlus className="mr-2 h-4 w-4" />
                      Add Your First Record
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-pastel-purple/10 hover:bg-pastel-purple/20 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Add New Record</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Log a new IVF procedure to your records
                </p>
                <Button asChild>
                  <Link to="/add-record">
                    <FilePlus className="mr-2 h-4 w-4" />
                    Add Record
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-pastel-blue/10 hover:bg-pastel-blue/20 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Browse Records</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  View and manage your IVF procedure logs
                </p>
                <Button asChild variant="secondary">
                  <Link to="/records">
                    <FileText className="mr-2 h-4 w-4" />
                    View Records
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <SubscriptionDetails />

          <Card className="bg-pastel-green/10 hover:bg-pastel-green/20 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">View Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View analytics and insights from your records
              </p>
              <Button asChild variant="outline">
                <Link to="/summary">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  View Summary
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/add-record">
                  <FilePlus className="mr-2 h-4 w-4" />
                  Add Record
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/records">
                  <FileText className="mr-2 h-4 w-4" />
                  View Records
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/summary">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  View Summary
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
