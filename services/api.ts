import {
    Member, PointLog, Fee, InventoryItem, Honour, MemberHonourStatus, Resource, Event, LogEntry,
    Role, Permissions, AttendanceRecord, ReportData, AttendancePointsSettings, MemberAttendanceStat,
    AppUser, AlertSettings, UniformRecord, MemberAchievements, Notification, HonourImage,
    OtherAchievementType, MemberOtherAchievement, Group
} from '../types';
import { MOCK_USERS, MOCK_ROLES } from './mock-data/users';
import { MOCK_MEMBERS, MOCK_GROUPS, MOCK_CLASSES } from './mock-data/members';
import { MOCK_POINTS_LOG, MOCK_LEADERBOARD } from './mock-data/points';
import { MOCK_EVENTS } from './mock-data/events';
import {
    MOCK_UNIFORM_RECORDS,
    MOCK_ACHIEVEMENT_RECORDS,
    MOCK_OTHER_ACHIEVEMENT_TYPES,
    MOCK_MEMBER_OTHER_ACHIEVEMENTS,
} from './mock-data/uniform';
import { MOCK_ATTENDANCE_RECORDS } from './mock-data/attendance';
import { MOCK_FEES } from './mock-data/fees';
import { MOCK_INVENTORY, MOCK_INVENTORY_CATEGORIES } from './mock-data/inventory';
import { MOCK_RESOURCES, MOCK_RESOURCE_CATEGORIES } from './mock-data/resources';
import {
    MOCK_HONOURS,
    MOCK_HONOUR_CATEGORIES,
    MOCK_HONOUR_IMAGES,
    MOCK_HONOUR_STATUS,
} from './mock-data/honours';
import { MOCK_LOGS } from './mock-data/logs';
import { BASE_PERMISSIONS } from './mock-data/permissions';

const structuredCloneImpl: <T>(value: T) => T = (globalThis as any).structuredClone
    ? (value) => (globalThis as any).structuredClone(value)
    : (value) => JSON.parse(JSON.stringify(value));

const deepClone = <T>(value: T): T => structuredCloneImpl(value);

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const randomId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const defaultAlertSettings: AlertSettings = {
    overdueFeeAmount: 50,
    missingBookThreshold: 3,
    missingUniformThreshold: 2,
    missingBibleThreshold: 4,
    attendanceThreshold: 75,
    lowStockWarningThreshold: 5,
    incompleteRegistration: true,
};

const defaultAttendanceSettings: AttendancePointsSettings = {
    present: 10,
    absent: -5,
    hasBible: 5,
    noBible: 0,
    hasBook: 5,
    noBook: 0,
    hasUniform: 10,
    noUniform: -5,
    lateFeePenalty: -2,
    lateFeePaidCredit: 1,
};

type LeaderboardEntry = { group: string; total: number };

type State = {
    roles: Map<string, Role>;
    users: Map<string, AppUser>;
    members: Map<string, Member>;
    groups: Group[];
    classes: string[];
    pointsLog: PointLog[];
    leaderboard: LeaderboardEntry[];
    events: Map<string, Event>;
    uniformRecords: Map<string, UniformRecord>;
    achievementRecords: Map<string, MemberAchievements>;
    otherAchievementTypes: OtherAchievementType[];
    otherAchievements: Map<string, MemberOtherAchievement>;
    fees: Map<string, Fee>;
    inventory: Map<string, InventoryItem>;
    inventoryCategories: { name: string; subcategories: string[] }[];
    resources: Map<string, Resource>;
    resourceCategories: string[];
    honours: Map<string, Honour>;
    honourCategories: string[];
    honourImages: Map<string, HonourImage>;
    memberHonourStatus: MemberHonourStatus;
    attendanceRecords: Map<string, AttendanceRecord>;
    notifications: Notification[];
    logs: LogEntry[];
    alertSettings: AlertSettings;
    attendanceSettings: AttendancePointsSettings;
};

