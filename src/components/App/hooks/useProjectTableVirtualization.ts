import { useCallback, useMemo, useState } from "react";
import type { Project } from "../../../types/defines";

const PROJECT_TABLE_MAX_VISIBLE_ROWS = 10;
const PROJECT_TABLE_ROW_HEIGHT = 52;
const PROJECT_TABLE_OVERSCAN = 3;

export function useProjectTableVirtualization(projects: Project[]) {
  const [projectTableScrollTop, setProjectTableScrollTop] = useState(0);
  const [projectTableRowHeight, setProjectTableRowHeight] = useState(PROJECT_TABLE_ROW_HEIGHT);

  const shouldVirtualizeProjects = projects.length > PROJECT_TABLE_MAX_VISIBLE_ROWS;
  const projectTableViewportHeight = PROJECT_TABLE_MAX_VISIBLE_ROWS * projectTableRowHeight;

  const measureProjectRowHeight = useCallback((node: HTMLTableRowElement | null) => {
    if (!node) {
      return;
    }

    const nextHeight = node.getBoundingClientRect().height;
    if (nextHeight > 0 && Math.abs(nextHeight - projectTableRowHeight) > 0.5) {
      setProjectTableRowHeight(nextHeight);
    }
  }, [projectTableRowHeight]);

  const projectRowsWindow = useMemo(() => {
    const total = projects.length;
    if (!shouldVirtualizeProjects || total === 0) {
      return {
        startIndex: 0,
        endIndex: total,
        offsetTop: 0,
        offsetBottom: 0
      };
    }

    const startIndex = Math.max(0, Math.floor(projectTableScrollTop / projectTableRowHeight) - PROJECT_TABLE_OVERSCAN);
    const endIndex = Math.min(
      total,
      Math.ceil((projectTableScrollTop + projectTableViewportHeight) / projectTableRowHeight) + PROJECT_TABLE_OVERSCAN
    );

    const offsetTop = startIndex * projectTableRowHeight;
    const renderedHeight = (endIndex - startIndex) * projectTableRowHeight;
    const offsetBottom = Math.max(0, total * projectTableRowHeight - offsetTop - renderedHeight);

    return {
      startIndex,
      endIndex,
      offsetTop,
      offsetBottom
    };
  }, [projects.length, projectTableRowHeight, projectTableScrollTop, projectTableViewportHeight, shouldVirtualizeProjects]);

  const visibleProjects = shouldVirtualizeProjects
    ? projects.slice(projectRowsWindow.startIndex, projectRowsWindow.endIndex)
    : projects;

  const resetProjectTableScroll = () => {
    setProjectTableScrollTop(0);
  };

  return {
    shouldVirtualizeProjects,
    projectTableViewportHeight,
    projectRowsWindow,
    visibleProjects,
    setProjectTableScrollTop,
    measureProjectRowHeight,
    resetProjectTableScroll
  };
}
