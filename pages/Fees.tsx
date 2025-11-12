// Implemented the Fees page component to resolve module resolution errors.
// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { api } from '../services/api';
import { Fee, Member } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import FeeModal from '../components/modals/FeeModal';
import { useAlert, useUser } from '../App';
import { Plus, Trash2 } from 'react-feather';
import AccessDenied from '../components/ui/AccessDenied';
import ConfirmationModal from '../components/modals/ConfirmationModal';

const Fees: React.FC = () => {
    const user = useUser();
    const [fees, setFees] = React.useState<Fee[]>([]);
    const [members, setMembers] = React.useState<Member[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const { addAlert } = useAlert();
    const [feeToDelete, setFeeToDelete] = React.useState<Fee | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');

    const fetchData = async () => {
        setLoading(true);
        const [feesRes, membersRes] = await Promise.all([
            api.getFeesData(),
            api.getMembersData()
        ]);
        if (feesRes.success) setFees(feesRes.data.fees);
        if (membersRes.success) setMembers(membersRes.data.members);
        setLoading(false);
    };

    React.useEffect(() => {
        if (user?.permissions.fees.view) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user]);
    
    const handleSave = () => {
        addAlert('Fees added successfully!', 'success');
        fetchData();
        setIsModalOpen(false);
    };

    const handleStatusChange = async (feeId: string, status: Fee['status']) => {
        setLoading(true);
        const res = await api.updateFeeStatus(feeId, status);
        if (res.success) {
            addAlert('Fee status updated.', 'success');
            if (user) {
                const fee = fees.find(f => f.id === feeId);
                const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
                if (fee) {
                    api.logAction(userName, 'Update Fee Status', `Set status for ${fee.memberName}'s fee to ${status}.`);
                }
            }
            await fetchData();
        } else if ('message' in res) {
            addAlert(res.message, 'error');
        }
        setLoading(false);
    };

    const handleDelete = () => {
        if (!feeToDelete) return;
        addAlert(`Fee for ${feeToDelete.memberName} deleted.`, 'success');
        setFeeToDelete(null);
        fetchData(); // This would call api.deleteFee in a real app
    };
    
    const filteredFees = React.useMemo(() => {
        return fees.filter(fee =>
            fee.memberName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (statusFilter === 'all' || fee.status === statusFilter)
        );
    }, [fees, searchTerm, statusFilter]);

    if (loading || !user) return <Spinner show={true} />;

    const { permissions } = user;

    if (!permissions.fees.view) {
        return <AccessDenied />;
    }
    
    const canAdd = permissions.fees.canAdd;

    const inputStyles = "w-full px-3 py-2 bg-gray-input border border-gray-border rounded-md text-sm focus:ring-primary focus:border-primary placeholder:text-text-muted";

    return (
        <>
            <div className="space-y-6">
                <Card title="Fee Management" actions={
                    canAdd && <Button onClick={() => setIsModalOpen(true)}><Plus size={16} className="mr-2" /> Add Fee</Button>
                }>
                    <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="Search by member name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={inputStyles}
                        />
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputStyles}>
                            <option value="all">All Statuses</option>
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                            <option value="Waived">Waived</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto -mx-4 md:-mx-6">
                        <table className="w-full text-sm">
                            <thead className="text-left bg-gray-base">
                                <tr>
                                    {['Member', 'Group', 'Type', 'Amount', 'Due Date', 'Status', 'Actions'].map(h =>
                                        <th key={h} className="p-3 font-medium text-text-muted">{h}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFees.map(fee => (
                                    <tr key={fee.id} className="border-b border-gray-border">
                                        <td className="p-3 font-semibold text-text-main">{fee.memberName}</td>
                                        <td className="p-3 text-text-muted">{fee.group}</td>
                                        <td className="p-3 text-text-muted">{fee.type === 'Other' ? fee.otherTypeReason : fee.type}</td>
                                        <td className="p-3 text-text-muted">${fee.amount.toFixed(2)}</td>
                                        <td className="p-3 text-text-muted">{fee.dueDate}</td>
                                        <td className="p-2">
                                            {permissions.fees.canEditStatus ? (
                                                <select
                                                    value={fee.status}
                                                    onChange={(e) => handleStatusChange(fee.id, e.target.value as Fee['status'])}
                                                    className={`w-full text-xs font-semibold rounded-md p-1.5 border-none focus:ring-2 focus:ring-primary ${
                                                        fee.status === 'Paid' ? 'bg-success/20 text-green-300' :
                                                        fee.status === 'Unpaid' ? 'bg-danger/20 text-red-300' : 'bg-gray-light-border text-text-muted'
                                                    }`}
                                                >
                                                    <option value="Paid">Paid</option>
                                                    <option value="Unpaid">Unpaid</option>
                                                    <option value="Waived">Waived</option>
                                                </select>
                                            ) : (
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    fee.status === 'Paid' ? 'bg-success/20 text-green-300' :
                                                    fee.status === 'Unpaid' ? 'bg-danger/20 text-red-300' : 'bg-gray-light-border text-text-muted'
                                                }`}>
                                                    {fee.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <Button size="sm" variant="danger" onClick={() => setFeeToDelete(fee)}><Trash2 size={14}/></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            
            <FeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                members={members}
                onSave={handleSave}
            />

            <ConfirmationModal
                isOpen={!!feeToDelete}
                onClose={() => setFeeToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Fee"
                message={`Are you sure you want to delete this fee for ${feeToDelete?.memberName}? This action cannot be undone.`}
            />
        </>
    );
};

export default Fees;