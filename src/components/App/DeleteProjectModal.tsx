import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react";

interface DeleteProjectModalProps {
  projectName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export function DeleteProjectModal({
  projectName,
  isOpen,
  onClose,
  onConfirmDelete
}: DeleteProjectModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent bg="surface.900" border="1px solid" borderColor="borderPrimary">
        <ModalHeader color="brand.gold">Delete Project?</ModalHeader>
        <ModalBody>
          <Text color="textSecondary">
            Delete <Text as="span" color="textPrimary" fontWeight={700}>{projectName ?? "this project"}</Text>? This action cannot be undone.
          </Text>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button colorScheme="red" onClick={onConfirmDelete} isDisabled={!projectName}>Delete</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
