
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useRecords } from '@/hooks/useRecords';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Plus } from 'lucide-react';
import { TrialBanner } from '@/components/subscription/TrialBanner';

const Dashboard: React.FC = () => {
  const { records, loading } = useRecords();
  
  const stats = useMemo(() => {
    if (!records || !records.length) return {
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

  // Get patient status (for demo purposes)
  const getPatientStatus = (index: number) => {
    const statuses = ['stable', 'review', 'critical', 'stable', 'stable'];
    return statuses[index % statuses.length];
  };
  
  // Get status text
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'stable': 'Stable',
      'review': 'Review',
      'critical': 'Critical'
    };
    return statusMap[status] || 'Stable';
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Recent Patients Card */}
        <div className="lg:col-span-2">
          <Card className="bg-white shadow-sm border-gray-100">
            <CardHeader className="pb-2 flex justify-between items-start">
              <CardTitle className="text-lg font-semibold text-gray-800">Recent Patients</CardTitle>
              <div className="flex space-x-1">
                {Array(3).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-primary' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center p-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="ml-3 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats.recentRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No patient records found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {stats.recentRecords.map((record, index) => (
                    <div key={record.id} className="patient-card group">
                      <div className="patient-avatar">
                        {record.mrn.substring(0, 2)}
                      </div>
                      <div className="patient-info">
                        <div className="flex justify-between">
                          <h3 className="patient-name">{`Patient ${record.mrn}`}</h3>
                          <span className={`status-tag status-${getPatientStatus(index)}`}>
                            {getStatusText(getPatientStatus(index))}
                          </span>
                        </div>
                        <p className="patient-details">
                          {`${record.procedure} • ${record.age} yrs`}
                        </p>
                        <p className="text-xs text-gray-400">
                          Last visit: {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button asChild variant="outline" className="w-full text-gray-700 border-gray-200 hover:bg-gray-50">
                <Link to="/records">View All Patients</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Statistics Column */}
        <div className="space-y-6">
          <Card className="bg-white shadow-sm border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-gray-800">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="stats-card">
                <p className="stats-label">Total Patients</p>
                <p className="stats-value">{loading ? '...' : stats.totalRecords}</p>
              </div>
              
              <div className="stats-card">
                <p className="stats-label">New This Week</p>
                <p className="stats-value">{loading ? '...' : Math.floor(stats.totalRecords * 0.12)}</p>
              </div>
              
              <div className="stats-card">
                <p className="stats-label">Appointments Today</p>
                <p className="stats-value">{loading ? '...' : Math.floor(stats.totalRecords * 0.05)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Button asChild className="w-full">
            <Link to="/add-record">
              <Plus className="w-4 h-4 mr-2" />
              Add New Patient
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
