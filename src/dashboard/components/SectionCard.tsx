// dashboard/components/SectionCard.tsx

import {
    Card,
    CardContent,
    Typography,
} from "@mui/material";
import { ReactNode } from "react";

interface SectionCardProps {
    title: string;
    children: ReactNode;
}

export const SectionCard = ({
    title,
    children,
}: SectionCardProps) => {

    return (

        <Card
            elevation={0}
            sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
            }}
        >

            <CardContent>

                <Typography
                    variant="h6"
                    gutterBottom
                >
                    {title}
                </Typography>

                {children}

            </CardContent>

        </Card>

    );

};