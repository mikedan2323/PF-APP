import { UniformRecord, MemberAchievements, OtherAchievementType, MemberOtherAchievement } from '../../types';

export const MOCK_UNIFORM_RECORDS: UniformRecord[] = [
    { memberId: 'm1', name: 'Carl Sagan', items: { 'Sash': true, 'Scarf': true, 'Slide': true, 'Belt': true, 'Shirt (Type A)': true, 'Pants (Type A)': true }, sizes: { 'Shirt (Type A)': 'L', 'Pants (Type A)': 'L', 'Belt': '34' }, bookIssued: true },
    { memberId: 'm2', name: 'Ada Lovelace', items: { 'Sash': true, 'Scarf': false, 'Slide': true, 'Belt': true, 'Shirt (Type A)': true, 'Pants (Type A)': true }, sizes: { 'Shirt (Type A)': 'M', 'Pants (Type A)': 'M', 'Belt': '30' }, bookIssued: true },
    { memberId: 'm3', name: 'Grace Hopper', items: { 'Sash': false, 'Scarf': false, 'Slide': false, 'Belt': false, 'Shirt (Type A)': false, 'Pants (Type A)': false }, sizes: {}, bookIssued: false },
];

const createAchievementSet = (highestClass: string) => {
    const classes = ['Friend', 'Companion', 'Explorer', 'Ranger', 'Voyager', 'Guide'];
    const highestIndex = classes.indexOf(highestClass);
    const achievements: MemberAchievements['achievements'] = {};

    classes.forEach((className, index) => {
        const earned = index < highestIndex;
        achievements[`${className} Pin`] = { earned, received: earned };
        achievements[`${className} Chevron`] = { earned, received: earned };
    });
    
    return achievements;
};


export const MOCK_ACHIEVEMENT_RECORDS: MemberAchievements[] = [
    { 
        memberId: 'm1', name: 'Carl Sagan', // Guide
        achievements: {
            ...createAchievementSet('Guide'),
            'Voyager Pin': { earned: true, received: false }, // Example of not received
            'Voyager Chevron': { earned: true, received: true },
        } 
    },
    { 
        memberId: 'm2', name: 'Ada Lovelace', // Voyager
        achievements: createAchievementSet('Voyager')
    },
     { 
        memberId: 'm3', name: 'Grace Hopper', // Ranger
        achievements: createAchievementSet('Ranger')
    },
     { 
        memberId: 'm4', name: 'Alan Turing', // Explorer
        achievements: createAchievementSet('Explorer')
    },
     { 
        memberId: 'm5', name: 'Marie Curie', // Companion
        achievements: createAchievementSet('Companion')
    },
    { 
        memberId: 'm6', name: 'Nikola Tesla', // Friend
        achievements: {
            ...createAchievementSet('Friend'),
            'Friend Pin': { earned: true, received: false }, // Manually overridden as earned but not received
        }
    },
     { 
        memberId: 'm7', name: 'Isaac Newton', // Guide
        achievements: createAchievementSet('Guide')
    },
];

export const MOCK_OTHER_ACHIEVEMENT_TYPES: OtherAchievementType[] = [
    {
        name: 'Ribbons',
        achievements: [
            'Advanced Class Ribbon', 'Share Him Ribbon', 'Medal of Valor Ribbon',
            'Merit Award Ribbon', 'Good Conduct Ribbon', 'PBE Ribbon',
            'Drill Ribbon', 'Drum Ribbon', 'Excellence Ribbon'
        ]
    },
    {
        name: 'Other (Service Stars, Badges, etc.)',
        achievements: [
            'Baptismal Pin', 'Service Star 1yr', 'Service Star 2yr',
            'Service Star 3yr', 'Service Star 5yr', 'Captain Badge', 'Scribe Badge'
        ]
    }
];

export const MOCK_MEMBER_OTHER_ACHIEVEMENTS: MemberOtherAchievement[] = [
    { id: 'oa1', memberId: 'm1', type: 'Ribbons', achievement: 'PBE Ribbon', dateEarned: '2023-05-20', received: true },
    { id: 'oa2', memberId: 'm1', type: 'Other (Service Stars, Badges, etc.)', achievement: 'Service Star 5yr', dateEarned: '2023-09-01', received: true },
    { id: 'oa3', memberId: 'm2', type: 'Ribbons', achievement: 'Good Conduct Ribbon', dateEarned: '2024-01-15', received: false },
];