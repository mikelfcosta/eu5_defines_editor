import type { ReactNode } from "react";
import { Box, Button, HStack, Text } from "@chakra-ui/react";

interface TopHeaderProps {
  projectName: string;
  projectVersion: string;
  hasChangesSinceExport: boolean;
  onToggleMenu: () => void;
  onOpenProjectModal: () => void;
  filters?: ReactNode;
}

export function TopHeader({
  projectName,
  projectVersion,
  hasChangesSinceExport,
  onToggleMenu,
  onOpenProjectModal,
  filters
}: TopHeaderProps) {
  return (
    <Box
      as="header"
      position="relative"
      zIndex={8}
      bg="rgba(3, 25, 39, 0.7)"
      backdropFilter="blur(16px)"
      px={8}
      py={3}
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      gap={0}
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
      borderBottom="1px solid"
      borderBottomColor="borderPrimary"
    >
      <HStack flex="0 0 auto" align="center" spacing={2}>
        <Button display={{ base: "inline-flex", md: "none" }} variant="outline" onClick={onToggleMenu}>
          Menu
        </Button>
      </HStack>
      <Box flex="1 1 auto" minW={0} display="flex" justifyContent="flex-end" alignItems="center">
        <Box display="grid" justifyItems="stretch" gap={0} w="100%">
          <HStack justify="flex-end" spacing={2}>
            <Text color={hasChangesSinceExport ? "brand.gold" : "textSecondary"}>
              {projectName} ({projectVersion}){hasChangesSinceExport ? " *" : ""}
            </Text>
            <Button size="sm" variant="outline" onClick={onOpenProjectModal} aria-label="Edit projects">
              ✎
            </Button>

          </HStack>
          {filters ?? null}
        </Box>
      </Box>
    </Box>
  );
}
