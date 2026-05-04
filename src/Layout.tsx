import type { ReactNode } from "react";
import {
  Layout as RALayout,
  CheckForApplicationUpdate
} from "react-admin";

import { useMediaQuery, useTheme } from "@mui/material";

export const MyLayout = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <RALayout
      sx={{
        /* TOOLBAR SUPERIOR */
        "& .RaTopToolbar-root": {
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: isSmall ? "stretch" : "flex-end",
        },

        "& .RaTopToolbar-root .MuiButton-root": {
          flex: isSmall ? "1 1 100%" : "0 0 auto",
          whiteSpace: "nowrap",
        },

        /* TOOLBAR FORM SAVE */
        "& .RaToolbar-root": {
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
        },

        "& .RaToolbar-root .MuiButton-root": {
          flex: isSmall ? "1 1 100%" : "0 0 auto",
        },

        /* DATAGRID */
        "& .RaDatagrid-root": {
          overflowX: "auto",
        },

        /* TABS */
        "& .MuiTabs-root": {
          overflowX: "auto",
        },

        "& .MuiTab-root": {
          minWidth: isSmall ? 120 : 90,
        },

        /* FORMS */
        "& .MuiFormControl-root": {
          minWidth: 0,
        },

        "& .RaSimpleForm-root": {
          width: "100%",
        },
      }}
    >
      {children}
      <CheckForApplicationUpdate />
    </RALayout>
  );
};