// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { Honour, MemberHonourStatus, Member } from '../types';
import { api } from '../services/api';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import HonourModal from '../components/modals/HonourModal';
import AddHonourModal from '../components/modals/AddHonourModal';
import Button from '../components/ui/Button';
import { Grid, List, Plus } from 'react-feather';
import { useUser, useAlert } from '../App';
import AccessDenied from '../components/ui/AccessDenied';

const Honours: React.FC = () => {
    const user = useUser();
    const { addAlert } = useAlert();
    const [honours, setHonours] = React.useState<Honour[]>([]);
    const [status, setStatus] = React.useState<MemberHonourStatus>({});
    const [members, setMembers] = React.useState<Member[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedHonour, setSelectedHonour] = React.useState<Honour | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('all');

    const fetchData = async () => {
        setLoading(true);
        const [honoursRes, statusRes, membersRes] = await Promise.all([
            api.getHonours(),
            api.getMemberHonourStatus(),
            api.getMembersData(),
        ]);
        if (honoursRes.success) setHonours(honoursRes.data);
        if (statusRes.success) setStatus(statusRes.data);
        if (membersRes.success) setMembers(membersRes.data.members);
        setLoading(false);
    };

    React.useEffect(() => {
        if (user?.permissions.honours.view) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleSaveNewHonour = async (honour: Omit<Honour, 'id'>) => {
        const res = await api.addHonour(honour);
        if (res.success) {
            addAlert('Honour added successfully!', 'success');
            setIsAddModalOpen(false);
            fetchData();
        } else {
            addAlert('Failed to add honour.', 'error');
        }
    };

    const filteredHonours = React.useMemo(() => {
        return honours.filter(h => 
            h.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (categoryFilter === 'all' || h.category === categoryFilter)
        );
    }, [honours, searchTerm, categoryFilter]);

    const groupedHonours = filteredHonours.reduce((acc, honour) => {
        if (!acc[honour.category]) acc[honour.category] = [];
        acc[honour.category].push(honour);
        return acc;
    }, {} as { [key: string]: Honour[] });
    
    const uniqueCategories = [...new Set(honours.map(h => h.category))].sort();

    if (loading || !user) return <Spinner show={true} />;

    const { permissions } = user;

    if (!permissions.honours.view) {
        return <AccessDenied />;
    }
    
    const inputStyles = "px-3 py-2 bg-gray-input border border-gray-border rounded-md text-sm focus:ring-primary focus:border-primary placeholder:text-text-muted";


    return (
        <>
            <div className="space-y-6">
                <Card>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold">Honours Directory</h2>
                             {permissions.honours.canAdd && (
                                <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                                    <Plus size={16} className="mr-1" /> Add Honour
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                             <input type="text" placeholder="Search honours..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={inputStyles} />
                             <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className={inputStyles}>
                                <option value="all">All Categories</option>
                                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant={viewMode === 'grid' ? 'primary' : 'outline'} onClick={() => setViewMode('grid')}><Grid size={16} /></Button>
                            <Button size="sm" variant={viewMode === 'list' ? 'primary' : 'outline'} onClick={() => setViewMode('list')}><List size={16} /></Button>
                        </div>
                    </div>
                </Card>

                {viewMode === 'grid' ? (
                    Object.keys(groupedHonours).sort().map(category => (
                        <Card key={category} title={category}>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                {groupedHonours[category].map(honour => (
                                    <div key={honour.id} className="text-center cursor-pointer group" onClick={() => setSelectedHonour(honour)}>
                                        <img src={honour.patchUrl} alt={honour.name} className="w-24 h-24 mx-auto rounded-full border-4 border-gray-border bg-gray-border group-hover:border-primary transition-all" />
                                        <p className="mt-2 text-sm font-medium text-text-muted group-hover:text-primary">{honour.name}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <div className="overflow-x-auto -mx-4 md:-mx-6">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-base">
                                    <tr>
                                        <th className="p-2 text-left font-medium text-text-muted">Honour</th>
                                        <th className="p-2 text-left font-medium text-text-muted">Category</th>
                                        <th className="p-2 text-center font-medium text-text-muted">Level</th>
                                        <th className="p-2 text-center font-medium text-text-muted">Completed By</th>
                                        <th className="p-2 text-center font-medium text-text-muted">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHonours.map(honour => {
                                        const completedCount = Object.values(status).filter(s => s[honour.id] === 'Completed').length;
                                        return (
                                            <tr key={honour.id} className="border-b border-gray-border">
                                                <td className="p-2 font-semibold text-text-main">{honour.name}</td>
                                                <td className="p-2 text-text-muted">{honour.category}</td>
                                                <td className="p-2 text-center">{honour.level}</td>
                                                <td className="p-2 text-center">{completedCount} / {members.length}</td>
                                                <td className="p-2 text-center">
                                                    <Button size="sm" variant="outline" onClick={() => setSelectedHonour(honour)}>Record Status</Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
            {selectedHonour && (
                <HonourModal 
                    isOpen={!!selectedHonour}
                    onClose={() => setSelectedHonour(null)}
                    honour={selectedHonour}
                    status={status}
                    members={members}
                    onStatusChange={async (memberId, honourId, newStatus) => {
                         await api.updateMemberHonourStatus(memberId, honourId, newStatus);
                         fetchData(); // simple refresh
                    }}
                />
            )}
            <AddHonourModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveNewHonour}
            />
        </>
    );
};

export default Honours;