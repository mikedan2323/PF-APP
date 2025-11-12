import * as React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Member, MemberAchievements } from '../../types';

interface PrintPinsChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  achievements: MemberAchievements[];
}

const CLASS_PROGRESSION = ['Friend', 'Companion', 'Explorer', 'Ranger', 'Voyager', 'Guide'];

const PrintPinsChecklistModal: React.FC<PrintPinsChecklistModalProps> = ({ isOpen, onClose, members, achievements }) => {
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

        const achievementMap = new Map<string, MemberAchievements['achievements']>();
        if (withNames) {
            achievements.forEach(ach => {
                achievementMap.set(ach.memberId, ach.achievements);
            });
        }

        let membersToPrint: (Member | { fullName: string })[] = [];
        if (withNames) {
            membersToPrint = members
                .filter(m => filterValue === 'all' || m[filterType] === filterValue)
                .sort((a,b) => a.fullName.localeCompare(b.fullName));
        } else {
            // Add 25 blank rows
            membersToPrint = Array(25).fill({ fullName: '' });
        }
        
        const title = `Pins & Chevrons Checklist ${filterValue !== 'all' ? `- ${filterValue}` : ''}`;
        
        let html = `<!DOCTYPE html>
<html><head><title>${title}</title>
<style>
    @media print { @page { size: landscape; margin: 0.5in; } body { margin: 0; } }
    body { font-family: Arial, sans-serif; }
    h2 { text-align: center; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #000; padding: 6px; text-align: center; }
    th { background: #e2e8f0; font-weight: bold; }
    .name-col { text-align: left; width: 20%; }
    .check-col { width: 40px; }
    .class-header { background: #cbd5e1; }
    .not-earned { background-color: #e2e8f0; }
    @media print { .no-print { display: none; } }
    .print-btn { position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #0EA5E9; color: white; border: none; border-radius: 5px; cursor: pointer; }
</style></head><body>
<button class="print-btn no-print" onclick="window.print()">🖨️ Print</button>
<h2>${title}</h2>
<table>
    <thead>
        <tr>
            <th class="name-col" rowSpan="2">Pathfinder Name</th>`;
        
        CLASS_PROGRESSION.forEach(className => {
            html += `<th colspan="2" class="class-header">${className}</th>`;
        });

        html += `</tr><tr>`;

        CLASS_PROGRESSION.forEach(() => { 
            html += `<th>Pin</th><th>Chevron</th>`; 
        });

        html += `</tr>
    </thead>
    <tbody>`;

        membersToPrint.forEach(member => {
            const memberWithId = member as Member;
            const memberAchievements = withNames ? achievementMap.get(memberWithId.id) : undefined;
            
            html += `<tr><td class="name-col">${member.fullName}</td>`;

            CLASS_PROGRESSION.forEach((className) => {
                let pinClass = 'check-col';
                let chevronClass = 'check-col';
                
                if (withNames && memberAchievements) {
                    const pinStatus = memberAchievements[`${className} Pin`] as { earned: boolean, received: boolean } | undefined;
                    const chevronStatus = memberAchievements[`${className} Chevron`] as { earned: boolean, received: boolean } | undefined;

                    if (!pinStatus || !pinStatus.earned) {
                        pinClass += ' not-earned';
                    }
                    if (!chevronStatus || !chevronStatus.earned) {
                        chevronClass += ' not-earned';
                    }
                }
                
                html += `<td class="${pinClass}"></td><td class="${chevronClass}"></td>`; 
            });
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
        <Modal show={isOpen} onClose={onClose} title="Print Pins & Chevrons Checklist">
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

export default PrintPinsChecklistModal;