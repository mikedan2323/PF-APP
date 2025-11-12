import * as React from 'react';
import { Permissions } from '../../types';
import { Lock, Plus, CheckSquare, Shield, Award, Users, Download, MoreVertical, Archive, DollarSign, Star, Link as LinkIcon, Calendar } from 'react-feather';

interface PermissionPreviewProps {
    category: keyof Permissions;
    permissions: Permissions;
}

const PreviewContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border border-gray-border rounded-lg h-full flex flex-col bg-gray-base/50 aspect-[3/4] max-h-[55vh]">
        <div className="h-8 bg-gray-surface border-b border-gray-border flex items-center px-2">
            <div className="w-4 h-4 rounded-full bg-gray-border mr-2"></div>
            <div className="text-xs font-bold text-text-subtle">{title}</div>
        </div>
        <div className="flex-1 p-3 overflow-hidden text-xs text-text-subtle">
            {children}
        </div>
    </div>
);

const Block: React.FC<{ className?: string, children?: React.ReactNode, title?: string }> = ({ className = '', children, title }) => (
    <div title={title} className={`bg-gray-surface rounded border border-gray-border/50 ${className}`}>{children}</div>
);

// FIX: Changed icon prop type to React.ReactElement<any> to allow cloning with additional props like 'size'.
const PreviewButton: React.FC<{ perm: boolean, label: string, icon: React.ReactElement<any>, variant?: 'primary' | 'outline' }> = ({ perm, label, icon, variant = 'primary' }) => (
    <div className={`flex items-center text-xs p-1 rounded transition-opacity ${
        perm ? (variant === 'primary' ? 'bg-primary/20 text-primary' : 'bg-gray-border/80 text-text-muted') : 'bg-gray-border opacity-50'
    }`}>
        {React.cloneElement(icon, { size: 10, className: "mr-1"})} {label}
    </div>
);

const Tab: React.FC<{ perm: boolean, label: string }> = ({ perm, label }) => (
    <div className={`px-2 py-0.5 border-b-2 text-xs ${perm ? 'border-primary/50 text-text-muted' : 'border-transparent text-gray-border'}`}>{label}</div>
);

const AccessDeniedPreview: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <Lock className="w-12 h-12 text-danger/50 mb-2" />
        <h4 className="font-bold">Access Denied</h4>
        <p>User cannot view this page.</p>
    </div>
);

const DashboardPreview: React.FC<{ perms: Permissions['dashboard'] }> = ({ perms }) => (
    <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
            {perms.viewCards.activeMembers ? <Block className="h-10" title="Active Members Card" /> : <div className="h-10"></div>}
            {perms.viewCards.avgAttendance ? <Block className="h-10" title="Avg Attendance Card" /> : <div className="h-10"></div>}
            {perms.viewCards.pointsLeader ? <Block className="h-10" title="Points Leader Card" /> : <div className="h-10"></div>}
        </div>
        <div className="flex gap-2">
            <div className="w-2/3 space-y-2">
                {perms.viewLeaderboard && <Block className="h-24 p-1" title="Leaderboard"><div className="h-full w-full bg-gray-border rounded-sm"></div></Block>}
                {perms.viewUpcomingEvents && <Block className="h-16 p-1" title="Upcoming Events"><div className="h-full w-full bg-gray-border rounded-sm"></div></Block>}
            </div>
            <div className="w-1/3 space-y-2">
                {perms.quickActions && <Block className="h-12 p-1" title="Quick Actions"><div className="h-full w-full bg-gray-border rounded-sm"></div></Block>}
                {perms.viewAttentionItems && <Block className="h-16 p-1" title="Attention Items"><div className="h-full w-full bg-gray-border rounded-sm"></div></Block>}
                {perms.viewOrderList && <Block className="h-12 p-1" title="Order List"><div className="h-full w-full bg-gray-border rounded-sm"></div></Block>}
            </div>
        </div>
    </div>
);

const MembersPreview: React.FC<{ perms: Permissions['members'] }> = ({ perms }) => (
    <div className="space-y-2">
         <Block className="p-1">
            <div className="flex justify-between items-center">
                <div className="flex">
                    <Tab perm={true} label="Directory" />
                    <Tab perm={perms.viewGroupManagement} label="Groups" />
                </div>
                <div className="flex gap-1">
                    <PreviewButton perm={perms.canExport} label="Export" icon={<Download />} variant="outline"/>
                    <PreviewButton perm={perms.canAdd} label="Add" icon={<Plus />} />
                </div>
            </div>
        </Block>
        <Block className="h-40 p-1 space-y-1">
            <div className="flex justify-between items-center">
                <div className="w-20 h-2 bg-gray-border rounded-sm"></div>
                <PreviewButton perm={perms.canBulkUpdate} label="Bulk Actions" icon={<MoreVertical />} />
            </div>
            <div className="h-4 w-full bg-gray-border/50 rounded-sm"></div>
            <div className="h-4 w-full bg-gray-border/50 rounded-sm"></div>
            <div className="h-4 w-full bg-gray-border/50 rounded-sm"></div>
        </Block>
    </div>
);

