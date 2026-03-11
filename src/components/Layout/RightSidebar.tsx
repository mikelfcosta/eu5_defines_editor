import { Box, Button, Heading, Stack } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

interface RightSidebarCategory {
  id: string;
  name: string;
  defineCount: number;
  modifiedCount: number;
}

interface DocsNavPage {
  path: string;
  title: string;
}

interface RightSidebarProps {
  categories?: RightSidebarCategory[];
  docsPages?: DocsNavPage[];
  onSelectCategory?: (categoryName: string) => void;
}

export function RightSidebar({ categories, docsPages, onSelectCategory }: RightSidebarProps) {
  const scrollToCategory = (categoryId: string) => {
    const target = document.getElementById(`category-${categoryId}`);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box
      as="aside"
      aria-label={docsPages ? "Documentation structure" : "Category index"}
      bg="pageBg"
      borderLeft="1px solid"
      borderColor="whiteAlpha.100"
      p={6}
      zIndex={2}
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      {categories ? (
        <>
          <Heading size="md" color="brand.gold" textTransform="uppercase" letterSpacing="wide" fontSize="sm">Categories</Heading>
          <Stack as="nav" mt={4} spacing={2}>
            {categories.map((category) => (
              <Button
                key={category.id}
                type="button"
                variant="ghost"
                justifyContent="flex-start"
                color="textSecondary"
                _hover={{ color: "brand.gold", bg: "whiteAlpha.50", transform: "translateX(-4px)" }}
                _focusVisible={{ color: "brand.gold", bg: "transparent" }}
                px={4}
                py={2}
                h="auto"
                fontWeight={500}
                borderRadius="md"
                transition="all 0.2s"
                title={`${category.modifiedCount}/${category.defineCount} modified`}
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory(category.name);
                    requestAnimationFrame(() => scrollToCategory(category.id));
                  }
                }}
              >
                {category.name}
              </Button>
            ))}
          </Stack>
        </>
      ) : docsPages ? (
        <>
          <Heading size="md" color="brand.gold" textTransform="uppercase" letterSpacing="wide" fontSize="sm">Docs Pages</Heading>
          <Stack as="nav" mt={4} spacing={2}>
            {docsPages.map((page) => (
              <Button
                key={page.path}
                as={NavLink}
                to={page.path}
                end={page.path === "/docs"}
                variant="ghost"
                justifyContent="flex-start"
                px={4}
                py={2}
                h="auto"
                fontWeight={500}
                borderRadius="md"
                transition="all 0.2s"
                sx={{
                  "&.active": {
                    color: "brand.gold",
                    bg: "whiteAlpha.100",
                    fontWeight: 600
                  },
                  "&:not(.active)": {
                    color: "textSecondary"
                  }
                }}
                _hover={{ color: "brand.gold", bg: "whiteAlpha.50", transform: "translateX(-4px)" }}
                _focusVisible={{ color: "brand.gold", bg: "transparent" }}
              >
                {page.title}
              </Button>
            ))}
          </Stack>
        </>
      ) : null}
    </Box>
  );
}
