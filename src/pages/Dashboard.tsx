
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useRecords } from '@/hooks/useRecords';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus, FileSearch, BarChart } from 'lucide-react';
import { ProcedureType } from '@/types';

const Dashboard: React.FC = () => {
  const { records, loading } = useRecords();
  
  const stats = useMemo(() => {
    if (!records.length) return {
      totalRecords: 0,
      recentRecords: [],
      procedureCounts: {},
      hospitalCounts: {},
    };

    // Recent records
    const recentRecords = [...records]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    // Procedure counts
    const procedureCounts = records.reduce((acc, record) => {
      const { procedure } = record;
      acc[procedure] = (acc[procedure] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Hospital counts
    const hospitalCounts = records.reduce((acc, record) => {
      const { hospital } = record;
      acc[hospital] = (acc[hospital] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalRecords: records.length,
      recentRecords,
      procedureCounts,
      hospitalCounts,
    };
  }, [records]);
  
  // Get top procedures
  const topProcedures = useMemo(() => {
    if (!stats.procedureCounts) return [];
    
    return Object.entries(stats.procedureCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, count }));
  }, [stats.procedureCounts]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome to IVF Logbook Pro</h2>
          <p className="text-muted-foreground mt-1">
            Track and manage your IVF procedures efficiently
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/add-record">
              <FilePlus className="mr-2 h-4 w-4" />
              Add New Record
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? (
                <div className="h-4 w-16 animate-pulse bg-gray-200 rounded"></div>
              ) : (
                stats.totalRecords
              )}
            </div>
          </CardContent>
        </Card>
        
        {topProcedures.slice(0, 3).map((procedure, index) => (
          <Card key={index} className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {procedure.name || 'Procedure'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? (
                  <div className="h-4 w-16 animate-pulse bg-gray-200 rounded"></div>
                ) : (
                  procedure.count
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>View Records</CardTitle>
            <CardDescription>
              Search, filter and export your patient records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileSearch className="h-12 w-12 text-primary opacity-80" />
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/records">Browse Records</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Add New Record</CardTitle>
            <CardDescription>
              Create a new IVF procedure record
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FilePlus className="h-12 w-12 text-primary opacity-80" />
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/add-record">Add Record</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Summary & Analytics</CardTitle>
            <CardDescription>
              View summary statistics and procedure breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart className="h-12 w-12 text-primary opacity-80" />
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/summary">View Summary</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Recent Records */}
      <div>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Records</CardTitle>
            <CardDescription>
              Your most recently added IVF procedure records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : stats.recentRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No records added yet</p>
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">MRN</th>
                      <th className="px-6 py-3">Procedure</th>
                      <th className="px-6 py-3">Hospital</th>
                      <th className="px-6 py-3">Supervision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentRecords.map((record) => (
                      <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{record.date}</td>
                        <td className="px-6 py-4">{record.mrn}</td>
                        <td className="px-6 py-4">{record.procedure}</td>
                        <td className="px-6 py-4">{record.hospital}</td>
                        <td className="px-6 py-4">{record.supervision}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/records">View All Records</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
