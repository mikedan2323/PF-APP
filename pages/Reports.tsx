// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { api } from '../services/api';
import { geminiService } from '../services/geminiService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { ReportData } from '../types';
import OntarioConferenceReport from '../components/reports/OntarioConferenceReport';
import { useUser } from '../App';
import AccessDenied from '../components/ui/AccessDenied';

const Reports: React.FC = () => {
    const user = useUser();
    const [activeTab, setActiveTab] = React.useState('summary');
    const [month, setMonth] = React.useState('');
    const [reportContent, setReportContent] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const now = new Date();
        const year = now.getFullYear();
        const monthNum = (now.getMonth() + 1).toString().padStart(2, '0');
        setMonth(`${year}-${monthNum}`);
    }, []);
    
    const handleGenerateAISummary = async () => {
        if (!month) return alert('Please select a month.');
        setLoading(true);
        setReportContent('');
        try {
            const response = await api.getConferenceReportData(month);
            if (response.success) {
                const geminiReport = await geminiService.generateMonthlyReport(month, response.data);
                setReportContent(geminiReport);
            } else { throw new Error('Failed to fetch report data.'); }
        } catch (error) {
            console.error(error);
            setReportContent("Error generating report. Please check the console for details.");
        } finally {
            setLoading(false);
        }
    };
    
    if (!user) return <Spinner show={true} />;

    if (!user.permissions.adminPanel.reports.view) {
        return <AccessDenied />;
    }

    const inputStyles = "mt-1 block w-full rounded-md bg-gray-input border-gray-border shadow-sm focus:ring-primary focus:border-primary";
    
    return (
        <div className="space-y-6">
             <Spinner show={loading} />
            <Card>
                <div className="flex border-b border-gray-border">
                    <button onClick={() => setActiveTab('summary')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'summary' ? 'border-b-2 border-primary text-primary' : 'text-text-muted'}`}>Monthly AI Summary</button>
                    <button onClick={() => setActiveTab('conference')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'conference' ? 'border-b-2 border-primary text-primary' : 'text-text-muted'}`}>Ontario Conference Report</button>
                </div>

                <div className="mt-6">
                     <div className="flex items-end gap-4 mb-6">
                        <div>
                            <label htmlFor="reportMonth" className="block text-sm font-medium text-text-muted">Select Reporting Month</label>
                            <input type="month" id="reportMonth" value={month} onChange={(e) => setMonth(e.target.value)}
                                className={inputStyles} />
                        </div>
                        {activeTab === 'summary' && <Button onClick={handleGenerateAISummary} disabled={loading}>{loading ? 'Generating...' : 'Generate AI Summary'}</Button>}
                     </div>
                </div>

                {activeTab === 'summary' && reportContent && (
                    <div className="p-6 bg-gray-base border border-gray-border rounded-lg">
                        <h3 className="text-lg font-bold mb-4">Generated Report</h3>
                        <div className="prose prose-sm max-w-none text-text-muted" dangerouslySetInnerHTML={{ __html: reportContent.replace(/\n/g, '<br />') }} />
                    </div>
                )}

                {activeTab === 'conference' && <OntarioConferenceReport month={month} />}
            </Card>
        </div>
    );
};

export default Reports;