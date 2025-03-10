
import React, { useMemo } from 'react';
import { useRecords } from '@/hooks/useRecords';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ProcedureSummary, SupervisionType } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9146FF', '#FF6B8B'];

const Summary: React.FC = () => {
  const { records, loading } = useRecords();
  
  const procedureSummary = useMemo<ProcedureSummary[]>(() => {
    if (!records.length) return [];
    
    // Group by procedure
    const procedureGroups = records.reduce((acc, record) => {
      const { procedure, supervision } = record;
      
      // If this procedure doesn't exist yet in our accumulator, initialize it
      if (!acc[procedure]) {
        acc[procedure] = {
          procedure,
          count: 0,
          supervisionBreakdown: {},
        };
      }
      
      // Increment the count for this procedure
      acc[procedure].count += 1;
      
      // Add to the supervision breakdown
      const currentSupervisionCount = acc[procedure].supervisionBreakdown[supervision as SupervisionType] || 0;
      acc[procedure].supervisionBreakdown[supervision as SupervisionType] = currentSupervisionCount + 1;
      
      return acc;
    }, {} as Record<string, ProcedureSummary>);
    
    // Convert the object to an array and sort by count
    return Object.values(procedureGroups).sort((a, b) => b.count - a.count);
  }, [records]);
  
  const supervisionData = useMemo(() => {
    if (!procedureSummary.length) return [];
    
    // Get all unique supervision types
    const allSupervisionTypes = new Set<string>();
    procedureSummary.forEach(summary => {
      Object.keys(summary.supervisionBreakdown).forEach(type => {
        allSupervisionTypes.add(type);
      });
    });
    
    // Create data for the stacked bar chart
    return procedureSummary.map(summary => {
      const data: Record<string, any> = {
        name: summary.procedure,
      };
      
      // Add all supervision types with their count (or 0 if not present)
      Array.from(allSupervisionTypes).forEach(type => {
        data[type] = summary.supervisionBreakdown[type as SupervisionType] || 0;
      });
      
      return data;
    });
  }, [procedureSummary]);
  
  const hospitalData = useMemo(() => {
    if (!records.length) return [];
    
    // Count by hospital
    const hospitalCounts = records.reduce((acc, record) => {
      const { hospital } = record;
      acc[hospital] = (acc[hospital] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array of objects for pie chart
    return Object.entries(hospitalCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [records]);
  
  const timelineData = useMemo(() => {
    if (!records.length) return [];
    
    // Group by month
    const monthlyData = records.reduce((acc, record) => {
      const date = new Date(record.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          count: 0,
        };
      }
      
      acc[monthYear].count += 1;
      
      return acc;
    }, {} as Record<string, { month: string; count: number }>);
    
    // Convert to array and sort by month
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [records]);
  
  const exportSummaryPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('IVF Procedures Summary', 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
      
      // Procedure Summary Table
      doc.setFontSize(14);
      doc.text('Procedure Summary', 14, 35);
      
      const procedureData = procedureSummary.map(summary => [
        summary.procedure,
        summary.count.toString(),
        Object.entries(summary.supervisionBreakdown)
          .map(([type, count]) => `${type}: ${count}`)
          .join(', '),
      ]);
      
      autoTable(doc, {
        head: [['Procedure', 'Total Count', 'Supervision Breakdown']],
        body: procedureData,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });
      
      // Hospital Summary Table
      const finalY = (doc as any).lastAutoTable.finalY || 120;
      doc.setFontSize(14);
      doc.text('Hospital Summary', 14, finalY + 15);
      
      const hospitalTableData = hospitalData.map(item => [
        item.name,
        item.value.toString(),
      ]);
      
      autoTable(doc, {
        head: [['Hospital', 'Count']],
        body: hospitalTableData,
        startY: finalY + 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });
      
      doc.save('ivf_summary.pdf');
      toast.success('Summary exported to PDF');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Summary & Analytics</h2>
          <p className="text-muted-foreground mt-1">
            Statistical overview of your IVF procedures
          </p>
        </div>
        
        <Button onClick={exportSummaryPDF} disabled={loading || records.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export Summary
        </Button>
      </div>
      
      {loading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-card">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-gray-100 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : records.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Add some records to see summary statistics and analytics for your IVF procedures.
            </p>
            <Button asChild>
              <a href="/add-record">Add Your First Record</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Procedures by Supervision Type</CardTitle>
                <CardDescription>
                  Breakdown of procedures by supervision level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={supervisionData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {['Direct', 'Indirect', 'Independent', 'Teaching'].map((type, index) => (
                        <Bar key={type} dataKey={type} stackId="a" fill={COLORS[index % COLORS.length]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Procedures by Hospital</CardTitle>
                <CardDescription>
                  Distribution of procedures across different hospitals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={hospitalData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {hospitalData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} procedures`, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Procedures Over Time</CardTitle>
              <CardDescription>
                Monthly trend of procedures performed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timelineData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#0088FE" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Procedure Summary</CardTitle>
              <CardDescription>
                Detailed breakdown of all procedures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left">Procedure</th>
                      <th className="px-4 py-3 text-left">Total Count</th>
                      <th className="px-4 py-3 text-left">Direct</th>
                      <th className="px-4 py-3 text-left">Indirect</th>
                      <th className="px-4 py-3 text-left">Independent</th>
                      <th className="px-4 py-3 text-left">Teaching</th>
                    </tr>
                  </thead>
                  <tbody>
                    {procedureSummary.map((summary, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-3">{summary.procedure}</td>
                        <td className="px-4 py-3">{summary.count}</td>
                        <td className="px-4 py-3">{summary.supervisionBreakdown.Direct || 0}</td>
                        <td className="px-4 py-3">{summary.supervisionBreakdown.Indirect || 0}</td>
                        <td className="px-4 py-3">{summary.supervisionBreakdown.Independent || 0}</td>
                        <td className="px-4 py-3">{summary.supervisionBreakdown.Teaching || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Summary;
