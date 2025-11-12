// Implemented the OrderSummary component for the Uniform page to resolve module resolution errors.
import * as React from 'react';
import { UniformRecord, Member, MemberAchievements } from '../../types';
import Card from '../ui/Card';

interface OrderSummaryProps {
  records: UniformRecord[];
  uniformData: { items: string[]; sizeItems: string[] };
  members: Member[];
  achievements: MemberAchievements[];
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ records, uniformData, members, achievements }) => {
  const [activeTab, setActiveTab] = React.useState<'uniforms' | 'pins'>('uniforms');
  
  const uniformSummary = React.useMemo(() => {
    const needed: { [item: string]: { total: number; sizes: { [size: string]: number } } } = {};
    const memberMap = new Map<string, Member>(members.map(m => [m.id, m]));

    records.forEach(memberRecord => {
        const member = memberMap.get(memberRecord.memberId);
        if (!member) return;

        uniformData.items.forEach(item => {
            if (!memberRecord.items[item]) { // If item is needed
                let itemName = item;
                if (item === 'Pants (Type A)' && member.gender === 'Female') {
                    itemName = 'Skirt (Type A)';
                }
                
                if (!needed[itemName]) {
                    needed[itemName] = { total: 0, sizes: {} };
                }
                
                needed[itemName].total += 1;

                if (uniformData.sizeItems.includes(item)) {
                    const size = memberRecord.sizes[item] || 'Unknown';
                    let displaySize = size;
                    
                    if (size !== 'Unknown') {
                        if (member.gender === 'Male') {
                            displaySize = `Boy's ${size}`;
                        } else if (member.gender === 'Female') {
                            displaySize = `Girl's ${size}`;
                        }
                    }
                    
                    needed[itemName].sizes[displaySize] = (needed[itemName].sizes[displaySize] || 0) + 1;
                }
            }
        });
    });

    return Object.entries(needed).filter(([, data]) => data.total > 0);
  }, [records, uniformData, members]);

  const pinsToOrder = React.useMemo(() => {
    const needed: { [name: string]: number } = {};
    achievements.forEach(member => {
      Object.entries(member.achievements).forEach(([name, status]) => {
        // FIX: Cast `status` to its correct type to access `earned` and `received` properties.
        const achievementStatus = status as { earned: boolean; received: boolean };
        if (achievementStatus.earned && !achievementStatus.received) {
          needed[name] = (needed[name] || 0) + 1;
        }
      });
    });
    return Object.entries(needed).sort(([a], [b]) => a.localeCompare(b));
  }, [achievements]);


  return (
    <>
      <div className="flex border-b border-gray-border mb-6">
          <button onClick={() => setActiveTab('uniforms')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'uniforms' ? 'border-b-2 border-primary text-primary' : 'text-text-muted'}`}>Uniform Items</button>
          <button onClick={() => setActiveTab('pins')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'pins' ? 'border-b-2 border-primary text-primary' : 'text-text-muted'}`}>Pins & Chevrons</button>
      </div>

      {activeTab === 'uniforms' && (
        uniformSummary.length === 0 ? (
          <div className="text-center p-8 text-text-muted">All members have complete uniforms. Nothing to order.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniformSummary.sort(([a], [b]) => a.localeCompare(b)).map(([item, data]) => (
              <Card key={item} title={item} subtitle={`Total needed: ${data.total}`}>
                {Object.keys(data.sizes).length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {Object.entries(data.sizes).sort(([a], [b]) => a.localeCompare(b)).map(([size, count]) => (
                      <li key={size} className="flex justify-between">
                        <span className="text-text-muted">{size}:</span>
                        <span className="font-semibold">{count}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-text-muted">This item is one-size-fits-all.</p>
                )}
              </Card>
            ))}
          </div>
        )
      )}

      {activeTab === 'pins' && (
        pinsToOrder.length === 0 ? (
          <div className="text-center p-8 text-text-muted">All earned pins and chevrons have been received. Nothing to order.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinsToOrder.map(([item, count]) => (
              <Card key={item} title={item} subtitle={`Total needed: ${count}`} />
            ))}
          </div>
        )
      )}
    </>
  );
};

export default OrderSummary;