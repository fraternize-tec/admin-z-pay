import type { ReactNode } from "react";
import {
  Layout as RALayout,
  CheckForApplicationUpdate,
  AppBar,
} from "react-admin";

import {
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useLocation } from "react-router-dom";
import { MyMenu } from "./layout/MyMenu";

export const MyLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const theme = useTheme();

  const isSmall = useMediaQuery(
    theme.breakpoints.down("sm")
  );

  const location = useLocation();

  const isBingoTelao =
    location.pathname === "/bingo/telao";

  return (
      <RALayout
        appBar={
          isBingoTelao ? () => null : AppBar
        }
        menu={
          isBingoTelao ? () => null : MyMenu
        }
        sx={{
          ...(isBingoTelao && {
            "& .RaLayout-appFrame": {
              marginTop: "0px !important",
            },

            "& .RaLayout-contentWithSidebar": {
              marginLeft: "0px !important",
            },

            "& .RaLayout-content": {
              padding: "0px !important",
              margin: "0px !important",
            },

            "& .RaLayout-main": {
              padding: "0px !important",
              margin: "0px !important",
            },
          }),

          /* TOOLBAR SUPERIOR */
          "& .RaTopToolbar-root": {
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            justifyContent: isSmall
              ? "stretch"
              : "flex-end",
          },

          "& .RaTopToolbar-root .MuiButton-root":
            {
              flex: isSmall
                ? "1 1 100%"
                : "0 0 auto",
              whiteSpace: "nowrap",
            },

          /* TOOLBAR FORM SAVE */
          "& .RaToolbar-root": {
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
          },

          "& .RaToolbar-root .MuiButton-root": {
            flex: isSmall
              ? "1 1 100%"
              : "0 0 auto",
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