

import * as React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Member } from '../../types';
import { uniformData } from '../../pages/Uniform';

interface PrintUniformChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
}

const PrintUniformChecklistModal: React.FC<PrintUniformChecklistModalProps> = ({ isOpen, onClose, members }) => {
    const [filterType, setFilterType] = React.useState<'group' | 'class'>('group');
    const [filterValue, setFilterValue] = React.useState<string>('all');

    const filters = React.useMemo(() => {
        const groups = ['all', ...new Set(members.map(m => m.group))];
        const classes = ['all', ...new Set(members.map(m => m.class))];
        return { groups, classes };
    }, [members]);

    const handlePrint = (withNames: boolean) => {
        const printWindow = window.open('', '', 'height=800,width=1200');
        if (!printWindow) return;

        let membersToPrint: (Member | { fullName: string })[] = [];
        if (withNames) {
            membersToPrint = members
                .filter(m => filterValue === 'all' || m[filterType] === filterValue)
                .sort((a,b) => a.fullName.localeCompare(b.fullName));
        } else {
            // Add 25 blank rows
            membersToPrint = Array(25).fill({ fullName: '' });
        }
        
        const title = `Uniform Checklist ${filterValue !== 'all' ? `- ${filterValue}` : ''}`;
        
        let html = `...`; // Full HTML string below

        html = `<!DOCTYPE html>
<html><head><title>${title}</title>
<style>
    @media print { @page { size: portrait; margin: 0.5in; } body { margin: 0; } }
    body { font-family: Arial, sans-serif; }
    h2 { text-align: center; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #000; padding: 8px; text-align: center; }
    th { background: #e2e8f0; font-weight: bold; }
    .name-col { text-align: left; width: 25%; }
    .check-col { width: 50px; }
    @media print { .no-print { display: none; } }
    .print-btn { position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #0EA5E9; color: white; border: none; border-radius: 5px; cursor: pointer; }
</style></head><body>
<button class="print-btn no-print" onclick="window.print()">🖨️ Print</button>
<h2>${title}</h2>
<table><thead><tr><th class="name-col">Pathfinder Name</th>`;
        uniformData.items.forEach(item => {
            html += `<th>${item}</th>`;
        });
        html += `</tr></thead><tbody>`;
        membersToPrint.forEach(member => {
            html += `<tr><td class="name-col">${member.fullName}</td>`;
            uniformData.items.forEach(() => { html += `<td class="check-col"></td>`; });
            html += `</tr>`;
        });
        html += `</tbody></table></body></html>`;

        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
        onClose();
    };
    
    const inputStyles = "w-full bg-gray-input border-gray-border rounded-md text-sm p-2 focus:ring-primary focus:border-primary";

    return (
        <Modal show={isOpen} onClose={onClose} title="Print Uniform Checklist">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-text-muted">Filter By</label>
                        <select value={filterType} onChange={e => { setFilterType(e.target.value as any); setFilterValue('all'); }} className={inputStyles}>
                            <option value="group">Group</option>
                            <option value="class">Class</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-text-muted">{filterType === 'group' ? 'Select Group' : 'Select Class'}</label>
                        <select value={filterValue} onChange={e => setFilterValue(e.target.value)} className={inputStyles}>
                            {(filterType === 'group' ? filters.groups : filters.classes).map(f =>
                                <option key={f} value={f}>{f === 'all' ? 'All Members' : f}</option>
                            )}
                        </select>
                    </div>
                </div>
                <div className="pt-4 border-t border-gray-border text-center">
                    <p className="text-sm text-text-muted mb-4">Choose a printing option below.</p>
                     <div className="flex justify-center gap-4">
                        <Button onClick={() => handlePrint(true)}>Print with Names</Button>
                        <Button variant="outline" onClick={() => handlePrint(false)}>Print Blank Sheet</Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default PrintUniformChecklistModal;