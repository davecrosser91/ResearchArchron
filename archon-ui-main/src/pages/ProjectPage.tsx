import { useParams } from 'react-router-dom';
import { ProjectsViewWithBoundary, ProjectDetailViewWithBoundary } from '../features/projects';

// Routes:
// /projects - Shows project list
// /projects/:projectId - Shows project detail with tasks/docs

function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();

  // If projectId exists, show detail view, otherwise show list
  return projectId ? <ProjectDetailViewWithBoundary /> : <ProjectsViewWithBoundary />;
}

export { ProjectPage };