const initializeState = (): State => {
    const state: State = {
        roles: new Map(MOCK_ROLES.map(role => [role.id, deepClone(role)])),
        users: new Map(MOCK_USERS.map(user => [user.id, deepClone(user)])),
        members: new Map(MOCK_MEMBERS.map(member => [member.id, deepClone(member)])),
        groups: deepClone(MOCK_GROUPS),
        classes: deepClone(MOCK_CLASSES),
        pointsLog: deepClone(MOCK_POINTS_LOG),
        leaderboard: deepClone(MOCK_LEADERBOARD),
        events: new Map(MOCK_EVENTS.map(event => [event.id, { ...event, start: new Date(event.start), end: new Date(event.end) }])),
        uniformRecords: new Map(MOCK_UNIFORM_RECORDS.map(record => [record.memberId, deepClone(record)])),
        achievementRecords: new Map(MOCK_ACHIEVEMENT_RECORDS.map(record => [record.memberId, deepClone(record)])),
        otherAchievementTypes: deepClone(MOCK_OTHER_ACHIEVEMENT_TYPES),
        otherAchievements: new Map(MOCK_MEMBER_OTHER_ACHIEVEMENTS.map(record => [record.id, deepClone(record)])),
        fees: new Map(MOCK_FEES.map(fee => [fee.id, deepClone(fee)])),
        inventory: new Map(MOCK_INVENTORY.map(item => [item.id, deepClone(item)])),
        inventoryCategories: deepClone(MOCK_INVENTORY_CATEGORIES),
        resources: new Map(MOCK_RESOURCES.map(res => [res.id, deepClone(res)])),
        resourceCategories: deepClone(MOCK_RESOURCE_CATEGORIES),
        honours: new Map(MOCK_HONOURS.map(h => [h.id, deepClone(h)])),
        honourCategories: deepClone(MOCK_HONOUR_CATEGORIES),
        honourImages: new Map(MOCK_HONOUR_IMAGES.map(img => [img.id, deepClone(img)])),
        memberHonourStatus: deepClone(MOCK_HONOUR_STATUS),
        attendanceRecords: new Map(MOCK_ATTENDANCE_RECORDS.map(record => [record.id, deepClone(record)])),
        notifications: [],
        logs: deepClone(MOCK_LOGS),
        alertSettings: deepClone(defaultAlertSettings),
        attendanceSettings: deepClone(defaultAttendanceSettings),
    };
    return state;
};

const state = initializeState();

const getRoleByName = (roleName: string) => {
    for (const role of state.roles.values()) {
        if (role.name === roleName) return role;
    }
    return undefined;
};

const ensureMemberDependentRecords = (memberId: string, memberName: string) => {
    if (!state.uniformRecords.has(memberId)) {
        state.uniformRecords.set(memberId, { memberId, name: memberName, items: {}, sizes: {}, bookIssued: false });
    }
    if (!state.achievementRecords.has(memberId)) {
        state.achievementRecords.set(memberId, { memberId, name: memberName, achievements: {} });
    }
    if (!state.memberHonourStatus[memberId]) {
        state.memberHonourStatus[memberId] = {};
    }
};

const removeMember = (id: string) => {
    const member = state.members.get(id);
    state.members.delete(id);
    state.uniformRecords.delete(id);
    state.achievementRecords.delete(id);
    delete state.memberHonourStatus[id];
    Array.from(state.otherAchievements.values()).forEach(record => {
        if (record.memberId === id) {
            state.otherAchievements.delete(record.id);
        }
    });
    state.fees.forEach((fee, feeId) => {
        if (fee.memberId === id) state.fees.delete(feeId);
    });
    return member;
};

const upsertLog = (entry: LogEntry) => {
    state.logs.unshift(entry);
    if (state.logs.length > 200) {
        state.logs.length = 200;
    }
};

const recalculateLeaderboard = () => {
    const totals: Record<string, number> = {};
    state.pointsLog.forEach(log => {
        totals[log.group] = (totals[log.group] || 0) + log.points;
    });
    state.leaderboard = Object.entries(totals)
        .map(([group, total]) => ({ group, total }))
        .sort((a, b) => b.total - a.total);
};

const getAttendanceDataForMonth = (month: string) => {
    const [year, monthNum] = month.split('-').map(Number);
    return Array.from(state.attendanceRecords.values()).filter(record => {
        const [recordYear, recordMonth] = record.date.split('-').map(Number);
        return recordYear === year && recordMonth === monthNum;
    });
};