const AttendancePreview: React.FC<{ perms: Permissions['attendance'] }> = ({ perms }) => (
    <div className="space-y-2">
         <Block className="p-1">
            <div className="flex justify-between items-center">
                <div className="flex">
                    <Tab perm={perms.tabs.take} label="Take" />
                    <Tab perm={perms.tabs.manage} label="Manage" />
                    <Tab perm={perms.tabs.overall} label="Overall" />
                </div>
                <PreviewButton perm={perms.canPrint} label="Print" icon={<CheckSquare />} variant="outline"/>
            </div>
        </Block>
        <div className="text-center pt-8">
            <CheckSquare size={48} className={`mx-auto transition-opacity ${perms.tabs.take ? 'text-primary/30' : 'text-gray-border'}`} />
            <p className="mt-2 text-xs">Content for '{perms.tabs.take ? 'Take' : '...'}' tab</p>
            <div className="flex justify-end mt-12">
                <PreviewButton perm={perms.canSave} label="Save Attendance" icon={<CheckSquare />} />
            </div>
        </div>
    </div>
);

const GenericPagePreview: React.FC<{ icon: React.ElementType, perms: { canAdd?: boolean, canPrint?: boolean, canExport?: boolean } }> = ({ icon: Icon, perms }) => (
     <div className="space-y-2">
        <Block className="p-1">
            <div className="flex justify-end items-center gap-1">
                {perms.canPrint && <PreviewButton perm={perms.canPrint} label="Print" icon={<Shield />} variant="outline"/>}
                {perms.canExport && <PreviewButton perm={perms.canExport} label="Export" icon={<Download />} variant="outline"/>}
                {perms.canAdd && <PreviewButton perm={perms.canAdd} label="Add" icon={<Plus />} />}
            </div>
        </Block>
        <div className="text-center pt-8">
            <Icon size={48} className="mx-auto text-primary/30" />
            <div className="mt-12 h-20 bg-gray-border/50 rounded"></div>
        </div>
    </div>
);


const PermissionPreview: React.FC<PermissionPreviewProps> = ({ category, permissions }) => {
    const renderPreview = () => {
        const modulePerms = permissions[category];
        if (!modulePerms || !('view' in modulePerms) || !modulePerms.view) {
            return <AccessDeniedPreview />;
        }

        switch(category) {
            case 'dashboard':
                return <DashboardPreview perms={permissions.dashboard} />;
            case 'members':
                return <MembersPreview perms={permissions.members} />;
            case 'attendance':
                return <AttendancePreview perms={permissions.attendance} />;
            case 'uniform':
                return <GenericPagePreview icon={Shield} perms={{ canPrint: permissions.uniform.canPrint, canAdd: false }} />;
            case 'points':
                return <GenericPagePreview icon={Award} perms={{ canAdd: permissions.points.canAddRemove }} />;
            case 'fees':
                return <GenericPagePreview icon={DollarSign} perms={{ canAdd: permissions.fees.canAdd, canExport: permissions.fees.canExport }} />;
            case 'inventory':
                return <GenericPagePreview icon={Archive} perms={{ canAdd: permissions.inventory.canAdd, canExport: permissions.inventory.canExport }} />;
            case 'honours':
                return <GenericPagePreview icon={Star} perms={{ canAdd: permissions.honours.canAdd }} />;
            case 'resources':
                return <GenericPagePreview icon={LinkIcon} perms={{ canAdd: permissions.resources.canAdd }} />;
            case 'events':
                return <GenericPagePreview icon={Calendar} perms={{ canAdd: permissions.events.canAdd }} />;
            case 'adminPanel':
                return <GenericPagePreview icon={Users} perms={{}} />;
            default:
                return <div className="text-center pt-10">Preview not available.</div>;
        }
    };

    return (
        <PreviewContainer title={category.charAt(0).toUpperCase() + category.slice(1)}>
            {renderPreview()}
        </PreviewContainer>
    );
};

export default PermissionPreview;
