// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';

import { api } from '../services/api';
import { Event, Member } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EventModal from '../components/modals/EventModal';
import { useUser } from '../App';
import Spinner from '../components/ui/Spinner';
import AccessDenied from '../components/ui/AccessDenied';
import MemberDetailModal from '../components/modals/MemberDetailModal';

const localizer = momentLocalizer(moment);

const categoryColors: Record<Event['category'], string> = {
    'Club Meeting': '#0EA5E9', // Primary blue
    'Conference': '#8B5CF6',   // Violet
    'Community Service': '#10B981', // Emerald
    'Campout': '#D97706',      // Amber
    'Birthday': '#F59E0B',    // Orange
};


const Events: React.FC = () => {
    const user = useUser();
    const [events, setEvents] = React.useState<(Event & { isBirthday?: boolean; memberId?: string; })[]>([]);
    const [members, setMembers] = React.useState<Member[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isEventModalOpen, setIsEventModalOpen] = React.useState(false);
    const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
    const [selectedMember, setSelectedMember] = React.useState<Member | null>(null);

    const fetchData = async () => {
        setLoading(true);
        const [eventsRes, membersRes] = await Promise.all([
            api.getEvents(),
            api.getMembersData()
        ]);

        let allEvents: (Event & { isBirthday?: boolean; memberId?: string; })[] = [];

        if (eventsRes.success) {
            const formattedEvents = eventsRes.data.map((e: any) => ({
                ...e,
                start: new Date(e.start),
                end: new Date(e.end),
            }));
            allEvents = [...allEvents, ...formattedEvents];
        }
        
        if (membersRes.success) {
            setMembers(membersRes.data.members);
            const currentYear = new Date().getFullYear();
            const birthdayEvents = membersRes.data.members
                .map((member: Member) => {
                    if (!member.dob) return null;
                    const [birthYear, month, day] = member.dob.split('-').map(Number);
                    // Create events for this year and next year to handle year-end views
                    const birthdayThisYear = new Date(currentYear, month - 1, day);
                    
                    return {
                        id: `bday_${member.id}`,
                        title: `🎂 ${member.fullName}'s Birthday`,
                        start: birthdayThisYear,
                        end: birthdayThisYear,
                        allDay: true,
                        category: 'Birthday' as const,
                        isBirthday: true,
                        memberId: member.id,
                    };
                })
                .filter(e => e !== null) as (Event & { isBirthday?: boolean; memberId?: string; })[];
            allEvents = [...allEvents, ...birthdayEvents];
        }

        setEvents(allEvents);
        setLoading(false);
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleSelectEvent = (event: Event & { isBirthday?: boolean, memberId?: string }) => {
        if (event.isBirthday && event.memberId) {
            const member = members.find(m => m.id === event.memberId);
            if (member) {
                setSelectedMember(member);
            }
        } else {
            setSelectedEvent(event);
            setIsEventModalOpen(true);
        }
    };

    const handleAddNew = () => {
        setSelectedEvent(null);
        setIsEventModalOpen(true);
    };

    const handleSave = async (event: Event) => {
        if (selectedEvent) {
            await api.updateEvent(event);
        } else {
            await api.addEvent(event);
        }
        fetchData();
        setIsEventModalOpen(false);
    };
    
    const eventStyleGetter = (event: Event) => {
        const backgroundColor = categoryColors[event.category] || '#3174ad';
        const style = {
            backgroundColor,
            borderRadius: '5px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        };
        return {
            style: style
        };
    };

    if (loading || !user) return <Spinner show={true} />;

    if (!user.permissions.events.view) {
        return <AccessDenied />;
    }

    return (
        <>
            <Card title="Events Calendar" actions={user.permissions.events.canAdd && <Button onClick={handleAddNew}>Add Event</Button>}>
                <div style={{ height: '70vh' }}>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        onSelectEvent={handleSelectEvent}
                        eventPropGetter={eventStyleGetter}
                    />
                </div>
            </Card>
            {isEventModalOpen && (
                <EventModal
                    isOpen={isEventModalOpen}
                    onClose={() => setIsEventModalOpen(false)}
                    event={selectedEvent}
                    onSave={handleSave}
                />
            )}
            {selectedMember && (
                <MemberDetailModal
                    isOpen={!!selectedMember}
                    onClose={() => setSelectedMember(null)}
                    member={selectedMember}
                />
            )}
        </>
    );
};

export default Events;