const calculateAttendanceStats = () => {
    const activeMembers = Array.from(state.members.values()).filter(m => m.status === 'Active');
    const stats: Record<string, MemberAttendanceStat & { presentMeetings: number; bibleCount: number; bookCount: number; uniformCount: number; totalMeetings: number }> = {};

    activeMembers.forEach(member => {
        stats[member.id] = {
            memberId: member.id,
            name: member.fullName,
            group: member.group,
            class: member.class,
            presenceRate: 0,
            bibleRate: 0,
            bookRate: 0,
            uniformRate: 0,
            daysPresent: 0,
            daysAbsent: 0,
            daysExcused: 0,
            presentMeetings: 0,
            bibleCount: 0,
            bookCount: 0,
            uniformCount: 0,
            totalMeetings: 0,
        };
    });

    state.attendanceRecords.forEach(record => {
        Object.entries(record.records).forEach(([memberId, attData]) => {
            const stat = stats[memberId];
            if (!stat) return;
            stat.totalMeetings += 1;
            if (attData.present) {
                stat.daysPresent += 1;
                stat.presentMeetings += 1;
                if (attData.bible) stat.bibleCount += 1;
                if (attData.book) stat.bookCount += 1;
                if (attData.uniform) stat.uniformCount += 1;
            } else if (attData.excused?.present) {
                stat.daysExcused += 1;
            } else {
                stat.daysAbsent += 1;
            }
        });
    });

    return Object.values(stats).map(stat => ({
        memberId: stat.memberId,
        name: stat.name,
        group: stat.group,
        class: stat.class,
        daysPresent: stat.daysPresent,
        daysAbsent: stat.daysAbsent,
        daysExcused: stat.daysExcused,
        presenceRate: stat.totalMeetings > 0 ? Math.round((stat.daysPresent / stat.totalMeetings) * 100) : 0,
        bibleRate: stat.presentMeetings > 0 ? Math.round((stat.bibleCount / stat.presentMeetings) * 100) : 0,
        bookRate: stat.presentMeetings > 0 ? Math.round((stat.bookCount / stat.presentMeetings) * 100) : 0,
        uniformRate: stat.presentMeetings > 0 ? Math.round((stat.uniformCount / stat.presentMeetings) * 100) : 0,
    }));
};

