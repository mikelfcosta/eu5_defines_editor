import { Box, HStack, IconButton, Text } from "@chakra-ui/react";

interface BottomFooterProps {
  saveStatus: string;
  saveDisabled: boolean;
  exportDisabled: boolean;
  onSave: () => void;
  onExport: () => void;
}

export function BottomFooter({
  saveStatus,
  saveDisabled,
  exportDisabled,
  onSave,
  onExport
}: BottomFooterProps) {
  return (
    <Box
      as="footer"
      bg="transparent"
      px={6}
      py={2}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={4}
      flex="0 0 auto"
      position="relative"
      boxShadow="0 -10px 18px -14px rgba(0, 0, 0, 0.8)"
      _before={{
        content: '\"\"',
        position: "absolute",
        left: 6,
        right: 6,
        top: 0,
        height: "1px",
        bg: "borderPrimary"
      }}
    >
      <HStack spacing={2} ml="auto">
        <Text color="textSecondary" textAlign="right">{saveStatus}</Text>
        <IconButton aria-label="Save project" variant="outline" icon={<span>💾</span>} onClick={onSave} isDisabled={saveDisabled} />
        <IconButton aria-label="Export project" variant="outline" icon={<span>⇩</span>} onClick={onExport} isDisabled={exportDisabled} />
      </HStack>
    </Box>
  );
}
