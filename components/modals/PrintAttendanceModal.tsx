// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { api } from '../../services/api';
import Spinner from '../ui/Spinner';

interface PrintAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrintAttendanceModal: React.FC<PrintAttendanceModalProps> = ({ isOpen, onClose }) => {
    const [classes, setClasses] = React.useState<string[]>([]);
    const [selectedClass, setSelectedClass] = React.useState('');
    const [dateMethod, setDateMethod] = React.useState<'auto' | 'custom'>('auto');
    const [month, setMonth] = React.useState('');
    const [year, setYear] = React.useState('');
    const [customDateInput, setCustomDateInput] = React.useState('');
    const [customDates, setCustomDates] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            api.getMembersData().then(res => {
                if (res.success) setClasses(res.data.classes);
            });
            const now = new Date();
            setMonth((now.getMonth() + 1).toString().padStart(2, '0'));
            setYear(now.getFullYear().toString());
            setCustomDates([]);
        }
    }, [isOpen]);

    const addCustomDate = () => {
        if (customDateInput && !customDates.includes(customDateInput)) {
            setCustomDates([...customDates, customDateInput].sort());
            setCustomDateInput('');
        }
    };
    
    const removeCustomDate = (dateToRemove: string) => {
        setCustomDates(customDates.filter(d => d !== dateToRemove));
    };

    const handleGenerate = async () => {
        if (!selectedClass) {
            alert('Please select a class.');
            return;
        }

        setLoading(true);
        try {
            const datesToPrint = dateMethod === 'auto'
                ? getBiWeeklySundays(parseInt(month), parseInt(year))
                : customDates;

            if (datesToPrint.length === 0) {
                alert('No dates selected or found for the selected month.');
                setLoading(false);
                return;
            }
            
            const response = await api.generateAttendanceSheet(selectedClass, datesToPrint);
            if(response.success){
                createAttendancePrintWindow(response.data);
                onClose();
            } else {
                alert('Failed to generate sheet.');
            }

        } catch (error) {
            console.error(error);
            alert('An error occurred while generating the sheet.');
        } finally {
            setLoading(false);
        }
    };
    
    // Helper to get bi-weekly sundays (client side)
    const getBiWeeklySundays = (monthNum: number, yearNum: number) => {
      const sundays = [];
      const date = new Date(yearNum, monthNum - 1, 1);
      while (date.getDay() !== 0) { date.setDate(date.getDate() + 1); }
      let isBiWeekly = true;
      while (date.getMonth() === monthNum - 1) {
        if (isBiWeekly) sundays.push(date.toISOString().split('T')[0]);
        isBiWeekly = !isBiWeekly;
        date.setDate(date.getDate() + 7);
      }
      return sundays;
    };
    
    const createAttendancePrintWindow = (data: { className: string, members: string[], dates: string[] }) => {
        const { className, members, dates } = data;
        if (!members || members.length === 0) {
            alert('No members found in this class');
            return;
        }
        
        const printWindow = window.open('', '', 'height=800,width=1200');
        if(!printWindow) return;

        let html = `...`; // Full HTML string below
        
        html = `<!DOCTYPE html>
<html><head><title>${className} - Attendance</title>
<style>
    @media print { @page { size: landscape; margin: 0.3in; } body { margin: 0; } }
    body { font-family: Arial, sans-serif; padding: 20px; }
    h2, h3 { text-align: center; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #000; padding: 6px 4px; text-align: center; }
    th { background: #e2e8f0; font-weight: bold; }
    .name-col { text-align: left; min-width: 120px; }
    .date-header { background: #cbd5e1; }
    .checkbox-col { width: 40px; }
    @media print { .no-print { display: none; } }
    .print-btn { position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #0EA5E9; color: white; border: none; border-radius: 5px; cursor: pointer; }
</style></head><body>
<button class="print-btn no-print" onclick="window.print()">🖨️ Print</button>
<h2>Fa Nyame Pathfinders - ${className} Class</h2>
<h3>Attendance Sheet</h3>
<table><thead><tr><th class="name-col">Pathfinder Name</th>`;
        dates.forEach(date => {
            const d = new Date(date + 'T12:00:00');
            html += `<th colspan="4" class="date-header">${d.getMonth() + 1}/${d.getDate()}</th>`;
        });
        html += `</tr><tr><th></th>`;
        dates.forEach(() => { html += `<th class="checkbox-col">P</th><th class="checkbox-col">B</th><th class="checkbox-col">Bk</th><th class="checkbox-col">U</th>`; });
        html += `</tr></thead><tbody>`;
        members.forEach(member => {
            html += `<tr><td class="name-col">${member}</td>`;
            dates.forEach(() => { html += `<td class="checkbox-col"></td><td class="checkbox-col"></td><td class="checkbox-col"></td><td class="checkbox-col"></td>`; });
            html += `</tr>`;
        });
        html += `</tbody></table></body></html>`;
        
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    };

    const inputStyles = "mt-1 block w-full rounded-md bg-gray-input border-gray-border shadow-sm focus:ring-primary focus:border-primary";

    return (
        <Modal show={isOpen} onClose={onClose} title="Print Attendance Sheet">
             <Spinner show={loading} />
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-muted">Class</label>
                    <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className={inputStyles}>
                        <option value="">Select Class...</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-muted">Date Selection</label>
                    <div className="mt-2 flex gap-4">
                        <label><input type="radio" name="dateMethod" value="auto" checked={dateMethod === 'auto'} onChange={() => setDateMethod('auto')} className="mr-1 text-primary focus:ring-primary"/> Auto (Bi-weekly)</label>
                        <label><input type="radio" name="dateMethod" value="custom" checked={dateMethod === 'custom'} onChange={() => setDateMethod('custom')} className="mr-1 text-primary focus:ring-primary"/> Custom Dates</label>
                    </div>
                </div>
                {dateMethod === 'auto' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-text-muted">Month</label>
                           <input type="month" value={`${year}-${month}`} onChange={e => { const [y,m] = e.target.value.split('-'); setYear(y); setMonth(m); }} className={inputStyles}/>
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-text-muted">Add Custom Dates</label>
                        <div className="mt-1 flex gap-2">
                            <input type="date" value={customDateInput} onChange={e => setCustomDateInput(e.target.value)} className={inputStyles}/>
                            <Button variant="outline" onClick={addCustomDate}>Add</Button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {customDates.map(d => (
                                <span key={d} className="flex items-center gap-2 bg-gray-border text-text-main text-sm px-2 py-1 rounded-full">
                                    {d} <button onClick={() => removeCustomDate(d)} className="text-danger hover:text-red-400">&times;</button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
             <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleGenerate}>Generate & Print</Button>
            </div>
        </Modal>
    );
};

export default PrintAttendanceModal;