export const api = {
    // --- User & Role Management ---
    getUser: async (userId: string): Promise<AppUser | null> => {
        await delay(100);
        const user = state.users.get(userId);
        return user ? deepClone(user) : null;
    },

    getRolePermissions: async (roleName: string): Promise<Permissions | null> => {
        await delay(100);
        const role = getRoleByName(roleName);
        return role ? deepClone(role.permissions) : null;
    },

    getUsers: async (): Promise<{ success: boolean; data: AppUser[] }> => {
        await delay(100);
        return { success: true, data: Array.from(state.users.values()).map(user => deepClone(user)) };
    },

    addUser: async (name: string, role: string, code: string, isShared: boolean, uid?: string): Promise<{ success: boolean; data?: { user: AppUser; code: string }; message?: string }> => {
        await delay(100);
        const id = uid || randomId('user');
        const basePermissions = (await api.getRolePermissions(role)) || deepClone(BASE_PERMISSIONS);
        const newUser: AppUser = { id, name, role, isShared, permissions: basePermissions };
        state.users.set(id, newUser);
        upsertLog({ id: randomId('log'), timestamp: new Date().toISOString(), user: 'System', action: 'Add User', details: `Added user ${name} (${role})` });
        return { success: true, data: { user: deepClone(newUser), code } };
    },

    updateUser: async (userId: string, data: { name: string; role: string }) => {
        await delay(100);
        const user = state.users.get(userId);
        if (!user) return { success: false, message: 'User not found' } as const;
        const updated: AppUser = { ...user, name: data.name, role: data.role };
        const rolePermissions = (await api.getRolePermissions(data.role)) || deepClone(BASE_PERMISSIONS);
        updated.permissions = rolePermissions;
        state.users.set(userId, updated);
        upsertLog({ id: randomId('log'), timestamp: new Date().toISOString(), user: 'System', action: 'Update User', details: `Updated user ${data.name}` });
        return { success: true };
    },

    deleteUser: async (userId: string) => {
        await delay(100);
        const removed = state.users.get(userId);
        state.users.delete(userId);
        if (removed) {
            upsertLog({ id: randomId('log'), timestamp: new Date().toISOString(), user: 'System', action: 'Delete User', details: `Deleted user ${removed.name}` });
        }
        return { success: true };
    },

    updateUserPermissions: async (userId: string, permissions: Permissions) => {
        await delay(100);
        const user = state.users.get(userId);
        if (user) {
            user.permissions = deepClone(permissions);
            state.users.set(userId, user);
            upsertLog({ id: randomId('log'), timestamp: new Date().toISOString(), user: 'System', action: 'Update Permissions', details: `Updated permissions for ${user.name}` });
        }
        return { success: true };
    },

    getRoles: async (): Promise<{ success: boolean; data: Role[] }> => {
        await delay(100);
        return { success: true, data: Array.from(state.roles.values()).map(role => deepClone(role)) };
    },

    addRole: async (roleName: string) => {
        await delay(100);
        if (getRoleByName(roleName)) {
            return { success: false, message: 'Role already exists.' } as const;
        }
        const roleId = roleName.toLowerCase().replace(/\s+/g, '_');
        const base = deepClone(BASE_PERMISSIONS);
        const newRole: Role = { id: roleId, name: roleName, permissions: base };
        state.roles.set(roleId, newRole);
        upsertLog({ id: randomId('log'), timestamp: new Date().toISOString(), user: 'System', action: 'Add Role', details: `Added role ${roleName}` });
        return { success: true };
    },

    updateRolePermissions: async (roleId: string, permissions: Permissions) => {
        await delay(100);
        const role = state.roles.get(roleId);
        if (role) {
            role.permissions = deepClone(permissions);
            state.roles.set(roleId, role);
        }
        return { success: true };
    },

    updateRole: async (roleId: string, newName: string) => {
        await delay(100);
        const role = state.roles.get(roleId);
        if (role) {
            role.name = newName;
            state.roles.set(roleId, role);
        }
        return { success: true };
    },

    deleteRole: async (roleId: string) => {
        await delay(100);
        state.roles.delete(roleId);
        return { success: true };
    },

    logAction: async (user: string, action: string, details: string): Promise<void> => {
        await delay(50);
        upsertLog({ id: randomId('log'), timestamp: new Date().toISOString(), user, action, details });
    },

    // --- Members ---
    getMembersData: async () => {
        await delay(100);
        const members = Array.from(state.members.values()).map(member => deepClone(member));
        return {
            success: true,
            data: {
                members,
                groups: deepClone(state.groups),
                classes: deepClone(state.classes),
            },
        } as const;
    },

    addMember: async (member: Omit<Member, 'id'>) => {
        await delay(100);
        const id = randomId('member');
        const newMember: Member = { ...member, id };
        state.members.set(id, newMember);
        ensureMemberDependentRecords(id, member.fullName);
        upsertLog({ id: randomId('log'), timestamp: new Date().toISOString(), user: 'System', action: 'Add Member', details: `Added member ${member.fullName}` });
        return { success: true };
    },

    updateMember: async (updatedMember: Member) => {
        await delay(100);
        state.members.set(updatedMember.id, deepClone(updatedMember));
        ensureMemberDependentRecords(updatedMember.id, updatedMember.fullName);
        return { success: true };
    },

    deleteMember: async (id: string) => {
        await delay(100);
        const member = removeMember(id);
        if (member) {
            upsertLog({ id: randomId('log'), timestamp: new Date().toISOString(), user: 'System', action: 'Delete Member', details: `Removed member ${member.fullName}` });
        }
        return { success: true };
    },

    bulkUpdateField: async (memberIds: string[], field: 'group' | 'class' | 'status', value: string) => {
        await delay(100);
        memberIds.forEach(id => {
            const member = state.members.get(id);
            if (member) {
                (member as any)[field] = value;
                state.members.set(id, member);
            }
        });
        return { success: true };
    },

    bulkUpdateRegistration: async (memberIds: string[], field: keyof Member['registration'], value: boolean) => {
        await delay(100);
        memberIds.forEach(id => {
            const member = state.members.get(id);
            if (member) {
                member.registration[field] = value;
                state.members.set(id, member);
            }
        });
        return { success: true };
    },

    bulkDeleteMembers: async (memberIds: string[]) => {
        await delay(100);
        memberIds.forEach(id => removeMember(id));
        return { success: true };
    },

    // --- Points ---
    getPointsData: async () => {
        await delay(100);
        return {
            success: true,
            data: {
                logs: deepClone(state.pointsLog),
                leaderboard: deepClone(state.leaderboard),
            },
        } as const;
    },

    addPoints: async (log: Omit<PointLog, 'id'>) => {
        await delay(100);
        const newLog: PointLog = { ...log, id: randomId('pl') };
        state.pointsLog.unshift(newLog);
        recalculateLeaderboard();
        upsertLog({ id: randomId('log'), timestamp: new Date().toISOString(), user: log.by, action: 'Add Points', details: `${log.points} pts to ${log.group} for ${log.reason}` });
        return { success: true };
    },

    // --- Events ---
    getEvents: async (): Promise<{ success: boolean; data: Event[] }> => {
        await delay(100);
        const events = Array.from(state.events.values()).map(event => ({ ...event, start: new Date(event.start), end: new Date(event.end) }));
        return { success: true, data: events };
    },

    addEvent: async (event: Omit<Event, 'id'>): Promise<{ success: boolean; data: Event }> => {
        await delay(100);
        const id = randomId('evt');
        const newEvent: Event = { ...event, id, start: new Date(event.start), end: new Date(event.end) };
        state.events.set(id, newEvent);
        upsertLog({ id: randomId('log'), timestamp: new Date().toISOString(), user: 'System', action: 'Add Event', details: `Added event ${event.title}` });
        return { success: true, data: deepClone(newEvent) };
    },

    updateEvent: async (event: Event): Promise<{ success: boolean; data: Event }> => {
        await delay(100);
        const updated: Event = { ...event, start: new Date(event.start), end: new Date(event.end) };
        state.events.set(event.id, updated);
        return { success: true, data: deepClone(updated) };
    },

    deleteEvent: async (eventId: string): Promise<{ success: boolean }> => {
        await delay(100);
        state.events.delete(eventId);
        return { success: true };
    },

    // --- Uniform ---
    getUniformData: async (): Promise<{ success: boolean; data: { members: UniformRecord[] } }> => {
        await delay(100);
        return { success: true, data: { members: Array.from(state.uniformRecords.values()).map(record => deepClone(record)) } };
    },

    saveUniformRecords: async (records: UniformRecord[]): Promise<{ success: boolean }> => {
        await delay(100);
        records.forEach(record => {
            state.uniformRecords.set(record.memberId, deepClone(record));
        });
        return { success: true };
    },

    getAchievementData: async (): Promise<{ success: boolean; data: { members: MemberAchievements[] } }> => {
        await delay(100);
        return { success: true, data: { members: Array.from(state.achievementRecords.values()).map(record => deepClone(record)) } };
    },

    updateAchievementStatus: async (memberId: string, achievement: string, type: 'earned' | 'received', value: boolean): Promise<{ success: boolean }> => {
        await delay(100);
        const record = state.achievementRecords.get(memberId);
        if (!record) {
            state.achievementRecords.set(memberId, { memberId, name: state.members.get(memberId)?.fullName || 'Unknown', achievements: { [achievement]: { earned: type === 'earned' ? value : false, received: type === 'received' ? value : false } } });
        } else {
            if (!record.achievements[achievement]) {
                record.achievements[achievement] = { earned: false, received: false };
            }
            record.achievements[achievement][type] = value;
            state.achievementRecords.set(memberId, record);
        }
        return { success: true };
    },

    getOtherAchievementData: async (): Promise<{ success: boolean; data: { types: OtherAchievementType[]; records: MemberOtherAchievement[] } }> => {
        await delay(100);
        return {
            success: true,
            data: {
                types: deepClone(state.otherAchievementTypes),
                records: Array.from(state.otherAchievements.values()).map(record => deepClone(record)),
            },
        };
    },

    addOtherAchievementType: async (name: string): Promise<{ success: boolean; data: OtherAchievementType[] }> => {
        await delay(100);
        if (!state.otherAchievementTypes.find(type => type.name === name)) {
            state.otherAchievementTypes.push({ name, achievements: [] });
        }
        return { success: true, data: deepClone(state.otherAchievementTypes) };
    },

    addOtherAchievementName: async (typeName: string, achievementName: string): Promise<{ success: boolean; data: OtherAchievementType[] }> => {
        await delay(100);
        const type = state.otherAchievementTypes.find(t => t.name === typeName);
        if (type && !type.achievements.includes(achievementName)) {
            type.achievements.push(achievementName);
        }
        return { success: true, data: deepClone(state.otherAchievementTypes) };
    },

    recordOtherAchievement: async (record: Omit<MemberOtherAchievement, 'id'>): Promise<{ success: boolean; data: MemberOtherAchievement }> => {
        await delay(100);
        const id = randomId('oa');
        const newRecord: MemberOtherAchievement = { ...record, id };
        state.otherAchievements.set(id, newRecord);
        return { success: true, data: deepClone(newRecord) };
    },

    updateOtherAchievement: async (record: MemberOtherAchievement): Promise<{ success: boolean; data: MemberOtherAchievement }> => {
        await delay(100);
        state.otherAchievements.set(record.id, deepClone(record));
        return { success: true, data: deepClone(record) };
    },

    deleteOtherAchievement: async (recordId: string): Promise<{ success: boolean }> => {
        await delay(100);
        state.otherAchievements.delete(recordId);
        return { success: true };
    },

    // --- Fees ---
    getFeesData: async (): Promise<{ success: boolean; data: { fees: Fee[] } }> => {
        await delay(100);
        return { success: true, data: { fees: Array.from(state.fees.values()).map(fee => deepClone(fee)) } };
    },

    addFee: async (fee: Omit<Fee, 'id' | 'pointLogId'>): Promise<{ success: boolean }> => {
        await delay(100);
        const id = randomId('fee');
        const newFee: Fee = { ...fee, id };
        state.fees.set(id, newFee);
        if (fee.type === 'Late') {
            const settings = await api.getAttendancePointsSettings();
            await api.addPoints({
                ts: new Date().toISOString(),
                group: fee.group,
                reason: `Late Fee Added: ${fee.memberName}`,
                points: settings.lateFeePenalty,
                by: 'System',
                members: [fee.memberName],
            });
        }
        return { success: true };
    },

    updateFeeStatus: async (feeId: string, status: Fee['status']): Promise<{ success: boolean }> => {
        await delay(100);
        const fee = state.fees.get(feeId);
        if (fee) {
            fee.status = status;
            state.fees.set(feeId, fee);
            if (fee.type === 'Late' && status === 'Paid') {
                const settings = await api.getAttendancePointsSettings();
                await api.addPoints({
                    ts: new Date().toISOString(),
                    group: fee.group,
                    reason: `Late Fee Paid: ${fee.memberName}`,
                    points: settings.lateFeePaidCredit,
                    by: 'System',
                    members: [fee.memberName],
                });
            }
        }
        return { success: true };
    },

    deleteFee: async (feeId: string): Promise<{ success: boolean }> => {
        await delay(100);
        state.fees.delete(feeId);
        return { success: true };
    },

    getNotifications: async (): Promise<{ success: boolean; data: Notification[] }> => {
        await delay(50);
        return { success: true, data: deepClone(state.notifications) };
    },

    // --- Groups ---
    getGroups: async (): Promise<{ success: boolean; data: Group[] }> => {
        await delay(100);
        return { success: true, data: deepClone(state.groups) };
    },

    addGroup: async (groupName: string, color: string): Promise<{ success: boolean }> => {
        await delay(100);
        if (!state.groups.find(group => group.name === groupName)) {
            state.groups.push({ name: groupName, color });
        }
        return { success: true };
    },

    updateGroup: async (originalName: string, newName: string, newColor: string): Promise<{ success: boolean }> => {
        await delay(100);
        const group = state.groups.find(g => g.name === originalName);
        if (group) {
            group.name = newName;
            group.color = newColor;
        }
        Array.from(state.members.values()).forEach(member => {
            if (member.group === originalName) {
                member.group = newName;
                state.members.set(member.id, member);
            }
        });
        return { success: true };
    },

    deleteGroup: async (groupName: string): Promise<{ success: boolean }> => {
        await delay(100);
        state.groups = state.groups.filter(group => group.name !== groupName);
        Array.from(state.members.values()).forEach(member => {
            if (member.group === groupName) {
                member.group = state.groups[0]?.name || '';
                state.members.set(member.id, member);
            }
        });
        return { success: true };
    },

    // --- Inventory ---
    getInventoryData: async (): Promise<{ success: boolean; data: { items: InventoryItem[]; categories: { name: string; subcategories: string[] }[] } }> => {
        await delay(100);
        return {
            success: true,
            data: {
                items: Array.from(state.inventory.values()).map(item => deepClone(item)),
                categories: deepClone(state.inventoryCategories),
            },
        };
    },

    addInventoryItem: async (item: Omit<InventoryItem, 'id'>): Promise<{ success: boolean }> => {
        await delay(100);
        const id = randomId('inv');
        state.inventory.set(id, { ...item, id });
        return { success: true };
    },

    updateInventoryItem: async (item: InventoryItem): Promise<{ success: boolean }> => {
        await delay(100);
        state.inventory.set(item.id, deepClone(item));
        return { success: true };
    },

    deleteInventoryItem: async (itemId: string): Promise<{ success: boolean }> => {
        await delay(100);
        state.inventory.delete(itemId);
        return { success: true };
    },

    addInventoryCategory: async (name: string): Promise<{ success: boolean; data: any[] }> => {
        await delay(100);
        if (!state.inventoryCategories.find(cat => cat.name === name)) {
            state.inventoryCategories.push({ name, subcategories: [] });
        }
        return { success: true, data: deepClone(state.inventoryCategories) };
    },

    addInventorySubcategory: async (categoryName: string, subcategoryName: string): Promise<{ success: boolean; data: any[] }> => {
        await delay(100);
        const category = state.inventoryCategories.find(cat => cat.name === categoryName);
        if (category && !category.subcategories.includes(subcategoryName)) {
            category.subcategories.push(subcategoryName);
        }
        return { success: true, data: deepClone(state.inventoryCategories) };
    },

    updateInventoryQuantity: async (id: string, quantity: number): Promise<{ success: boolean }> => {
        await delay(100);
        const item = state.inventory.get(id);
        if (item) {
            item.quantity = quantity;
            state.inventory.set(id, item);
        }
        return { success: true };
    },

    // --- Resources ---
    getResources: async (): Promise<{ success: boolean; data: { resources: Resource[]; categories: string[] } }> => {
        await delay(100);
        return {
            success: true,
            data: {
                resources: Array.from(state.resources.values()).map(res => deepClone(res)),
                categories: deepClone(state.resourceCategories),
            },
        };
    },

    addResource: async (resource: Omit<Resource, 'id'>): Promise<{ success: boolean }> => {
        await delay(100);
        const id = randomId('res');
        state.resources.set(id, { ...resource, id });
        return { success: true };
    },

    updateResource: async (resource: Resource): Promise<{ success: boolean }> => {
        await delay(100);
        state.resources.set(resource.id, deepClone(resource));
        return { success: true };
    },

    deleteResource: async (resourceId: string): Promise<{ success: boolean }> => {
        await delay(100);
        state.resources.delete(resourceId);
        return { success: true };
    },

    addResourceCategory: async (name: string): Promise<{ success: boolean; data: string[] }> => {
        await delay(100);
        if (!state.resourceCategories.includes(name)) {
            state.resourceCategories.push(name);
        }
        return { success: true, data: deepClone(state.resourceCategories) };
    },

    // --- Honours ---
    getHonours: async (): Promise<{ success: boolean; data: Honour[] }> => {
        await delay(100);
        return { success: true, data: Array.from(state.honours.values()).map(h => deepClone(h)) };
    },

    getHonourCategories: async (): Promise<{ success: boolean; data: string[] }> => {
        await delay(100);
        return { success: true, data: deepClone(state.honourCategories) };
    },

    addHonourCategory: async (categoryName: string): Promise<{ success: boolean; data: string[] }> => {
        await delay(100);
        if (!state.honourCategories.includes(categoryName)) {
            state.honourCategories.push(categoryName);
        }
        return { success: true, data: deepClone(state.honourCategories) };
    },

    getHonourImages: async (): Promise<{ success: boolean; data: HonourImage[] }> => {
        await delay(100);
        return { success: true, data: Array.from(state.honourImages.values()).map(img => deepClone(img)) };
    },

    addHonourImage: async (name: string, url: string): Promise<{ success: true; data: HonourImage }> => {
        await delay(100);
        const id = randomId('img');
        const newImage: HonourImage = { id, name, url };
        state.honourImages.set(id, newImage);
        return { success: true, data: deepClone(newImage) };
    },

    deleteHonourImage: async (id: string): Promise<{ success: boolean }> => {
        await delay(100);
        state.honourImages.delete(id);
        return { success: true };
    },

    addHonour: async (honour: Omit<Honour, 'id'>): Promise<{ success: boolean }> => {
        await delay(100);
        const id = randomId('honour');
        state.honours.set(id, { ...honour, id });
        return { success: true };
    },

    getMemberHonourStatus: async (): Promise<{ success: boolean; data: MemberHonourStatus }> => {
        await delay(100);
        return { success: true, data: deepClone(state.memberHonourStatus) };
    },

    updateMemberHonourStatus: async (memberId: string, honourId: string, status: string): Promise<{ success: boolean }> => {
        await delay(100);
        if (!state.memberHonourStatus[memberId]) {
            state.memberHonourStatus[memberId] = {};
        }
        state.memberHonourStatus[memberId][honourId] = status;
        return { success: true };
    },

    deleteHonour: async (honourId: string): Promise<{ success: boolean }> => {
        await delay(100);
        state.honours.delete(honourId);
        return { success: true };
    },

    // --- Attendance ---
    saveAttendanceRecord: async (record: Omit<AttendanceRecord, 'id'>) => {
        await delay(100);
        const id = randomId('att');
        const newRecord: AttendanceRecord = { ...record, id };
        state.attendanceRecords.set(id, deepClone(newRecord));
        upsertLog({ id: randomId('log'), timestamp: new Date().toISOString(), user: record.recorder, action: 'Save Attendance', details: `Saved attendance for ${record.className} on ${record.date}` });
        return { success: true };
    },

    getAttendanceRecords: async () => {
        await delay(100);
        const records = Array.from(state.attendanceRecords.values())
            .sort((a, b) => (a.date < b.date ? 1 : -1))
            .map(record => deepClone(record));
        return { success: true, data: records };
    },

    updateAttendanceRecord: async (id: string, records: AttendanceRecord['records']) => {
        await delay(100);
        const existing = state.attendanceRecords.get(id);
        if (existing) {
            existing.records = deepClone(records);
            state.attendanceRecords.set(id, existing);
        }
        return { success: true };
    },

    deleteAttendanceRecord: async (id: string) => {
        await delay(100);
        state.attendanceRecords.delete(id);
        return { success: true };
    },

    processAttendancePoints: async (id: string) => {
        await delay(100);
        const record = state.attendanceRecords.get(id);
        if (!record) return { success: false, message: 'Record not found' } as const;
        if (record.pointsProcessed) return { success: false, message: 'Points already processed' } as const;

        const groupMembersCount: Record<string, number> = {};
        Array.from(state.members.values()).forEach(member => {
            if (member.status === 'Active') {
                groupMembersCount[member.group] = (groupMembersCount[member.group] || 0) + 1;
            }
        });

        const groupPoints: Record<string, { total: number; memberDetails: { name: string; points: number }[] }> = {};
        const settings = await api.getAttendancePointsSettings();

        Object.entries(record.records).forEach(([memberId, attData]) => {
            const member = state.members.get(memberId);
            if (!member || member.status !== 'Active') return;
            let memberPoints = 0;
            if (attData.present && !attData.excused?.present) {
                memberPoints += settings.present;
                memberPoints += attData.bible && !attData.excused?.bible ? settings.hasBible : settings.noBible;
                memberPoints += attData.book && !attData.excused?.book ? settings.hasBook : settings.noBook;
                memberPoints += attData.uniform && !attData.excused?.uniform ? settings.hasUniform : settings.noUniform;
            } else if (!attData.present && !attData.excused?.present) {
                memberPoints += settings.absent;
            }

            if (!groupPoints[member.group]) {
                groupPoints[member.group] = { total: 0, memberDetails: [] };
            }
            groupPoints[member.group].total += memberPoints;
            groupPoints[member.group].memberDetails.push({ name: member.fullName, points: memberPoints });
        });

        await Promise.all(
            Object.entries(groupPoints).map(async ([groupName, data]) => {
                const memberCount = groupMembersCount[groupName] || 1;
                const finalGroupPoints = Math.round(data.total / memberCount);
                const reason = `Attendance for ${record.date} (${record.className}). Avg from ${memberCount} members.`;
                await api.addPoints({
                    ts: new Date().toISOString(),
                    group: groupName,
                    reason,
                    points: finalGroupPoints,
                    by: 'System (Attendance)',
                    members: data.memberDetails.map(detail => `${detail.name}: ${detail.points}pts`),
                });
            })
        );

        record.pointsProcessed = true;
        state.attendanceRecords.set(id, record);
        return { success: true };
    },

    getOverallAttendanceStats: async (): Promise<{ success: true; data: MemberAttendanceStat[] }> => {
        await delay(100);
        return { success: true, data: calculateAttendanceStats() };
    },

    getConferenceReportData: async (month: string): Promise<{ success: true; data: ReportData }> => {
        await delay(100);
        const stats = calculateAttendanceStats();
        const meetings = (await api.getEvents()).data;
        const [year, monthNum] = month.split('-').map(Number);
        const meetingCount = meetings.filter(event => {
            const date = new Date(event.start);
            return date.getFullYear() === year && date.getMonth() + 1 === monthNum && event.category === 'Club Meeting';
        }).length;
        const avgAttendance = stats.length > 0 ? Math.round(stats.reduce((sum, s) => sum + s.presenceRate, 0) / stats.length) : 0;
        const uniformCompliance = stats.length > 0 ? Math.round(stats.reduce((sum, s) => sum + s.uniformRate, 0) / stats.length) : 0;
        return { success: true, data: { meetingCount, avgAttendance, uniformCompliance } };
    },

    generateAttendanceSheet: async (className: string, dates: string[]) => {
        await delay(100);
        const members = Array.from(state.members.values())
            .filter(member => member.class === className && member.status === 'Active')
            .map(member => member.fullName);
        return { success: true, data: { className, members, dates } };
    },

    getAlertSettings: async (): Promise<AlertSettings> => {
        await delay(50);
        return deepClone(state.alertSettings);
    },

    saveAlertSettings: async (settings: AlertSettings) => {
        await delay(50);
        state.alertSettings = deepClone(settings);
        return { success: true };
    },

    getAttendancePointsSettings: async (): Promise<AttendancePointsSettings> => {
        await delay(50);
        return deepClone(state.attendanceSettings);
    },

    saveAttendancePointsSettings: async (settings: AttendancePointsSettings) => {
        await delay(50);
        state.attendanceSettings = deepClone(settings);
        return { success: true };
    },

    getLogs: async (): Promise<{ success: boolean; data: LogEntry[] }> => {
        await delay(100);
        return { success: true, data: deepClone(state.logs) };
    },
};
