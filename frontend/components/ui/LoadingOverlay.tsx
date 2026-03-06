import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Activity } from 'lucide-react';

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    isVisible,
    message = "Loading your workspace..."
}) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="flex flex-col items-center"
                    >
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                            <div className="relative bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-700">
                                <Activity className="w-10 h-10 text-blue-400" />
                            </div>
                        </div>

                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />

                        <h2 className="text-xl font-bold text-white tracking-tight">
                            {message}
                        </h2>
                        <p className="text-slate-400 text-sm mt-2 flex items-center">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                            Establishing secure connection...
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
