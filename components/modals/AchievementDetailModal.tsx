// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { MemberAchievements } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface AchievementDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: MemberAchievements & { memberClass: string };
    onUpdate: (memberId: string, achievement: string, type: 'earned' | 'received', value: boolean) => void;
}

const CLASS_PROGRESSION = ['Friend', 'Companion', 'Explorer', 'Ranger', 'Voyager', 'Guide'];

const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({ isOpen, onClose, member, onUpdate }) => {
    
    const memberClassIndex = CLASS_PROGRESSION.indexOf(member.memberClass);

    const handleEarnedChange = (className: string, value: boolean) => {
        const pinName = `${className} Pin`;
        const chevronName = `${className} Chevron`;
        onUpdate(member.memberId, pinName, 'earned', value);
        onUpdate(member.memberId, chevronName, 'earned', value);
    };

    return (
        <Modal show={isOpen} onClose={onClose} title={`${member.name}'s Pins & Chevrons`} size="lg">
            <div className="space-y-6">
                {CLASS_PROGRESSION.map((className, index) => {
                    const isEarnable = memberClassIndex > index;

                    const pinName = `${className} Pin`;
                    const chevronName = `${className} Chevron`;
                    const pinStatus = member.achievements[pinName] || { earned: false, received: false };
                    const chevronStatus = member.achievements[chevronName] || { earned: false, received: false };

                    const isEarned = pinStatus.earned; // Use one as source of truth

                    return (
                        <div key={className} className="p-4 border border-gray-border rounded-lg bg-gray-surface/50">
                            <h4 className="font-bold text-text-main mb-3">{className}</h4>
                            <div className="space-y-3 text-sm">
                                {/* Earned Status */}
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center font-semibold text-text-main">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-5 w-5 rounded text-primary focus:ring-primary mr-2 disabled:opacity-50"
                                            checked={isEarned}
                                            onChange={(e) => handleEarnedChange(className, e.target.checked)}
                                            disabled={!isEarnable}
                                        />
                                        Earned (Pin & Chevron)
                                    </label>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs"
                                        onClick={() => handleEarnedChange(className, !isEarned)}
                                    >
                                        Override Earned
                                    </Button>
                                </div>
                                
                                {/* Received Statuses */}
                                <div className="pl-8 pt-3 border-t border-gray-border/50 space-y-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                                        <span className="font-semibold">{pinName}</span>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 rounded text-primary focus:ring-primary mr-2"
                                                checked={pinStatus.received}
                                                onChange={(e) => onUpdate(member.memberId, pinName, 'received', e.target.checked)}
                                            />
                                            Received
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                                        <span className="font-semibold">{chevronName}</span>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 rounded text-primary focus:ring-primary mr-2"
                                                checked={chevronStatus.received}
                                                onChange={(e) => onUpdate(member.memberId, chevronName, 'received', e.target.checked)}
                                            />
                                            Received
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
             <div className="mt-8 flex justify-end">
                <Button onClick={onClose}>Done</Button>
            </div>
        </Modal>
    );
};

export default AchievementDetailModal;