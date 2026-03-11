import { Box, Button, IconButton, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import type { ChangeEventHandler } from "react";
import type { Project } from "../../types/defines";
import { formatDateTime } from "../../utils";
import { useProjectTableVirtualization } from "./hooks/useProjectTableVirtualization";

interface ProjectManagerModalProps {
  isOpen: boolean;
  projects: Project[];
  activeProjectId: string | null;
  editingProjectId: string | null;
  editingProjectName: string;
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
  onBeginRename: (project: Project) => void;
  onEditingNameChange: (value: string) => void;
  onCommitRename: (projectId: string) => void;
  onCancelRename: () => void;
  onRequestDelete: (projectId: string) => void;
  onCreateProject: () => void;
  onImportFileChange: ChangeEventHandler<HTMLInputElement>;
}

export function ProjectManagerModal({
  isOpen,
  projects,
  activeProjectId,
  editingProjectId,
  editingProjectName,
  onClose,
  onSelectProject,
  onBeginRename,
  onEditingNameChange,
  onCommitRename,
  onCancelRename,
  onRequestDelete,
  onCreateProject,
  onImportFileChange
}: ProjectManagerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectTable = useProjectTableVirtualization(projects);

  useEffect(() => {
    if (!isOpen) {
      projectTable.resetProjectTableScroll();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="4xl">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent bg="surface.900" border="1px solid" borderColor="borderPrimary">
        <ModalHeader color="brand.gold">Project Selection</ModalHeader>
        <ModalBody display="grid" gap={3}>
          <Box
            border="none"
            borderRadius="md"
            overflow="hidden"
            bg="transparent"
            fontFamily="sans-serif"
            maxH={projectTable.shouldVirtualizeProjects ? `${projectTable.projectTableViewportHeight}px` : undefined}
            overflowY={projectTable.shouldVirtualizeProjects ? "auto" : "visible"}
            onScroll={(event) => {
              if (projectTable.shouldVirtualizeProjects) {
                projectTable.setProjectTableScrollTop(event.currentTarget.scrollTop);
              }
            }}
          >
            <Table size="sm" variant="simple" sx={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "40%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <Thead bg="transparent">
                <Tr borderBottom="1px solid" borderColor="borderSecondary">
                  <Th py={3}>Project Name</Th>
                  <Th py={3}>Last Updated</Th>
                  <Th py={3}>Latest Version</Th>
                  <Th py={3} textAlign="center">Edit</Th>
                  <Th py={3} textAlign="center">Delete</Th>
                </Tr>
              </Thead>
              <Tbody>
                {projectTable.shouldVirtualizeProjects && projectTable.projectRowsWindow.offsetTop > 0 ? (
                  <Tr>
                    <Td colSpan={5} p={0} h={`${projectTable.projectRowsWindow.offsetTop}px`} borderBottom="none" />
                  </Tr>
                ) : null}

                {projectTable.visibleProjects.map((project, index) => {
                  const isActive = project.id === activeProjectId;
                  const isEditing = editingProjectId === project.id;

                  return (
                    <Tr
                      key={project.id}
                      ref={index === 0 ? projectTable.measureProjectRowHeight : undefined}
                      bg={isActive ? "rgba(255, 210, 103, 0.2)" : undefined}
                      _hover={{ bg: isActive ? "rgba(255, 210, 103, 0.24)" : "surface.700" }}
                      cursor="pointer"
                      onClick={() => onSelectProject(project.id)}
                    >
                      <Td>
                        {isEditing ? (
                          <Input
                            size="sm"
                            value={editingProjectName}
                            onChange={(event) => onEditingNameChange(event.target.value)}
                            onBlur={() => onCommitRename(project.id)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                onCommitRename(project.id);
                              }

                              if (event.key === "Escape") {
                                onCancelRename();
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <Text>{project.name}</Text>
                        )}
                      </Td>
                      <Td>{formatDateTime(project.updatedAt)}</Td>
                      <Td>{project.modVersion}</Td>
                      <Td textAlign="center" verticalAlign="middle">
                        <Box display="flex" justifyContent="center" alignItems="center">
                          <IconButton
                            aria-label={`Edit ${project.name}`}
                            size="sm"
                            variant="outline"
                            icon={<span>✎</span>}
                            onClick={(event) => {
                              event.stopPropagation();
                              onBeginRename(project);
                            }}
                          />
                        </Box>
                      </Td>
                      <Td textAlign="center" verticalAlign="middle">
                        <Box display="flex" justifyContent="center" alignItems="center">
                          <IconButton
                            aria-label={`Delete ${project.name}`}
                            size="sm"
                            variant="outline"
                            icon={<span>✕</span>}
                            colorScheme="red"
                            isDisabled={projects.length <= 1}
                            onClick={(event) => {
                              event.stopPropagation();
                              onRequestDelete(project.id);
                            }}
                          />
                        </Box>
                      </Td>
                    </Tr>
                  );
                })}

                {projectTable.shouldVirtualizeProjects && projectTable.projectRowsWindow.offsetBottom > 0 ? (
                  <Tr>
                    <Td colSpan={5} p={0} h={`${projectTable.projectRowsWindow.offsetBottom}px`} borderBottom="none" />
                  </Tr>
                ) : null}

                <Tr
                  _hover={{ bg: "surface.700" }}
                  cursor="pointer"
                  onClick={onCreateProject}
                >
                  <Td colSpan={5} py={4} borderBottom="none" w="100%">
                    <Text color="brand.gold" fontWeight={600}>+ Create new project</Text>
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </ModalBody>
        <ModalFooter>
          <input
            type="file"
            accept=".json"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={onImportFileChange}
          />
          <Button variant="outline" mr={3} onClick={() => fileInputRef.current?.click()}>
            Import Project
          </Button>
          <Button colorScheme="yellow" onClick={onClose}>Done</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
