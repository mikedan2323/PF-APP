import * as React from 'react';
import { Member } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { User, Tag, Home, Gift, Phone } from 'react-feather';
import moment from 'moment';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

const DetailItem: React.FC<{ icon: React.ElementType, label: string, value: string | undefined }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-start text-sm">
        <Icon className="w-4 h-4 text-primary mr-3 mt-1 flex-shrink-0" />
        <div>
            <div className="font-semibold text-text-muted">{label}</div>
            <div className="text-text-main">{value || 'N/A'}</div>
        </div>
    </div>
);

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ isOpen, onClose, member }) => {
  if (!isOpen || !member) return null;

  const calculateAge = (dob: string | undefined): string | undefined => {
    if (!dob) return undefined;
    const age = moment().diff(moment(dob), 'years');
    return `${age} years old`;
  };

  return (
    <Modal show={isOpen} onClose={onClose} title={`Member Details`}>
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-border">
            <div className="w-16 h-16 rounded-full bg-gray-border flex items-center justify-center font-bold text-3xl text-primary">
                {member.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
                <h3 className="text-2xl font-bold text-text-main">{member.fullName}</h3>
                <p className="text-text-muted">{member.status === 'Active' ? 'Active Member' : 'Inactive Member'}</p>
            </div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <DetailItem icon={User} label="Gender" value={member.gender} />
        <DetailItem icon={Gift} label="Date of Birth" value={member.dob} />
        <DetailItem icon={Gift} label="Age" value={calculateAge(member.dob)} />
        <DetailItem icon={Tag} label="Group" value={member.group} />
        <DetailItem icon={Home} label="Class" value={member.class} />
        <DetailItem icon={Phone} label="Parent/Guardian Contact" value={member.contact} />
      </div>
      <div className="mt-8 flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};

export default MemberDetailModal;