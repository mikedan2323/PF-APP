// FIX: Define and export all types to be used throughout the application.

export interface Permissions {
    dashboard: {
        view: boolean;
        quickActions: boolean;
        viewAttentionItems: boolean;
        viewOrderList: boolean;
        viewLeaderboard: boolean;
        viewUpcomingEvents: boolean;
        viewCards: {
            activeMembers: boolean;
            avgAttendance: boolean;
            pointsLeader: boolean;
        };
    };
    members: {
        view: boolean;
        canAdd: boolean;
        canEdit: boolean;
        canDelete: boolean;
        viewGroupManagement: boolean;
        canBulkAdd: boolean;
        canBulkUpdate: boolean;
        canExport: boolean;
    };
    attendance: {
        view: boolean;
        canSave: boolean;
        canEdit: boolean;
        canProcessPoints: boolean;
        canDelete: boolean;
        canPrint: boolean;
        tabs: {
            take: boolean;
            manage: boolean;
            overall: boolean;
        };
    };
    uniform: {
        view: boolean;
        tabs: {
            uniforms: boolean;
            pins: boolean;
            otherAchievements: boolean;
            orderSummary: boolean;
        };
        canEditUniforms: boolean;
        canEditPins: boolean;
        canEditOtherAchievements: boolean;
        canSave: boolean;
        canPrint: boolean;
    };
    points: {
        view: boolean;
        tabs: {
            addRemove: boolean;
            overall: boolean;
        };
        canAddRemove: boolean;
        viewLeaderboard: boolean;
        viewRecentLog: boolean;
    };
    fees: {
        view: boolean;
        canAdd: boolean;
        canEditStatus: boolean;
        canDelete: boolean;
        canExport: boolean;
    };
    inventory: {
        view: boolean;
        viewStats: boolean;
        canAdd: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canUpdateQuantity: boolean;
        canManageCategories: boolean;
        canExport: boolean;
    };
    honours: {
        view: boolean;
        canAdd: boolean;
        canRecordStatus: boolean;
        canBulkUpdate: boolean;
    };
    resources: {
        view: boolean;
        canAdd: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canManageCategories: boolean;
    };
    events: {
        view: boolean;
        canAdd: boolean;
        canEdit: boolean;
        canDelete: boolean;
    };
    adminPanel: {
        view: boolean;
        reports: { 
            view: boolean; 
            canGenerate: boolean;
            canExportConference: boolean;
        };
        management: {
            view: boolean;
            canAddUsers: boolean;
            canEditUsers: boolean;
            canDeleteUsers: boolean;
            canEditAccessCodes: boolean;
            canEditPermissions: boolean;
            canManageRoles: boolean;
        };
        alerts: { 
            view: boolean; 
            canEdit: boolean; 
        };
        log: { 
            view: boolean; 
        };
        settings: { 
            view: boolean; 
            canManageHonourImages: boolean;
            canConfigurePoints: boolean;
            canTriggerSystemActions: boolean;
        };
    };
}

export interface Role {
    id: string;
    name: string;
    permissions: Permissions;
}

export interface AppUser {
    id: string;
    name: string;
    role: string;
    permissions: Permissions;
    isShared: boolean;
    individualName?: string;
}

export type User = AppUser;

export interface Group {
    name: string;
    color: string;
}

export interface Member {
    id: string;
    fullName: string;
    group: string;
    class: string;
    dob?: string;
    gender?: 'Male' | 'Female' | 'Other';
    contact?: string;
    status: 'Active' | 'Inactive';
    registration: {
        form: boolean;
        healthInfo: boolean;
        feesPaid: boolean;
    };
}

export interface AlertData {
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning';
}

export interface PointLog {
    id: string;
    ts: string;
    group: string;
    reason: string;
    points: number;
    by: string;
    members?: string[];
}

export interface Fee {
    id: string;
    memberId: string;
    memberName: string;
    group: string;
    type: 'Late' | 'Other';
    otherTypeReason?: string;
    amount: number;
    dueDate: string;
    status: 'Paid' | 'Unpaid' | 'Waived';
    pointLogId?: string;
}

export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    subcategory?: string;
    quantity: number;
    minStock: number;
    size?: string;
    gender?: 'Boys' | 'Girls' | 'Unisex';
    location?: string;
    notes?: string;
}

export interface HonourImage {
    id: string;
    name: string;
    url: string;
}

export interface Honour {
    id: string;
    name: string;
    category: string;
    level: number;
    patchUrl: string;
    instructor?: string;
}

export interface MemberHonourStatus {
    [memberId: string]: {
        [honourId: string]: 'Not Started' | 'In Progress' | 'Completed';
    };
}

export interface Resource {
    id: string;
    name: string;
    url: string;
    category: string;
    by: string;
    at: string;
}

export interface Event {
    id: string;
    title: string;
    start: Date;
    end: Date;
    category: 'Club Meeting' | 'Conference' | 'Community Service' | 'Campout' | 'Birthday';
    allDay?: boolean;
    description?: string;
}

export interface LogEntry {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details: string;
}

export interface AttendanceData {
    present: boolean;
    bible: boolean;
    book: boolean;
    uniform: boolean;
    remarks?: string;
    excused?: {
        present?: boolean;
        bible?: boolean;
        book?: boolean;
        uniform?: boolean;
    };
};

export interface AttendanceRecord {
    id: string;
    date: string;
    className: string;
    recorder: string;
    records: {
        [memberId: string]: AttendanceData;
    };
    pointsProcessed: boolean;
}

export interface ReportData {
    meetingCount: number;
    avgAttendance: number;
    uniformCompliance: number;
}

export interface AttendancePointsSettings {
    present: number;
    absent: number;
    hasBible: number;
    noBible: number;
    hasBook: number;

    noBook: number;
    hasUniform: number;
    noUniform: number;
    lateFeePenalty: number;
    lateFeePaidCredit: number;
}

export interface MemberAttendanceStat {
    memberId: string;
    name: string;
    group: string;
    class: string;
    presenceRate: number;
    bibleRate: number;
    bookRate: number;
    uniformRate: number;
    daysPresent: number;
    daysAbsent: number;
    daysExcused: number;
}

export interface AlertSettings {
    overdueFeeAmount: number;
    missingBookThreshold: number;
    missingUniformThreshold: number;
    missingBibleThreshold: number;
    attendanceThreshold: number;
    lowStockWarningThreshold: number;
    incompleteRegistration: boolean;
}

export interface UniformRecord {
    memberId: string;
    name: string;
    items: { [item: string]: boolean };
    sizes: { [item: string]: string };
    bookIssued: boolean;
}

export interface MemberAchievements {
    memberId: string;
    name: string;
    achievements: {
        [achievement: string]: {
            earned: boolean;
            received: boolean;
        };
    };
}

export interface OtherAchievementType {
    name: string;
    achievements: string[];
}

export interface MemberOtherAchievement {
    id: string;
    memberId: string;
    type: string;
    achievement: string;
    dateEarned: string;
    received: boolean;
    notes?: string;
}

export interface Notification {
    id: string;
    read: boolean;
    type: 'incomplete_registration' | 'overdue_fee' | 'low_stock' | 'low_attendance' | 'missing_item';
    message: string;
}
