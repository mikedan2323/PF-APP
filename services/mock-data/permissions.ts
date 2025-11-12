import { Permissions } from '../../types';

export const BASE_PERMISSIONS: Permissions = {
    dashboard: { view: false, quickActions: false, viewAttentionItems: false, viewOrderList: false, viewLeaderboard: false, viewUpcomingEvents: false, viewCards: { activeMembers: false, avgAttendance: false, pointsLeader: false } },
    members: { view: false, canAdd: false, canEdit: false, canDelete: false, viewGroupManagement: false, canBulkAdd: false, canBulkUpdate: false, canExport: false },
    attendance: { view: false, canSave: false, canEdit: false, canProcessPoints: false, canDelete: false, canPrint: false, tabs: { take: false, manage: false, overall: false } },
    uniform: { view: false, tabs: { uniforms: false, pins: false, otherAchievements: false, orderSummary: false }, canEditUniforms: false, canEditPins: false, canEditOtherAchievements: false, canSave: false, canPrint: false },
    points: { view: false, tabs: { addRemove: false, overall: false }, canAddRemove: false, viewLeaderboard: false, viewRecentLog: false },
    fees: { view: false, canAdd: false, canEditStatus: false, canDelete: false, canExport: false },
    inventory: { view: false, viewStats: false, canAdd: false, canEdit: false, canDelete: false, canUpdateQuantity: false, canManageCategories: false, canExport: false },
    honours: { view: false, canAdd: false, canRecordStatus: false, canBulkUpdate: false },
    resources: { view: false, canAdd: false, canEdit: false, canDelete: false, canManageCategories: false },
    events: { view: false, canAdd: false, canEdit: false, canDelete: false },
    adminPanel: { view: false, reports: { view: false, canGenerate: false, canExportConference: false }, management: { view: false, canAddUsers: false, canEditUsers: false, canDeleteUsers: false, canEditAccessCodes: false, canEditPermissions: false, canManageRoles: false }, alerts: { view: false, canEdit: false }, log: { view: false }, settings: { view: false, canManageHonourImages: false, canConfigurePoints: false, canTriggerSystemActions: false } },
};

export const directorPermissions: Permissions = {
    dashboard: { view: true, quickActions: true, viewAttentionItems: true, viewOrderList: true, viewLeaderboard: true, viewUpcomingEvents: true, viewCards: { activeMembers: true, avgAttendance: true, pointsLeader: true } },
    members: { view: true, canAdd: true, canEdit: true, canDelete: true, viewGroupManagement: true, canBulkAdd: true, canBulkUpdate: true, canExport: true },
    attendance: { view: true, canSave: true, canEdit: true, canProcessPoints: true, canDelete: true, canPrint: true, tabs: { take: true, manage: true, overall: true } },
    uniform: { view: true, tabs: { uniforms: true, pins: true, otherAchievements: true, orderSummary: true }, canEditUniforms: true, canEditPins: true, canEditOtherAchievements: true, canSave: true, canPrint: true },
    points: { view: true, tabs: { addRemove: true, overall: true }, canAddRemove: true, viewLeaderboard: true, viewRecentLog: true },
    fees: { view: true, canAdd: true, canEditStatus: true, canDelete: true, canExport: true },
    inventory: { view: true, viewStats: true, canAdd: true, canEdit: true, canDelete: true, canUpdateQuantity: true, canManageCategories: true, canExport: true },
    honours: { view: true, canAdd: true, canRecordStatus: true, canBulkUpdate: true },
    resources: { view: true, canAdd: true, canEdit: true, canDelete: true, canManageCategories: true },
    events: { view: true, canAdd: true, canEdit: true, canDelete: true },
    adminPanel: { view: true, reports: { view: true, canGenerate: true, canExportConference: true }, management: { view: true, canAddUsers: true, canEditUsers: true, canDeleteUsers: true, canEditAccessCodes: true, canEditPermissions: true, canManageRoles: true }, alerts: { view: true, canEdit: true }, log: { view: true }, settings: { view: true, canManageHonourImages: true, canConfigurePoints: true, canTriggerSystemActions: true } },
};

export const leaderPermissions: Permissions = {
    ...BASE_PERMISSIONS,
    dashboard: { view: true, quickActions: true, viewAttentionItems: true, viewOrderList: true, viewLeaderboard: true, viewUpcomingEvents: true, viewCards: { activeMembers: true, avgAttendance: true, pointsLeader: true } },
    members: { view: true, canAdd: true, canEdit: true, canDelete: false, viewGroupManagement: true, canBulkAdd: true, canBulkUpdate: true, canExport: true },
    attendance: { view: true, canSave: true, canEdit: true, canProcessPoints: true, canDelete: true, canPrint: true, tabs: { take: true, manage: true, overall: true } },
    uniform: { view: true, tabs: { uniforms: true, pins: true, otherAchievements: true, orderSummary: true }, canEditUniforms: true, canEditPins: true, canEditOtherAchievements: true, canSave: true, canPrint: true },
    points: { view: true, tabs: { addRemove: true, overall: true }, canAddRemove: true, viewLeaderboard: true, viewRecentLog: true },
    fees: { view: true, canAdd: true, canEditStatus: true, canDelete: false, canExport: true },
    inventory: { view: true, viewStats: true, canAdd: true, canEdit: true, canDelete: false, canUpdateQuantity: true, canManageCategories: false, canExport: true },
    honours: { view: true, canAdd: true, canRecordStatus: true, canBulkUpdate: true },
    resources: { view: true, canAdd: true, canEdit: true, canDelete: false, canManageCategories: false },
    events: { view: true, canAdd: true, canEdit: true, canDelete: false },
    adminPanel: { ...BASE_PERMISSIONS.adminPanel, view: true, log: { view: true }, settings: { view: true, canManageHonourImages: false, canConfigurePoints: false, canTriggerSystemActions: false } }
};

export const counsellorPermissions: Permissions = {
    ...BASE_PERMISSIONS,
    dashboard: { view: true, quickActions: true, viewAttentionItems: true, viewOrderList: false, viewLeaderboard: true, viewUpcomingEvents: true, viewCards: { activeMembers: true, avgAttendance: false, pointsLeader: false } },
    members: { view: true, canAdd: false, canEdit: false, canDelete: false, viewGroupManagement: false, canBulkAdd: false, canBulkUpdate: false, canExport: false },
    attendance: { view: true, canSave: true, canEdit: false, canProcessPoints: false, canDelete: false, canPrint: true, tabs: { take: true, manage: false, overall: true } },
    uniform: { view: true, tabs: { uniforms: true, pins: true, otherAchievements: true, orderSummary: false }, canEditUniforms: true, canEditPins: true, canEditOtherAchievements: false, canSave: true, canPrint: true },
    points: { view: true, tabs: { addRemove: true, overall: true }, canAddRemove: true, viewLeaderboard: true, viewRecentLog: true },
    fees: { view: true, canAdd: false, canEditStatus: false, canDelete: false, canExport: false },
    inventory: { view: true, viewStats: true, canAdd: false, canEdit: false, canDelete: false, canUpdateQuantity: false, canManageCategories: false, canExport: false },
    honours: { view: true, canAdd: false, canRecordStatus: true, canBulkUpdate: false },
    resources: { view: true, canAdd: false, canEdit: false, canDelete: false, canManageCategories: false },
    events: { view: true, canAdd: false, canEdit: false, canDelete: false },
};