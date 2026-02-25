"use client";
import React from "react";
import { useStyles } from "@/app/dashboard/(routes)/_styles/style";

interface FormLabelProps {
    text: string;
    required?: boolean;
}

/**
 * Consistently styled form field label with the glass-grey design token colour.
 * Usage: <FormLabel text="Field Name" /> or <FormLabel text="Field Name" required />
 */
const FormLabel: React.FC<FormLabelProps> = ({ text, required }) => {
    const { styles } = useStyles();
    return (
        <span className={styles.formLabel}>
            {required && <span className={styles.requiredStar}>* </span>}
            {text}
        </span>
    );
};

export default FormLabel;
