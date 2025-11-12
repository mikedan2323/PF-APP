import * as React from 'react';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import OntarioConferenceReport from '../reports/OntarioConferenceReport';
import { useUser } from '../../App';
import { geminiService } from '../../services/geminiService';
import { api } from '../../services/api';

const AISummaryTab: React.FC<{ month: string }> = ({ month }) => {
    const user = useUser();
    const [reportContent, setReportContent] = React.useState('');
    const [loading, setLoading] = React.useState(false);

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

    return (
        <div>
            <div className="flex items-end gap-4 mb-6">
                {user.permissions.adminPanel.reports.canGenerate && 
                    <Button onClick={handleGenerateAISummary} disabled={loading}>{loading ? 'Generating...' : 'Generate AI Summary'}</Button>
                }
            </div>
            {reportContent && (
                <div className="p-6 bg-gray-base border border-gray-border rounded-lg">
                    <h3 className="text-lg font-bold mb-4">Generated Report</h3>
                    <div className="prose prose-sm max-w-none text-text-muted" dangerouslySetInnerHTML={{ __html: reportContent.replace(/\n/g, '<br />') }} />
                </div>
            )}
        </div>
    );
}

const ReportsTab: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState('conference');
    const [month, setMonth] = React.useState('');

    React.useEffect(() => {
        const now = new Date();
        const year = now.getFullYear();
        const monthNum = (now.getMonth() + 1).toString().padStart(2, '0');
        setMonth(`${year}-${monthNum}`);
    }, []);
    
    const inputStyles = "mt-1 block w-full rounded-md bg-gray-input border-gray-border shadow-sm focus:ring-primary focus:border-primary";
    
    return (
        <div className="space-y-6">
            <div className="flex border-b border-gray-border">
                <button onClick={() => setActiveTab('conference')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'conference' ? 'border-b-2 border-primary text-primary' : 'text-text-muted'}`}>Ontario Conference Report</button>
                <button onClick={() => setActiveTab('summary')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'summary' ? 'border-b-2 border-primary text-primary' : 'text-text-muted'}`}>Monthly AI Summary</button>
            </div>

            <div className="mt-6">
                 <div className="flex items-end gap-4 mb-6">
                    <div>
                        <label htmlFor="reportMonth" className="block text-sm font-medium text-text-muted">Select Reporting Month</label>
                        <input type="month" id="reportMonth" value={month} onChange={(e) => setMonth(e.target.value)}
                            className={inputStyles} />
                    </div>
                 </div>
            </div>

            {activeTab === 'summary' && <AISummaryTab month={month} />}
            {activeTab === 'conference' && <OntarioConferenceReport month={month} />}
        </div>
    );
};

export default ReportsTab;
