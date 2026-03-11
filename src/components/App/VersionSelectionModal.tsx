import { Button, FormControl, FormLabel, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Text } from "@chakra-ui/react";

interface VersionSelectionModalProps {
  isOpen: boolean;
  pendingVersion: string;
  availableVersions: string[];
  onClose: () => void;
  onPendingVersionChange: (version: string) => void;
  onApply: () => void;
}

export function VersionSelectionModal({
  isOpen,
  pendingVersion,
  availableVersions,
  onClose,
  onPendingVersionChange,
  onApply
}: VersionSelectionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent bg="panelBg" border="1px solid" borderColor="borderPrimary">
        <ModalHeader color="brand.gold">Select Game Version</ModalHeader>
        <ModalBody display="grid" gap={3}>
          <FormControl>
            <FormLabel htmlFor="version-modal-select">Version</FormLabel>
            <Select id="version-modal-select" value={pendingVersion} onChange={(event) => onPendingVersionChange(event.target.value)}>
              {availableVersions.map((version) => (
                <option key={version} value={version}>
                  {version}
                </option>
              ))}
            </Select>
          </FormControl>
          <Text color="textSecondary">Applying a new version resets current project define overrides.</Text>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button colorScheme="yellow" onClick={onApply}>Apply</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
