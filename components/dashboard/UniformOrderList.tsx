// Implemented the UniformOrderList component for the dashboard to resolve module resolution errors.
import * as React from 'react';
import { UniformRecord, MemberAchievements } from '../../types';
import { ShoppingCart } from 'react-feather';

interface UniformOrderListProps {
    uniforms: UniformRecord[];
    achievements: MemberAchievements[];
}

const uniformItems = ['Sash', 'Scarf', 'Slide', 'Belt'];

const UniformOrderList: React.FC<UniformOrderListProps> = ({ uniforms, achievements }) => {
    const itemsToOrder = React.useMemo(() => {
        const needed: { [key: string]: number } = {};
        
        // Count missing uniform items
        uniforms.forEach(member => {
            uniformItems.forEach(item => {
                if (!member.items[item]) {
                    needed[item] = (needed[item] || 0) + 1;
                }
            });
        });

        // Count earned but not received achievement items (pins/patches)
        achievements.forEach(member => {
            Object.entries(member.achievements).forEach(([name, status]) => {
                const achievementStatus = status as { earned: boolean, received: boolean };
                if (achievementStatus.earned && !achievementStatus.received) {
                    needed[name] = (needed[name] || 0) + 1;
                }
            });
        });

        return Object.entries(needed);
    }, [uniforms, achievements]);

    return (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {itemsToOrder.length > 0 ? (
                itemsToOrder.map(([item, count]) => (
                    <div key={item} className="flex justify-between items-center text-sm p-2 bg-gray-base rounded">
                        <span className="text-text-muted">{item}</span>
                        <span className="font-bold text-primary">x {count}</span>
                    </div>
                ))
            ) : (
                <div className="text-center py-4">
                    <ShoppingCart className="mx-auto text-text-subtle mb-2" />
                    <p className="text-sm text-text-muted">No items currently need to be ordered.</p>
                </div>
            )}
        </div>
    );
};

export default UniformOrderList;