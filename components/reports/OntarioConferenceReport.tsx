// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { api } from '../../services/api';
// FIX: Add AttendanceData to imports to correctly type attendance records.
import { Member, Event, AttendanceRecord, UniformRecord, AttendanceData } from '../../types';
import { uniformData } from '../../pages/Uniform';
import { Info, Plus, Trash2 } from 'react-feather';

interface OntarioConferenceReportProps {
  month: string;
}

const getMeritPointsForPercentage = (percentage: number): number => {
    if (percentage >= 91) return 20;
    if (percentage >= 76) return 15;
    if (percentage >= 51) return 10;
    if (percentage > 0) return 5;
    return 0;
};

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="relative group flex items-center">
        <Info size={14} className="text-text-subtle ml-2" />
        <div className="absolute bottom-full mb-2 w-64 bg-gray-base p-2 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity border border-gray-border z-10">
            {text}
        </div>
    </div>
);

interface Activity { id: number; description: string; }

const OntarioConferenceReport: React.FC<OntarioConferenceReportProps> = ({ month }) => {
    const [loading, setLoading] = React.useState(false);

    // Auto-calculated data
    const [regularMeetings, setRegularMeetings] = React.useState(0);
    const [avgAttendance, setAvgAttendance] = React.useState(0);
    const [uniformACompliance, setUniformACompliance] = React.useState(0);

    // Manual data
    const [extraMeetings, setExtraMeetings] = React.useState('');
    const [staffMeetingHeld, setStaffMeetingHeld] = React.useState(false);
    const [shareFaithActivities, setShareFaithActivities] = React.useState<Activity[]>([]);
    const [servingOthersActivities, setServingOthersActivities] = React.useState<Activity[]>([]);
    const [clubTrips, setClubTrips] = React.useState<Activity[]>([]);
    const [inductionDay, setInductionDay] = React.useState(false);
    const [inductionDayDesc, setInductionDayDesc] = React.useState('');
    const [staffCourses, setStaffCourses] = React.useState<Activity[]>([]);
    const [baptizedCount, setBaptizedCount] = React.useState(0);
    const [conferenceActivities, setConferenceActivities] = React.useState<Activity[]>([]);
    const [attendedOtherInduction, setAttendedOtherInduction] = React.useState(false);
    const [attendedOtherInductionDesc, setAttendedOtherInductionDesc] = React.useState('');
    const [districtMeeting, setDistrictMeeting] = React.useState(false);
    const [evaluationForm, setEvaluationForm] = React.useState(false);
    const [additionalMerits, setAdditionalMerits] = React.useState<Activity[]>([]);


    const fetchAndCalculateData = React.useCallback(async () => {
        if (!month) return;
        setLoading(true);

        const [year, monthNum] = month.split('-').map(Number);
        
        const [membersRes, eventsRes, attendanceRes, uniformRes] = await Promise.all([
            api.getMembersData(),
            api.getEvents(),
            api.getAttendanceRecords(),
            api.getUniformData()
        ]);

        // 1. Regular Meetings
        if (eventsRes.success) {
            const meetings = eventsRes.data.filter(e => {
                const eventDate = new Date(e.start);
                return e.category === 'Club Meeting' &&
                       eventDate.getFullYear() === year &&
                       eventDate.getMonth() + 1 === monthNum;
            });
            setRegularMeetings(meetings.length);
        }

        // 2. Average Attendance
        if (attendanceRes.success && membersRes.success && regularMeetings > 0) {
            const activeMembers = membersRes.data.members.filter(m => m.status === 'Active');
            const totalMembership = activeMembers.length;

            const monthRecords = attendanceRes.data.filter(r => {
                const recordDate = new Date(r.date + 'T12:00:00'); // Ensure it's parsed as local
                return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === monthNum;
            });
            
            if (monthRecords.length > 0 && totalMembership > 0) {
                const totalPresent = monthRecords.reduce((sum, record) => {
                    // FIX: Explicitly type `rec` as `AttendanceData` to resolve property access errors.
                    return sum + Object.values(record.records).filter((rec: AttendanceData) => rec.present && !rec.excused?.present).length;
                }, 0);
                
                const avgPresentPerMeeting = totalPresent / monthRecords.length;
                const percentage = (avgPresentPerMeeting / totalMembership) * 100;
                setAvgAttendance(percentage);
            }
        }

        // 4. Uniform Compliance
        if(uniformRes.success && membersRes.success) {
             const activeMembers = membersRes.data.members.filter(m => m.status === 'Active');
             const totalMembership = activeMembers.length;
             
             if(totalMembership > 0) {
                const completeUniformItems = uniformData.items.filter(item => item.includes('Type A'));
                let membersWithCompleteUniform = 0;
                
                activeMembers.forEach(member => {
                    const uniformRecord = uniformRes.data.members.find(r => r.memberId === member.id);
                    if(uniformRecord) {
                        const hasAllItems = completeUniformItems.every(item => uniformRecord.items[item]);
                        if(hasAllItems) {
                            membersWithCompleteUniform++;
                        }
                    }
                });
                setUniformACompliance((membersWithCompleteUniform / totalMembership) * 100);
             }
        }
        setLoading(false);
    }, [month, regularMeetings]);

    React.useEffect(() => {
        fetchAndCalculateData();
    }, [month]);
    
    const totalMeritPoints = React.useMemo(() => {
        let total = 0;
        // 1. Meetings
        total += Math.min(regularMeetings, 4) * 10;
        // 2. Attendance
        total += getMeritPointsForPercentage(avgAttendance);
        // 3. Staff Meeting
        if (staffMeetingHeld) total += 10;
        // 4. Uniform
        total += getMeritPointsForPercentage(uniformACompliance);
        // 5, 6, 7. Outreach/Trips
        total += shareFaithActivities.length * 10;
        total += servingOthersActivities.length * 10;
        total += clubTrips.length * 10;
        // 8. Induction
        if(inductionDay) total += 10;
        // 9. Staff Learning
        total += staffCourses.length * 10;
        // 10. Baptized
        total += baptizedCount * 10;
        // 11. Conference Activities
        total += conferenceActivities.length * 20;
        // 12. Attended other induction
        if(attendedOtherInduction) total += 10;
        // 13. District Meeting
        if(districtMeeting) total += 20;
        // 14. Evaluation Form
        if(evaluationForm) total += 20;
        // 15. Additional Merits
        total += additionalMerits.length * 10; // Assuming 10 pts each
        
        return total;
    }, [regularMeetings, avgAttendance, uniformACompliance, staffMeetingHeld, shareFaithActivities, servingOthersActivities, clubTrips, inductionDay, staffCourses, baptizedCount, conferenceActivities, attendedOtherInduction, districtMeeting, evaluationForm, additionalMerits]);

    const addActivity = (setter: React.Dispatch<React.SetStateAction<Activity[]>>) => {
        setter(prev => [...prev, { id: Date.now(), description: '' }]);
    };
    
    const removeActivity = (id: number, setter: React.Dispatch<React.SetStateAction<Activity[]>>) => {
        setter(prev => prev.filter(item => item.id !== id));
    };

    const inputStyles = "w-full mt-1 p-2 bg-gray-input border border-gray-border rounded-md";

    const ActivitySection: React.FC<{
        title: string;
        activities: Activity[];
        setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
        pointsPer: number;
        tooltip: string;
    }> = ({ title, activities, setActivities, pointsPer, tooltip }) => (
         <div>
            <label className="font-semibold flex items-center">{title} <Tooltip text={tooltip} /></label>
            {activities.map((activity, index) => (
                <div key={activity.id} className="flex items-center gap-2 mt-1">
                    <input type="text" placeholder={`Activity #${index + 1}`} className={inputStyles}/>
                    <Button size="sm" variant="danger" onClick={() => removeActivity(activity.id, setActivities)}><Trash2 size={14}/></Button>
                </div>
            ))}
            <Button size="sm" variant="outline" className="mt-2" onClick={() => addActivity(setActivities)}>
                <Plus size={14} className="mr-1" /> Add Activity ({pointsPer} pts each)
            </Button>
        </div>
    );

    return (
        <div className="space-y-6">
            <Spinner show={loading} />
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-text-main">Ontario Conference Monthly Report Helper</h3>
                    <p className="text-text-muted">Use this tool to calculate your points for the monthly report.</p>
                </div>
                <div className="text-right">
                    <Button onClick={fetchAndCalculateData}>Recalculate Data</Button>
                    <Card className="mt-4 text-center">
                        <p className="text-sm font-medium text-text-muted">Total Merit Points Earned</p>
                        <p className="text-4xl font-bold text-primary">{totalMeritPoints}</p>
                    </Card>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="1. Club Meetings" className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="font-semibold flex items-center">Regular Meetings <Tooltip text="Auto-calculated from 'Club Meeting' events in the calendar for the selected month."/></label>
                            <p className="text-2xl font-bold">{regularMeetings}</p>
                            <p className="text-xs text-text-muted">Points: {Math.min(regularMeetings, 4) * 10} / 40</p>
                        </div>
                        <div className="md:col-span-2">
                             <label className="font-semibold flex items-center">Extra Meetings <Tooltip text="Specify any extra meetings not captured in the calendar count."/></label>
                            <input type="text" value={extraMeetings} onChange={e => setExtraMeetings(e.target.value)} className={inputStyles}/>
                        </div>
                    </div>
                </Card>

                <Card title="2. Average Attendance">
                    <p className="text-2xl font-bold">{avgAttendance.toFixed(2)}%</p>
                    <p className="text-primary font-semibold">{getMeritPointsForPercentage(avgAttendance)} Merit Points</p>
                    <Tooltip text="Calculated as: (Total Present / Meetings) / Total Members. Points are based on the official merit table." />
                </Card>
                
                <Card title="4. Uniform Compliance (Type A)">
                    <p className="text-2xl font-bold">{uniformACompliance.toFixed(2)}%</p>
                    <p className="text-primary font-semibold">{getMeritPointsForPercentage(uniformACompliance)} Merit Points</p>
                     <Tooltip text="Calculated based on uniform checklists for active members. This is an estimate; manually exclude new inductees on your paper form." />
                </Card>

                <Card title="10. Baptized Children">
                     <label className="font-semibold flex items-center">Number Baptized <Tooltip text="10 merit points per child."/></label>
                     <input type="number" value={baptizedCount} onChange={e => setBaptizedCount(parseInt(e.target.value) || 0)} className={inputStyles} />
                     <p className="text-primary font-semibold mt-2">{baptizedCount * 10} Merit Points</p>
                </Card>
            </div>

             <Card title="Manual Point Entry">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <ActivitySection title="5. Share Your Faith Activities" activities={shareFaithActivities} setActivities={setShareFaithActivities} pointsPer={10} tooltip="10 points for each activity where 50% of the club is involved." />
                        <ActivitySection title="6. Serving Others Activities" activities={servingOthersActivities} setActivities={setServingOthersActivities} pointsPer={10} tooltip="10 points for each activity where 50% of the club is involved." />
                        <ActivitySection title="7. Club Trips & Outings" activities={clubTrips} setActivities={setClubTrips} pointsPer={10} tooltip="10 points for each outing where 50% of the club is involved." />
                    </div>
                     <div className="space-y-6">
                        <ActivitySection title="9. Staff Learning Courses" activities={staffCourses} setActivities={setStaffCourses} pointsPer={10} tooltip="10 points per unique course type attended by any staff (e.g., Basic Training, MIT)." />
                        <ActivitySection title="11. Conference Activities" activities={conferenceActivities} setActivities={setConferenceActivities} pointsPer={20} tooltip="20 points for each official conference activity with 50% club participation." />
                        <ActivitySection title="15. Additional Merits" activities={additionalMerits} setActivities={setAdditionalMerits} pointsPer={10} tooltip="10 points for each additional conference-approved campaign or event." />
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="font-semibold flex items-center">8. Club Induction / Pathfinder Day <Tooltip text="10 points for holding one of these events."/></label>
                            <label className="flex items-center mt-2"><input type="checkbox" checked={inductionDay} onChange={e => setInductionDay(e.target.checked)} className="mr-2 rounded text-primary focus:ring-primary"/> Event Held (+10 pts)</label>
                            <input type="text" placeholder="Specify event..." value={inductionDayDesc} onChange={e => setInductionDayDesc(e.target.value)} className={inputStyles} />
                        </div>
                         <div>
                            <label className="font-semibold flex items-center">12. Attended Other Club's Induction <Tooltip text="10 points for attending another club's induction/investiture."/></label>
                            <label className="flex items-center mt-2"><input type="checkbox" checked={attendedOtherInduction} onChange={e => setAttendedOtherInduction(e.target.checked)} className="mr-2 rounded text-primary focus:ring-primary"/> Attended (+10 pts)</label>
                            <input type="text" placeholder="Specify which club..." value={attendedOtherInductionDesc} onChange={e => setAttendedOtherInductionDesc(e.target.value)} className={inputStyles} />
                        </div>
                        <div className="space-y-2">
                             <label className="flex items-center font-semibold"><input type="checkbox" checked={staffMeetingHeld} onChange={e => setStaffMeetingHeld(e.target.checked)} className="mr-2 rounded text-primary focus:ring-primary"/> 3. Staff Meeting Held (+10 pts) <Tooltip text="Check if a staff meeting was held this month."/></label>
                             <label className="flex items-center font-semibold"><input type="checkbox" checked={districtMeeting} onChange={e => setDistrictMeeting(e.target.checked)} className="mr-2 rounded text-primary focus:ring-primary"/> 13. Attended District Meeting (+20 pts) <Tooltip text="Check if your club was represented at the quarterly district coordinator's meeting."/></label>
                             <label className="flex items-center font-semibold"><input type="checkbox" checked={evaluationForm} onChange={e => setEvaluationForm(e.target.checked)} className="mr-2 rounded text-primary focus:ring-primary"/> 14. Submitted Eval Form (+20 pts) <Tooltip text="Check if the Area Coordinator's Evaluation Form was submitted this quarter."/></label>
                        </div>
                    </div>
                 </div>
             </Card>
        </div>
    );
}

export default OntarioConferenceReport;