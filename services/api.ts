// Implemented a mock API service to resolve module resolution errors.
// FIX: Corrected circular and invalid imports. All types are now imported from `../types`.
import { 
    User, Member, PointLog, Fee, InventoryItem, Honour, MemberHonourStatus, Resource, Event, LogEntry, 
    Role, Permissions, AttendanceRecord, ReportData, AttendancePointsSettings, MemberAttendanceStat, 
    AppUser, AlertSettings, UniformRecord, MemberAchievements, Notification, HonourImage,
    OtherAchievementType, MemberOtherAchievement, Group, AttendanceData
} from '../types';
import { db } from './firebase';
import { 
    collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch, query, where, addDoc, 
    serverTimestamp, orderBy, Timestamp, arrayUnion 
} from "firebase/firestore"; 

// Data for seeding roles, moved from mock-data files to remove the dependency.
const BASE_PERMISSIONS: Permissions = {
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
const directorPermissions: Permissions = {
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
const leaderPermissions: Permissions = {
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
const counsellorPermissions: Permissions = {
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
const MOCK_ROLES: Role[] = [
  { id: 'role_director', name: 'Director', permissions: directorPermissions },
  { id: 'role_leader', name: 'Leader', permissions: leaderPermissions },
  { id: 'role_counsellor', name: 'Counsellor', permissions: counsellorPermissions },
];


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const seedInitialRoles = async () => {
    const rolesRef = collection(db, 'roles');
    const rolesSnapshot = await getDocs(rolesRef);
    if(rolesSnapshot.empty) {
        console.log("No roles found in Firestore, seeding initial roles...");
        const batch = writeBatch(db);
        MOCK_ROLES.forEach(role => {
            const roleDocRef = doc(db, 'roles', role.id);
            batch.set(roleDocRef, role);
        });
        await batch.commit();
        console.log("Initial roles have been seeded.");
    }
}

// Seed roles on app start
seedInitialRoles();

// Helper to create default records for new members
const createDefaultRecords = async (memberId: string, memberName: string) => {
    const batch = writeBatch(db);

    // Uniform Record
    const uniformRef = doc(db, 'uniforms', memberId);
    const uniformSnap = await getDoc(uniformRef);
    if (!uniformSnap.exists()) {
        const defaultUniform: UniformRecord = {
            memberId, name: memberName, items: {}, sizes: {}, bookIssued: false
        };
        batch.set(uniformRef, defaultUniform);
    }

    // Achievement Record
    const achievementRef = doc(db, 'achievements', memberId);
    const achievementSnap = await getDoc(achievementRef);
    if (!achievementSnap.exists()) {
        const defaultAchievements: MemberAchievements = {
            memberId, name: memberName, achievements: {}
        };
        batch.set(achievementRef, defaultAchievements);
    }

    // Member Honour Status
    const honourStatusRef = doc(db, 'memberHonourStatuses', memberId);
    const honourStatusSnap = await getDoc(honourStatusRef);
    if (!honourStatusSnap.exists()) {
        batch.set(honourStatusRef, {});
    }
    
    await batch.commit();
};


export const api = {
    // --- User & Role Management (Now with Firestore) ---
    getUser: async (userId: string): Promise<AppUser | null> => {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            return userDoc.data() as AppUser;
        }
        return null;
    },

    getRolePermissions: async (roleName: string): Promise<Permissions | null> => {
        const q = query(collection(db, 'roles'), where("name", "==", roleName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const roleDoc = querySnapshot.docs[0];
            return (roleDoc.data() as Role).permissions;
        }
        return null;
    },

    getUsers: async (): Promise<{ success: boolean; data: AppUser[] }> => {
        const usersCol = collection(db, 'users');
        const userSnapshot = await getDocs(usersCol);
        const userList = userSnapshot.docs.map(doc => doc.data() as AppUser);
        return { success: true, data: userList };
    },

    addUser: async (name: string, role: string, code: string, isShared: boolean, uid?: string): Promise<{ success: boolean; data?: { user: AppUser, code: string }; message?: string }> => {
        const id = uid || `user_${Date.now()}`;
        const newUser: AppUser = {
            id, name, role, isShared, permissions: {} as Permissions, // Permissions are derived from role, not stored on user
        };
        await setDoc(doc(db, 'users', id), newUser);
        return { success: true, data: { user: newUser, code }};
    },
    
    updateUser: async (userId: string, data: { name: string, role: string }) => {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
            name: data.name,
            role: data.role
        });
        return { success: true };
    },

    deleteUser: async (userId: string) => {
        await deleteDoc(doc(db, "users", userId));
        return { success: true };
    },

    updateUserPermissions: async (userId: string, permissions: Permissions) => {
        console.warn("updateUserPermissions is deprecated. Update role permissions instead.");
        return { success: true };
    },

    getRoles: async (): Promise<{ success: boolean, data: Role[] }> => {
        const rolesCol = collection(db, 'roles');
        const roleSnapshot = await getDocs(rolesCol);
        const roleList = roleSnapshot.docs.map(doc => doc.data() as Role);
        return { success: true, data: roleList };
    },
    
    addRole: async (roleName: string) => {
        const rolesRef = collection(db, 'roles');
        const q = query(rolesRef, where("name", "==", roleName));
        const existing = await getDocs(q);
        if(!existing.empty) return { success: false, message: 'Role already exists.' };
        
        const basePermissions = (await api.getRolePermissions('Counsellor')) || {} as Permissions;
        const newRoleId = roleName.toLowerCase().replace(/\s+/g, '_');
        const newRole: Role = { id: newRoleId, name: roleName, permissions: JSON.parse(JSON.stringify(basePermissions)) };
        await setDoc(doc(db, 'roles', newRoleId), newRole);
        return { success: true };
    },

    updateRolePermissions: async (roleId: string, permissions: Permissions) => {
        const roleDocRef = doc(db, 'roles', roleId);
        await updateDoc(roleDocRef, { permissions });
        return { success: true };
    },
    
    updateRole: async (roleId: string, newName: string) => {
        const roleDocRef = doc(db, 'roles', roleId);
        await updateDoc(roleDocRef, { name: newName });
        // In a real app, you might want to find all users with the old role name and update them.
        return { success: true };
    },
    
    deleteRole: async (roleId: string) => {
        await deleteDoc(doc(db, "roles", roleId));
        return { success: true };
    },
    
    logAction: async (user: string, action: string, details: string): Promise<void> => {
        try {
            await addDoc(collection(db, 'logs'), {
                timestamp: serverTimestamp(),
                user,
                action,
                details
            });
        } catch (e) {
            console.error("Error writing log to Firestore:", e);
        }
    },
    
    getMembersData: async () => {
        const membersCol = collection(db, 'members');
        const memberSnapshot = await getDocs(membersCol);
        const members = memberSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Member));

        const groupsCol = collection(db, 'groups');
        const groupSnapshot = await getDocs(groupsCol);
        const groups = groupSnapshot.docs.map(doc => doc.data() as Group);
        
        const classes = ['Friend', 'Companion', 'Explorer', 'Ranger', 'Voyager', 'Guide'];

        return { success: true, data: { members, groups, classes }};
    },
    
    addMember: async (member: Omit<Member, 'id'>) => {
        const docRef = await addDoc(collection(db, 'members'), member);
        await createDefaultRecords(docRef.id, member.fullName);
        return { success: true };
    },
    
    updateMember: async (updatedMember: Member) => {
        const { id, ...dataToUpdate } = updatedMember;
        const memberDocRef = doc(db, 'members', id);
        await updateDoc(memberDocRef, dataToUpdate);
        return { success: true };
    },

    deleteMember: async (id: string) => {
        await deleteDoc(doc(db, "members", id));
        // In a real app, you would also delete associated data in other collections
        return { success: true };
    },

    bulkUpdateField: async (memberIds: string[], field: 'group' | 'class' | 'status', value: string) => {
        const batch = writeBatch(db);
        memberIds.forEach(id => {
            const memberDocRef = doc(db, 'members', id);
            batch.update(memberDocRef, { [field]: value });
        });
        await batch.commit();
        return { success: true };
    },

    bulkUpdateRegistration: async (memberIds: string[], field: keyof Member['registration'], value: boolean) => {
        const batch = writeBatch(db);
        memberIds.forEach(id => {
            const memberDocRef = doc(db, 'members', id);
            batch.update(memberDocRef, { [`registration.${field}`]: value });
        });
        await batch.commit();
        return { success: true };
    },

    bulkDeleteMembers: async (memberIds: string[]) => {
        const batch = writeBatch(db);
        memberIds.forEach(id => {
            const memberDocRef = doc(db, 'members', id);
            batch.delete(memberDocRef);
        });
        await batch.commit();
        return { success: true };
    },
    
    getPointsData: async () => {
        const logsCol = collection(db, 'pointsLog');
        const q = query(logsCol, orderBy('ts', 'desc'));
        const logSnapshot = await getDocs(q);
        const logs = logSnapshot.docs.map(d => ({...d.data(), id: d.id } as PointLog));

        const groupTotals: { [key: string]: number } = {};
        logs.forEach(log => {
            groupTotals[log.group] = (groupTotals[log.group] || 0) + log.points;
        });

        const calculatedLeaderboard = Object.entries(groupTotals)
            .map(([group, total]) => ({ group, total }))
            .sort((a, b) => b.total - a.total);

        return { success: true, data: { logs, leaderboard: calculatedLeaderboard }};
    },
    
    addPoints: async (log: Omit<PointLog, 'id'>) => {
        await addDoc(collection(db, 'pointsLog'), log);
        return { success: true };
    },
    
    getEvents: async (): Promise<{ success: boolean; data: Event[] }> => {
        const eventsCol = collection(db, 'events');
        const snapshot = await getDocs(eventsCol);
        const eventList = snapshot.docs.map(d => {
            const data = d.data();
            return {
                ...data,
                id: d.id,
                start: (data.start as Timestamp).toDate(),
                end: (data.end as Timestamp).toDate(),
            } as Event;
        });
        return { success: true, data: eventList };
    },
    addEvent: async (event: Omit<Event, 'id'>): Promise<{ success: boolean; data: Event }> => {
        const eventData = {
            ...event,
            start: Timestamp.fromDate(event.start),
            end: Timestamp.fromDate(event.end),
        };
        const docRef = await addDoc(collection(db, 'events'), eventData);
        return { success: true, data: { ...event, id: docRef.id } };
    },
    updateEvent: async (event: Event): Promise<{ success: boolean; data: Event }> => {
        const { id, ...dataToUpdate } = event;
        const eventData = {
            ...dataToUpdate,
            start: Timestamp.fromDate(event.start),
            end: Timestamp.fromDate(event.end),
        };
        await updateDoc(doc(db, 'events', id), eventData);
        return { success: true, data: event };
    },
    deleteEvent: async (eventId: string): Promise<{ success: boolean }> => {
        await deleteDoc(doc(db, 'events', eventId));
        return { success: true };
    },
    
    getUniformData: async (): Promise<{ success: boolean; data: { members: UniformRecord[] } }> => {
        const snapshot = await getDocs(collection(db, 'uniforms'));
        const records = snapshot.docs.map(d => d.data() as UniformRecord);
        return { success: true, data: { members: records } };
    },
    saveUniformRecords: async (records: UniformRecord[]): Promise<{ success: boolean }> => {
        const batch = writeBatch(db);
        records.forEach(record => {
            const docRef = doc(db, 'uniforms', record.memberId);
            batch.set(docRef, record);
        });
        await batch.commit();
        return { success: true };
    },

    getAchievementData: async (): Promise<{ success: boolean; data: { members: MemberAchievements[] } }> => {
        const snapshot = await getDocs(collection(db, 'achievements'));
        const records = snapshot.docs.map(d => d.data() as MemberAchievements);
        return { success: true, data: { members: records } };
    },
    updateAchievementStatus: async (memberId: string, achievement: string, type: 'earned' | 'received', value: boolean): Promise<{ success: boolean }> => {
        const docRef = doc(db, 'achievements', memberId);
        // Use dot notation to update nested fields
        await updateDoc(docRef, { [`achievements.${achievement}.${type}`]: value });
        return { success: true };
    },

    getOtherAchievementData: async (): Promise<{ success: boolean; data: { types: OtherAchievementType[]; records: MemberOtherAchievement[] } }> => {
        const typesSnapshot = await getDocs(collection(db, 'otherAchievementTypes'));
        const types = typesSnapshot.docs.map(d => d.data() as OtherAchievementType);
        
        const recordsSnapshot = await getDocs(collection(db, 'otherAchievements'));
        const records = recordsSnapshot.docs.map(d => ({ ...d.data(), id: d.id }) as MemberOtherAchievement);
        
        return { success: true, data: { types, records } };
    },
    addOtherAchievementType: async (name: string): Promise<{ success: boolean; data: OtherAchievementType[] }> => {
        await addDoc(collection(db, 'otherAchievementTypes'), { name, achievements: [] });
        const res = await api.getOtherAchievementData();
        return { success: true, data: res.data.types };
    },
    addOtherAchievementName: async (typeName: string, achievementName: string): Promise<{ success: boolean; data: OtherAchievementType[] }> => {
        const q = query(collection(db, 'otherAchievementTypes'), where("name", "==", typeName));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const docRef = snapshot.docs[0].ref;
            await updateDoc(docRef, { achievements: arrayUnion(achievementName) });
        }
        const res = await api.getOtherAchievementData();
        return { success: true, data: res.data.types };
    },
    recordOtherAchievement: async (record: Omit<MemberOtherAchievement, 'id'>): Promise<{ success: boolean; data: MemberOtherAchievement }> => {
        const docRef = await addDoc(collection(db, 'otherAchievements'), record);
        const newRecord = { ...record, id: docRef.id };
        return { success: true, data: newRecord };
    },
    updateOtherAchievement: async (record: MemberOtherAchievement): Promise<{ success: boolean; data: MemberOtherAchievement }> => {
        const { id, ...dataToUpdate } = record;
        await updateDoc(doc(db, 'otherAchievements', id), dataToUpdate);
        return { success: true, data: record };
    },
    deleteOtherAchievement: async (recordId: string): Promise<{ success: boolean }> => {
        await deleteDoc(doc(db, 'otherAchievements', recordId));
        return { success: true };
    },

    getFeesData: async (): Promise<{ success: boolean; data: { fees: Fee[] } }> => {
        const snapshot = await getDocs(collection(db, 'fees'));
        const fees = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Fee);
        return { success: true, data: { fees } };
    },
    addFee: async (fee: Omit<Fee, 'id' | 'pointLogId'>): Promise<{ success: boolean }> => {
        const docRef = await addDoc(collection(db, 'fees'), fee);
        if (fee.type === 'Late') {
            const settings = await api.getAttendancePointsSettings();
            await api.addPoints({
                ts: new Date().toISOString(), group: fee.group, reason: `Late Fee Added: ${fee.memberName}`, 
                points: settings.lateFeePenalty, by: 'System', members: [fee.memberName]
            });
            await updateDoc(docRef, { pointLogId: 'pending' }); // To track penalty
        }
        return { success: true };
    },
    updateFeeStatus: async (feeId: string, status: Fee['status']): Promise<{ success: boolean }> => {
        const docRef = doc(db, 'fees', feeId);
        await updateDoc(docRef, { status });
        const feeSnap = await getDoc(docRef);
        const fee = feeSnap.data() as Fee;

        if (fee.type === 'Late' && status === 'Paid' && fee.pointLogId) {
            const settings = await api.getAttendancePointsSettings();
            await api.addPoints({
                ts: new Date().toISOString(), group: fee.group, reason: `Late Fee Paid: ${fee.memberName}`,
                points: settings.lateFeePaidCredit, by: 'System', members: [fee.memberName]
            });
            await updateDoc(docRef, { pointLogId: 'processed' });
        }
        return { success: true };
    },
    deleteFee: async (feeId: string): Promise<{ success: boolean }> => {
        await deleteDoc(doc(db, "fees", feeId));
        return { success: true };
    },
    getNotifications: async (): Promise<{ success: boolean, data: Notification[] }> => { return { success: true, data: [] }; },
    
    getGroups: async (): Promise<{ success: boolean; data: Group[] }> => {
        const groupsCol = collection(db, 'groups');
        const groupSnapshot = await getDocs(groupsCol);
        const groups = groupSnapshot.docs.map(doc => doc.data() as Group);
        return { success: true, data: groups };
    },
    addGroup: async (groupName: string, color: string): Promise<{ success: boolean }> => {
        await addDoc(collection(db, 'groups'), { name: groupName, color });
        return { success: true };
    },
    updateGroup: async (originalName: string, newName: string, newColor: string): Promise<{ success: boolean }> => {
        const q = query(collection(db, 'groups'), where("name", "==", originalName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const groupDocRef = querySnapshot.docs[0].ref;
            await updateDoc(groupDocRef, { name: newName, color: newColor });
        }
        return { success: true };
    },
    deleteGroup: async (groupName: string): Promise<{ success: boolean }> => {
        const q = query(collection(db, 'groups'), where("name", "==", groupName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const groupDocRef = querySnapshot.docs[0].ref;
            await deleteDoc(groupDocRef);
        }
        return { success: true };
    },

    getInventoryData: async (): Promise<{ success: boolean; data: { items: InventoryItem[], categories: { name: string; subcategories: string[] }[] } }> => {
        const itemsSnap = await getDocs(collection(db, 'inventory'));
        const items = itemsSnap.docs.map(d => ({ ...d.data(), id: d.id } as InventoryItem));
        const catSnap = await getDocs(collection(db, 'inventoryCategories'));
        const categories = catSnap.docs.map(d => d.data() as { name: string; subcategories: string[] });
        return { success: true, data: { items, categories }};
    },
    addInventoryItem: async (item: Omit<InventoryItem, 'id'>): Promise<{ success: boolean }> => {
        await addDoc(collection(db, 'inventory'), item);
        return { success: true };
    },
    updateInventoryItem: async (item: InventoryItem): Promise<{ success: boolean }> => {
        const { id, ...dataToUpdate } = item;
        await updateDoc(doc(db, 'inventory', id), dataToUpdate);
        return { success: true };
    },
    deleteInventoryItem: async (itemId: string): Promise<{ success: boolean }> => {
        await deleteDoc(doc(db, 'inventory', itemId));
        return { success: true };
    },
    addInventoryCategory: async (name: string): Promise<{ success: boolean; data: any[] }> => {
        await addDoc(collection(db, 'inventoryCategories'), { name, subcategories: [] });
        const res = await api.getInventoryData();
        return { success: true, data: res.data.categories };
    },
    addInventorySubcategory: async (categoryName: string, subcategoryName: string): Promise<{ success: boolean; data: any[] }> => {
        const q = query(collection(db, 'inventoryCategories'), where("name", "==", categoryName));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            await updateDoc(snapshot.docs[0].ref, { subcategories: arrayUnion(subcategoryName) });
        }
        const res = await api.getInventoryData();
        return { success: true, data: res.data.categories };
    },
    updateInventoryQuantity: async (id: string, quantity: number): Promise<{ success: boolean }> => {
        await updateDoc(doc(db, 'inventory', id), { quantity });
        return { success: true };
    },

    getResources: async (): Promise<{ success: boolean; data: { resources: Resource[], categories: string[] } }> => {
        const resSnap = await getDocs(collection(db, 'resources'));
        const resources = resSnap.docs.map(d => ({ ...d.data(), id: d.id } as Resource));
        const catSnap = await getDocs(collection(db, 'resourceCategories'));
        const categories = catSnap.docs.map(d => d.data().name as string);
        return { success: true, data: { resources, categories } };
    },
    addResource: async (resource: Omit<Resource, 'id'>): Promise<{ success: boolean }> => {
        await addDoc(collection(db, 'resources'), resource);
        return { success: true };
    },
    updateResource: async (resource: Resource): Promise<{ success: boolean }> => {
        const { id, ...dataToUpdate } = resource;
        await updateDoc(doc(db, 'resources', id), dataToUpdate);
        return { success: true };
    },
    deleteResource: async (resourceId: string): Promise<{ success: boolean }> => {
        await deleteDoc(doc(db, 'resources', resourceId));
        return { success: true };
    },
    addResourceCategory: async (name: string): Promise<{ success: boolean; data: string[] }> => {
        await addDoc(collection(db, 'resourceCategories'), { name });
        const res = await api.getResources();
        return { success: true, data: res.data.categories };
    },

    getHonours: async (): Promise<{ success: boolean; data: Honour[] }> => {
        const snap = await getDocs(collection(db, 'honours'));
        return { success: true, data: snap.docs.map(d => ({ ...d.data(), id: d.id } as Honour)) };
    },
    getHonourCategories: async (): Promise<{ success: boolean; data: string[] }> => {
        const snap = await getDocs(collection(db, 'honourCategories'));
        return { success: true, data: snap.docs.map(d => d.data().name as string) };
    },
    addHonourCategory: async (categoryName: string): Promise<{ success: boolean; data: string[] }> => {
        await addDoc(collection(db, 'honourCategories'), { name: categoryName });
        return api.getHonourCategories();
    },
    getHonourImages: async (): Promise<{ success: boolean; data: HonourImage[] }> => {
        const snap = await getDocs(collection(db, 'honourImages'));
        return { success: true, data: snap.docs.map(d => ({ ...d.data(), id: d.id } as HonourImage)) };
    },
    addHonourImage: async (name: string, url: string): Promise<{ success: true, data: HonourImage }> => {
        const docRef = await addDoc(collection(db, 'honourImages'), { name, url });
        return { success: true, data: { id: docRef.id, name, url } };
    },
    deleteHonourImage: async (id: string): Promise<{ success: boolean }> => {
        await deleteDoc(doc(db, 'honourImages', id));
        return { success: true };
    },
    addHonour: async (honour: Omit<Honour, 'id'>): Promise<{ success: boolean }> => {
        await addDoc(collection(db, 'honours'), honour);
        return { success: true };
    },
    getMemberHonourStatus: async (): Promise<{ success: boolean; data: MemberHonourStatus }> => {
        const snap = await getDocs(collection(db, 'memberHonourStatuses'));
        const statuses: MemberHonourStatus = {};
        snap.forEach(doc => {
            statuses[doc.id] = doc.data();
        });
        return { success: true, data: statuses };
    },
    updateMemberHonourStatus: async (memberId: string, honourId: string, status: string): Promise<{ success: boolean }> => {
        const docRef = doc(db, 'memberHonourStatuses', memberId);
        await updateDoc(docRef, { [honourId]: status });
        return { success: true };
    },

    saveAttendanceRecord: async (record: Omit<AttendanceRecord, 'id'>) => {
        await addDoc(collection(db, 'attendance'), record);
        return { success: true };
    },
    getAttendanceRecords: async () => {
        const recordsCol = collection(db, 'attendance');
        const q = query(recordsCol, orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        const records = snapshot.docs.map(d => ({...d.data(), id: d.id} as AttendanceRecord));
        return { success: true, data: records };
    },
    updateAttendanceRecord: async (id: string, records: AttendanceRecord['records']) => {
        await updateDoc(doc(db, 'attendance', id), { records });
        return { success: true };
    },
    deleteAttendanceRecord: async (id: string) => {
        await deleteDoc(doc(db, 'attendance', id));
        return { success: true };
    },
    processAttendancePoints: async (id: string) => {
        const recordRef = doc(db, 'attendance', id);
        const recordSnap = await getDoc(recordRef);
        if (!recordSnap.exists()) return { success: false, message: "Record not found" };
        const record = recordSnap.data() as AttendanceRecord;
        if (record.pointsProcessed) return { success: false, message: "Points already processed" };

        const settings = await api.getAttendancePointsSettings();
        const membersRes = await api.getMembersData();
        const groupMembersCount: { [group: string]: number } = {};
        membersRes.data.members.forEach(m => {
            if (m.status === 'Active') {
                groupMembersCount[m.group] = (groupMembersCount[m.group] || 0) + 1;
            }
        });

        const groupPoints: { [group: string]: { total: number, memberDetails: { name: string, points: number }[] } } = {};

        for (const memberId in record.records) {
            const member = membersRes.data.members.find(m => m.id === memberId);
            if (!member || member.status !== 'Active') continue;

            const attData = record.records[memberId];
            let memberPoints = 0;
            if (attData.present && !attData.excused?.present) {
                memberPoints += settings.present;
                if (attData.bible && !attData.excused?.bible) memberPoints += settings.hasBible; else memberPoints += settings.noBible;
                if (attData.book && !attData.excused?.book) memberPoints += settings.hasBook; else memberPoints += settings.noBook;
                if (attData.uniform && !attData.excused?.uniform) memberPoints += settings.hasUniform; else memberPoints += settings.noUniform;
            } else if (!attData.present && !attData.excused?.present) {
                memberPoints += settings.absent;
            }
            // Excused absences result in 0 points

            if (!groupPoints[member.group]) {
                groupPoints[member.group] = { total: 0, memberDetails: [] };
            }
            groupPoints[member.group].total += memberPoints;
            groupPoints[member.group].memberDetails.push({ name: member.fullName, points: memberPoints });
        }

        for (const groupName in groupPoints) {
            const memberCount = groupMembersCount[groupName] || 1;
            const finalGroupPoints = Math.round(groupPoints[groupName].total / memberCount);
            const reason = `Attendance for ${record.date} (${record.className}). Avg from ${memberCount} members.`;
            
            await api.addPoints({
                ts: new Date().toISOString(),
                group: groupName,
                reason: reason,
                points: finalGroupPoints,
                by: 'System (Attendance)',
                members: groupPoints[groupName].memberDetails.map(d => `${d.name}: ${d.points}pts`)
            });
        }

        await updateDoc(recordRef, { pointsProcessed: true });
        return { success: true };
    },
    getOverallAttendanceStats: async (): Promise<{success: true, data: MemberAttendanceStat[]}> => {
        const [membersRes, attendanceRes] = await Promise.all([
            api.getMembersData(),
            api.getAttendanceRecords()
        ]);

        if (!membersRes.success || !attendanceRes.success) return { success: true, data: [] };

        const stats: { [memberId: string]: any } = {};
        const activeMembers = membersRes.data.members.filter(m => m.status === 'Active');

        activeMembers.forEach(m => {
            stats[m.id] = {
                memberId: m.id, name: m.fullName, group: m.group, class: m.class,
                totalMeetings: 0, daysPresent: 0, daysAbsent: 0, daysExcused: 0,
                bibleCount: 0, bookCount: 0, uniformCount: 0, presentMeetings: 0
            };
        });

        attendanceRes.data.forEach(record => {
            Object.keys(record.records).forEach(memberId => {
                if (stats[memberId]) {
                    stats[memberId].totalMeetings++;
                    const data = record.records[memberId];
                    if (data.present) {
                        stats[memberId].daysPresent++;
                        stats[memberId].presentMeetings++;
                        if (data.bible) stats[memberId].bibleCount++;
                        if (data.book) stats[memberId].bookCount++;
                        if (data.uniform) stats[memberId].uniformCount++;
                    } else if(data.excused?.present) {
                        stats[memberId].daysExcused++;
                    } else {
                         stats[memberId].daysAbsent++;
                    }
                }
            });
        });
        
        const finalStats = Object.values(stats).map(s => ({
            ...s,
            presenceRate: s.totalMeetings > 0 ? Math.round((s.daysPresent / s.totalMeetings) * 100) : 0,
            bibleRate: s.presentMeetings > 0 ? Math.round((s.bibleCount / s.presentMeetings) * 100) : 0,
            bookRate: s.presentMeetings > 0 ? Math.round((s.bookCount / s.presentMeetings) * 100) : 0,
            uniformRate: s.presentMeetings > 0 ? Math.round((s.uniformCount / s.presentMeetings) * 100) : 0,
        }));

        return { success: true, data: finalStats };
    },
    getConferenceReportData: async (month: string): Promise<{success: true, data: ReportData}> => {
        // This is a simplified calculation for the demo
        const stats = await api.getOverallAttendanceStats();
        const totalMeetings = await api.getEvents();
        const [year, monthNum] = month.split('-').map(Number);
        const meetingCount = totalMeetings.data.filter(e => {
            const d = new Date(e.start);
            return d.getFullYear() === year && d.getMonth() + 1 === monthNum && e.category === 'Club Meeting';
        }).length;

        const avgAttendance = stats.data.length > 0 ? Math.round(stats.data.reduce((sum, s) => sum + s.presenceRate, 0) / stats.data.length) : 0;
        const uniformCompliance = stats.data.length > 0 ? Math.round(stats.data.reduce((sum, s) => sum + s.uniformRate, 0) / stats.data.length) : 0;
        return { success: true, data: { meetingCount, avgAttendance, uniformCompliance }};
    },
    generateAttendanceSheet: async (className: string, dates: string[]) => { 
        const membersRes = await api.getMembersData();
        const members = membersRes.data.members.filter(m => m.class === className && m.status === 'Active').map(m => m.fullName);
        return { success: true, data: { className, members, dates }};
     },
    getAlertSettings: async (): Promise<AlertSettings> => {
        const docRef = doc(db, 'settings', 'alerts');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as AlertSettings;
        }
        // Return default if not found
        return { overdueFeeAmount: 50, missingBookThreshold: 3, missingUniformThreshold: 2, missingBibleThreshold: 4, attendanceThreshold: 75, lowStockWarningThreshold: 5, incompleteRegistration: true };
    },
    saveAlertSettings: async (settings: AlertSettings) => {
        await setDoc(doc(db, 'settings', 'alerts'), settings);
        return { success: true };
    },
    getAttendancePointsSettings: async (): Promise<AttendancePointsSettings> => {
        const docRef = doc(db, 'settings', 'attendancePoints');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as AttendancePointsSettings;
        }
        // Return default if not found
        return { present: 10, absent: -5, hasBible: 5, noBible: 0, hasBook: 5, noBook: 0, hasUniform: 10, noUniform: -5, lateFeePenalty: -2, lateFeePaidCredit: 1 };
    },
    saveAttendancePointsSettings: async (settings: AttendancePointsSettings) => {
        await setDoc(doc(db, 'settings', 'attendancePoints'), settings);
        return { success: true };
    },
    getLogs: async (): Promise<{ success: boolean; data: LogEntry[] }> => {
        const logsCol = collection(db, 'logs');
        const q = query(logsCol, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        const logs = snapshot.docs.map(d => {
            const data = d.data();
            return {
                ...data,
                id: d.id,
                timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString()
            } as LogEntry;
        });
        return { success: true, data: logs };
    },
};