import type { ReactNode } from "react";
import { Box, Button, HStack, Text } from "@chakra-ui/react";

interface TopHeaderProps {
  projectName: string;
  onToggleMenu: () => void;
  onOpenProjectModal: () => void;
  filters?: ReactNode;
}

export function TopHeader({ projectName, onToggleMenu, onOpenProjectModal, filters }: TopHeaderProps) {
  return (
    <Box
      as="header"
      position="relative"
      zIndex={8}
      bg="transparent"
      px={6}
      py={2}
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      gap={0}
      boxShadow="0 10px 18px -14px rgba(0, 0, 0, 0.8)"
      _after={{
        content: '""',
        position: "absolute",
        left: 6,
        right: 6,
        bottom: 0,
        height: "1px",
        bg: "borderPrimary"
      }}
    >
      <HStack flex="0 0 auto" align="center" spacing={2}>
        <Button display={{ base: "inline-flex", md: "none" }} variant="outline" onClick={onToggleMenu}>
          Menu
        </Button>
      </HStack>
      <Box flex="1 1 auto" minW={0} display="flex" justifyContent="flex-end" alignItems="center">
        <Box display="grid" justifyItems="stretch" gap={0} w="100%">
          <HStack justify="flex-end" spacing={2}>
            <Text color="textSecondary">{projectName}</Text>
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
