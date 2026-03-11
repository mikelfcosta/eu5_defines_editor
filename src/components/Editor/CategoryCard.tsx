import { useEffect, useMemo, useState } from "react";
import type { DefineCategory, DefineEntry } from "../../types/defines";
import { Box, Button, Collapse, Text, VStack } from "@chakra-ui/react";
import { DefineRow } from "./DefineRow";

const VIRTUALIZE_THRESHOLD = 80;
const VIRTUAL_ROW_HEIGHT = 52;
const VIRTUAL_VIEWPORT_HEIGHT = 560;
const VIRTUAL_OVERSCAN = 8;

interface CategoryCardProps {
  category: DefineCategory;
  modifiedCount: number;
  isCollapsed: boolean;
  fillAvailableHeight?: boolean;
  getDisplayValue: (entry: DefineEntry) => string;
  getIsModified: (entry: DefineEntry) => boolean;
  getError: (entry: DefineEntry) => string | undefined;
  onToggleCollapse: (categoryName: string) => void;
  onUpdateDefine: (entry: DefineEntry, raw: string) => void;
  onResetDefine: (entry: DefineEntry) => void;
}

export function CategoryCard({
  category,
  modifiedCount,
  isCollapsed,
  fillAvailableHeight = false,
  getDisplayValue,
  getIsModified,
  getError,
  onToggleCollapse,
  onUpdateDefine,
  onResetDefine
}: CategoryCardProps) {
  const categoryId = category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const isLockedOpen = fillAvailableHeight;
  const effectiveCollapsed = isLockedOpen ? false : isCollapsed;
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(VIRTUAL_VIEWPORT_HEIGHT);
  const shouldVirtualize = !effectiveCollapsed && category.defines.length > VIRTUALIZE_THRESHOLD;
  const shouldFillExpandedHeight = fillAvailableHeight && !effectiveCollapsed;

  useEffect(() => {
    if (effectiveCollapsed) {
      setScrollTop(0);
    }
  }, [effectiveCollapsed]);

  useEffect(() => {
    const element = document.getElementById(`category-panel-${category.name}`);
    if (!element || !shouldVirtualize || !shouldFillExpandedHeight) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const nextHeight = entries[0]?.contentRect.height;
      if (nextHeight && Number.isFinite(nextHeight)) {
        setViewportHeight(Math.max(1, Math.floor(nextHeight)));
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [category.name, shouldFillExpandedHeight, shouldVirtualize]);

  const virtualWindow = useMemo(() => {
    const total = category.defines.length;
    const visibleHeight = shouldFillExpandedHeight ? viewportHeight : VIRTUAL_VIEWPORT_HEIGHT;
    if (!shouldVirtualize || total === 0) {
      return {
        startIndex: 0,
        endIndex: total,
        offsetTop: 0,
        totalHeight: total * VIRTUAL_ROW_HEIGHT
      };
    }

    const startIndex = Math.max(0, Math.floor(scrollTop / VIRTUAL_ROW_HEIGHT) - VIRTUAL_OVERSCAN);
    const endIndex = Math.min(
      total,
      Math.ceil((scrollTop + visibleHeight) / VIRTUAL_ROW_HEIGHT) + VIRTUAL_OVERSCAN
    );

    return {
      startIndex,
      endIndex,
      offsetTop: startIndex * VIRTUAL_ROW_HEIGHT,
      totalHeight: total * VIRTUAL_ROW_HEIGHT
    };
  }, [category.defines.length, scrollTop, shouldFillExpandedHeight, shouldVirtualize, viewportHeight]);

  const visibleDefines = shouldVirtualize
    ? category.defines.slice(virtualWindow.startIndex, virtualWindow.endIndex)
    : category.defines;

  return (
    <Box
      as="article"
      id={`category-${categoryId}`}
      bg="panelBg"
      border="1px solid"
      borderColor={!effectiveCollapsed ? "brand.gold" : "borderPrimary"}
      borderRadius="xl"
      boxShadow="sm"
      transition="box-shadow 0.2s, border-color 0.2s"
      _hover={{ boxShadow: "md", borderColor: "brand.gold" }}
      scrollMarginTop="140px"
      h={shouldFillExpandedHeight ? "full" : undefined}
      display={shouldFillExpandedHeight ? "flex" : undefined}
      flexDirection={shouldFillExpandedHeight ? "column" : undefined}
      overflow={shouldFillExpandedHeight ? "hidden" : undefined}
    >
      <Button
        variant="ghost"
        w="full"
        justifyContent="space-between"
        borderRadius={isLockedOpen ? "xl" : effectiveCollapsed ? "xl" : "xl xl 0 0"}
        px={8}
        py={6}
        color="textPrimary"
        _hover={{ bg: "surface.700" }}
        onClick={isLockedOpen ? undefined : () => onToggleCollapse(category.name)}
        aria-expanded={!effectiveCollapsed}
        aria-controls={`category-panel-${category.name}`}
        cursor={isLockedOpen ? "default" : "pointer"}
      >
        <Text fontSize="xl" fontWeight={600}>{category.name}</Text>
        <Text color="textSecondary" fontSize="sm" ml="auto" mr={4}>
          {category.defines.length} entries / {modifiedCount} modified
        </Text>
        {!isLockedOpen ? (
          <Text color="textSecondary" aria-hidden="true">
            {effectiveCollapsed ? "+" : "-"}
          </Text>
        ) : null}
      </Button>

      <Collapse in={!effectiveCollapsed} animateOpacity unmountOnExit style={shouldFillExpandedHeight ? { flex: 1 } : undefined}>
        {shouldVirtualize ? (
          <Box
            id={`category-panel-${category.name}`}
            h={shouldFillExpandedHeight ? "full" : `${VIRTUAL_VIEWPORT_HEIGHT}px`}
            overflowY="auto"
            onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
          >
            <Box h={`${virtualWindow.totalHeight}px`} position="relative">
              <Box position="absolute" top={`${virtualWindow.offsetTop}px`} left={0} right={0}>
                {visibleDefines.map((entry) => (
                  <DefineRow
                    key={entry.id}
                    entry={entry}
                    value={getDisplayValue(entry)}
                    isModified={getIsModified(entry)}
                    error={getError(entry)}
                    onUpdate={onUpdateDefine}
                    onReset={onResetDefine}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        ) : (
          <VStack id={`category-panel-${category.name}`} spacing={0} align="stretch">
            {visibleDefines.map((entry) => (
              <DefineRow
                key={entry.id}
                entry={entry}
                value={getDisplayValue(entry)}
                isModified={getIsModified(entry)}
                error={getError(entry)}
                onUpdate={onUpdateDefine}
                onReset={onResetDefine}
              />
            ))}
          </VStack>
        )}
      </Collapse>
    </Box>
  );
}
