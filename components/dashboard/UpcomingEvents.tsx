import * as React from 'react';
import { Event } from '../../types';
import { Calendar, MapPin, Users } from 'react-feather';
import moment from 'moment';

interface UpcomingEventsProps {
    events: Event[];
}

const eventIcons: Record<Event['category'], React.ElementType> = {
    'Club Meeting': Users,
    'Conference': Users,
    'Community Service': MapPin,
    'Campout': MapPin,
    'Birthday': Calendar
};

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events }) => {
    const upcoming = React.useMemo(() => {
        const now = new Date();
        const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        return events
            .filter(event => event.start > now && event.start < twoWeeksFromNow)
            .sort((a, b) => a.start.getTime() - b.start.getTime())
            .slice(0, 3);
    }, [events]);

    if (upcoming.length === 0) {
        return <p className="text-text-muted text-center py-4">No events scheduled in the next two weeks.</p>;
    }

    return (
        <div className="space-y-4">
            {upcoming.map(event => {
                const Icon = eventIcons[event.category] || Calendar;
                return (
                    <div key={event.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-base">
                        <div className="p-2 bg-gray-border/50 rounded-full">
                            <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold text-text-main">{event.title}</p>
                            <p className="text-sm text-text-muted">
                                {moment(event.start).format('ddd, MMM D')} &bull; {moment(event.start).fromNow()}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default UpcomingEvents;