import * as React from 'react';
import { AppUser, Permissions, Role } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { ChevronDown, ChevronRight } from 'react-feather';
import PermissionPreview from '../admin/PermissionPreview';

interface PermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: AppUser | null;
    role?: Role | null;
    onSave: (updatedUser: AppUser) => void;
    onRolePermissionsSave?: (permissions: Permissions) => void;
}

// More descriptive and organized permission configuration
const permissionConfig = {
    dashboard: { 
        label: 'Dashboard', 
        permissions: {
            view: 'View Dashboard page',
            quickActions: 'Use Quick Actions (Attendance, Points)',
            viewAttentionItems: 'View "Attention Items" card',
            viewOrderList: 'View "Uniform & Pins to Order" card',
            viewLeaderboard: 'View "Group Points Leaderboard" card',
            viewUpcomingEvents: 'View "Upcoming Events" card',
            viewCards: {
                label: 'Statistic Cards',
                permissions: {
                    activeMembers: 'View "Active Members" card',
                    avgAttendance: 'View "Avg. Attendance" card',
                    pointsLeader: 'View "Points Leader" card',
                }
            }
        } 
    },
    members: { 
        label: 'Members', 
        permissions: {
            view: 'View Members page',
            canAdd: 'Can add new members (single)',
            canBulkAdd: 'Can add new members (bulk)',
            canEdit: 'Can edit existing members',
            canDelete: 'Can delete members',
            canBulkUpdate: 'Can use bulk actions (change group, status, etc.)',
            canExport: 'Can export member list to CSV',
            viewGroupManagement: 'View Group Management tab',
        } 
    },
    attendance: { 
        label: 'Attendance', 
        permissions: {
            view: 'View Attendance page',
            tabs: {
                label: 'Visible Tabs',
                permissions: {
                    take: 'View "Take Attendance" tab',
                    manage: 'View "Manage Records" tab',
                    overall: 'View "Overall Stats" tab',
                }
            },
            canSave: 'Can take and save new attendance records',
            canEdit: 'Can edit saved attendance records',
            canProcessPoints: 'Can process attendance for points',
            canDelete: 'Can delete attendance records',
            canPrint: 'Can print attendance sheets',
        } 
    },
    uniform: { 
        label: 'Uniform & Pins', 
        permissions: {
            view: 'View Uniform & Pins page',
            tabs: {
                label: 'Visible Tabs',
                permissions: {
                    uniforms: 'View "Uniform Checklist" tab',
                    pins: 'View "Pins & Chevrons" tab',
                    otherAchievements: 'View "Other Achievements" tab',
                    orderSummary: 'View "Order Summary" tab'
                }
            },
            canEditUniforms: 'Can edit uniform checklist status',
            canEditPins: 'Can edit pin & chevron status',
            canEditOtherAchievements: 'Can manage other achievements',
            canSave: 'Can save changes made to uniform/pins',
            canPrint: 'Can print checklists',
        } 
    },
    points: { 
        label: 'Points', 
        permissions: {
            view: 'View Points page',
            tabs: {
                label: 'Visible Tabs',
                permissions: {
                    addRemove: 'View "Add/Remove Points" tabs',
                    overall: 'View "Overall" analytics tab',
                }
            },
            canAddRemove: 'Can add or remove points',
            viewLeaderboard: 'View "Group Leaderboard" chart',
            viewRecentLog: 'View "Recent Points Log"',
        } 
    },
    fees: { 
        label: 'Fees', 
        permissions: {
            view: 'View Fees page',
            canAdd: 'Can add new fees for members',
            canEditStatus: 'Can change fee status (e.g., mark as paid)',
            canDelete: 'Can delete fee records',
            canExport: 'Can export fees list to CSV'
        } 
    },
    inventory: { 
        label: 'Inventory', 
        permissions: { 
            view: 'View Inventory page',
            viewStats: 'View statistics cards',
            canAdd: 'Can add new items', 
            canEdit: 'Can edit items', 
            canDelete: 'Can delete items',
            canUpdateQuantity: 'Can update quantity from table view',
            canManageCategories: 'Can create new categories/sub-categories',
            canExport: 'Can export inventory to CSV'
        } 
    },
    honours: {
        label: 'Honours',
        permissions: {
            view: 'View Honours page',
            canAdd: 'Can add new honours to directory',
            canRecordStatus: 'Can record/update member honour status',
            canBulkUpdate: 'Can bulk update status for multiple members',
        }
    },
    resources: { 
        label: 'Resources', 
        permissions: { 
            view: 'View Resources page', 
            canAdd: 'Can add new resource links', 
            canEdit: 'Can edit existing links', 
            canDelete: 'Can delete links',
            canManageCategories: 'Can create new categories'
        } 
    },
    events: { 
        label: 'Events', 
        permissions: { 
            view: 'View Events page', 
            canAdd: 'Can add new events', 
            canEdit: 'Can edit existing events', 
            canDelete: 'Can delete events' 
        } 
    },
    adminPanel: { 
        label: 'Admin Panel', 
        permissions: {
            view: 'View "Admin Panel" in sidebar',
            reports: { 
                label: 'Reports Tab', 
                permissions: { 
                    view: 'View Reports tab', 
                    canGenerate: 'Can generate AI summaries',
                    canExportConference: 'Can export conference report data'
                } 
            },
            management: { 
                label: 'Management Tab', 
                permissions: { 
                    view: 'View Management tab', 
                    canAddUsers: 'Can add new users', 
                    canEditUsers: 'Can edit user details & role', 
                    canDeleteUsers: 'Can delete users',
                    canEditAccessCodes: 'Can view/edit user access codes',
                    canEditPermissions: 'Can edit user & role permissions', 
                    canManageRoles: 'Can create, rename, & delete roles' 
                } 
            },
            alerts: { 
                label: 'Alerts Tab', 
                permissions: { 
                    view: 'View Alerts tab', 
                    canEdit: 'Can edit alert settings' 
                } 
            },
            log: { 
                label: 'Audit Log Tab', 
                permissions: { 
                    view: 'View Audit Log tab' 
                } 
            },
            settings: { 
                label: 'Settings Tab', 
                permissions: { 
                    view: 'View Settings tab',
                    canManageHonourImages: 'Can manage honour patch image library',
                    canConfigurePoints: 'Can configure attendance point system',
                    canTriggerSystemActions: 'Can trigger system actions (rebuilds, etc.)'
                } 
            }
        } 
    },
};

type CategoryKey = keyof typeof permissionConfig;

const getNestedValue = (obj: any, path: string): boolean => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || false;
};

const setNestedValue = (obj: any, path: string, value: boolean) => {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
};

const recursivelySetPermissions = (configNode: any, permissionNode: any, value: boolean) => {
    for (const [key, configValue] of Object.entries(configNode)) {
        if (key === 'label') continue;

        const typedConfigValue = configValue as any;
        if (typeof typedConfigValue === 'string') {
            permissionNode[key] = value;
        } else if (typedConfigValue && typedConfigValue.permissions) {
            if (!permissionNode[key]) permissionNode[key] = {};
            recursivelySetPermissions(typedConfigValue.permissions, permissionNode[key], value);
        }
    }
};


const PermissionTree: React.FC<{
    config: any;
    permissions: Permissions;
    onPermissionChange: (path: string, value: boolean) => void;
    pathPrefix?: string;
    isParentDisabled?: boolean;
}> = ({ config, permissions, onPermissionChange, pathPrefix = '', isParentDisabled = false }) => {
    const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({});

    const toggleSection = (key: string) => {
        setOpenSections(prev => ({...prev, [key]: !prev[key]}));
    };

    return (
        <div className="space-y-2">
            {Object.entries(config).map(([permissionKey, value]: [string, any]) => {
                const currentPath = pathPrefix ? `${pathPrefix}.${permissionKey}` : permissionKey;
                const isViewPermission = permissionKey === 'view';

                if (typeof value === 'string') {
                    return (
                        <label key={currentPath} className={`flex items-center text-sm p-2 rounded-md hover:bg-gray-base ${isParentDisabled && !isViewPermission ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                            <input
                                type="checkbox"
                                className="mr-3 h-4 w-4 rounded text-primary bg-gray-input border-gray-border focus:ring-primary"
                                checked={getNestedValue(permissions, currentPath)}
                                onChange={e => onPermissionChange(currentPath, e.target.checked)}
                                disabled={isParentDisabled && !isViewPermission}
                            />
                            {value}
                        </label>
                    );
                } else if (value && value.permissions) {
                    const isOpen = openSections[permissionKey] ?? true; // Default to open
                    const areChildrenDisabled = isParentDisabled || !getNestedValue(permissions, `${currentPath}.view`);

                    return (
                        <div key={currentPath} className="bg-gray-surface/50 p-2 rounded-md border border-gray-border/50">
                            <div className="flex items-center cursor-pointer" onClick={() => toggleSection(permissionKey)}>
                                {isOpen ? <ChevronDown size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1" />}
                                <h4 className="font-semibold text-sm text-text-muted">{value.label}</h4>
                            </div>
                            {isOpen && (
                                <div className="pl-6 pt-2">
                                    <PermissionTree
                                        config={value.permissions}
                                        permissions={permissions}
                                        onPermissionChange={onPermissionChange}
                                        pathPrefix={currentPath}
                                        isParentDisabled={areChildrenDisabled}
                                    />
                                </div>
                            )}
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
};

const PermissionsModal: React.FC<PermissionsModalProps> = ({ isOpen, onClose, user, role, onSave, onRolePermissionsSave }) => {
    const [permissions, setPermissions] = React.useState<Permissions | null>(null);
    const [selectedCategory, setSelectedCategory] = React.useState<CategoryKey>('dashboard');
    const [loading, setLoading] = React.useState(false);

    const target = user || role;
    const title = user ? `Permissions: ${user.name}` : `Permissions: ${role?.name} Role`;

    React.useEffect(() => {
        if (target) {
            setPermissions(JSON.parse(JSON.stringify(target.permissions))); // Deep copy
            setSelectedCategory('dashboard');
        } else {
            setPermissions(null);
        }
    }, [target, isOpen]);

    const handlePermissionChange = (path: string, value: boolean) => {
        if (!permissions) return;
        const newState = JSON.parse(JSON.stringify(permissions));
        setNestedValue(newState, path, value);

        // If a view permission is unchecked, uncheck all its children
        if (path.endsWith('.view') && !value) {
            const pathParts = path.split('.');
            pathParts.pop(); // remove '.view'
            let configNode = permissionConfig as any;
            let permissionNode = newState as any;
            pathParts.forEach(part => {
                configNode = (configNode[part]?.permissions) ? configNode[part].permissions : configNode[part];
                permissionNode = permissionNode[part];
            });
            if (configNode && permissionNode) {
                 recursivelySetPermissions(configNode, permissionNode, false);
            }
        }

        setPermissions(newState);
    };
    
    const handleSelectAllForCategory = (select: boolean) => {
        if (!permissions) return;
        const newState = JSON.parse(JSON.stringify(permissions));
        const categoryConfig = (permissionConfig as any)[selectedCategory].permissions;
        const categoryPermissions = newState[selectedCategory];
        
        recursivelySetPermissions(categoryConfig, categoryPermissions, select);

        // Also set the main view permission for the category
        newState[selectedCategory].view = select;

        setPermissions(newState);
    };

    const handleSubmit = async () => {
        if (!target || !permissions) return;
        setLoading(true);
        if (user && onSave) {
            const updatedUser = { ...user, permissions };
            onSave(updatedUser);
        } else if (role && onRolePermissionsSave) {
            onRolePermissionsSave(permissions);
        }
        setLoading(false);
    };
    
    if (!target || !permissions) return null;
    
    const isCategoryDisabled = !permissions[selectedCategory]?.view;

    return (
        <Modal show={isOpen} onClose={onClose} title={title} size="xl">
            <Spinner show={loading} />
            <div className="flex flex-col md:flex-row gap-6 min-h-[60vh]">
                {/* Panel 1: Modules */}
                <div className="w-full md:w-1/4 border-b md:border-b-0 md:border-r border-gray-border pb-4 md:pb-0 md:pr-4">
                    <h3 className="font-semibold text-text-muted text-sm mb-2 px-2">Modules</h3>
                    <div className="space-y-1">
                        {Object.entries(permissionConfig).map(([key, { label }]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedCategory(key as CategoryKey)}
                                className={`w-full text-left text-sm p-2 rounded-md transition-colors ${selectedCategory === key ? 'bg-primary/20 text-primary font-semibold' : 'hover:bg-gray-border/50'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Panel 2: Permissions */}
                <div className="w-full md:w-1/2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">{permissionConfig[selectedCategory].label}</h3>
                         <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleSelectAllForCategory(true)}>Select All</Button>
                            <Button size="sm" variant="outline" onClick={() => handleSelectAllForCategory(false)}>Deselect All</Button>
                        </div>
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto pr-2">
                        <PermissionTree 
                            config={(permissionConfig as any)[selectedCategory].permissions}
                            permissions={permissions}
                            onPermissionChange={handlePermissionChange}
                            pathPrefix={selectedCategory}
                            isParentDisabled={isCategoryDisabled}
                        />
                    </div>
                </div>

                {/* Panel 3: Preview */}
                <div className="w-full md:w-1/4">
                     <h3 className="font-semibold text-text-muted text-sm mb-2">Live Preview</h3>
                     <PermissionPreview category={selectedCategory} permissions={permissions} />
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-gray-border pt-6 -mx-6 -mb-6 px-6 pb-6 bg-gray-base/50 rounded-b-lg">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Save Permissions</Button>
            </div>
        </Modal>
    );
};

export default PermissionsModal;
