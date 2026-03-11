import { Box, Button, Heading, Stack } from "@chakra-ui/react";

interface RightSidebarCategory {
  id: string;
  name: string;
  defineCount: number;
  modifiedCount: number;
}

interface RightSidebarProps {
  categories: RightSidebarCategory[];
  onSelectCategory: (categoryName: string) => void;
}

export function RightSidebar({ categories, onSelectCategory }: RightSidebarProps) {
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
      aria-label="Category index"
      bg="pageBg"
      borderLeft="1px solid"
      borderColor="borderPrimary"
      p={6}
      zIndex={2}
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Heading size="md" color="brand.gold">Categories</Heading>
      <Stack as="nav" mt={4} spacing={4}>
        {categories.map((category) => (
          <Button
            key={category.id}
            type="button"
            variant="ghost"
            justifyContent="flex-start"
            color="textSecondary"
            _hover={{ color: "textPrimary", bg: "transparent" }}
            _focusVisible={{ color: "textPrimary", bg: "transparent" }}
            px={0}
            h="auto"
            fontWeight={500}
            title={`${category.modifiedCount}/${category.defineCount} modified`}
            onClick={() => {
              onSelectCategory(category.name);
              requestAnimationFrame(() => scrollToCategory(category.id));
            }}
          >
            {category.name}
          </Button>
        ))}
      </Stack>
    </Box>
  );
}
