// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { api } from '../services/api';
import { Resource } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ResourceModal from '../components/modals/ResourceModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import { Link, Trash2, Edit, Plus } from 'react-feather';
import { useAlert, useUser } from '../App';
import AccessDenied from '../components/ui/AccessDenied';


const Resources: React.FC = () => {
    const user = useUser();
    const [resources, setResources] = React.useState<Resource[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedResource, setSelectedResource] = React.useState<Resource | null>(null);
    const [resourceToDelete, setResourceToDelete] = React.useState<Resource | null>(null);
    const { addAlert } = useAlert();

    const fetchData = async () => {
        setLoading(true);
        const response = await api.getResources();
        if (response.success) {
            setResources(response.data.resources);
        }
        setLoading(false);
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const groupedResources = resources.reduce((acc, resource) => {
        const category = resource.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(resource);
        return acc;
    }, {} as { [key: string]: Resource[] });

    const handleOpenModal = (resource: Resource | null = null) => {
        setSelectedResource(resource);
        setIsModalOpen(true);
    };
    
    const handleSave = () => {
        addAlert(selectedResource ? 'Resource updated!' : 'Resource added!', 'success');
        fetchData();
        setIsModalOpen(false);
    };
    
    const handleDelete = () => {
        if(!resourceToDelete || !user) return;
        addAlert(`Deleted '${resourceToDelete.name}'.`, 'success');
        const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
        api.logAction(userName, 'Delete Resource', `Deleted resource: ${resourceToDelete.name}`);
        setResourceToDelete(null);
        fetchData();
    }

    if (loading || !user) return <Spinner show={true} />;

    const { permissions } = user;

    if (!permissions.resources.view) {
        return <AccessDenied />;
    }

    const canManage = permissions.resources.canAdd;

    return (
        <>
        <div className="space-y-6">
            <Card 
                title="Resources Library" 
                actions={canManage && <Button onClick={() => handleOpenModal()}><Plus size={16} className="mr-1"/> Add Resource</Button>}
            >
                {Object.keys(groupedResources).sort().map(category => (
                    <div key={category} className="mb-8 last:mb-0">
                        <h3 className="text-lg font-bold text-text-main mb-3 pb-2 border-b border-gray-border">{category}</h3>
                        <div className="space-y-3">
                            {groupedResources[category].map(resource => (
                                <div
                                    key={resource.id}
                                    className="flex items-center justify-between p-4 border border-gray-border rounded-lg hover:bg-gray-border/50 transition-all"
                                >
                                    <div className="flex items-center">
                                        <Link className="text-primary mr-4" />
                                        <div>
                                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{resource.name}</a>
                                            <div className="text-xs text-text-muted mt-1">Added by {resource.by} on {resource.at}</div>
                                        </div>
                                    </div>
                                    {canManage && (
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleOpenModal(resource)}><Edit size={14}/></Button>
                                            <Button size="sm" variant="danger" onClick={() => setResourceToDelete(resource)}><Trash2 size={14}/></Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {resources.length === 0 && !loading && (
                    <div className="text-center py-12 text-text-muted">
                        <h3 className="text-lg font-medium">No resources available</h3>
                        <p>Click "Add Resource" to build your library.</p>
                    </div>
                )}
            </Card>
        </div>
        
        <ResourceModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            resource={selectedResource}
            onSave={handleSave}
        />
        
        <ConfirmationModal
            isOpen={!!resourceToDelete}
            onClose={() => setResourceToDelete(null)}
            onConfirm={handleDelete}
            title="Delete Resource"
            message={`Are you sure you want to delete the resource "${resourceToDelete?.name}"?`}
        />
        </>
    );
};

export default Resources;