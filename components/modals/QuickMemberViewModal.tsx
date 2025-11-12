import * as React from 'react';
import Modal from '../ui/Modal';
import { api } from '../../services/api';
import { Member } from '../../types';
import Spinner from '../ui/Spinner';

interface QuickMemberViewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickMemberViewModal: React.FC<QuickMemberViewModalProps> = ({ isOpen, onClose }) => {
    const [members, setMembers] = React.useState<Member[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');

    React.useEffect(() => {
        if (isOpen) {
            setLoading(true);
            api.getMembersData().then(res => {
                if (res.success) {
                    setMembers(res.data.members);
                }
                setLoading(false);
            });
        }
    }, [isOpen]);

    const filteredMembers = React.useMemo(() => {
        return members.filter(m => m.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [members, searchTerm]);

    const inputStyles = "w-full p-2 mb-4 bg-gray-input border border-gray-border rounded-md focus:ring-primary focus:border-primary";

    return (
        <Modal show={isOpen} onClose={onClose} title="Member Directory" size="lg">
            <Spinner show={loading} />
            <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={inputStyles}
            />
            <div className="max-h-96 overflow-y-auto border border-gray-border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-gray-base text-left sticky top-0">
                        <tr>
                            <th className="p-2 font-medium text-text-muted">Name</th>
                            <th className="p-2 font-medium text-text-muted">Group</th>
                            <th className="p-2 font-medium text-text-muted">Class</th>
                            <th className="p-2 font-medium text-text-muted">Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map(member => (
                            <tr key={member.id} className="border-b border-gray-border">
                                <td className="p-2 font-semibold">{member.fullName}</td>
                                <td className="p-2">{member.group}</td>
                                <td className="p-2">{member.class}</td>
                                <td className="p-2">{member.contact}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Modal>
    );
};

export default QuickMemberViewModal;