// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Group } from '../../types';

interface LeaderboardChartProps {
  data: { group: string, total: number }[];
  groups: Group[];
}

const LeaderboardChart: React.FC<LeaderboardChartProps> = ({ data, groups }) => {
  const colorMap = React.useMemo(() => new Map(groups.map(g => [g.name, g.color])), [groups]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="group" tick={{ fill: 'var(--color-text-subtle)', fontSize: 12 }} />
          <YAxis tick={{ fill: 'var(--color-text-subtle)', fontSize: 12 }} />
          <Tooltip 
            cursor={{ fill: 'rgba(56, 189, 248, 0.1)' }} 
            contentStyle={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: 'var(--color-text-main)' }}
            itemStyle={{ color: 'var(--color-text-main)' }}
          />
          <Bar dataKey="total" name="Points">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colorMap.get(entry.group) || '#8884d8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeaderboardChart;