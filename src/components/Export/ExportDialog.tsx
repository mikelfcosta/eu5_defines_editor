import { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea
} from "@chakra-ui/react";
import { bumpSemver } from "../../lib/storage";

interface ExportDialogProps {
  isOpen: boolean;
  isExporting: boolean;
  initialModName: string;
  initialModDescription: string;
  initialVersion: string;
  initialBumpType: "patch" | "minor" | "major";
  onCancel: () => void;
  onConfirm: (payload: {
    modName: string;
    modDescription: string;
    bumpType: "patch" | "minor" | "major";
    nextVersion: string;
  }) => void;
}

export function ExportDialog({
  isOpen,
  isExporting,
  initialModName,
  initialModDescription,
  initialVersion,
  initialBumpType,
  onCancel,
  onConfirm
}: ExportDialogProps) {
  const [modName, setModName] = useState(initialModName);
  const [modDescription, setModDescription] = useState(initialModDescription);
  const [bumpType, setBumpType] = useState<"patch" | "minor" | "major">(initialBumpType);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setModName(initialModName);
    setModDescription(initialModDescription);
    setBumpType(initialBumpType);
  }, [initialBumpType, initialModDescription, initialModName, isOpen]);

  const nextVersion = bumpSemver(initialVersion, bumpType);

  return (
    <Modal isOpen={isOpen} onClose={onCancel} isCentered>
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent bg="panelBg" border="1px solid" borderColor="borderPrimary">
        <ModalHeader color="brand.gold">Export Mod</ModalHeader>
        <ModalCloseButton />
        <ModalBody display="grid" gap={4}>
          <FormControl>
            <FormLabel htmlFor="export-mod-name">Mod Name</FormLabel>
            <Input
            id="export-mod-name"
            type="text"
            value={modName}
            onChange={(event) => setModName(event.target.value)}
            disabled={isExporting}
          />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="export-mod-description">Mod Description</FormLabel>
            <Textarea
            id="export-mod-description"
            rows={3}
            value={modDescription}
            onChange={(event) => setModDescription(event.target.value)}
            disabled={isExporting}
          />
          </FormControl>

          <Box border="1px solid" borderColor="borderPrimary" borderRadius="md" p={4}>
            <Text mb={2}>Version Bump</Text>
            <RadioGroup value={bumpType} onChange={(value: "patch" | "minor" | "major") => setBumpType(value)}>
              <Stack>
                <Radio value="patch">Patch ({bumpSemver(initialVersion, "patch")})</Radio>
                <Radio value="minor">Minor ({bumpSemver(initialVersion, "minor")})</Radio>
                <Radio value="major">Major ({bumpSemver(initialVersion, "major")})</Radio>
              </Stack>
            </RadioGroup>
          </Box>

          <Text color="textSecondary">Exporting will set project version to {nextVersion}.</Text>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button variant="outline" onClick={onCancel} isDisabled={isExporting}>
            Cancel
          </Button>
          <Button
            colorScheme="yellow"
            onClick={() =>
              onConfirm({
                modName: modName.trim() || initialModName,
                modDescription: modDescription.trim(),
                bumpType,
                nextVersion
              })
            }
            isDisabled={isExporting || modName.trim().length === 0}
          >
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
