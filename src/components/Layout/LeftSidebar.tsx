import { NavLink } from "react-router-dom";
import { Box, Button, Heading, Link, Stack, Text } from "@chakra-ui/react";
interface DocsNavPage {
  path: string;
  title: string;
}

interface LeftSidebarProps {
  menuOpen: boolean;
  selectedVersion: string;
  docsPages: DocsNavPage[];
  isDocsRoute: boolean;
  onOpenVersionModal: () => void;
}

export function LeftSidebar({
  menuOpen,
  selectedVersion,
  docsPages,
  isDocsRoute,
  onOpenVersionModal
}: LeftSidebarProps) {
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
          {[{ to: "/", label: "Editor", end: true }, { to: "/docs", label: "Docs" }, { to: "/about", label: "About" }].map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end as boolean | undefined}>
              {({ isActive }) => (
                <Link
                  display="block"
                  textAlign="right"
                  textDecoration="none"
                  color="textPrimary"
                  borderRight="3px solid"
                  borderColor={isActive ? "brand.gold" : "transparent"}
                  fontWeight={isActive ? 700 : 500}
                  px={2}
                  py={1}
                  _hover={{ textDecoration: "none", color: "textPrimary", bgGradient: "linear(to-l, rgba(255,255,255,0.15), transparent)" }}
                >
                  {item.label}
                </Link>
              )}
            </NavLink>
          ))}
        </Stack>

        {isDocsRoute ? (
          <Box border="1px solid" borderColor="borderSecondary" bg="surface.700" borderRadius="md" p={4}>
            <Heading size="md" color="brand.gold" mb={2}>Docs Pages</Heading>
            <Stack as="nav" aria-label="Documentation pages" spacing={1}>
              {docsPages.map((page) => (
                <NavLink key={page.path} to={page.path} end={page.path === "/docs"}>
                  {({ isActive }) => (
                    <Link
                      display="block"
                      textAlign="right"
                      textDecoration="none"
                      color="textPrimary"
                      borderRight="3px solid"
                      borderColor={isActive ? "brand.gold" : "transparent"}
                      fontWeight={isActive ? 700 : 500}
                      px={2}
                      py={1}
                      _hover={{ textDecoration: "none", color: "textPrimary" }}
                    >
                      {page.title}
                    </Link>
                  )}
                </NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>

      <Button mt="auto" variant="outline" borderColor="borderPrimary" onClick={onOpenVersionModal} justifyContent="space-between">
        <Text>Version {selectedVersion}</Text>
        <Text aria-hidden="true">✎</Text>
      </Button>
    </Box>
  );
}
