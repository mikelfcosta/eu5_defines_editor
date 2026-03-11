# Design Feedback & Implementation Plan (v1)

This document outlines the design changes based on user feedback. It should be used by the Coder to implement the next iteration of the UI.

## 1. Overall Layout

*   **Max Width:** The main application container should have a `max-width` of `1440px` and be horizontally centered on the page.
*   **Background:** The main container's gradient background should be removed. Replace it with a single, solid background color.

## 2. Left Sidebar

*   **Title:** The application title "EUV Defines Editor" should be split into two lines:
    *   "EUV"
    *   "Defines Editor"
*   **Navigation:** Navigation links' text should be right-aligned. Padding around the links should be maintained.
*   **Background & Shadow:** The sidebar's background color should match the main content area. A subtle vertical line should separate the sidebar from the content. The sidebar itself should have a `drop-shadow` to create a visual effect of it being underneath the main content "paper".
*   **Version Indicator:**
    *   The game version selector dropdown should be removed.
    *   A new version indicator should be placed at the bottom of the sidebar.
    *   It should display text like "Version 1.0.9".
    *   An "edit" icon should be placed to the right of the text.
    *   Clicking the icon will open a modal for version selection.
*   **Projects Area:** The "projects" section is removed from the sidebar.
*   **Theme Toggle:** The light/dark theme toggle button is removed from the sidebar.

## 3. Main Container

*   **Header Removal:** The entire header area within the main container (with "modified", "next version", "export" buttons) is removed.
*   **Filter Controls:**
    *   The titles for search and category filters are removed.
    *   The search field should be a single input element with a search icon inside, aligned to the right with padding.
    *   The category filter should be a simple select/dropdown box.
    *   The "Modified Only" filter should be a checkbox.
*   **Scrolling:**
    *   The left sidebar, right sidebar, header, and footer should have fixed positions.
    *   Only the inner main content area should be scrollable.
    *   The header should have a higher z-index to appear above the scrolling content.
*   **Accordions (Category Cards):**
    *   Accordions should be more compact.
    *   When an accordion is open, it should appear as a single, unified card.
    *   Each define/variable within the card should be a single-line list item.
    *   The layout for each define row should be:
        1.  `variable_name`
        2.  Input field
        3.  "Info" icon button (shows type, dev comment, description on hover).
        4.  "Reset" icon button (resets the value to default).

## 4. Right Sidebar

*   **Alignment & Design:** The sidebar should be left-aligned and have a mirrored design to the left sidebar (including background and shadow effects).
*   **Content:** It should display a list of the variable names only.
*   **Interaction:**
    *   On hover, the text for each item should lighten with a smooth animation.
    *   A tooltip should appear on hover, showing the category's variable count and the number of modified variables within it.

## 5. Header (Fixed, Top of Page)

*   **Position:** The header is fixed to the top of the viewport.
*   **Content:**
    *   The only content will be the project selection area, positioned at the top-right.
    *   This will show the current project name as text.
    *   An "edit" icon next to the name will open a modal to manage projects (view list, create new).

## 6. Footer (Fixed, Bottom of Page)

*   **Content:**
    *   "Save" icon button.
    *   "Export" icon button. Clicking it opens a modal to select the version change type (major, minor, patch) and confirm the export.
    *   Light/Dark theme switch icon (e.g., sun/moon icon) on the bottom-right.
