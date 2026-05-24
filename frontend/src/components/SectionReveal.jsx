import { motion } from "framer-motion";

export const SectionReveal = ({
    children,
    delay = 0,
    y = 24,
    className = "",
    as: Tag = "div",
}) => {
    const MotionTag = motion[Tag] || motion.div;
    return (
        <MotionTag
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </MotionTag>
    );
};

export default SectionReveal;
