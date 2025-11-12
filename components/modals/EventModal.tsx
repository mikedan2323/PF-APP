// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { Event } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Event | null;
    onSave: (event: Event) => void;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event, onSave }) => {
    const [formData, setFormData] = React.useState<Omit<Partial<Event>, 'start' | 'end'> & { start?: string; end?: string; }>({});

    React.useEffect(() => {
        if (event) {
            setFormData({
                ...event,
                start: event.start ? new Date(event.start.getTime() - (event.start.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '',
                end: event.end ? new Date(event.end.getTime() - (event.end.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '',
            });
        } else {
            setFormData({
                id: `evt_${Date.now()}`,
                title: '',
                category: 'Club Meeting',
                allDay: false,
            });
        }
    }, [event, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.start || !formData.end) {
            alert('Title, start, and end times are required.');
            return;
        }
        onSave({
            ...formData,
            start: new Date(formData.start),
            end: new Date(formData.end),
        } as Event);
    };
    
    const inputStyles = "mt-1 w-full bg-gray-input border-gray-border rounded-md focus:ring-primary focus:border-primary";

    return (
        <Modal show={isOpen} onClose={onClose} title={event ? 'Edit Event' : 'Add New Event'}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Event Title</label>
                    <input type="text" name="title" value={formData.title || ''} onChange={handleChange} className={inputStyles} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Start Time</label>
                        <input type="datetime-local" name="start" value={formData.start || ''} onChange={handleChange} className={inputStyles} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">End Time</label>
                        <input type="datetime-local" name="end" value={formData.end || ''} onChange={handleChange} className={inputStyles} />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className={inputStyles}>
                        <option>Club Meeting</option>
                        <option>Conference</option>
                        <option>Community Service</option>
                        <option>Campout</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea name="description" value={formData.description || ''} onChange={handleChange} className={inputStyles} rows={3}></textarea>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Save Event</Button>
            </div>
        </Modal>
    );
};

export default EventModal;