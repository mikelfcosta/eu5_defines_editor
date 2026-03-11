import { Box, Heading, Text } from "@chakra-ui/react";

export function AboutPage() {
  return (
    <Box as="article" maxW="880px" bg="panelBg" border="1px solid" borderColor="borderPrimary" borderRadius="md" p={8}>
      <Heading size="lg" color="brand.gold" mb={4}>About</Heading>
      <Text>
        EUV Defines Editor is an offline-first frontend app for customizing Europa Universalis V defines and exporting
        valid mod files.
      </Text>
    </Box>
  );
}
