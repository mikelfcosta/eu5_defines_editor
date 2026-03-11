import type { ReactNode } from "react";
import { Box, Grid } from "@chakra-ui/react";

interface AppShellProps {
  leftSidebar: ReactNode;
  topHeader: ReactNode;
  footer: ReactNode;
  rightSidebar?: ReactNode;
  children: ReactNode;
}

export function AppShell({ leftSidebar, topHeader, footer, rightSidebar, children }: AppShellProps) {
  return (
    <Box maxW="1440px" h="calc(100vh - 1.5rem)" my="0.75rem" mx="auto" bg="pageBg">
      <Grid templateColumns={{ base: "1fr", md: "240px minmax(0, 1fr)", lg: "240px minmax(0, 1fr) 200px" }} h="full">
        {leftSidebar}
        <Box
          display="flex"
          flexDirection="column"
          minW={0}
          h="full"
          overflow="hidden"
          bg="pageBg"
          borderRadius="xl"
          boxShadow="-8px 0 32px rgba(0, 0, 0, 0.4), 8px 0 32px rgba(0, 0, 0, 0.4)"
          border="1px solid"
          borderColor="whiteAlpha.100"
          zIndex={3}
          position="relative"
        >
          {topHeader}
          <Box
            as="main"
            px={6}
            py={4}
            overflow="auto"
            flex="1 1 auto"
            sx={{
              scrollbarWidth: "thin",
              scrollbarColor: "#ffd267 transparent",
              "&::-webkit-scrollbar": { width: "10px", height: "10px" },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                background: "#ffd267",
                borderRadius: "999px",
                border: "2px solid transparent",
                backgroundClip: "padding-box"
              },
              "&::-webkit-scrollbar-corner": { background: "transparent" }
            }}
          >
            {children}
          </Box>
          {footer}
        </Box>
        <Box display={{ base: "none", lg: "block" }}>{rightSidebar ?? null}</Box>
      </Grid>
    </Box>
  );
}
