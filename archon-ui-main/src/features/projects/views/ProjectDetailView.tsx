import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/primitives";
import { DocsTab } from "../documents/DocsTab";
import { TasksTab } from "../tasks/TasksTab";
import { useProjectDetail } from "../hooks/useProjectQueries";
import { Button } from "../../ui/primitives/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
};

export function ProjectDetailView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tasks");

  const { data: project, isLoading, error } = useProjectDetail(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-cyan-400">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-lg text-red-400">Failed to load project</div>
        <Button onClick={() => navigate("/projects")} variant="cyan">
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full p-6"
    >
      {/* Header with back button */}
      <motion.div variants={itemVariants} className="mb-6">
        <Button
          onClick={() => navigate("/projects")}
          variant="ghost"
          className="mb-4 text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        <h1 className="text-3xl font-bold text-cyan-400">{project.title}</h1>
        {project.description && (
          <p className="mt-2 text-gray-400">{project.description}</p>
        )}
      </motion.div>

      {/* Tabs for Documents and Tasks */}
      <motion.div variants={itemVariants} className="relative">
        <Tabs defaultValue="tasks" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="docs" className="py-3 font-mono transition-all duration-300" color="blue">
              Documents
            </TabsTrigger>
            <TabsTrigger value="tasks" className="py-3 font-mono transition-all duration-300" color="orange">
              Tasks
            </TabsTrigger>
          </TabsList>

          <div>
            {activeTab === "docs" && (
              <TabsContent value="docs" className="mt-0">
                <DocsTab project={project} />
              </TabsContent>
            )}
            {activeTab === "tasks" && (
              <TabsContent value="tasks" className="mt-0">
                <TasksTab projectId={project.id} />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
