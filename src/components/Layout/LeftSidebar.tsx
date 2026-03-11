import { NavLink, useLocation } from "react-router-dom";
import { Box, Button, Heading, Link, Stack, Text } from "@chakra-ui/react";
interface LeftSidebarProps {
  menuOpen: boolean;
  selectedVersion: string;
  onOpenVersionModal: () => void;
}

export function LeftSidebar({
  menuOpen,
  selectedVersion,
  onOpenVersionModal
}: LeftSidebarProps) {
  const location = useLocation();

  return (
    <Box
      as="aside"
      bg="pageBg"
      borderRight="1px solid"
      borderColor="borderPrimary"
      p={6}
      zIndex={2}
      display={{ base: menuOpen ? "flex" : "none", md: "flex" }}
      position={{ base: "fixed", md: "relative" }}
      left={{ base: 0, md: "auto" }}
      top={{ base: 0, md: "auto" }}
      bottom={{ base: 0, md: "auto" }}
      w={{ base: "240px", md: "auto" }}
      flexDirection="column"
    >
      <Box my="auto">
        <Heading size="lg" lineHeight="1" textAlign="right" textTransform="uppercase" color="brand.gold" mb={6}>
          <Text as="span" display="block">EUV</Text>
          <Text as="span" display="block">Defines Editor</Text>
        </Heading>

        <Stack as="nav" aria-label="Primary navigation" spacing={1} mb={6}>
          {[{ to: "/", label: "Editor", end: true }, { to: "/docs/getting-started", label: "Docs" }, { to: "/about", label: "About" }].map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end as boolean | undefined}>
              {({ isActive }) => {
                const isDocsActive = item.label === "Docs" && location.pathname.startsWith("/docs");
                const effectiveIsActive = item.label === "Docs" ? isDocsActive : isActive;

                return (
                  <Link
                    display="block"
                    textAlign="right"
                    textDecoration="none"
                    color="textPrimary"
                    borderRight="3px solid"
                    borderColor={effectiveIsActive ? "brand.gold" : "transparent"}
                    fontWeight={effectiveIsActive ? 600 : 400}
                    px={4}
                    py={2}
                    borderRadius="md"
                    transition="all 0.2s"
                    _hover={{ textDecoration: "none", color: "brand.gold", bg: "whiteAlpha.100" }}
                  >
                    {item.label}
                  </Link>
                );
              }}
            </NavLink>
          ))}
        </Stack>
      </Box>

      <Button mt="auto" variant="outline" borderColor="borderPrimary" onClick={onOpenVersionModal} justifyContent="space-between">
        <Text>Version {selectedVersion}</Text>
        <Text aria-hidden="true">✎</Text>
      </Button>
    </Box>
  );
}
